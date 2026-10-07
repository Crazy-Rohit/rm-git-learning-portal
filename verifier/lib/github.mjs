import { PORTAL } from './portal.mjs';
import { normaliseRepo } from './form.mjs';

export async function readText(gh, repo, filePath) {
  try {
    const res = await gh.repos.getContent({ ...repo, path: filePath });
    const data = res.data;
    if (!data || Array.isArray(data) || data.type !== 'file' || !data.content) return '';
    return Buffer.from(String(data.content).replace(/\s/g, ''), 'base64').toString('utf8');
  } catch {
    return '';
  }
}

export async function listPath(gh, repo, filePath) {
  try {
    const res = await gh.repos.getContent({ ...repo, path: filePath });
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data ? [data] : [];
  } catch {
    return [];
  }
}

export async function listCommits(gh, repo, since) {
  try {
    return await gh.paginate(gh.repos.listCommits, { ...repo, since, per_page: 100 });
  } catch {
    return [];
  }
}

export function ownCommits(commits, userId, startedAt) {
  const started = new Date(startedAt);
  return commits.filter((commit) => {
    const when = new Date(commit.commit?.committer?.date || commit.commit?.author?.date || 0);
    return commit.author && Number(commit.author.id) === Number(userId) && when > started;
  });
}

export function isVagueMessage(message) {
  const first = String(message || '').split('\n')[0].trim().toLowerCase().replace(/[.!]+$/, '');
  return first === 'update' || first === 'fix';
}

export function labOf(login) {
  return { owner: login, repo: PORTAL.labName };
}

export async function publicRepo(gh, repo) {
  try {
    return (await gh.repos.get(repo)).data;
  } catch {
    return null;
  }
}

export function beginLab({ login, userId, declaredRepo, info }) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  const evidence = { repo: `${login}/${PORTAL.labName}` };
  const expected = `${login}/${PORTAL.labName}`;
  add(
    'Submission names your git-lab repository',
    normaliseRepo(declaredRepo).toLowerCase() === expected.toLowerCase(),
    `In the form, enter ${expected}.`,
  );
  add(
    'Lab repository exists and is public',
    !!info && info.private === false,
    !info
      ? `Create a public repository named ${PORTAL.labName} from ${PORTAL.templateFullName}.`
      : 'Make the repository public. The portal can only read public repositories.',
  );
  if (!info || info.private) return { checks, evidence, stop: true };
  const owned = Number(info.owner?.id) === Number(userId);
  add('Repository belongs to you', owned, 'The git-lab repository must be owned by the account that opened this issue.');
  return { checks, evidence, stop: !owned };
}

export async function codeFileCheck(gh, repo, stage, code) {
  const file = (await readText(gh, repo, `.stage/stage-${stage}.txt`)).trim();
  return {
    name: 'Challenge code file is correct',
    ok: file === code,
    detail: `Commit the code from your Start issue as the only line of .stage/stage-${stage}.txt.`,
  };
}
