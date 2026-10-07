import { beginLab, codeFileCheck, labOf, listCommits, ownCommits, publicRepo, readText } from '../lib/github.mjs';

export async function checkStage3({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 3, code));

  const greeting = await readText(gh, repo, 'greeting.txt');
  const lower = greeting.toLowerCase();
  add(
    'greeting.txt keeps both messages',
    lower.includes('welcome') && lower.includes('good luck'),
    'Merge greeting-a and greeting-b so greeting.txt contains both "welcome" and "good luck".',
  );
  add(
    'Conflict markers are gone',
    greeting.length > 0 && !/^(<<<<<<<|=======|>>>>>>>)/m.test(greeting),
    'Delete every <<<<<<<, =======, and >>>>>>> line from greeting.txt, then commit the merge.',
  );

  const own = ownCommits(await listCommits(gh, repo, startedAt), userId, startedAt);
  let merge = null;
  for (const commit of own.slice(0, 30)) {
    try {
      const full = await gh.repos.getCommit({ ...repo, ref: commit.sha });
      if ((full.data.parents || []).length >= 2) {
        merge = commit;
        break;
      }
    } catch {
      // A missing commit detail fails the merge check below.
    }
  }
  add(
    'A merge commit is on main',
    !!merge,
    'Merge greeting-b into main and finish the merge with a commit. That commit has two parents.',
  );
  evidence.commits = own.slice(0, 20).map((commit) => commit.sha);
  return { checks, evidence };
}
