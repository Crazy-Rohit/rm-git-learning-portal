import { challengeCode } from './lib/challenge.mjs';
import { guideUrl, renderResult, startMessage } from './lib/comment.mjs';
import { buildBadge, buildCertificate, chooseKey, signCredential, verifyCredential, writeCredential } from './lib/credential.mjs';
import { displayName, parseForm } from './lib/form.mjs';
import { loadLearner, saveLearner } from './lib/ledger.mjs';
import { writeSharePage } from './lib/share.mjs';
import { DAILY_SUBMIT_LIMIT } from './lib/portal.mjs';
import { checkStage1 } from './stages/stage1.mjs';
import { checkStage2 } from './stages/stage2.mjs';
import { checkStage3 } from './stages/stage3.mjs';
import { checkStage4 } from './stages/stage4.mjs';
import { checkStage5 } from './stages/stage5.mjs';
import { checkStage6 } from './stages/stage6.mjs';
import { checkStage7 } from './stages/stage7.mjs';

const CHECKS = {
  1: checkStage1,
  2: checkStage2,
  3: checkStage3,
  4: checkStage4,
  5: checkStage5,
  6: checkStage6,
  7: checkStage7,
};

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

function learnerName(learner, form, login) {
  return learner.name || displayName(form['your name'] || form['name on the certificate']) || login;
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
    await say(`Choose a stage from 1 to 7. On the form, click **Stage** if it still says None.\n\n${guideUrl('the-stage-box-says-none')}`);
    return { closed: true };
  }
  if (!secret) {
    await say('The portal cannot check work yet because the challenge secret is not configured.');
    return { closed: true, error: true };
  }

  const learner = loadLearner(ledgerDir, authorId, login);
  const form = parseForm(issue.body || '');
  const code = challengeCode(authorId, stage, secret);
  learner.stages[stage] ??= {};
  const previous = String(Number(stage) - 1);
  const previousPassed = Number(stage) === 1 || Boolean(learner.stages[previous]?.passedAt);

  if (isStart) {
    if (!previousPassed) {
      await say(`Pass stage ${previous} before starting stage ${stage}. Stages open in order. The form lists every number so later stages use the same page.\n\n${guideUrl('pass-the-previous-stage-first')}`);
      return { closed: true };
    }
    const name = displayName(form['your name']);
    if (!name) {
      await say('Enter your name as you want it on the badge. Use letters, spaces, and hyphens. Example: Rohit Manna.');
      return { closed: true };
    }
    const issued = Object.values(learner.stages).some((item) => item?.credentialId);
    if (!learner.name || !issued) learner.name = name;
    if (!learner.stages[stage].startedAt) learner.stages[stage].startedAt = now().toISOString();
    saveLearner(ledgerDir, learner);
    await say(`${startMessage(stage, code, login)}\n\nYour badges print **${name}** where the design shows XYZ.`);
    return { closed: true, started: true };
  }

  learner.attempts[stage] = (learner.attempts[stage] || 0) + 1;
  const recent = await submissionsInLastDay(gh, portal, login);
  if (recent > DAILY_SUBMIT_LIMIT) {
    saveLearner(ledgerDir, learner);
    await say(`You have used the ${DAILY_SUBMIT_LIMIT} checks allowed for today. Open a new Submit issue tomorrow.\n\n${guideUrl('too-many-checks-today')}`);
    return { closed: true };
  }
  if (!previousPassed) {
    saveLearner(ledgerDir, learner);
    await say(`Pass stage ${previous} before submitting stage ${stage}.\n\n${guideUrl('pass-the-previous-stage-first')}`);
    return { closed: true };
  }
  if (!learner.stages[stage].startedAt) {
    saveLearner(ledgerDir, learner);
    await say(`Open a Start issue for stage ${stage} first. Only work done after that start time counts.\n\n${guideUrl('the-cycle-for-every-stage')}`);
    return { closed: true };
  }

  const run = CHECKS[Number(stage)];
  if (!run) {
    saveLearner(ledgerDir, learner);
    await say(`Stage ${stage} is not a stage of this course.\n\n${guideUrl('how-the-portal-works')}`);
    return { closed: true };
  }

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
          name: learnerName(learner, form, login),
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
          name: learnerName(learner, form, login),
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
