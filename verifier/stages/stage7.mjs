import { beginLab, codeFileCheck, labOf, listPath, publicRepo, readText } from '../lib/github.mjs';
import {
  aboutProblem, contactProblem, educationProblem, experienceProblem, parseData, profileProblem, projectsProblem, skillsProblem,
} from '../lib/portfolio.mjs';

const FIXES = /(?:fix(?:es|ed)?|close[sd]?|resolve[sd]?)\s+#(\d+)/i;

async function closedPulls(gh, repo) {
  try {
    return await gh.paginate(gh.pulls.list, { ...repo, state: 'closed', per_page: 100 });
  } catch {
    return [];
  }
}

async function workflowRuns(gh, repo) {
  try {
    const res = await gh.actions.listWorkflowRunsForRepo({ ...repo, per_page: 100 });
    return res.data.workflow_runs || [];
  } catch {
    return [];
  }
}

async function hasFile(gh, repo, paths) {
  for (const filePath of paths) {
    const text = await readText(gh, repo, filePath);
    if (text.trim()) return true;
  }
  return false;
}

export async function checkStage7({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 7, code));

  const readme = (await readText(gh, repo, 'README.md')).trim();
  add(
    'README.md explains the project',
    readme.length >= 40,
    'Write a README that says what the project is and how to use it.',
  );
  add(
    'A licence file is present',
    await hasFile(gh, repo, ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING']),
    'Add a licence file, for example LICENSE with the MIT text.',
  );
  add(
    'A .gitignore is present',
    (await readText(gh, repo, '.gitignore')).trim().length > 0,
    'Add a .gitignore that suits the project.',
  );

  const workflows = await listPath(gh, repo, '.github/workflows');
  add(
    'A workflow file is present',
    workflows.some((file) => /\.ya?ml$/i.test(file.name || '')),
    'Add a GitHub Actions workflow under .github/workflows/.',
  );
  const started = new Date(startedAt);
  const runs = await workflowRuns(gh, repo);
  add(
    'The workflow passes on main',
    runs.some((run) => run.conclusion === 'success' && run.head_branch === 'main' && new Date(run.created_at || 0) > started),
    'Push the workflow and wait until a run on main is green, after you start this stage.',
  );

  let pages = false;
  try {
    const page = await gh.repos.getPages(repo);
    pages = Boolean(page.data?.html_url);
  } catch {
    pages = false;
  }
  add(
    'GitHub Pages is live',
    pages,
    'In Settings → Pages, deploy from the main branch. The site must have a published address.',
  );

  const merged = (await closedPulls(gh, repo)).filter((pull) => pull.merged_at && new Date(pull.merged_at) > started && pull.base?.ref === 'main');
  add(
    'A pull request was merged into main',
    merged.length >= 1,
    'Open an issue, then merge a pull request into main after you start this stage.',
  );

  let closedByPull = false;
  for (const pull of merged) {
    const match = String(pull.body || '').match(FIXES);
    if (!match) continue;
    try {
      const issue = await gh.issues.get({ ...repo, issue_number: Number(match[1]) });
      if (issue.data?.state === 'closed') {
        closedByPull = true;
        break;
      }
    } catch {
      // A missing issue fails this check.
    }
  }
  add(
    'A pull request closed an issue',
    closedByPull,
    'Open an issue, then merge a pull request whose description contains Fixes # followed by that issue number.',
  );

  let released = false;
  try {
    const release = await gh.repos.getReleaseByTag({ ...repo, tag: 'v2.0.0' });
    const when = new Date(release.data.published_at || release.data.created_at || 0);
    released = String(release.data.body || '').trim().length >= 20 && when > started;
  } catch {
    released = false;
  }
  add(
    'Release v1.0.0 has notes',
    released,
    'Publish a GitHub release tagged v2.0.0 with release notes of at least a sentence, after you start this stage. v1.0.0 was the stage 4 tag.',
  );
  const sections = [
    ['Portfolio identity is filled', profileProblem, 'data/profile.json'],
    ['About section is filled', aboutProblem, 'data/about.json'],
    ['Education section is filled', educationProblem, 'data/education.json'],
    ['Skills section is filled', skillsProblem, 'data/skills.json'],
    ['Experience section is filled', experienceProblem, 'data/experience.json'],
    ['Projects section is filled', projectsProblem, 'data/projects.json'],
    ['Contact section is filled', contactProblem, 'data/contact.json'],
  ];
  for (const [name, problem, file] of sections) {
    const detail = problem(parseData(await readText(gh, repo, file)), login);
    add(name, !detail, detail);
  }
  return { checks, evidence };
}
