import assert from 'node:assert/strict';
import canonicalize from 'canonicalize';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { handleIssue } from '../handle.mjs';
import { challengeCode } from '../lib/challenge.mjs';
import { canonical } from '../lib/canonical.mjs';
import { buildBadge, buildCertificate, signCredential, verifyCredential } from '../lib/credential.mjs';
import { parseForm, normaliseRepo } from '../lib/form.mjs';
import { loadLearner } from '../lib/ledger.mjs';
import { PORTAL } from '../lib/portal.mjs';

const SECRET = 'test-secret';
const LOGIN = 'learner';
const USER_ID = 42;

test('parseForm reads issue form labels', () => {
  const form = parseForm('### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n');
  assert.equal(form.stage, '1');
  assert.equal(form['your lab repository'], 'learner/git-lab');
});

test('normaliseRepo accepts a GitHub URL', () => {
  assert.equal(normaliseRepo('https://github.com/learner/git-lab.git'), 'learner/git-lab');
});

test('challenge code is stable and personal', () => {
  assert.equal(challengeCode(USER_ID, '1', SECRET), challengeCode(USER_ID, '1', SECRET));
  assert.notEqual(challengeCode(USER_ID, '1', SECRET), challengeCode(99, '1', SECRET));
  assert.equal(challengeCode(USER_ID, '1', SECRET).length, 12);
});

function issueGh(issue, repos) {
  const comments = [];
  let closed = false;
  const gh = {
    comments,
    get closed() { return closed; },
    issues: {
      get: async () => ({ data: issue }),
      createComment: async ({ body }) => { comments.push(body); },
      update: async ({ state }) => { closed = state === 'closed'; },
      listForRepo: async () => ({ data: [issue] }),
    },
    repos,
    paginate: async (method, params) => (await method(params)).data,
  };
  return gh;
}

function passingRepos(code) {
  const commits = [1, 2, 3].map((n) => ({
    sha: `abc${n}`,
    author: { id: USER_ID },
    commit: { committer: { date: '2026-10-05T12:00:00Z' } },
  }));
  return {
    get: async () => ({
      data: {
        private: false,
        owner: { id: USER_ID },
        template_repository: { full_name: PORTAL.templateFullName },
      },
    }),
    getContent: async ({ path: filePath }) => {
      const text = filePath.endsWith('stage-1.txt') ? code : '*.log\n';
      return { data: { type: 'file', content: Buffer.from(text).toString('base64') } };
    },
    listCommits: async () => ({ data: commits }),
    getCommit: async () => ({ data: { files: [{ filename: 'README.md' }] } }),
  };
}

test('a Start issue records the time and returns a code', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const gh = issueGh({
    title: '[Start] stage 1',
    body: '### Stage\n\n1\n',
    user: { id: USER_ID, login: LOGIN },
    created_at: '2026-10-05T10:00:00Z',
  });
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 7, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T10:00:00Z'),
  });
  assert.equal(result.started, true);
  assert.equal(gh.closed, true);
  const code = challengeCode(USER_ID, '1', SECRET);
  assert.match(gh.comments[0], new RegExp(code));
  assert.match(gh.comments[0], /\.stage\/stage-1\.txt/);
  assert.match(gh.comments[0], new RegExp(`echo "${code}" > \\.stage/stage-1\\.txt`));
  assert.match(gh.comments[0], /https:\/\/codespaces\.new\/learner\/git-lab/);
  assert.match(gh.comments[0], /template_name=rm-git-lab-template/);
  assert.match(gh.comments[0], /repo=learner%2Fgit-lab/);
  assert.match(gh.comments[0], /greeting-a/);
  assert.match(gh.comments[0], /screens-you-will-see/);
  assert.match(gh.comments[0], /when-a-check-fails/);
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].startedAt, '2026-10-05T10:00:00.000Z');
});

test('a second Start issue keeps the original start time', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const issue = {
    title: '[Start] stage 1',
    body: '### Stage\n\n1\n',
    user: { id: USER_ID, login: LOGIN },
    created_at: '2026-10-05T10:00:00Z',
  };
  await handleIssue({
    gh: issueGh(issue), ledgerDir: dir, issueNumber: 7, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T10:00:00Z'),
  });
  await handleIssue({
    gh: issueGh(issue), ledgerDir: dir, issueNumber: 8, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T10:00:00Z'),
  });
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].startedAt, '2026-10-05T10:00:00.000Z');
});

test('submit before start does not pass the stage', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const gh = issueGh({
    title: '[Submit] stage 1',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: { id: USER_ID, login: LOGIN },
    created_at: '2026-10-05T11:00:00Z',
  });
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 9, portal: PORTAL, secret: SECRET,
  });
  assert.equal(result.passed, undefined);
  assert.match(gh.comments[0], /Start issue/);
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].passedAt, undefined);
});

test('a complete stage 1 submission passes and records evidence', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const code = challengeCode(USER_ID, '1', SECRET);
  const author = { id: USER_ID, login: LOGIN };
  await handleIssue({
    gh: issueGh({
      title: '[Start] ',
      body: '### Stage\n\n1\n',
      user: author,
      created_at: '2026-10-05T09:00:00Z',
    }),
    ledgerDir: dir, issueNumber: 1, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T09:00:00Z'),
  });
  const gh = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nhttps://github.com/learner/git-lab.git\n',
    user: author,
    created_at: '2026-10-05T12:30:00Z',
  }, passingRepos(code));
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 2, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T12:30:00Z'),
  });
  assert.equal(result.passed, true);
  const saved = loadLearner(dir, USER_ID, LOGIN);
  assert.equal(saved.stages['1'].passedAt, '2026-10-05T12:30:00.000Z');
  assert.deepEqual(saved.stages['1'].evidence.commits, ['abc1', 'abc2', 'abc3']);
  assert.match(gh.comments[0], /Stage 1 passed/);
  assert.match(gh.comments[0], /Start stage 2/);
  assert.match(gh.comments[0], /signing key is not configured/);
  assert.equal(saved.stages['1'].credentialId, undefined);
});

test('a wrong challenge code fails the stage', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const author = { id: USER_ID, login: LOGIN };
  await handleIssue({
    gh: issueGh({ title: '[Start] ', body: '### Stage\n\n1\n', user: author, created_at: '2026-10-05T09:00:00Z' }),
    ledgerDir: dir, issueNumber: 1, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T09:00:00Z'),
  });
  const gh = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: author,
    created_at: '2026-10-05T12:30:00Z',
  }, passingRepos('someone-elses-code'));
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 2, portal: PORTAL, secret: SECRET,
  });
  assert.equal(result.passed, false);
  assert.match(gh.comments[0], /Challenge code file is correct/);
  assert.match(gh.comments[0], /challenge-code-file-is-wrong/);
  assert.match(gh.comments[0], /when-a-check-fails/);
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].passedAt, undefined);
});

test('stage 2 cannot start before stage 1 is passed', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const gh = issueGh({
    title: '[Start] ',
    body: '### Stage\n\n2\n',
    user: { id: USER_ID, login: LOGIN },
    created_at: '2026-10-05T12:00:00Z',
  });
  await handleIssue({ gh, ledgerDir: dir, issueNumber: 3, portal: PORTAL, secret: SECRET });
  assert.match(gh.comments[0], /Pass stage 1/);
});

function signingMaterial() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    pem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    keys: [{ kid: '2026-1', x: publicKey.export({ format: 'jwk' }).x, validFrom: '2026-01-01' }],
  };
}

test('canonical JSON matches the signature library', () => {
  const sample = buildBadge({
    stage: 1, githubId: USER_ID, login: LOGIN, issuedAt: '2026-10-05T12:30:00.000Z',
    kid: '2026-1', repo: 'learner/git-lab', issue: 2,
    issuerName: PORTAL.issuerName, siteUrl: PORTAL.siteUrl,
  });
  assert.equal(canonical(sample), canonicalize(sample));
});

test('a changed credential fails the signature check', () => {
  const { pem, keys } = signingMaterial();
  const signed = signCredential(buildCertificate({
    githubId: USER_ID, login: LOGIN, name: 'Rohit Learner', issuedAt: '2026-10-05T12:30:00.000Z',
    kid: '2026-1', issuerName: PORTAL.issuerName, siteUrl: PORTAL.siteUrl,
  }), pem);
  assert.equal(verifyCredential(signed, keys[0]), true);
  const tampered = { ...signed, recipient: { ...signed.recipient, name: 'Someone Else' } };
  assert.equal(verifyCredential(tampered, keys[0]), false);
});

test('a passed stage 1 issues a signed badge and keeps it on a later pass', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  const { pem, keys } = signingMaterial();
  const code = challengeCode(USER_ID, '1', SECRET);
  const author = { id: USER_ID, login: LOGIN };
  await handleIssue({
    gh: issueGh({ title: '[Start] ', body: '### Stage\n\n1\n', user: author, created_at: '2026-10-05T09:00:00Z' }),
    ledgerDir: dir, issueNumber: 1, portal: PORTAL, secret: SECRET, signingKey: pem, keys,
    now: () => new Date('2026-10-05T09:00:00Z'),
  });
  const gh = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: author,
    created_at: '2026-10-05T12:30:00Z',
  }, passingRepos(code));
  const shareDir = path.join(dir, 'share');
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 2, portal: PORTAL, secret: SECRET, signingKey: pem, keys, shareDir,
    now: () => new Date('2026-10-05T12:30:00Z'),
  });
  assert.equal(result.passed, true);
  const saved = loadLearner(dir, USER_ID, LOGIN);
  assert.equal(saved.stages['1'].credentialId, 'GGP-2026-42-S1');
  const stored = JSON.parse(readFileSync(path.join(dir, 'certificates', 'GGP-2026-42-S1.json'), 'utf8'));
  assert.equal(verifyCredential(stored, keys[0]), true);
  assert.equal(stored.recipient.githubId, USER_ID);
  assert.equal(stored.evidence.repo, 'learner/git-lab');
  assert.match(gh.comments[0], /verify\.html\?id=GGP-2026-42-S1/);
  assert.match(gh.comments[0], /share\/GGP-2026-42-S1\.html/);
  assert.match(gh.comments[0], /badges\/first-repository\.png/);
  const card = readFileSync(path.join(shareDir, 'GGP-2026-42-S1.html'), 'utf8');
  assert.match(card, /property="og:title" content="First Repository"/);
  assert.match(card, /Awarded to @learner by Rohit Manna/);
  assert.match(card, /badges\/first-repository\.png/);
  const again = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: author,
    created_at: '2026-10-06T12:30:00Z',
  }, passingRepos(code));
  await handleIssue({
    gh: again, ledgerDir: dir, issueNumber: 3, portal: PORTAL, secret: SECRET, signingKey: pem, keys,
    now: () => new Date('2026-10-06T12:30:00Z'),
  });
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].credentialId, 'GGP-2026-42-S1');
  assert.equal(loadLearner(dir, USER_ID, LOGIN).stages['1'].passedAt, '2026-10-05T12:30:00.000Z');
});

const AUTHOR = { id: USER_ID, login: LOGIN };
const LATER = '2026-10-06T09:00:00Z';

function textFile(text) {
  return { data: { type: 'file', content: Buffer.from(text).toString('base64') } };
}

async function passStage1(dir) {
  await handleIssue({
    gh: issueGh({ title: '[Start] ', body: '### Stage\n\n1\n', user: AUTHOR, created_at: '2026-10-05T09:00:00Z' }),
    ledgerDir: dir, issueNumber: 1, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T09:00:00Z'),
  });
  const gh = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n1\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-05T10:00:00Z',
  }, passingRepos(challengeCode(USER_ID, '1', SECRET)));
  const result = await handleIssue({
    gh, ledgerDir: dir, issueNumber: 2, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-05T10:00:00Z'),
  });
  assert.equal(result.passed, true);
}

async function openStage(dir, stage) {
  const gh = issueGh({ title: '[Start] ', body: `### Stage\n\n${stage}\n`, user: AUTHOR, created_at: LATER });
  await handleIssue({
    gh, ledgerDir: dir, issueNumber: 20 + stage, portal: PORTAL, secret: SECRET,
    now: () => new Date(LATER),
  });
  return gh;
}

test('stages 2 to 7 pass when the public evidence is present', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ledger-'));
  await passStage1(dir);
  const stage2 = await openStage(dir, 2);
  assert.match(stage2.comments[0], /feature\/about-page/);
  const code2 = challengeCode(USER_ID, '2', SECRET);
  const gh2 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n2\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-06T12:00:00Z',
  }, {
    get: async () => ({ data: { private: false, owner: { id: USER_ID } } }),
    getContent: async ({ path: filePath }) => textFile(filePath.endsWith('stage-2.txt') ? code2 : ''),
  });
  gh2.pulls = {
    list: async () => ({ data: [{
      number: 8, merged_at: '2026-10-06T11:00:00Z', base: { ref: 'main' }, head: { ref: 'feature/about-page' },
      user: { id: USER_ID }, body: 'This adds an about page. It records what I want to learn.',
    }] }),
    listCommits: async () => ({ data: [{ commit: { message: 'Add an about page with my learning goals' } }] }),
  };
  assert.equal((await handleIssue({
    gh: gh2, ledgerDir: dir, issueNumber: 30, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T12:00:00Z'),
  })).passed, true);

  await openStage(dir, 3);
  const code3 = challengeCode(USER_ID, '3', SECRET);
  const gh3 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n3\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-06T13:00:00Z',
  }, {
    get: async () => ({ data: { private: false, owner: { id: USER_ID } } }),
    getContent: async ({ path: filePath }) => textFile(filePath === 'greeting.txt' ? 'Hello, welcome to the team and good luck\n' : code3),
    listCommits: async () => ({ data: [{ sha: 'merge', author: { id: USER_ID }, commit: { committer: { date: '2026-10-06T12:30:00Z' }, message: 'Merge' } }] }),
    getCommit: async () => ({ data: { parents: [{ sha: 'a' }, { sha: 'b' }] } }),
  });
  assert.equal((await handleIssue({
    gh: gh3, ledgerDir: dir, issueNumber: 31, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T13:00:00Z'),
  })).passed, true);

  await openStage(dir, 4);
  const code4 = challengeCode(USER_ID, '4', SECRET);
  const gh4 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n4\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-06T14:00:00Z',
  }, {
    get: async () => ({ data: { private: false, owner: { id: USER_ID } } }),
    getContent: async () => textFile(code4),
    listCommits: async () => ({ data: [{
      sha: 'rev', author: { id: USER_ID },
      commit: { committer: { date: '2026-10-06T13:30:00Z' }, message: 'Revert "Add a note"\n\nThis reverts commit abcdef1.' },
    }] }),
  });
  gh4.git = {
    getRef: async () => ({ data: { object: { type: 'tag', sha: 'tagsha' } } }),
    getTag: async () => ({ data: { message: 'First stable version of my lab', tagger: { date: '2026-10-06T13:40:00Z' } } }),
  };
  assert.equal((await handleIssue({
    gh: gh4, ledgerDir: dir, issueNumber: 32, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T14:00:00Z'),
  })).passed, true);

  await openStage(dir, 5);
  const code5 = challengeCode(USER_ID, '5', SECRET);
  const gh5 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n5\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-06T15:00:00Z',
  }, {
    get: async ({ repo }) => ({
      data: repo === 'rm-practice-repo'
        ? { fork: true, private: false, owner: { id: USER_ID }, parent: { full_name: 'Crazy-Rohit/rm-practice-repo' } }
        : { private: false, owner: { id: USER_ID } },
    }),
    getContent: async () => textFile(code5),
  });
  gh5.pulls = {
    list: async () => ({ data: [{ number: 3, merged_at: '2026-10-06T14:30:00Z', user: { id: USER_ID } }] }),
    listFiles: async () => ({ data: [{ filename: 'contributors/learner.md', status: 'added' }] }),
  };
  assert.equal((await handleIssue({
    gh: gh5, ledgerDir: dir, issueNumber: 33, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T15:00:00Z'),
  })).passed, true);

  await openStage(dir, 6);
  const code6 = challengeCode(USER_ID, '6', SECRET);
  const gh6 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n6\n\n### Your lab repository\n\nlearner/git-lab\n',
    user: AUTHOR,
    created_at: '2026-10-06T16:00:00Z',
  }, {
    get: async () => ({ data: { private: false, owner: { id: USER_ID } } }),
    getContent: async ({ path: filePath }) => (
      filePath === '.github/workflows' ? { data: [{ name: 'check.yml', type: 'file' }] } : textFile(code6)
    ),
  });
  gh6.actions = {
    listWorkflowRunsForRepo: async () => ({ data: { workflow_runs: [
      { id: 1, head_branch: 'main', conclusion: 'failure', created_at: '2026-10-06T15:10:00Z' },
      { id: 2, head_branch: 'main', conclusion: 'success', created_at: '2026-10-06T15:20:00Z' },
    ] } }),
  };
  assert.equal((await handleIssue({
    gh: gh6, ledgerDir: dir, issueNumber: 34, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T16:00:00Z'),
  })).passed, true);

  await openStage(dir, 7);
  const code7 = challengeCode(USER_ID, '7', SECRET);
  const files = {
    'README.md': 'Notes for the Git course, and how to open them.',
    LICENSE: 'MIT License',
    '.gitignore': '*.log\n',
    '.stage/stage-7.txt': code7,
  };
  const gh7 = issueGh({
    title: '[Submit] ',
    body: '### Stage\n\n7\n\n### Your lab repository\n\nlearner/notes\n',
    user: AUTHOR,
    created_at: '2026-10-06T17:00:00Z',
  }, {
    get: async () => ({ data: { private: false, owner: { id: USER_ID } } }),
    getContent: async ({ path: filePath }) => (
      filePath === '.github/workflows' ? { data: [{ name: 'check.yml', type: 'file' }] } : textFile(files[filePath] || '')
    ),
    getPages: async () => ({ data: { html_url: 'https://learner.github.io/notes/' } }),
    getReleaseByTag: async () => ({ data: { body: 'First public release of my notes.', published_at: '2026-10-06T16:30:00Z' } }),
  });
  gh7.pulls = {
    list: async () => ({ data: [1, 2, 3].map((number) => ({
      number, merged_at: '2026-10-06T16:00:00Z', base: { ref: 'main' },
      body: number === 1 ? 'Adds the home page.\n\nFixes #4' : 'Adds another page for the notes site.',
    })) }),
  };
  gh7.actions = {
    listWorkflowRunsForRepo: async () => ({ data: { workflow_runs: [
      { id: 9, head_branch: 'main', conclusion: 'success', created_at: '2026-10-06T16:10:00Z' },
    ] } }),
  };
  const portalIssue = { title: '[Submit] ', body: '### Stage\n\n7\n\n### Your lab repository\n\nlearner/notes\n', user: AUTHOR };
  gh7.issues.get = async (params) => ({
    data: params.owner === 'learner' ? { state: 'closed' } : portalIssue,
  });
  assert.equal((await handleIssue({
    gh: gh7, ledgerDir: dir, issueNumber: 35, portal: PORTAL, secret: SECRET,
    now: () => new Date('2026-10-06T17:00:00Z'),
  })).passed, true);
  assert.equal(loadLearner(dir, USER_ID, LOGIN).certificateId, null);
});
