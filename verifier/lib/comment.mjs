import { badgeFor } from './badges.mjs';
import { PORTAL } from './portal.mjs';

export function profileSnippet(stage, id) {
  const badge = badgeFor(stage);
  if (!badge) return '';
  const image = `${PORTAL.siteUrl}badges/${badge.slug}.png`;
  const verify = `${PORTAL.siteUrl}verify.html?id=${encodeURIComponent(id)}`;
  return `[![${badge.title}](${image})](${verify})`;
}

export function startMessage(stage, code, login) {
  return [
    `Stage ${stage} has started for @${login}.`,
    '',
    `Your personal code is \`${code}\`.`,
    '',
    `Commit that code as the only line of \`.stage/stage-${stage}.txt\` on the \`main\` branch of \`${login}/git-lab\`.`,
    'A copied repository fails this check, because the code is tied to the account that opened this issue.',
    '',
    `Handbook for this stage: ${PORTAL.handbookUrl}#ch6`,
  ].join('\n');
}

export function renderResult({ stage, passed, checks, credentialId, signingNote }) {
  const head = passed
    ? `Stage ${stage} passed.`
    : `Stage ${stage} did not pass. Fix the items below and open a new Submit issue.`;
  const lines = checks.map((check) => {
    const mark = check.ok ? 'x' : ' ';
    const detail = !check.ok && check.detail ? `\n  ${check.detail}` : '';
    return `- [${mark}] **${check.name}**${detail}`;
  });
  const parts = [
    head,
    '',
    ...lines,
    '',
    `Handbook: ${PORTAL.handbookUrl}#ch6`,
  ];
  if (passed && credentialId) {
    const verify = `${PORTAL.siteUrl}verify.html?id=${encodeURIComponent(credentialId)}`;
    const snippet = profileSnippet(stage, credentialId);
    parts.push(
      '',
      `Signed badge: ${verify}`,
      '',
      'Anyone can open that page and check the signature. Paste this into your GitHub profile README:',
      '',
      snippet,
    );
  } else if (passed && signingNote) {
    parts.push('', signingNote);
  }
  return parts.join('\n');
}
