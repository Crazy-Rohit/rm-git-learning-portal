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
