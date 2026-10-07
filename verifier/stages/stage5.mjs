import { PORTAL } from '../lib/portal.mjs';
import { beginLab, codeFileCheck, labOf, publicRepo } from '../lib/github.mjs';

const PRACTICE = { owner: PORTAL.owner, repo: PORTAL.practiceName };

async function listPulls(gh) {
  try {
    return await gh.paginate(gh.pulls.list, { ...PRACTICE, state: 'closed', per_page: 100 });
  } catch {
    return [];
  }
}

async function pullFiles(gh, number) {
  try {
    return await gh.paginate(gh.pulls.listFiles, { ...PRACTICE, pull_number: number, per_page: 100 });
  } catch {
    return [];
  }
}

export async function checkStage5({ gh, login, userId, startedAt, code, declaredRepo }) {
  const lab = labOf(login);
  const info = await publicRepo(gh, lab);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, lab, 5, code));

  const fork = await publicRepo(gh, { owner: login, repo: PORTAL.practiceName });
  const forked = fork?.fork === true
    && String(fork.parent?.full_name || '').toLowerCase() === PORTAL.practiceFullName.toLowerCase()
    && Number(fork.owner?.id) === Number(userId);
  add(
    'You forked the practice repository',
    forked,
    `Fork ${PORTAL.practiceFullName} onto your own account. Do not create an empty repository with the same name.`,
  );

  const started = new Date(startedAt);
  const expected = `contributors/${login}.md`;
  let matched = null;
  for (const pull of await listPulls(gh)) {
    if (!pull.merged_at || new Date(pull.merged_at) <= started) continue;
    if (Number(pull.user?.id) !== Number(userId)) continue;
    const files = await pullFiles(gh, pull.number);
    const only = files.length === 1 && files[0].filename === expected && files[0].status === 'added';
    if (only) {
      matched = pull;
      break;
    }
  }
  add(
    'A merged pull request adds only your contributor file',
    !!matched,
    `Open a pull request into ${PORTAL.practiceFullName} that adds only ${expected}, then wait until it is merged.`,
  );
  if (matched) evidence.pull = matched.number;
  return { checks, evidence };
}
