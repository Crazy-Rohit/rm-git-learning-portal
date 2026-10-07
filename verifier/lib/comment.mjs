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

export function submitUrl(stage, login, repoName = PORTAL.labName) {
  const query = new URLSearchParams({
    template: 'submit-stage.yml',
    stage: String(stage),
  });
  if (repoName) query.set('repo', `${login}/${repoName}`);
  return `https://github.com/${PORTAL.owner}/${PORTAL.repo}/issues/new?${query}`;
}

function codespaceStart({ stage, login, code, intro, commands, after = '', guide }) {
  const lines = [
    `Stage ${stage} has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    intro,
    '',
    `Open [git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}). If you still have the stage 1 codespace, you can use that. Paste the lines below into the terminal and press Enter.`,
    '',
    '```bash',
    ...commands,
    '```',
  ];
  if (after) lines.push('', after);
  lines.push(
    '',
    `**Submit.** Open [Submit stage ${stage}](${submitUrl(stage, login)}) and choose **Create**. The form should say \`${login}/git-lab\`.`,
    '',
    `[Stage guide](https://github.com/${PORTAL.owner}/${PORTAL.repo}/blob/main/HANDBOOK.md#${guide})`,
  );
  return lines.join('\n');
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

function stage2Start(code, login) {
  return codespaceStart({
    stage: 2,
    login,
    code,
    guide: 'stage-2-branches-and-pull-requests',
    intro: 'This stage is a branch and a pull request in git-lab.',
    commands: [
      `echo "${code}" > .stage/stage-2.txt`,
      'git add .stage/stage-2.txt',
      'git commit -m "Add stage 2 code"',
      'git push',
      'git switch -c feature/about-page',
      'echo "I am learning branches and pull requests." > about.md',
      'git add about.md',
      'git commit -m "Add an about page with my learning goals"',
      'git push -u origin feature/about-page',
    ],
    after: 'On GitHub, open a pull request from `feature/about-page` into `main`. Write at least two sentences about what changed and why. Do not use a commit message that is only `update` or `fix`. Merge the pull request, then submit.',
  });
}

function stage3Start(code, login) {
  return codespaceStart({
    stage: 3,
    login,
    code,
    guide: 'stage-3-merge-conflicts',
    intro: 'This stage merges the two greeting branches that came with the template.',
    commands: [
      `echo "${code}" > .stage/stage-3.txt`,
      'git add .stage/stage-3.txt',
      'git commit -m "Add stage 3 code"',
      'git switch main',
      'git pull',
      'git fetch origin',
      'git merge origin/greeting-a',
      'git merge origin/greeting-b',
    ],
    after: 'The second merge conflicts. Open `greeting.txt`, delete the `<<<<<<<`, `=======`, and `>>>>>>>` lines, and keep both ideas, for example `Hello, welcome to the team and good luck`. Then run `git add greeting.txt`, `git commit`, and `git push`.',
  });
}

function stage4Start(code, login) {
  return codespaceStart({
    stage: 4,
    login,
    code,
    guide: 'stage-4-undo-and-history',
    intro: 'This stage undoes a pushed commit and marks a release.',
    commands: [
      `echo "${code}" > .stage/stage-4.txt`,
      'git add .stage/stage-4.txt',
      'git commit -m "Add stage 4 code"',
      'echo "This line is a mistake" >> notes.txt',
      'git add notes.txt',
      'git commit -m "Add a note that should not be here"',
      'git push',
      'git revert --no-edit HEAD',
      'git push',
      'git tag -a v1.0.0 -m "First stable version of my lab"',
      'git push origin v1.0.0',
    ],
    after: 'If `git revert HEAD` opens an editor, save and close it so the revert commit is created. Keep the message Git writes.',
  });
}

function stage5Start(code, login) {
  return [
    `Stage 5 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    `First, in git-lab, save the code. Open [git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}) and paste:`,
    '',
    '```bash',
    `echo "${code}" > .stage/stage-5.txt`,
    'git add .stage/stage-5.txt',
    'git commit -m "Add stage 5 code"',
    'git push',
    '```',
    '',
    `Then fork the practice repository: [Fork rm-practice-repo](https://github.com/${PORTAL.practiceFullName}/fork). On your fork, add exactly one file, \`contributors/${login}.md\`, on a new branch, and open a pull request into \`${PORTAL.practiceFullName}\`.`,
    '',
    '```bash',
    `git clone https://github.com/${login}/${PORTAL.practiceName}.git`,
    `cd ${PORTAL.practiceName}`,
    'git switch -c add-me',
    'mkdir -p contributors',
    `echo "Hi, I am ${login} and I am learning Git." > contributors/${login}.md`,
    `git add contributors/${login}.md`,
    `git commit -m "Add ${login} to contributors"`,
    'git push -u origin add-me',
    '```',
    '',
    'Open the pull request from that branch into the original repository. A workflow merges it when the only change is that one new file. Wait until it is merged, then submit.',
    '',
    `**Submit.** Open [Submit stage 5](${submitUrl(5, login)}) and choose **Create**. The repository is still \`${login}/git-lab\`.`,
    '',
    `[Stage guide](https://github.com/${PORTAL.owner}/${PORTAL.repo}/blob/main/HANDBOOK.md#stage-5-fork-and-pull-request)`,
  ].join('\n');
}

function stage6Start(code, login) {
  return codespaceStart({
    stage: 6,
    login,
    code,
    guide: 'stage-6-automation',
    intro: 'This stage adds a GitHub Actions workflow that fails, then you fix it.',
    commands: [
      `echo "${code}" > .stage/stage-6.txt`,
      'git add .stage/stage-6.txt',
      'git commit -m "Add stage 6 code"',
      'mkdir -p .github/workflows',
      "cat > .github/workflows/check.yml << 'EOF'",
      'name: Check',
      'on: [push]',
      'jobs:',
      '  check:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - name: README must mention Git',
      '        run: grep -q "NOT-THERE-YET" README.md',
      'EOF',
      'git add .github/workflows/check.yml',
      'git commit -m "Add a check that fails on purpose"',
      'git push',
    ],
    after: 'Open the Actions tab and wait until the run is red. In `.github/workflows/check.yml`, change `NOT-THERE-YET` to `Git`, then run `git add .github/workflows/check.yml`, `git commit -m "Make the check look for Git"`, and `git push`. Wait until the next run is green, then submit.',
  });
}

function stage7Start(code, login) {
  return [
    `Stage 7 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    'Create a **new public repository** for a small project of your own. Do not use `git-lab`. Then open it in Codespaces and build the checklist below. Save your code in that project, not in git-lab:',
    '',
    '```bash',
    `echo "${code}" > .stage/stage-7.txt`,
    'git add .stage/stage-7.txt',
    'git commit -m "Add stage 7 code"',
    'git push',
    '```',
    '',
    '- `README.md` that says what the project is and how to use it',
    '- A licence file, for example `LICENSE`',
    '- A `.gitignore` that suits the project',
    '- A GitHub Actions workflow that passes on `main`',
    '- GitHub Pages turned on, with a published address',
    '- At least three pull requests merged into `main`',
    '- One of those pull requests closes an issue. Write `Fixes #12` in its description, using the real issue number',
    '- A GitHub release tagged `v1.0.0` with release notes',
    '',
    `**Submit.** Open [Submit stage 7](${submitUrl(7, login, '')}) and choose **Create**. In **Your lab repository**, enter \`${login}/your-project-name\`.`,
    '',
    `[Stage guide](https://github.com/${PORTAL.owner}/${PORTAL.repo}/blob/main/HANDBOOK.md#stage-7-capstone-project)`,
  ].join('\n');
}

export function startMessage(stage, code, login) {
  const number = Number(stage);
  if (number === 1) return stage1Start(code, login);
  if (number === 2) return stage2Start(code, login);
  if (number === 3) return stage3Start(code, login);
  if (number === 4) return stage4Start(code, login);
  if (number === 5) return stage5Start(code, login);
  if (number === 6) return stage6Start(code, login);
  if (number === 7) return stage7Start(code, login);
  return `Stage ${stage} is not a stage of this course.`;
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
