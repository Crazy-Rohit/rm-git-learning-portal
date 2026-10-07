# Git Learning Portal: stage guide

This guide shows how to learn and pass each stage of the [Git Learning Portal](https://crazy-rohit.github.io/rm-git-learning-portal/). Read it next to the [handbook](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/). The handbook explains each command. This guide tells you what to do and what the check looks for.

The course is by Rohit Manna. Everything runs on GitHub, so you only need a free GitHub account.

## Contents

- [How the portal works](#how-the-portal-works)
- [Before you begin](#before-you-begin)
- [The cycle for every stage](#the-cycle-for-every-stage)
- [Stage 1: First repository](#stage-1-first-repository)
- [Stage 2: Branches and pull requests](#stage-2-branches-and-pull-requests)
- [Stage 3: Merge conflicts](#stage-3-merge-conflicts)
- [Stage 4: Undo and history](#stage-4-undo-and-history)
- [Stage 5: Fork and pull request](#stage-5-fork-and-pull-request)
- [Stage 6: Automation](#stage-6-automation)
- [Stage 7: Capstone project](#stage-7-capstone-project)
- [When a check fails](#when-a-check-fails)
- [Rules and privacy](#rules-and-privacy)
- [Command reference](#command-reference)

## How the portal works

1. You do real work in a public repository on **your own** GitHub account.
2. You open an issue in [rm-git-learning-portal](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues). That issue is how the portal knows who you are, so you never create a separate login.
3. A GitHub Actions workflow reads your public repository through the GitHub API and replies on the issue with each check, pass or fail.
4. Your progress is saved in a public record under your GitHub account's permanent numeric id. You can see it on the [Progress](https://crazy-rohit.github.io/rm-git-learning-portal/progress.html) page.

The portal never runs your code and cannot read private repositories. Every check is something anyone could see on your public GitHub profile.

Stages open in order. You can start stage 2 only after stage 1 is passed, and so on.

> **What is open today:** stage 1. Stages 2 to 7 are described below so you can learn and practise now. Their checks open later, and the details may change slightly when they do.

## Before you begin

### 1. Create a GitHub account

Sign up at [github.com](https://github.com/signup). Pick a username you are happy to show to employers, because your work in this course is public.

### 2. That is all you need

You do the work in **GitHub Codespaces**: an editor with a terminal that opens in your browser, with Git already set up and signed in to your account. Nothing to install. Personal accounts get a free monthly allowance, which is far more than this course needs.

The Start reply for each stage gives you the links and commands. You do not have to choose a terminal or configure anything.

### Optional: work on your own computer instead

Skip this unless you want Git on your own machine. If you use it, do these steps once, then run the same commands from the Start reply in your own terminal inside the `git-lab` folder.

**Install Git.** Follow [handbook chapter 4](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch4). Then check it works:

```bash
git --version
```

**Tell Git who you are.** On your own computer this step matters more than any other. The portal only counts commits that GitHub links to your account, and GitHub links a commit by its email address.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

Use an email that is **added and verified** on GitHub under **Settings → Emails**. If you want to keep your email private, use the noreply address shown on that page. It looks like `12345678+your-username@users.noreply.github.com`.

To check what Git will use:

```bash
git config user.name
git config user.email
```

See [handbook chapter 5](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch5) for the full setup, including your editor and line endings.

**Sign in and clone.** Create `git-lab` first (stage 1, step 1 below), then:

```bash
git clone https://github.com/YOUR-USERNAME/git-lab.git
cd git-lab
```

The first time you push, Git asks you to sign in and a browser window opens. For SSH keys or tokens, read [handbook chapter 23](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch23).

You use the same `git-lab` repository for stages 1 to 4 and 6.

## The cycle for every stage

Every stage follows the same five steps.

1. **Read.** Each stage below lists the handbook chapters to read first.
2. **Start.** Open a [Start issue](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml) and choose the stage. Within a minute the portal replies with your **personal code** and closes the issue.
3. **Save the code.** Commit the code as the only line of `.stage/stage-N.txt` on `main`, where `N` is the stage number.
4. **Do the work.** Only work done **after** the Start issue counts. The start time is saved once and does not change if you open another Start issue.
5. **Submit.** Open a [Submit issue](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=submit-stage.yml). Choose the stage and enter your repository as `your-username/git-lab`. The reply lists every check.

### Why the personal code

The code is made from your GitHub account id and the stage number. Another learner's code does not work in your repository, and yours does not work in theirs. That is why copying a finished repository fails.

### Saving the code

```bash
mkdir -p .stage
echo "PASTE-YOUR-CODE" > .stage/stage-1.txt
git add .stage/stage-1.txt
git commit -m "Add stage 1 code"
git push
```

For stage 1 the Start reply gives you this command with your code filled in. In Codespaces it works as written. On your own Windows computer, PowerShell's `echo` can add a hidden byte-order mark; if the code check fails, create the file in an editor, paste the code, and save it as UTF-8.

---

## Stage 1: First repository

**You learn:** how a repository is born, how the three areas of Git work, how to commit, how to read history, and how to ignore files.

**Time:** about an hour.

### Read first

| Chapter | Topic |
| --- | --- |
| [6](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch6) | Your first repository |
| [7](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch7) | The three areas of Git |
| [8](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch8) | Making commits |
| [9](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch9) | Viewing history |
| [10](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch10) | Ignoring files |

### Key ideas

- The **working directory** is the files you edit. The **staging area** is what goes into the next commit. The **repository** is the saved history.
- `git add` moves changes into the staging area. `git commit` saves the staging area as a new commit.
- `.gitignore` lists files Git should not track, such as logs and build output.

### Step by step

1. Choose [Start stage 1](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=1), then **Create**. GitHub shows the issue page. That is expected.
2. Wait about a minute and refresh. The portal replies with your personal code and three steps. Follow them in order:
   - **Create my git-lab.** The link opens GitHub's new-repository page already filled in: from `rm-git-lab-template`, named `git-lab`, public. Tick **Include all branches** and choose **Create repository**.
   - **My git-lab in Codespaces.** Choose **Create codespace**. An editor opens with a terminal at the bottom. Paste the commands from the reply and press Enter. They save your code, change the README, ignore log files, commit each change, and push.
   - **Submit stage 1.** The link opens the Submit form already filled in. Choose **Create**.
3. Wait a minute and refresh the Submit issue. The reply lists every check.

The commands in the reply, with your code in place of `YOUR-CODE`:

```bash
echo "YOUR-CODE" > .stage/stage-1.txt   # save your personal code
git add .stage/stage-1.txt               # stage it
git commit -m "Add stage 1 code"         # commit 1
echo "I am learning Git with Rohit Manna." >> README.md
git add README.md
git commit -m "Introduce myself in the README"   # commit 2
echo "*.log" >> .gitignore               # ignore log files
git add .gitignore
git commit -m "Ignore log files"         # commit 3
git push                                 # send the commits to GitHub
git log --oneline                        # list your commits
```

To see the ignore rule work, run `echo test > debug.log` and then `git status`. `debug.log` is not listed.

**Put your name on your card (optional).** In the codespace, open `index.html` from the file list on the left. Under the comment `Change the two lines below`, replace `YOUR NAME` with your name and `YOUR-USERNAME` with your GitHub username. Then run:

```bash
git commit -am "Put my name on the card"
git push
```

### Your card on the web

`index.html` in `git-lab` is a small portfolio card. To put it online, open your repository's **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. After a minute the card is live at `https://your-username.github.io/git-lab/`. Every time you change the file and push, the page updates.

### What the check looks for

| Check | How to pass |
| --- | --- |
| Submission names your git-lab repository | Enter `your-username/git-lab` in the form |
| Lab repository exists and is public | The repository is named `git-lab` and set to Public |
| Repository belongs to you | It is on the account that opened the Submit issue |
| Created from the lab template | It was made with **Use this template** from `rm-git-lab-template` |
| Challenge code file is correct | `.stage/stage-1.txt` on `main` contains only your code |
| `.gitignore` contains `*.log` | One line is exactly `*.log` |
| At least three commits by you after the start time | Three or more commits after your Start issue, linked to your GitHub account |
| `README.md` was changed after the start time | One of those commits edits `README.md` |

### Practise more

- Run `git diff` before `git add`, then `git diff --staged` after it, and compare the output.
- Unstage a file with `git restore --staged <file>`.
- Try `git log --stat` and `git show HEAD`.

---

## Stage 2: Branches and pull requests

> Not open yet. You can learn and practise it now.

**You learn:** how to work on a branch, push it, and merge it through a pull request with a clear description.

### Read first

| Chapter | Topic |
| --- | --- |
| [14](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch14) | Branches and HEAD |
| [15](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch15) | Merging |
| [21](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch21) | Remotes and cloning |
| [22](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch22) | Push, pull and fetch |
| [25](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch25) | Pull requests |
| [26](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch26) | Code review |

### Step by step

1. Open a Start issue for stage **2** and save the code in `.stage/stage-2.txt` on `main`.
2. Create a feature branch. The name must start with `feature/`:

   ```bash
   git switch main
   git pull
   git switch -c feature/about-page
   ```

3. Make a change, for example a new file `about.md`, and commit it with a message that says what changed:

   ```bash
   git add about.md
   git commit -m "Add an about page with my learning goals"
   git push -u origin feature/about-page
   ```

4. On GitHub, open a pull request from `feature/about-page` into `main`.
5. Write a description of at least a couple of sentences: what changed and why.
6. Merge the pull request on GitHub.
7. Update your local copy:

   ```bash
   git switch main
   git pull
   ```

8. Submit stage 2.

### What the check is planned to look for

- A pull request merged into `main` from a branch named `feature/...` after your start time.
- A written description on that pull request.
- No commit messages that are only `update` or `fix`.
- The stage 2 code in `.stage/stage-2.txt`.

---

## Stage 3: Merge conflicts

> Not open yet. You can learn and practise it now.

**You learn:** why conflicts happen, how to read conflict markers, and how to finish a merge.

### Read first

| Chapter | Topic |
| --- | --- |
| [15](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch15) | Merging |
| [16](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch16) | Merge conflicts |

### The setup

Your `git-lab` template came with two branches that both change the same line of `greeting.txt`:

| Branch | `greeting.txt` |
| --- | --- |
| `main` | `Hello` |
| `greeting-a` | `Hello, welcome to the team` |
| `greeting-b` | `Hello and good luck` |

If you did not tick **Include all branches**, create a new `git-lab` from the template, or make these two branches yourself.

### Step by step

1. Start stage **3** and save the code in `.stage/stage-3.txt`.
2. Merge the first branch. This one merges cleanly:

   ```bash
   git switch main
   git pull
   git fetch origin
   git merge origin/greeting-a
   ```

3. Merge the second branch. This one conflicts:

   ```bash
   git merge origin/greeting-b
   ```

4. Open `greeting.txt`. You see markers like these:

   ```text
   <<<<<<< HEAD
   Hello, welcome to the team
   =======
   Hello and good luck
   >>>>>>> origin/greeting-b
   ```

5. Replace the whole block with one line that keeps both ideas, and delete every marker line:

   ```text
   Hello, welcome to the team and good luck
   ```

6. Finish the merge:

   ```bash
   git add greeting.txt
   git commit
   git push
   ```

7. Run `git log --oneline --graph` and find the merge commit with two parents.
8. Submit stage 3.

### What the check is planned to look for

- A merge commit with two parents on `main` after your start time.
- `greeting.txt` contains both `welcome` and `good luck`.
- No `<<<<<<<`, `=======` or `>>>>>>>` lines left in the file.
- The stage 3 code in `.stage/stage-3.txt`.

---

## Stage 4: Undo and history

> Not open yet. You can learn and practise it now.

**You learn:** the safe way to undo a commit that is already pushed, how reset differs from revert, and how to mark a release with a tag.

### Read first

| Chapter | Topic |
| --- | --- |
| [11](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch11) | Undoing changes |
| [20](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch20) | Tags |
| [35](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch35) | Reflog and recovery |

### Key ideas

- `git revert` adds a new commit that undoes an old one. It is safe on shared branches.
- `git reset` moves the branch pointer. Use it only on commits you have not pushed.
- An **annotated** tag stores a message, an author and a date. A lightweight tag does not.

### Step by step

1. Start stage **4** and save the code in `.stage/stage-4.txt`.
2. Make a commit you will undo:

   ```bash
   echo "This line is a mistake" >> notes.txt
   git add notes.txt
   git commit -m "Add a note that should not be here"
   git push
   ```

3. Revert it, and keep the message Git writes:

   ```bash
   git log --oneline
   git revert <sha-of-that-commit>
   git push
   ```

   The message starts with `Revert "..."` and contains `This reverts commit <sha>`.

4. Try `git reset` locally on a throwaway commit you do **not** push, then use `git reflog` to find it again.
5. Create an annotated tag and push it:

   ```bash
   git tag -a v1.0.0 -m "First stable version of my lab"
   git push origin v1.0.0
   ```

6. Submit stage 4.

### What the check is planned to look for

- A commit made by `git revert` that reverts one of your own commits.
- An annotated tag named `v1.0.0` on GitHub.
- The stage 4 code in `.stage/stage-4.txt`.

---

## Stage 5: Fork and pull request

> Not open yet. You can learn and practise it now.

**You learn:** how to contribute to a project you do not own, which is how open source works.

### Read first

| Chapter | Topic |
| --- | --- |
| [21](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch21) | Remotes and cloning |
| [24](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch24) | Forks |
| [25](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch25) | Pull requests |
| [30](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch30) | Contributing to open source |

### Step by step

1. Start stage **5**. Save the code in `.stage/stage-5.txt` in your `git-lab`.
2. Fork [rm-practice-repo](https://github.com/Crazy-Rohit/rm-practice-repo) to your account.
3. Clone your fork and connect the original as `upstream`:

   ```bash
   git clone https://github.com/YOUR-USERNAME/rm-practice-repo.git
   cd rm-practice-repo
   git remote add upstream https://github.com/Crazy-Rohit/rm-practice-repo.git
   git remote -v
   ```

4. Add exactly one file named after your GitHub username:

   ```bash
   git switch -c add-your-username
   mkdir -p contributors
   echo "Hi, I am YOUR-USERNAME and I am learning Git." > contributors/YOUR-USERNAME.md
   git add contributors/YOUR-USERNAME.md
   git commit -m "Add YOUR-USERNAME to contributors"
   git push -u origin add-your-username
   ```

5. Open a pull request from your fork into `Crazy-Rohit/rm-practice-repo`.
6. Wait until it is merged, then submit stage 5.
7. Keep your fork up to date:

   ```bash
   git switch main
   git fetch upstream
   git merge upstream/main
   git push
   ```

### What the check is planned to look for

- A fork of `rm-practice-repo` on your account.
- A merged pull request from that fork that adds only `contributors/<your-username>.md`.
- The stage 5 code in `.stage/stage-5.txt` in your `git-lab`.

---

## Stage 6: Automation

> Not open yet. You can learn and practise it now.

**You learn:** how GitHub Actions runs checks on every push, and how to read a failing run and fix it.

### Read first

| Chapter | Topic |
| --- | --- |
| [31](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch31) | GitHub Actions |
| [32](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch32) | Actions in practice |

### Step by step

1. Start stage **6** and save the code in `.stage/stage-6.txt`.
2. Create `.github/workflows/check.yml` in `git-lab`. This version fails on purpose:

   ```yaml
   name: Check
   on: [push]
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: README must mention Git
           run: grep -q "NOT-THERE-YET" README.md
   ```

3. Commit and push. Open the **Actions** tab and watch the run turn red. Read the log to see why.
4. Fix it. Change `NOT-THERE-YET` to a word that is in your README, such as `Git`, then commit and push.
5. Watch the next run turn green.
6. Submit stage 6.

### What the check is planned to look for

- A workflow file in `.github/workflows/` in `git-lab`.
- A failed run followed by a successful run on the same branch, both after your start time.
- The stage 6 code in `.stage/stage-6.txt`.

---

## Stage 7: Capstone project

> Not open yet. You can start planning it now.

**You learn:** to run a small project the way real teams do, from first commit to a live site and a release.

### Read first

| Chapter | Topic |
| --- | --- |
| [27](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch27) | Issues, labels and projects |
| [28](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch28) | GitHub Pages |
| [29](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch29) | Repository hygiene |
| [33](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch33) | Branch protection and CODEOWNERS |
| [39](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch39) | Branching strategies |
| [40](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch40) | Team best practices |

### What to build

Pick something small you care about: a personal page, notes for a subject, or a tiny tool. Create a **new public repository** for it, separate from `git-lab`.

### Checklist

- [ ] `README.md` that says what the project is and how to use it
- [ ] A licence file, for example MIT
- [ ] A `.gitignore` that suits the project
- [ ] A GitHub Actions workflow that passes on `main`
- [ ] GitHub Pages turned on and the site live
- [ ] At least three merged pull requests
- [ ] At least one issue closed by a pull request, using `Fixes #12` in the pull request description
- [ ] A tagged release, for example `v1.0.0`, with release notes

### Tips

- Open an issue for each piece of work before you start it.
- Use one branch and one pull request per issue.
- Read your own pull request before merging it, as if someone else wrote it.

---

## When a check fails

The reply lists every check and says how to fix each one that failed. Fix them, push, and open a **new** Submit issue. You do not need a new Start issue, and your start time stays the same.

| Problem | Likely cause and fix |
| --- | --- |
| Commits are not counted | Git used an email that is not verified on GitHub. Fix `git config user.email`, then make new commits. Old commits keep their old email |
| Challenge code file is wrong | Extra text, quotes, or a byte-order mark. The file must contain only the code. Check that it is on `main` and pushed |
| Repository not found | It is private, misspelled, or not named exactly `git-lab` |
| Not created from the template | You created an empty repository. Make a new one with **Use this template** |
| Commits made before the start time | Only work after your Start issue counts. Make new commits |
| Too many checks today | You can submit five times in 24 hours. Try again tomorrow |
| The portal says the stage is not open yet | That stage's check has not been released |

## Rules and privacy

- Do your own work. The personal code ties each stage to the account that started it.
- Everything the portal checks is public, because it is read from public repositories.
- Your progress record stores your GitHub numeric id, your username, stage times, and the commit and pull request references used as evidence. It does not store your email address.
- Read more in [docs/PRIVACY.md](docs/PRIVACY.md) and [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

## Command reference

| Task | Command |
| --- | --- |
| See what changed | `git status`, `git diff` |
| Stage a file | `git add <file>` |
| Commit | `git commit -m "Message"` |
| History | `git log --oneline --graph --all` |
| New branch | `git switch -c feature/name` |
| Change branch | `git switch main` |
| Merge | `git merge <branch>` |
| Get updates | `git pull` |
| Send updates | `git push` |
| Undo a pushed commit | `git revert <sha>` |
| Unstage a file | `git restore --staged <file>` |
| Find lost commits | `git reflog` |
| Annotated tag | `git tag -a v1.0.0 -m "Message"` then `git push origin v1.0.0` |

For the full list, see the [cheat sheet in handbook chapter 42](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch42).
