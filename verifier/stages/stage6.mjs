import { beginLab, codeFileCheck, labOf, listPath, publicRepo } from '../lib/github.mjs';

async function workflowRuns(gh, repo) {
  try {
    const res = await gh.actions.listWorkflowRunsForRepo({ ...repo, per_page: 100 });
    return res.data.workflow_runs || [];
  } catch {
    return [];
  }
}

export async function checkStage6({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 6, code));

  const files = await listPath(gh, repo, '.github/workflows');
  add(
    'A workflow file is in git-lab',
    files.some((file) => /\.ya?ml$/i.test(file.name || '')),
    'Add a workflow under .github/workflows/ and push it.',
  );

  const started = new Date(startedAt);
  const runs = (await workflowRuns(gh, repo)).filter((run) => new Date(run.created_at || 0) > started);
  const branches = new Set(runs.map((run) => run.head_branch).filter(Boolean));
  let recovered = false;
  for (const branch of branches) {
    const onBranch = runs.filter((run) => run.head_branch === branch);
    const failures = onBranch.filter((run) => run.conclusion === 'failure').map((run) => new Date(run.created_at));
    const successes = onBranch.filter((run) => run.conclusion === 'success').map((run) => new Date(run.created_at));
    if (failures.some((failed) => successes.some((passed) => passed > failed))) recovered = true;
  }
  add(
    'A failed run was followed by a successful run',
    recovered,
    'Push a workflow that fails, then fix it and push again. Both runs must be on the same branch, after you start this stage.',
  );
  evidence.runs = runs.slice(0, 10).map((run) => run.id).filter(Boolean);
  return { checks, evidence };
}
