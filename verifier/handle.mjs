import { challengeCode } from './lib/challenge.mjs';
import { renderResult, startMessage } from './lib/comment.mjs';
import { parseForm } from './lib/form.mjs';
import { loadLearner, saveLearner } from './lib/ledger.mjs';
import { DAILY_SUBMIT_LIMIT } from './lib/portal.mjs';
import { checkStage1 } from './stages/stage1.mjs';

const CHECKS = { 1: checkStage1 };

async function closeWith(gh, portal, issueNumber, body) {
  await gh.issues.createComment({
    owner: portal.owner,
    repo: portal.repo,
    issue_number: issueNumber,
    body,
  });
  await gh.issues.update({
    owner: portal.owner,
    repo: portal.repo,
    issue_number: issueNumber,
    state: 'closed',
  });
}

async function submissionsInLastDay(gh, portal, login) {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const issues = await gh.paginate(gh.issues.listForRepo, {
    owner: portal.owner,
    repo: portal.repo,
    creator: login,
    state: 'all',
    labels: 'submission',
    per_page: 100,
  });
  return issues.filter((issue) => new Date(issue.created_at).getTime() > since).length;
}

export async function handleIssue({ gh, ledgerDir, issueNumber, portal, secret, now = () => new Date() }) {
  const issue = (await gh.issues.get({
    owner: portal.owner,
    repo: portal.repo,
    issue_number: issueNumber,
  })).data;

  const title = issue.title || '';
  const isStart = title.startsWith('[Start]');
  const isSubmit = title.startsWith('[Submit]');
  if (!isStart && !isSubmit) return { skipped: true };

  const authorId = issue.user.id;
  const login = issue.user.login;
  const stage = String(parseForm(issue.body || '').stage || '').trim();
  const say = (body) => closeWith(gh, portal, issueNumber, body);

  if (!/^[1-7]$/.test(stage)) {
    await say('Choose a stage from 1 to 7.');
    return { closed: true };
  }
  if (!secret) {
    await say('The portal cannot check work yet because the challenge secret is not configured.');
    return { closed: true, error: true };
  }

  const learner = loadLearner(ledgerDir, authorId, login);
  const code = challengeCode(authorId, stage, secret);
  learner.stages[stage] ??= {};
  const previous = String(Number(stage) - 1);
  const previousPassed = Number(stage) === 1 || Boolean(learner.stages[previous]?.passedAt);

  if (isStart) {
    if (!previousPassed) {
      await say(`Pass stage ${previous} before starting stage ${stage}.`);
      return { closed: true };
    }
    if (!learner.stages[stage].startedAt) learner.stages[stage].startedAt = now().toISOString();
    saveLearner(ledgerDir, learner);
    await say(startMessage(stage, code, login));
    return { closed: true, started: true };
  }

  learner.attempts[stage] = (learner.attempts[stage] || 0) + 1;
  const recent = await submissionsInLastDay(gh, portal, login);
  if (recent > DAILY_SUBMIT_LIMIT) {
    saveLearner(ledgerDir, learner);
    await say(`You have used the ${DAILY_SUBMIT_LIMIT} checks allowed for today. Open a new Submit issue tomorrow.`);
    return { closed: true };
  }
  if (!previousPassed) {
    saveLearner(ledgerDir, learner);
    await say(`Pass stage ${previous} before submitting stage ${stage}.`);
    return { closed: true };
  }
  if (!learner.stages[stage].startedAt) {
    saveLearner(ledgerDir, learner);
    await say(`Open a Start issue for stage ${stage} first. Only work done after that start time counts.`);
    return { closed: true };
  }

  const run = CHECKS[Number(stage)];
  if (!run) {
    saveLearner(ledgerDir, learner);
    await say(`Stage ${stage} is not open yet. You can pass stage 1 today.`);
    return { closed: true };
  }

  const form = parseForm(issue.body || '');
  const result = await run({
    gh,
    login,
    userId: authorId,
    startedAt: learner.stages[stage].startedAt,
    code,
    declaredRepo: form['your lab repository'] || '',
  });
  const passed = result.checks.every((check) => check.ok);
  if (passed) {
    learner.stages[stage].passedAt = now().toISOString();
    learner.stages[stage].evidence = { ...result.evidence, issue: issueNumber };
  }
  saveLearner(ledgerDir, learner);
  await say(renderResult({ stage, passed, checks: result.checks }));
  return { closed: true, passed };
}
