import { PORTAL } from './portal.mjs';

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

export function renderResult({ stage, passed, checks }) {
  const head = passed
    ? `Stage ${stage} passed.`
    : `Stage ${stage} did not pass. Fix the items below and open a new Submit issue.`;
  const lines = checks.map((check) => {
    const mark = check.ok ? 'x' : ' ';
    const detail = !check.ok && check.detail ? `\n  ${check.detail}` : '';
    return `- [${mark}] **${check.name}**${detail}`;
  });
  return [
    head,
    '',
    ...lines,
    '',
    `Handbook: ${PORTAL.handbookUrl}#ch6`,
  ].join('\n');
}
