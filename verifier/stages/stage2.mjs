import { beginLab, codeFileCheck, isVagueMessage, labOf, publicRepo } from '../lib/github.mjs';

async function listPulls(gh, repo) {
  try {
    return await gh.paginate(gh.pulls.list, { ...repo, state: 'closed', per_page: 100 });
  } catch {
    return [];
  }
}

async function pullCommits(gh, repo, number) {
  try {
    return await gh.paginate(gh.pulls.listCommits, { ...repo, pull_number: number, per_page: 100 });
  } catch {
    return [];
  }
}

export async function checkStage2({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 2, code));

  const started = new Date(startedAt);
  const merged = (await listPulls(gh, repo)).filter((pull) => {
    if (!pull.merged_at || new Date(pull.merged_at) <= started) return false;
    if (pull.base?.ref !== 'main') return false;
    if (!String(pull.head?.ref || '').startsWith('feature/')) return false;
    return Number(pull.user?.id) === Number(userId);
  });
  const pull = merged[0];
  add(
    'A feature pull request was merged into main',
    !!pull,
    'Open a pull request from a branch named feature/... into main, write a description, and merge it after you start this stage.',
  );

  const body = String(pull?.body || '').trim();
  const sentences = body.split(/[.!?](?:\s|$)/).filter((part) => part.trim().length > 8);
  add(
    'The pull request explains the change',
    sentences.length >= 2,
    'The pull request description needs at least two sentences saying what changed and why.',
  );

  const commits = pull ? await pullCommits(gh, repo, pull.number) : [];
  const vague = commits.find((commit) => isVagueMessage(commit.commit?.message));
  add(
    'Commit messages say what changed',
    !!pull && commits.length > 0 && !vague,
    vague
      ? `Replace the commit message "${String(vague.commit?.message || '').split('\n')[0]}". "update" and "fix" on their own do not count.`
      : 'Each commit on the pull request needs a message that says what changed.',
  );
  if (pull) evidence.pull = pull.number;
  return { checks, evidence };
}
