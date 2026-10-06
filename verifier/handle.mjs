import { challengeCode } from './lib/challenge.mjs';
import { renderResult, startMessage } from './lib/comment.mjs';
import { buildBadge, buildCertificate, chooseKey, signCredential, verifyCredential, writeCredential } from './lib/credential.mjs';
import { parseForm } from './lib/form.mjs';
import { loadLearner, saveLearner } from './lib/ledger.mjs';
import { writeSharePage } from './lib/share.mjs';
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

function award(ledgerDir, unsigned, signingKey, key) {
  try {
    const signed = signCredential(unsigned, signingKey);
    if (!verifyCredential(signed, key)) return null;
    writeCredential(ledgerDir, signed);
    return signed;
  } catch {
    return null;
  }
}

function certificateName(form, login) {
  const typed = String(form['name on the certificate'] || '').replace(/\s+/g, ' ').trim();
  if (typed.length >= 2 && typed.length <= 80 && !/[^\p{L}\p{M}\p{N} .'-]/u.test(typed)) return typed;
  return login;
}

export async function handleIssue({ gh, ledgerDir, issueNumber, portal, secret, signingKey = '', keys = [], shareDir = '', now = () => new Date() }) {
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
  let credentialId = '';
  let signingNote = '';
  if (passed) {
    if (!learner.stages[stage].passedAt) learner.stages[stage].passedAt = now().toISOString();
    learner.stages[stage].evidence = { ...result.evidence, issue: issueNumber };
    const issuedAt = learner.stages[stage].passedAt;
    const key = chooseKey(keys, issuedAt);
    if (!learner.stages[stage].credentialId) {
      if (!signingKey || !key) {
        signingNote = 'The signed badge was not issued because the signing key is not configured.';
      } else {
        const signed = award(ledgerDir, buildBadge({
          stage,
          githubId: authorId,
          login,
          issuedAt,
          kid: key.kid,
          repo: result.evidence?.repo || '',
          issue: issueNumber,
          issuerName: portal.issuerName,
          siteUrl: portal.siteUrl,
        }), signingKey, key);
        if (signed) {
          learner.stages[stage].credentialId = signed.id;
          writeSharePage(shareDir, signed);
        } else signingNote = 'The stage passed, but the badge could not be signed. The signing key does not match the public key on the site.';
      }
    }
    if (Number(stage) === 7 && !learner.certificateId && signingKey && key) {
      const earlier = [1, 2, 3, 4, 5, 6].every((number) => learner.stages[String(number)]?.passedAt);
      if (earlier) {
        const signed = award(ledgerDir, buildCertificate({
          githubId: authorId,
          login,
          name: certificateName(form, login),
          issuedAt,
          kid: key.kid,
          issuerName: portal.issuerName,
          siteUrl: portal.siteUrl,
        }), signingKey, key);
        if (signed) {
          learner.certificateId = signed.id;
          writeSharePage(shareDir, signed);
        }
      }
    }
    credentialId = learner.stages[stage].credentialId || '';
  }
  saveLearner(ledgerDir, learner);
  await say(renderResult({ stage, passed, checks: result.checks, credentialId, signingNote }));
  return { closed: true, passed };
}
