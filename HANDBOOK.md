# Git Learning Portal: stage guide

This guide shows how to learn and pass each stage of the [Git Learning Portal](https://crazy-rohit.github.io/rm-git-learning-portal/). Read it next to the [handbook](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/). The handbook explains each command. This guide tells you what to do and what the check looks for.

The course is by Rohit Manna. Everything runs on GitHub, so you only need a free GitHub account.

## Contents

- [How the portal works](#how-the-portal-works)
- [Before you begin](#before-you-begin)
- [Apps, platforms, and commands](#apps-platforms-and-commands)
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

Working on your own computer is optional. The full steps for Windows, macOS, Linux, Git Bash, Git CMD, PowerShell, and Visual Studio Code are in [Apps, platforms, and commands](#apps-platforms-and-commands).

## Apps, platforms, and commands

Git is one program. Git Bash, Git CMD, PowerShell, Terminal, Visual Studio Code, and Codespaces are only windows that run it. The `git` lines are the same in every window. The lines that create a file (`echo`, folder paths) change with the window. Pick one window and stay with it.

The prompt tells you which window you have:

| Prompt | Window | Commands in this guide |
| --- | --- | --- |
| `user@machine MINGW64 ~/git-lab $` | Git Bash on Windows | The `bash` blocks |
| `C:\Users\You\Documents\git-lab>` | Git CMD, or Command Prompt | The Windows CMD blocks |
| `PS C:\Users\You\Documents\git-lab>` | PowerShell | The `bash` blocks, except the code file. Create that file in an editor |
| `you@mac git-lab %` or `$` | macOS Terminal | The `bash` blocks |
| `you@pc:~/git-lab$` | Linux terminal | The `bash` blocks |
| `$` inside a browser editor | GitHub Codespaces | The `bash` blocks. Git is already signed in |

### What to create, in this order

Do not skip ahead, and do not create the lab with `git init`.

1. A GitHub account, in the browser.
2. A Start issue for the stage. The reply contains your personal code. Copy it.
3. The `git-lab` repository, in the browser, from the template. Name it exactly `git-lab`, set it to Public, and tick **Include all branches**. This happens on github.com, not in the terminal.
4. A place to type commands: Codespaces, or one app on your computer.
5. Four pieces of work, each as its own commit: the code file, a README line, a `.gitignore` line, and optionally your name in `index.html`.
6. A push, so GitHub has the commits.
7. A Submit issue.

Stages 1 to 4 and stage 6 all use this same `git-lab`. Stage 5 also uses a fork of `rm-practice-repo`. Stage 7 uses a new repository that you choose.

### Codespaces, in the browser

This is the path the Start reply uses. Nothing is installed.

1. Finish step 1 of the Start reply, so `git-lab` exists.
2. Open the **My git-lab in Codespaces** link and choose **Create codespace**. The first time, GitHub asks you to allow Codespaces. Personal accounts include a free monthly allowance, which covers this course.
3. Wait until the editor finishes loading. A file list is on the left. A terminal is at the bottom. If you do not see it, open the menu **Terminal → New Terminal**.
4. Click the terminal. Copy every line from the reply's code block, paste, and press Enter. If a box asks about pasting several lines, choose **Paste**.
5. `git push` does not ask you to sign in. The codespace is already your GitHub account.
6. `git log --oneline` lists the commits. Your GitHub username should be the author.

To edit `index.html`, click it in the file list, change the two lines, press Ctrl+S (Command+S on a Mac), then run `git commit -am "Put my name on the card"` and `git push`.

### Windows

#### Install Git once

1. Download the installer only from [git-scm.com/download/win](https://git-scm.com/download/win).
2. Run it. Keep the defaults, and check three screens:
   - **Default editor:** Visual Studio Code, if you have it. Otherwise keep Vim.
   - **Initial branch name:** override it and type `main`.
   - **PATH:** keep "Git from the command line and also from 3rd-party software".
3. Finish. Close any terminal that was already open, then open a new one.

Or, in PowerShell:

```powershell
winget install --id Git.Git -e --source winget
```

Check, in a new window:

```bat
git --version
```

A line like `git version 2.45.0` means it worked. The number can differ. If Windows says `git is not recognized`, the PATH screen was skipped. Run the installer again and choose the PATH option above.

#### Which Windows app to open

The installer adds more than one app. You only need one.

| App | How to open | Notes |
| --- | --- | --- |
| **Git Bash** | Start menu, type `Git Bash` | Use this if you can. Every `bash` block in this guide pastes as written |
| **Git CMD** | Start menu, type `Git CMD` | Use this if Git Bash is not there. Use the CMD block below, not the bash block |
| **Command Prompt** | Start menu, type `cmd` | Same commands as Git CMD, once `git --version` works |
| **PowerShell** | Start menu, type `PowerShell` | `git` commands work. Do not use `echo` to write `.stage/stage-1.txt`. PowerShell can hide a byte-order mark in the file, and the code check then fails. Create that file in Notepad |
| **Visual Studio Code** | Start menu, type `Visual Studio Code` | An editor with a terminal inside. Set that terminal to Git Bash, as below |
| **Cursor** | The Cursor app | Same as Visual Studio Code. **Terminal → New Terminal**, then choose Git Bash |

Git CMD and Git Bash can both pass the stage. They are not two different courses.

#### Windows, first time, in Git Bash

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
cd ~
mkdir -p Documents
cd Documents
git clone https://github.com/YOUR-USERNAME/git-lab.git
cd git-lab
git status
```

`git status` should say `On branch main` and `nothing to commit, working tree clean`. If it says `not a git repository`, you are not inside `git-lab`. Run `cd ~/Documents/git-lab` and try again.

#### Windows, first time, in Git CMD

```bat
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
cd %USERPROFILE%\Documents
git clone https://github.com/YOUR-USERNAME/git-lab.git
cd git-lab
git status
```

#### The email GitHub will count

The portal counts a commit only when GitHub links it to your account. GitHub does that by the email on the commit.

1. Open GitHub → your avatar → **Settings → Emails**.
2. Use an email that is listed there and marked verified.
3. To hide your address, use the noreply address on that page. It looks like `12345678+your-username@users.noreply.github.com`.

Then:

```bash
git config --global user.email "THE-VERIFIED-EMAIL"
git config user.name
git config user.email
```

In Git CMD those last two lines are the same. In Codespaces you skip this. GitHub has already set the name and the noreply email.

After the first real commit, open the repository on GitHub, click the commit, and check the avatar. Your picture means the email matched. A grey octagon means it did not. Fix the email, then make a new commit. Old commits keep the old email.

#### Sign in when you push

The first `git push` on your own computer opens a browser window titled **Sign in to GitHub**. Sign in as the account that owns `git-lab`, then come back to the terminal. Later pushes reuse that sign-in. A password typed into the terminal is not the right method. For SSH keys or tokens, read [handbook chapter 23](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch23).

#### Visual Studio Code on Windows

1. Install Git first, then install [Visual Studio Code](https://code.visualstudio.com/).
2. Choose **File → Open Folder** and open the `git-lab` folder, after you have cloned it.
3. Choose **Terminal → New Terminal**.
4. In the terminal panel, open the dropdown beside the `+` and choose **Git Bash**. If Git Bash is missing, choose **Select Default Profile** and pick Git Bash.
5. The prompt should end in `$` and the path should end in `git-lab`. Then paste the bash commands.

`code .` typed inside Git Bash opens the current folder in Visual Studio Code, if the installer added `code` to PATH.

#### Stage 1 commands in Git CMD

Run these inside `git-lab`, after the Start reply. There is no space before `>`.

```bat
mkdir .stage
echo YOUR-CODE> .stage\stage-1.txt
git add .stage\stage-1.txt
git commit -m "Add stage 1 code"
echo I am learning Git with Rohit Manna.>> README.md
git add README.md
git commit -m "Introduce myself in the README"
echo *.log> .gitignore
git add .gitignore
git commit -m "Ignore log files"
git push
git log --oneline
```

`echo *.log> .gitignore` writes the exact line `*.log`. In Git CMD, `echo *.log >> .gitignore` can also work, but a brand-new file should use one `>`.

Open `index.html` with `notepad index.html`, change `YOUR NAME` and `YOUR-USERNAME`, save, then:

```bat
git add index.html
git commit -m "Put my name on the card"
git push
```

### macOS

1. Open **Terminal** from Applications → Utilities, or press Command+Space and type `Terminal`.
2. Run `git --version`. If Git is missing, macOS offers the command line tools. Install them. With Homebrew, `brew install git` gives a newer Git.
3. Set your name and verified email with the same three `git config --global` lines as Git Bash.
4. Clone and enter the lab:

```bash
cd ~/Documents
git clone https://github.com/YOUR-USERNAME/git-lab.git
cd git-lab
```

5. Paste the bash blocks from each stage. The first `git push` opens the browser to sign in.

Visual Studio Code is the same as on Windows: **File → Open Folder**, then **Terminal → New Terminal**. The built-in terminal is already a Unix shell, so the bash blocks work without choosing Git Bash.

### Linux

Open a terminal with Ctrl+Alt+T, or your distribution's terminal app. Install Git, then use the bash blocks.

```bash
# Debian or Ubuntu
sudo apt update
sudo apt install git

# Fedora
sudo dnf install git

# Arch
sudo pacman -S git
```

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
cd ~/Documents
git clone https://github.com/YOUR-USERNAME/git-lab.git
cd git-lab
```

### Every stage 1 command

Run them from inside `git-lab`. Replace `YOUR-CODE` with the code from your Start reply, and nothing else.

| Command | What it does | What you should see |
| --- | --- | --- |
| `echo "YOUR-CODE" > .stage/stage-1.txt` | Creates the file, or replaces it, with one line: your code | No output. In Git CMD: `echo YOUR-CODE> .stage\stage-1.txt` |
| `git add .stage/stage-1.txt` | Copies that file into the staging area, ready for the next commit | No output |
| `git commit -m "Add stage 1 code"` | Saves the staging area as a commit with that message | `1 file changed` and a short hash |
| `echo "I am learning Git with Rohit Manna." >> README.md` | Adds one line at the end of the README. `>>` appends. `>` would wipe the file | No output |
| `git add README.md` | Stages the README | No output |
| `git commit -m "Introduce myself in the README"` | Second commit. The checker requires this file to change | `1 file changed` |
| `echo "*.log" >> .gitignore` | Adds a line that is exactly `*.log`, so Git ignores log files | No output. In Git CMD: `echo *.log> .gitignore` |
| `echo test > debug.log` | Makes a log file, to prove the ignore rule | No output |
| `git status` | Shows what Git sees | `debug.log` is absent. README or `.gitignore` may be listed if you have not committed them |
| `git add .gitignore` | Stages the ignore file. Do not add `debug.log` | No output |
| `git commit -m "Ignore log files"` | Third commit | `1 file changed` |
| `git push` | Sends the commits on this branch to GitHub | `main -> main`. The first time, a browser may ask you to sign in |
| `git log --oneline` | Lists commits, newest first, one line each | At least three commits with your messages |
| `git commit -am "Put my name on the card"` | Stages tracked files and commits in one step. It does not add brand-new files | `1 file changed`, after you saved `index.html` |
| `git diff` | Shows edits that are not staged yet | The changed lines, in the terminal |
| `git diff --staged` | Shows what the next commit will contain | The staged lines |
| `git restore --staged <file>` | Takes a file back out of the staging area. The edit stays in the file | No output |
| `git show HEAD` | Shows the newest commit, including its patch | The commit message and the lines it changed |

`git status` is the command to run whenever you are unsure. It names the branch, the files waiting to be committed, and whether you are inside a repository.

### Commands used in later stages

These are the same on every platform. Angle brackets mean you substitute a real value. You do not type the brackets.

| Command | What it does |
| --- | --- |
| `git switch main` | Moves you onto the `main` branch |
| `git switch -c feature/about-page` | Creates `feature/about-page` and moves onto it. Stage 2 needs a name that starts with `feature/` |
| `git push -u origin feature/about-page` | Sends that branch to GitHub and remembers the link, so later `git push` is enough |
| `git pull` | Downloads new commits from GitHub and merges them into the branch you are on |
| `git fetch origin` | Downloads commits and branches without merging them |
| `git merge origin/greeting-a` | Merges that branch into the branch you are on. Stage 3 merges `greeting-a`, then `greeting-b` |
| `git log --oneline --graph` | Draws the branch lines. A merge commit has two parents |
| `git revert <sha>` | Adds a new commit that undoes the named commit. Safe after a push. Stage 4 |
| `git reset` | Moves the branch pointer. Use it only on commits you have not pushed |
| `git reflog` | Lists where your branch has been, including commits you reset away |
| `git tag -a v1.0.0 -m "First stable version of my lab"` | Creates an annotated tag. A message, author, and date are stored |
| `git push origin v1.0.0` | Sends that tag to GitHub. `git push` alone does not send tags |
| `git clone <url>` | Copies a GitHub repository onto your computer, including its history |
| `git remote add upstream <url>` | Remembers a second remote. Stage 5 uses `upstream` for the original project and `origin` for your fork |
| `git remote -v` | Prints the remotes and their URLs |
| `git merge upstream/main` | Brings the original project's `main` into your current branch |
| `mkdir -p .github/workflows` | Creates folders, including parents. In Git CMD the path uses backslashes: `mkdir .github\workflows` |

A pull request is not a Git command. You open it on GitHub from the branch you pushed. The description is the text box on that page. Stage 2 asks for a few sentences about what changed and why. Stage 5 asks for one file, `contributors/<your-username>.md`, and a pull request into `Crazy-Rohit/rm-practice-repo`.

### When the terminal says no

| Message | What it means | What to do |
| --- | --- | --- |
| `git is not recognized` | This window cannot find Git | Close it, open Git Bash or Git CMD, or reinstall Git with the PATH option |
| `not a git repository` | You are outside `git-lab` | `cd` into `git-lab`, then run `git status` |
| `Please tell me who you are` | Name or email was never set | Run the two `git config --global` lines, then commit again |
| `Authentication failed` or a repeated sign-in window | The push used the wrong GitHub account | Sign in as the account that owns `git-lab`. On Windows, Windows Credential Manager can forget the old account |
| `failed to push` and `non-fast-forward` | GitHub has commits you do not have | Run `git pull`, then `git push` |
| The code check fails and the file looks right | PowerShell wrote a hidden mark, or the file has a quote or a second line | Recreate `.stage/stage-1.txt` in Notepad, paste only the code, save as UTF-8, commit, and push |
| `nothing to commit, working tree clean` | The save did not change a tracked file, or you already committed | Run `git status` and `git log --oneline` before assuming it failed |

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
| Challenge code file is wrong | Extra text, quotes, or a byte-order mark. The file must contain only the code. On Windows, write it with the Git CMD line or with Notepad, not with PowerShell `echo`. Check that it is on `main` and pushed |
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

The same commands, with what to type on Windows, macOS, and Linux, are in [Apps, platforms, and commands](#apps-platforms-and-commands).

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
