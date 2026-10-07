import { badgeFor } from './badges.mjs';
import { PORTAL } from './portal.mjs';
import { sharePageUrl } from './share.mjs';

export function profileSnippet(stage, id) {
  const badge = badgeFor(stage);
  if (!badge) return '';
  const image = `${PORTAL.siteUrl}badges/${badge.slug}.png`;
  const verify = `${PORTAL.siteUrl}verify.html?id=${encodeURIComponent(id)}`;
  return `[![${badge.title}](${image})](${verify})`;
}

export function labCreateUrl(login) {
  const [owner, name] = PORTAL.templateFullName.split('/');
  const query = new URLSearchParams({
    template_owner: owner,
    template_name: name,
    owner: login,
    name: PORTAL.labName,
    visibility: 'public',
  });
  return `https://github.com/new?${query}`;
}

export function submitUrl(stage, login) {
  const query = new URLSearchParams({
    template: 'submit-stage.yml',
    stage: String(stage),
    repo: `${login}/${PORTAL.labName}`,
  });
  return `https://github.com/${PORTAL.owner}/${PORTAL.repo}/issues/new?${query}`;
}

function stage1Start(code, login) {
  return [
    `Stage 1 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    'You only need this browser. Do these three steps in order.',
    '',
    `**Step 1. Create your lab.** Skip this if you already have \`${login}/${PORTAL.labName}\`.`,
    `Open [Create my git-lab](${labCreateUrl(login)}), tick **Include all branches**, and choose **Create repository**.`,
    '',
    '**Step 2. Do the work in Codespaces.**',
    `Open [My git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}) and choose **Create codespace**. An editor opens in the browser with a terminal at the bottom. Copy all the lines below, paste them into that terminal, and press Enter. If it asks whether to paste several lines, choose **Paste**.`,
    '',
    '```bash',
    `echo "${code}" > .stage/stage-1.txt`,
    'git add .stage/stage-1.txt',
    'git commit -m "Add stage 1 code"',
    'echo "I am learning Git with Rohit Manna." >> README.md',
    'git add README.md',
    'git commit -m "Introduce myself in the README"',
    'echo "*.log" >> .gitignore',
    'git add .gitignore',
    'git commit -m "Ignore log files"',
    'git push',
    'git log --oneline',
    '```',
    '',
    'The last command lists your commits. Read each command against the handbook to see what it did.',
    '',
    `**Step 3. Submit.** Open [Submit stage 1](${submitUrl(1, login)}) and choose **Create**. The reply lists every check.`,
    '',
    'Optional: in Codespaces, open `index.html` from the file list, change `YOUR NAME` and `YOUR-USERNAME`, then run `git commit -am "Put my name on the card"` and `git push`.',
    '',
    `[Stage guide](https://github.com/${PORTAL.owner}/${PORTAL.repo}/blob/main/HANDBOOK.md#stage-1-first-repository)`,
  ].join('\n');
}

export function startMessage(stage, code, login) {
  if (Number(stage) === 1) return stage1Start(code, login);
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
      `Share this link on WhatsApp, Facebook, or LinkedIn: ${sharePageUrl(credentialId)}`,
      '',
      'Anyone can open the badge page and check the signature. Paste this into your GitHub profile README:',
      '',
      snippet,
    );
  } else if (passed && signingNote) {
    parts.push('', signingNote);
  }
  return parts.join('\n');
}
