import { normaliseRepo } from '../lib/form.mjs';
import { codeFileCheck, listPath, publicRepo, readText } from '../lib/github.mjs';

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
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  const full = normaliseRepo(declaredRepo);
  const [owner, name] = full.split('/');
  const named = owner?.toLowerCase() === login.toLowerCase()
    && !!name
    && name.toLowerCase() !== 'git-lab';
  add(
    'Submission names your capstone repository',
    named,
    `In the form, enter ${login}/your-project. Stage 7 uses a new public repository, not git-lab.`,
  );
  const evidence = { repo: named ? full : '' };
  if (!named) return { checks, evidence };

  const repo = { owner, repo: name };
  const info = await publicRepo(gh, repo);
  add(
    'Capstone repository exists and is public',
    !!info && info.private === false,
    'Create a new public repository. The portal cannot read a private one.',
  );
  if (!info || info.private) return { checks, evidence };
  const owned = Number(info.owner?.id) === Number(userId);
  add('Repository belongs to you', owned, 'The capstone must be owned by the account that opened this issue.');
  if (!owned) return { checks, evidence };

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
    'At least three pull requests were merged',
    merged.length >= 3,
    `Found ${merged.length}. Merge three pull requests into main after you start this stage.`,
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
    const release = await gh.repos.getReleaseByTag({ ...repo, tag: 'v1.0.0' });
    const when = new Date(release.data.published_at || release.data.created_at || 0);
    released = String(release.data.body || '').trim().length >= 20 && when > started;
  } catch {
    released = false;
  }
  add(
    'Release v1.0.0 has notes',
    released,
    'Publish a GitHub release tagged v1.0.0 with release notes of at least a sentence, after you start this stage.',
  );
  return { checks, evidence };
}
