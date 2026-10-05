import { PORTAL } from '../lib/portal.mjs';
import { normaliseRepo } from '../lib/form.mjs';

async function readText(gh, repo, filePath) {
  try {
    const res = await gh.repos.getContent({ ...repo, path: filePath });
    const data = res.data;
    if (!data || Array.isArray(data) || data.type !== 'file' || !data.content) return '';
    return Buffer.from(String(data.content).replace(/\s/g, ''), 'base64').toString('utf8');
  } catch {
    return '';
  }
}

async function listCommits(gh, repo, since) {
  try {
    return await gh.paginate(gh.repos.listCommits, { ...repo, since, per_page: 100 });
  } catch {
    return [];
  }
}

export async function checkStage1({ gh, login, userId, startedAt, code, declaredRepo }) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  const repo = { owner: login, repo: PORTAL.labName };
  const evidence = { repo: `${login}/${PORTAL.labName}`, commits: [] };

  const expectedRepo = `${login}/${PORTAL.labName}`;
  add(
    'Submission names your git-lab repository',
    normaliseRepo(declaredRepo).toLowerCase() === expectedRepo.toLowerCase(),
    `In the form, enter ${expectedRepo}.`,
  );

  let info = null;
  try {
    info = (await gh.repos.get(repo)).data;
  } catch {
    info = null;
  }

  add(
    'Lab repository exists and is public',
    !!info && info.private === false,
    !info
      ? `Create a public repository named ${PORTAL.labName} from ${PORTAL.templateFullName}.`
      : 'Make the repository public. The portal can only read public repositories.',
  );
  if (!info || info.private) return { checks, evidence };

  add(
    'Repository belongs to you',
    Number(info.owner?.id) === Number(userId),
    'The git-lab repository must be owned by the account that opened this issue.',
  );

  const templateName = info.template_repository?.full_name || '';
  add(
    'Created from the lab template',
    templateName.toLowerCase() === PORTAL.templateFullName.toLowerCase(),
    `On ${PORTAL.templateFullName}, choose Use this template, include all branches, and name the copy ${PORTAL.labName}.`,
  );

  const file = (await readText(gh, repo, '.stage/stage-1.txt')).trim();
  add(
    'Challenge code file is correct',
    file === code,
    'Commit the code from your Start issue as the only line of .stage/stage-1.txt.',
  );

  const ignore = await readText(gh, repo, '.gitignore');
  const hasLog = ignore.split(/\r?\n/).some((line) => line.trim() === '*.log');
  add(
    '.gitignore contains *.log',
    hasLog,
    'Add a line that is exactly *.log to .gitignore and commit it.',
  );

  const started = new Date(startedAt);
  const commits = await listCommits(gh, repo, startedAt);
  const own = commits.filter((commit) => {
    const when = new Date(commit.commit?.committer?.date || commit.commit?.author?.date || 0);
    return commit.author && Number(commit.author.id) === Number(userId) && when > started;
  });
  evidence.commits = own.slice(0, 20).map((commit) => commit.sha);
  add(
    'At least three commits by you after the start time',
    own.length >= 3,
    `Found ${own.length}. Make three commits after the Start issue, with the email GitHub has verified for your account.`,
  );

  let readmeChanged = false;
  for (const commit of own.slice(0, 30)) {
    try {
      const full = await gh.repos.getCommit({ ...repo, ref: commit.sha });
      const files = full.data.files || [];
      if (files.some((file) => file.filename === 'README.md')) {
        readmeChanged = true;
        break;
      }
    } catch {
      // A missing commit detail fails the README check below.
    }
  }
  add(
    'README.md was changed after the start time',
    readmeChanged,
    'Edit README.md and commit that change after you start the stage.',
  );

  return { checks, evidence };
}
