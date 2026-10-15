import { beginLab, codeFileCheck, labOf, listCommits, ownCommits, publicRepo, readText } from '../lib/github.mjs';
import { educationProblem, parseData } from '../lib/portfolio.mjs';

export async function checkStage3({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 3, code));

  const education = await readText(gh, repo, 'data/education.json');
  add(
    'Conflict markers are gone',
    education.length > 0 && !/^(<<<<<<<|=======|>>>>>>>)/m.test(education),
    'Delete every <<<<<<<, =======, and >>>>>>> line from data/education.json, then commit the merge.',
  );
  const educationDetail = educationProblem(parseData(education));
  add(
    'Education section is filled',
    !educationDetail,
    educationDetail,
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
    'Merge education-study into main and finish the merge with a commit. That commit has two parents. Do not merge origin/greeting-b.',
  );
  evidence.commits = own.slice(0, 20).map((commit) => commit.sha);
  return { checks, evidence };
}
