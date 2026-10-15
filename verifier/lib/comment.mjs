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

export function startUrl(stage) {
  const query = new URLSearchParams({
    template: 'start-stage.yml',
    stage: String(stage),
  });
  return `https://github.com/${PORTAL.owner}/${PORTAL.repo}/issues/new?${query}`;
}

const GUIDE = `https://github.com/${PORTAL.owner}/${PORTAL.repo}/blob/main/HANDBOOK.md`;

export function guideUrl(anchor) {
  return `${GUIDE}#${anchor}`;
}

const STAGE_GUIDE = {
  1: 'stage-1-first-repository',
  2: 'stage-2-branches-and-pull-requests',
  3: 'stage-3-merge-conflicts',
  4: 'stage-4-undo-and-history',
  5: 'stage-5-fork-and-pull-request',
  6: 'stage-6-automation',
  7: 'stage-7-capstone-project',
};

const CHECK_FIX = {
  'Challenge code file is correct': 'challenge-code-file-is-wrong',
  '.gitignore contains *.log': 'gitignore-is-missing-the-log-rule',
  'At least three commits by you after the start time': 'only-two-commits',
  'README.md was changed after the start time': 'readme-was-not-changed',
  'Lab repository exists and is public': 'repository-not-found',
  'Created from the lab template': 'not-created-from-the-template',
  'Submission names your git-lab repository': 'wrong-repository-name-on-the-form',
  'Repository belongs to you': 'repository-not-found',
};

function codespaceStart({ stage, login, code, intro, commands, after = '', guide }) {
  const lines = [
    `Stage ${stage} has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    intro,
    '',
    `Open [git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}). If you still have the stage 1 codespace, you can use that. Copy **every** line below, paste them into the terminal, and press Enter. If a box asks about several lines, choose **Paste**.`,
    '',
    '```bash',
    ...commands,
    '```',
  ];
  if (after) lines.push('', after);
  lines.push(
    '',
    `**Submit.** Open [Submit stage ${stage}](${submitUrl(stage, login)}) and choose **Create**. The form should say \`${login}/git-lab\`. If **Stage** says None, choose ${stage}.`,
    '',
    'If a check fails, stay in this codespace, paste any lines you skipped, push, and open a **new** Submit. Do not open another Start.',
    '',
    `[Stage ${stage} guide](${guideUrl(guide)}) · [If a check fails](${guideUrl('when-a-check-fails')})`,
  );
  return lines.join('\n');
}

function stage1Start(code, login) {
  return [
    `Stage 1 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    'You only need this browser. Do these three steps in order. Do not open Git CMD. Do not create a folder on your computer.',
    '',
    `**Step 1. Create your lab.** Skip this if you already have \`${login}/${PORTAL.labName}\`.`,
    `Open [Create my git-lab](${labCreateUrl(login)}), tick **Include all branches**, and choose **Create repository**.`,
    'Yellow **Compare & pull request** bars for `greeting-a` and `greeting-b` are from the template. Ignore them. Do not merge those branches in any stage.',
    '',
    '**Step 2. Do the work in Codespaces.**',
    `Open [My git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}) and choose **Create codespace**. An editor opens in the browser with a terminal at the bottom. Before you paste, open \`data/profile.json\` and replace \`YOUR NAME\`, \`YOUR HEADLINE\`, and \`YOUR-USERNAME\`. Use your real name, a headline such as Student or Developer, and the login \`${login}\`. Then copy **every** line below, paste them into that terminal, and press Enter. If it asks whether to paste several lines, choose **Paste**.`,
    '',
    '```bash',
    'if [ ! -f data/profile.json ]; then',
    '  mkdir -p data',
    '  base="https://raw.githubusercontent.com/Crazy-Rohit/rm-git-lab-template/main"',
    '  curl -fsSL "$base/index.html" -o index.html',
    '  curl -fsSL "$base/style.css" -o style.css',
    '  curl -fsSL "$base/app.js" -o app.js',
    '  curl -fsSL "$base/data/profile.json" -o data/profile.json',
    '  curl -fsSL "$base/data/about.json" -o data/about.json',
    '  curl -fsSL "$base/data/education.json" -o data/education.json',
    '  curl -fsSL "$base/data/skills.json" -o data/skills.json',
    '  curl -fsSL "$base/data/experience.json" -o data/experience.json',
    '  curl -fsSL "$base/data/projects.json" -o data/projects.json',
    '  curl -fsSL "$base/data/contact.json" -o data/contact.json',
    '  git add index.html style.css app.js data',
    '  git commit -m "Add the portfolio pages"',
    'fi',
    `echo "${code}" > .stage/stage-1.txt`,
    'git add .stage/stage-1.txt',
    'git commit -m "Add stage 1 code"',
    'echo "I am learning Git with Rohit Manna." >> README.md',
    'git add README.md data/profile.json',
    'git commit -m "Introduce myself in the README"',
    'echo "*.log" >> .gitignore',
    'git add .gitignore',
    'git commit -m "Ignore log files"',
    'git push',
    'git log --oneline',
    '```',
    '',
    'The last command lists your commits. You should see at least three new ones. Read each command against [handbook chapters 6 to 10](' + PORTAL.handbookUrl + '#ch6) to see what it did.',
    '',
    `**Step 3. Submit.** Open [Submit stage 1](${submitUrl(1, login)}) and choose **Create**. If **Stage** says None, choose **1**. The reply lists every check.`,
    '',
    'If a check fails, stay in this codespace, paste any lines you skipped, push, and open a **new** Submit. Do not open another Start.',
    '',
    'If the identity check fails, `data/profile.json` still has a placeholder. Edit that file, then run `git add data/profile.json`, `git commit -m "Add my name to the portfolio"`, and `git push`. Do not edit those words inside `index.html`. The page reads the JSON file.',
    '',
    `[Stage 1 guide](${guideUrl('stage-1-first-repository')}) · [Screens you will see](${guideUrl('screens-you-will-see')}) · [If a check fails](${guideUrl('when-a-check-fails')})`,
  ].join('\n');
}

function stage2Start(code, login) {
  return codespaceStart({
    stage: 2,
    login,
    code,
    guide: 'stage-2-branches-and-pull-requests',
    intro: 'This stage fills your About section on a branch, then merges that branch with a pull request. Open `data/about.json` first. Replace `YOUR SUMMARY` with a few sentences about you, set `careerGoal`, or add one interest.',
    commands: [
      `echo "${code}" > .stage/stage-2.txt`,
      'git add .stage/stage-2.txt',
      'git commit -m "Add stage 2 code"',
      'git push',
      'git switch -c feature/about-me',
      'git add data/about.json',
      'git commit -m "Add my about section"',
      'git push -u origin feature/about-me',
    ],
    after: 'On GitHub, open a pull request from `feature/about-me` into `main`. Write at least two sentences about what changed and why. Do not use a commit message that is only `update` or `fix`. Merge the pull request, then submit. If the About check fails, the summary is still the placeholder. Edit `data/about.json` on `feature/about-me`, commit, push, and merge again.',
  });
}

function stage3Start(code, login) {
  return codespaceStart({
    stage: 3,
    login,
    code,
    guide: 'stage-3-merge-conflicts',
    intro: 'This stage fills your Education section from two branches, then merges them. The second merge conflicts. Do not merge the template branches `origin/greeting-a` or `origin/greeting-b`.',
    commands: [
      `echo "${code}" > .stage/stage-3.txt`,
      'git add .stage/stage-3.txt',
      'git commit -m "Add stage 3 code"',
      'git switch main',
      'git pull',
      'git switch -C education-details',
      "cat > data/education.json << 'EOF'",
      '[',
      '  {',
      '    "institution": "YOUR INSTITUTION",',
      '    "qualification": "YOUR QUALIFICATION",',
      '    "field": "",',
      '    "startYear": "",',
      '    "endYear": "",',
      '    "description": "Details from the first branch"',
      '  }',
      ']',
      'EOF',
      'git add data/education.json',
      'git commit -m "Add education details"',
      'git switch main',
      'git switch -C education-study',
      "cat > data/education.json << 'EOF'",
      '[',
      '  {',
      '    "institution": "YOUR INSTITUTION",',
      '    "qualification": "YOUR QUALIFICATION",',
      '    "field": "YOUR FIELD",',
      '    "startYear": "",',
      '    "endYear": "",',
      '    "description": "What I studied"',
      '  }',
      ']',
      'EOF',
      'git add data/education.json',
      'git commit -m "Add what I studied"',
      'git switch main',
      'git merge education-details',
      'git merge education-study',
    ],
    after: 'The last merge conflicts in `data/education.json`. Delete the `<<<<<<<`, `=======`, and `>>>>>>>` lines and keep one JSON list. Replace `YOUR INSTITUTION` and `YOUR QUALIFICATION` with your school, college, or a course, and write a real description. Then run `git add data/education.json`, `git commit --no-edit`, and `git push`.',
  });
}

function stage4Start(code, login) {
  return codespaceStart({
    stage: 4,
    login,
    code,
    guide: 'stage-4-undo-and-history',
    intro: 'This stage fills your Skills section, commits one skill by mistake, undoes that commit, and marks version 1.0.0. Before you paste, open `data/skills.json` and replace `YOUR SKILL` with a real skill.',
    commands: [
      `echo "${code}" > .stage/stage-4.txt`,
      'git add .stage/stage-4.txt',
      'git commit -m "Add stage 4 code"',
      'git add data/skills.json',
      'git commit -m "Add my skills"',
      'node -e "const fs=require(\'fs\');const p=\'data/skills.json\';const d=JSON.parse(fs.readFileSync(p,\'utf8\'));d.technical.push(\'Gittt\');fs.writeFileSync(p, JSON.stringify(d,null,2))"',
      'git add data/skills.json',
      'git commit -m "Add a skill that should not be here"',
      'git push',
      'git revert --no-edit HEAD',
      'git push',
      'git tag -a v1.0.0 -m "First stable version of my portfolio"',
      'git push origin v1.0.0',
    ],
    after: 'If `git revert HEAD` opens an editor, save and close it so the revert commit is created. Keep the message Git writes. After the revert, `data/skills.json` must not contain `Gittt`.',
  });
}

function stage5Start(code, login) {
  return [
    `Stage 5 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    `First, in git-lab, open \`data/experience.json\`. Replace \`YOUR ROLE\` with a job, internship, college activity, or a fresher profile, and write what you did. Then open [git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}) and paste:`,
    '',
    '```bash',
    `echo "${code}" > .stage/stage-5.txt`,
    'git add .stage/stage-5.txt data/experience.json',
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
    `Open the pull request into the original repository, not into your fork: https://github.com/${PORTAL.practiceFullName}/compare/main...${login}:${PORTAL.practiceName}:add-me`,
    'The base must be `Crazy-Rohit/rm-practice-repo` and the compare side must be your fork. A workflow merges it when the only change is that one new file. Wait until it is merged, then submit.',
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
    intro: 'This stage fills your Projects and Contact sections, then adds a GitHub Actions workflow that fails until you fix it. Before you paste, open `data/projects.json` and `data/contact.json` and replace the placeholders. Add one project, and one way to reach you.',
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
      'git add .github/workflows/check.yml data/projects.json data/contact.json',
      'git commit -m "Add a check that fails on purpose"',
      'git push',
    ],
    after: 'Open the Actions tab and wait until the run is red. In `.github/workflows/check.yml`, change `NOT-THERE-YET` to `Git`, then run `git add .github/workflows/check.yml`, `git commit -m "Make the check look for Git"`, and `git push`. Wait until the next run is green, then submit. `data/projects.json` needs a real project, and `data/contact.json` needs one link or email.',
  });
}

function stage7Start(code, login) {
  return [
    `Stage 7 has started for @${login}. Your personal code is \`${code}\`.`,
    '',
    `Publish the portfolio you already built in \`${login}/git-lab\`. Do not create a second repository. Open [git-lab in Codespaces](https://codespaces.new/${login}/${PORTAL.labName}) and paste:`,
    '',
    '```bash',
    `echo "${code}" > .stage/stage-7.txt`,
    'git add .stage/stage-7.txt',
    'git commit -m "Add stage 7 code"',
    'git push',
    '```',
    '',
    '- Every `data/` file uses your own information. No value may still start with `YOUR`.',
    '- GitHub Actions on `main` is green. Stage 6 already added that workflow.',
    '- GitHub Pages is on: Settings, Pages, Deploy from branch `main`, folder `/ (root)`.',
    '- Open an issue called `Publish my portfolio`. On a branch `feature/final-polish`, make the last edit, push it, and open a pull request whose description contains `Fixes #` and the issue number. Merge it.',
    '- Publish a GitHub release tagged `v2.0.0` with at least one sentence of notes. `v1.0.0` was stage 4.',
    '',
    `**Submit.** Open [Submit stage 7](${submitUrl(7, login)}) and choose **Create**. The repository is \`${login}/git-lab\`.`,
    '',
    'If a check fails, fix the unchecked items, push, and open a **new** Submit. Do not open another Start.',
    '',
    `[Stage 7 guide](${guideUrl('stage-7-capstone-project')}) · [If a check fails](${guideUrl('when-a-check-fails')})`,
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
    : `Stage ${stage} did not pass. Fix the unchecked items in the same codespace, push, and open a **new** Submit issue. Do not open another Start.`;
  const lines = checks.map((check) => {
    const mark = check.ok ? 'x' : ' ';
    const detail = !check.ok && check.detail ? `\n  ${check.detail}` : '';
    const fix = !check.ok && CHECK_FIX[check.name] ? `\n  ${guideUrl(CHECK_FIX[check.name])}` : '';
    return `- [${mark}] **${check.name}**${detail}${fix}`;
  });
  const stageGuide = STAGE_GUIDE[Number(stage)] || 'when-a-check-fails';
  const parts = [
    head,
    '',
    ...lines,
    '',
  ];
  if (passed) {
    const next = Number(stage) + 1;
    if (next <= 7) {
      parts.push(`Stage ${next} is now open. [Start stage ${next}](${startUrl(next)})`);
    } else {
      parts.push(`Course complete. Open [Progress](${PORTAL.siteUrl}progress.html) to read your badges.`);
    }
    parts.push('', `[Stage ${stage} guide](${guideUrl(stageGuide)})`);
  } else {
    parts.push(`[How to fix this](${guideUrl('when-a-check-fails')}) · [Stage ${stage} guide](${guideUrl(stageGuide)}) · [Screens you will see](${guideUrl('screens-you-will-see')})`);
    parts.push('', `Handbook: ${PORTAL.handbookUrl}#ch6`);
  }
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
