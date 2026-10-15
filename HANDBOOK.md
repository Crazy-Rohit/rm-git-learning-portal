# Git Learning Portal: stage guide

This guide shows how to learn and pass each stage of the [Git Learning Portal](https://crazy-rohit.github.io/rm-git-learning-portal/). Read it next to the [handbook](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/). The handbook explains each command. This guide tells you what to do and what the check looks for.

The course is by Rohit Manna. Everything runs on GitHub, so you only need a free GitHub account.

## Contents

- [How the portal works](#how-the-portal-works)
- [Screens you will see](#screens-you-will-see)
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

Stages open in order. You can start stage 2 only after stage 1 is passed, and so on. The Start form lists every number so you can pick the stage you are on. Picking a later number too soon does not unlock it; the bot replies **Pass stage N first**.

All seven stages can be checked. Pass them in order.

## Screens you will see

These are the screens that most often look like errors. They are not. Match what you see, then follow the link.

### The Stage box says None

Type your **real name** on the Stage 1 page first. That name is printed on your badges in place of XYZ. The Start form is a GitHub issue form. Check **Your name**, then the **Stage** box. Stage often starts as **None**. Click it, choose **1** the first time, then **Create**. GitHub will not let you submit while Stage still says None.

Do not pick 2 to 7 until the previous stage is passed. The list is there so later stages use the same form.

[Open Start stage 1](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=1) · [Stage 1 steps](#stage-1-first-repository)

### GitHub opened an issue and nothing else happened

After **Create**, GitHub shows the issue page. That is the Start. Wait about a minute and refresh. A bot comment appears with three links and a command block. That comment is your worksheet. Close Git CMD, Git Bash, and VS Code if you opened them. You do not install Git for this path.

[The cycle for every stage](#the-cycle-for-every-stage)

### I already have GitHub. Do I still make a folder

No. You already have an account, so skip signup. You still do **not** create a folder on your computer, and you do not run `git init` or `git clone` for stage 1. The lab is a **public GitHub repository** named `git-lab`, made from a template in the browser. Codespaces opens that repository. Skip every `mkdir` line unless you later choose the optional local path.

[Before you begin](#before-you-begin) · [What to create, in this order](#what-to-create-in-this-order)

### Yellow Compare and pull request banners

After you create `git-lab`, GitHub may show yellow bars for `greeting-a` and `greeting-b`. Those branches come with the template. **Do not open those pull requests, and do not merge those branches.** [Stage 3](#stage-3-merge-conflicts) edits `data/education.json` instead. Ignore the banners and open Codespaces.

### Where to put my name and GitHub username

There are two different places. Do not mix them up.

1. **Badges.** On the Stage 1 page, type your real name, for example `Rohit Manna`. The badge preview shows that name. The Start form keeps the same **Your name** box. Do not type `xyz`.
2. **Portfolio.** In Codespaces, open `data/profile.json`.
   - `name` becomes your real name, for example `Rohit Manna`.
   - `headline` becomes what you are, for example `Student` or `Working professional`.
   - `githubUsername` becomes your GitHub login, for example `crazy-rohit`.

The portfolio does **not** replace the required commits in the bot command block, and it does not print the name on the signed badge. The badge uses the name from the Stage 1 page. If `data/profile.json` still says `YOUR NAME` when you submit, the identity check fails.

[Stage 1 steps](#stage-1-first-repository) · [Only two commits](#only-two-commits)

### I used Git CMD or Git Bash instead of Codespaces

Git CMD and Git Bash are two windows for the same Git program, not two courses. You can still pass on your own computer, but then you must clone `git-lab` and use the matching command block. The Start reply is written for Codespaces. If you are lost, go back to the Codespaces link in that reply.

[Apps, platforms, and commands](#apps-platforms-and-commands)

### A check failed

Do not open another Start. Your personal code and start time stay the same. Stay in the same codespace, paste any commands you skipped, `git push`, then open a **new** Submit issue.

[When a check fails](#when-a-check-fails)

## Before you begin

### 1. Create a GitHub account, if you do not have one

Sign up at [github.com](https://github.com/signup). Pick a username you are happy to show to employers, because your work in this course is public. If you already have an account, skip this step.

### 2. That is all you need

You do the work in **GitHub Codespaces**: an editor with a terminal that opens in your browser, with Git already set up and signed in to your account. Nothing to install. Personal accounts get a free monthly allowance, which is far more than this course needs.

The Start reply for each stage gives you the links and commands. You do not have to choose a terminal, create a directory, or configure anything.

Working on your own computer is optional. The full steps for Windows, macOS, Linux, Git Bash, Git CMD, PowerShell, and Visual Studio Code are in [Apps, platforms, and commands](#apps-platforms-and-commands). Skip that section until you want Git on your machine.

## Apps, platforms, and commands

If you are following the Start reply in Codespaces, **skip this whole section** and go to [The cycle for every stage](#the-cycle-for-every-stage). Come back only if you want Git on your own computer.

Git is one program. Git Bash, Git CMD, PowerShell, Terminal, Visual Studio Code, and Codespaces are only windows that run it. The `git` lines are the same in every window. The lines that create a file (`echo`, folder paths) change with the window. Pick one window and stay with it. Git CMD is not a different course from Git Bash.

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

Do not skip ahead, and do not create the lab with `git init`. A folder on your computer is not a GitHub repository.

1. A GitHub account, in the browser. Skip this if you already have one.
2. A Start issue for the stage. Type your real name in **Your name**. On the form, click **Stage**, choose the number, then **Create**. The reply contains your personal code. Copy it.
3. The `git-lab` repository, in the browser, from the template. Name it exactly `git-lab`, set it to Public, and tick **Include all branches**. This happens on github.com, not in the terminal. Ignore yellow **Compare & pull request** banners for `greeting-a` and `greeting-b`. Do not merge those branches. Stage 3 makes its own.
4. A place to type commands: the **My git-lab in Codespaces** link in the Start reply. A local app is optional.
5. Three required commits from the bot command block: the code file, a README line together with `data/profile.json`, and a `.gitignore` line. Paste the **whole** block. Editing the portfolio first is not enough until those commits exist.
6. A push, so GitHub has the commits. The last line of the block does this.
7. A Submit issue. If it fails, fix and submit again. Do not Start again.

Stages 1 to 7 all use this same `git-lab`. Stage 5 also uses a fork of `rm-practice-repo`. Stage 7 publishes `git-lab`. It does not use a second repository.

### Codespaces, in the browser

This is the path the Start reply uses. Nothing is installed.

1. Finish step 1 of the Start reply, so `git-lab` exists.
2. Open the **My git-lab in Codespaces** link and choose **Create codespace**. The first time, GitHub asks you to allow Codespaces. Personal accounts include a free monthly allowance, which covers this course.
3. Wait until the editor finishes loading. A file list is on the left. A terminal is at the bottom. If you do not see it, open the menu **Terminal → New Terminal**.
4. Click the terminal. Copy every line from the reply's code block, paste, and press Enter. If a box asks about pasting several lines, choose **Paste**.
5. `git push` does not ask you to sign in. The codespace is already your GitHub account.
6. `git log --oneline` lists the commits. Your GitHub username should be the author.

To edit `data/profile.json`, click it in the file list, replace `YOUR NAME`, `YOUR HEADLINE`, and `YOUR-USERNAME`, press Ctrl+S (Command+S on a Mac), then run `git add data/profile.json`, `git commit -m "Add my name to the portfolio"`, and `git push`.

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
git add README.md data\profile.json
git commit -m "Introduce myself in the README"
echo *.log> .gitignore
git add .gitignore
git commit -m "Ignore log files"
git push
git log --oneline
```

`echo *.log> .gitignore` writes the exact line `*.log`. In Git CMD, `echo *.log >> .gitignore` can also work, but a brand-new file should use one `>`.

Open `data\profile.json` with `notepad data\profile.json`, replace `YOUR NAME`, `YOUR HEADLINE`, and `YOUR-USERNAME`, save, then:

```bat
git add data\profile.json
git commit -m "Add my name to the portfolio"
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
| `git commit -am "Add my name to the portfolio"` | Stages tracked files and commits in one step. It does not add brand-new files | `1 file changed`, after you saved `data/profile.json` |
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
| `git switch -c feature/about-me` | Creates `feature/about-me` and moves onto it. Stage 2 needs a name that starts with `feature/` |
| `git push -u origin feature/about-me` | Sends that branch to GitHub and remembers the link, so later `git push` is enough |
| `git pull` | Downloads new commits from GitHub and merges them into the branch you are on |
| `git fetch origin` | Downloads commits and branches without merging them. Do not merge `origin/greeting-a` or `origin/greeting-b` |
| `git switch -C education-details` | Creates `education-details` from where you are and switches to it. Stage 3 builds this from `main` |
| `git merge education-details` | Merges that local branch into the branch you are on. Stage 3 then merges `education-study` |
| `git log --oneline --graph` | Draws the branch lines. A merge commit has two parents |
| `git revert <sha>` | Adds a new commit that undoes the named commit. Safe after a push. Stage 4 |
| `git reset` | Moves the branch pointer. Use it only on commits you have not pushed |
| `git reflog` | Lists where your branch has been, including commits you reset away |
| `git tag -a v1.0.0 -m "First stable version of my portfolio"` | Creates an annotated tag. A message, author, and date are stored. Stage 4 uses `v1.0.0`. Stage 7 uses `v2.0.0` |
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

1. **Read.** Each stage below lists the handbook chapters to read first. Those chapters teach the idea. This guide tells you what to type.
2. **Start.** Open a [Start issue](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml). Type your real name in **Your name** (this prints on your badges). If **Stage** says None, click it and choose the number. Then **Create**. Within a minute the portal replies with your **personal code** and closes the issue. Stay on that issue until the bot comment appears.
3. **Save the code.** Commit the code as the only line of `.stage/stage-N.txt` on `main`, where `N` is the stage number. The Start reply already has this command filled in. Paste the whole block.
4. **Do the work.** Only work done **after** the Start issue counts. The start time is saved once and does not change if you open another Start issue.
5. **Submit.** Open a [Submit issue](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=submit-stage.yml). Choose the same stage and enter your repository as `your-username/git-lab`. The reply lists every check. If something fails, [fix it](#when-a-check-fails) and open a new Submit, not a new Start.

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

These chapters explain the ideas. You still create `git-lab` from the template, not with `git init`. Skip [chapter 4](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch4) (install Git) and [chapter 5](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch5) (config) if you are using Codespaces.

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

1. On the [Stage 1 page](https://crazy-rohit.github.io/rm-git-learning-portal/stage-1.html), type your real name, then **Start stage 1**. The GitHub form should already show that name. If **Stage** still says None, choose **1**. Then **Create**. GitHub shows the issue page. That is expected. Do not open Git CMD. Do not create a folder.
2. Wait about a minute and refresh. The portal replies with your personal code and three steps. Follow them in order:
   - **Create my git-lab.** The link opens GitHub's new-repository page already filled in: from `rm-git-lab-template`, named `git-lab`, public. Tick **Include all branches** and choose **Create repository**. Yellow banners for `greeting-a` and `greeting-b` come with the template. Ignore them and do not merge those branches.
   - **My git-lab in Codespaces.** Choose **Create codespace**. An editor opens with a terminal at the bottom. Open `data/profile.json` first. Replace `YOUR NAME`, `YOUR HEADLINE`, and `YOUR-USERNAME`. Then copy **every** line of the command block, paste, and press Enter. If a box asks about several lines, choose **Paste**.
   - **Submit stage 1.** The link opens the Submit form already filled in. Choose **Create**.
3. Wait a minute and refresh the Submit issue. The reply lists every check. If a box is empty, open [When a check fails](#when-a-check-fails) and fix that item. Then submit again.

The commands in the reply, with your code in place of `YOUR-CODE`. Each `git commit` is one of the three required commits:

```bash
echo "YOUR-CODE" > .stage/stage-1.txt
git add .stage/stage-1.txt
git commit -m "Add stage 1 code"
echo "I am learning Git with Rohit Manna." >> README.md
git add README.md data/profile.json
git commit -m "Introduce myself in the README"
echo "*.log" >> .gitignore
git add .gitignore
git commit -m "Ignore log files"
git push
git log --oneline
```

`data/profile.json` is your portfolio identity. Set `name` to your real name, `headline` to Student, Developer, or Working professional, and `githubUsername` to your GitHub login. Do not leave `YOUR NAME` in the file. The page reads this file. Do not type the name into `index.html`.

If `data/profile.json` is missing, the first lines of the Start block download the portfolio into an older lab. Paste those lines too.

To see the ignore rule work, run `echo test > debug.log` and then `git status`. `debug.log` is not listed.

If you paste only some of these lines, Submit fails with a missing code file, a missing `*.log` line, or only two commits. Paste the rest in the same codespace, then submit again. Do not open a new Start.

**Put your name on the portfolio.** This is part of the second commit, not an extra optional step. In Codespaces, open `data/profile.json` from the file list.

- `YOUR NAME` becomes your real name, for example `Rohit Manna`.
- `YOUR HEADLINE` becomes what you are, for example `Student` or `Working professional`.
- `YOUR-USERNAME` becomes your GitHub login, for example `crazy-rohit`.

Save the file before you paste the command block. If you already pasted it, run `git add data/profile.json`, `git commit -m "Add my name to the portfolio"`, and `git push`.

### Your portfolio on the web

`index.html` reads the files in `data/`. Stage 1 fills your name. Later stages fill About, Education, Skills, Experience, Projects, and Contact. Empty sections stay hidden.

To put the page online, open the repository's **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. After a minute the portfolio is live at `https://your-username.github.io/git-lab/`. Opening `index.html` as a file on your computer does not load the JSON. Use Pages or the Codespaces preview.

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
| Portfolio identity is filled | `data/profile.json` has your real name, a headline, and your GitHub username |

### Practise more

- Run `git diff` before `git add`, then `git diff --staged` after it, and compare the output.
- Unstage a file with `git restore --staged <file>`.
- Try `git log --stat` and `git show HEAD`.

---

## Stage 2: Branches and pull requests

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

1. Open a [Start issue for stage 2](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=2). If **Stage** says None, choose **2**. Paste **every** line of the Start command block in the same Codespaces window you used for stage 1. That saves the code on `main`. Still ignore yellow banners for `greeting-a` and `greeting-b`, and do not merge those branches. Your pull request is from `feature/about-me`.
2. Open `data/about.json`. Replace `YOUR SUMMARY` with a few sentences about you. Set `careerGoal`, or add one interest. A student, a developer, and a working professional can each write what is true for them. Leave a field empty when it does not apply.
3. Create the feature branch and commit that file. The branch name must start with `feature/`:

   ```bash
   git switch main
   git pull
   git switch -c feature/about-me
   git add data/about.json
   git commit -m "Add my about section"
   git push -u origin feature/about-me
   ```

4. On GitHub, open a pull request from `feature/about-me` into `main`.
5. Write a description of at least a couple of sentences: what changed and why.
6. Merge the pull request on GitHub.
7. Update your local copy:

   ```bash
   git switch main
   git pull
   ```

8. [Submit stage 2](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=submit-stage.yml&stage=2). If a check fails, [fix it](#when-a-check-fails) and submit again. Do not Start again.

### What the check looks for

- A pull request merged into `main` from a branch named `feature/...` after your start time.
- A written description on that pull request.
- No commit messages that are only `update` or `fix`.
- The stage 2 code in `.stage/stage-2.txt`.
- `data/about.json` has your own summary, plus a goal or an interest. `YOUR SUMMARY` does not pass.

---

## Stage 3: Merge conflicts

**You learn:** why conflicts happen, how to read conflict markers, and how to finish a merge.

### Read first

| Chapter | Topic |
| --- | --- |
| [15](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch15) | Merging |
| [16](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch16) | Merge conflicts |

### The setup

You make two branches from `main`. Both change `data/education.json`. The second merge conflicts. That file is the Education section of your portfolio.

Do not merge `origin/greeting-a` or `origin/greeting-b`. Those branches came with the template and do not share history with your `main`.

### Step by step

1. [Start stage 3](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=3). Paste every line of the Start block. It creates `education-details` and `education-study` from your `main`, then merges both.
2. The last command conflicts. Open `data/education.json` and delete every `<<<<<<<`, `=======`, and `>>>>>>>` line. Keep one JSON list.
3. Replace `YOUR INSTITUTION` and `YOUR QUALIFICATION` with a school, college, or course. Write a real description. A student, a developer, and a working professional can each use what is true for them.
4. Finish the merge:

   ```bash
   git add data/education.json
   git commit --no-edit
   git push
   ```

5. Run `git log --oneline --graph` and find the merge commit with two parents.
6. Submit stage 3.

### What the check looks for

- A merge commit with two parents on `main` after your start time.
- `data/education.json` is valid JSON with an institution, a qualification, and a description.
- No `<<<<<<<`, `=======` or `>>>>>>>` lines left in the file.
- The stage 3 code in `.stage/stage-3.txt`.

---

## Stage 4: Undo and history

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

1. [Start stage 4](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=4). Before you paste, open `data/skills.json` and replace `YOUR SKILL` with at least one real skill.
2. Paste the Start block. It commits your skills, adds the fake skill `Gittt`, pushes, reverts that commit, and tags `v1.0.0`.
3. If `git revert` opens an editor, save and close it. Keep the message Git writes. It starts with `Revert "` and contains `This reverts commit`.
4. After the revert, `data/skills.json` must not contain `Gittt`.
5. Submit stage 4.

### What the check looks for

- A commit made by `git revert` that reverts one of your own commits.
- An annotated tag named `v1.0.0` on GitHub.
- `data/skills.json` has a real technical skill and does not contain `Gittt`.
- The stage 4 code in `.stage/stage-4.txt`.

---

## Stage 5: Fork and pull request

**You learn:** how to contribute to a project you do not own, which is how open source works.

### Read first

| Chapter | Topic |
| --- | --- |
| [21](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch21) | Remotes and cloning |
| [24](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch24) | Forks |
| [25](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch25) | Pull requests |
| [30](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch30) | Contributing to open source |

### Step by step

1. [Start stage 5](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=5). Open `data/experience.json` first. Replace `YOUR ROLE` with a job, internship, college activity, or a fresher profile, and write what you did. Then paste the Start block so `.stage/stage-5.txt` and that file are on `main` in `git-lab`.
2. Fork [rm-practice-repo](https://github.com/Crazy-Rohit/rm-practice-repo) to your account. If you are signed in as the owner of that repository, use the learner account instead. GitHub will not let you fork your own repository.
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

5. Open the pull request into `Crazy-Rohit/rm-practice-repo`, not into your own fork. The base is that repository and `main`. The compare side is your fork and your branch. The yellow bar on your fork opens the wrong pull request.
6. Wait until it says **Merged**, then submit stage 5. The form repository is still `your-username/git-lab`.
7. Keep your fork up to date:

   ```bash
   git switch main
   git fetch upstream
   git merge upstream/main
   git push
   ```

### What the check looks for

- A fork of `rm-practice-repo` on your account.
- A merged pull request from that fork that adds only `contributors/<your-username>.md`.
- `data/experience.json` has a real role and a description. `YOUR ROLE` does not pass.
- The stage 5 code in `.stage/stage-5.txt` in your `git-lab`.

---

## Stage 6: Automation

**You learn:** how GitHub Actions runs checks on every push, and how to read a failing run and fix it.

### Read first

| Chapter | Topic |
| --- | --- |
| [31](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch31) | GitHub Actions |
| [32](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch32) | Actions in practice |

### Step by step

1. [Start stage 6](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=6). Open `data/projects.json` and `data/contact.json` first. Add one project, and one email or link. Then paste the Start block.
2. The block creates `.github/workflows/check.yml` in `git-lab`. This version fails on purpose:

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

### What the check looks for

- A workflow file in `.github/workflows/` in `git-lab`.
- A failed run followed by a successful run on the same branch, both after your start time.
- `data/projects.json` has a real project. `data/contact.json` has one way to reach you.
- The stage 6 code in `.stage/stage-6.txt`.

---

## Stage 7: Capstone project

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

The project is the portfolio in `git-lab`. [Start stage 7](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=start-stage.yml&stage=7) and keep working in that same repository. On the Submit form, enter `your-username/git-lab`.

### Checklist

- [ ] Every file in `data/` uses your own information. Nothing still starts with `YOUR`
- [ ] `README.md`, `LICENSE`, and `.gitignore` are still present
- [ ] The GitHub Actions workflow from stage 6 passes on `main`
- [ ] GitHub Pages is on, and `https://your-username.github.io/git-lab/` loads
- [ ] An issue named for the publish, closed by a pull request whose description says `Fixes #` and that issue number
- [ ] A GitHub release tagged `v2.0.0` with release notes. `v1.0.0` was stage 4

### Tips

- Open an issue for each piece of work before you start it.
- Use one branch and one pull request per issue.
- Read your own pull request before merging it, as if someone else wrote it.

---

## When a check fails

The reply lists every check. An empty box is a fail. Fix those items in the **same** codespace, `git push`, and open a **new** Submit issue. You do not need a new Start issue. Your personal code and start time stay the same.

If you skipped the bot command block, paste the remaining lines from the Start comment and push, then submit again.

### Do not start the stage again

A second Start does not reset the clock and does not give you a new code. Use [Submit](https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?template=submit-stage.yml).

### Challenge code file is wrong

The file `.stage/stage-1.txt` on `main` must contain only the code from your Start comment, one line, no quotes.

You skipped the first two commands of the block, or PowerShell `echo` hid a byte-order mark.

In Codespaces:

```bash
echo "PASTE-YOUR-CODE" > .stage/stage-1.txt
git add .stage/stage-1.txt
git commit -m "Add stage 1 code"
git push
```

On Windows PowerShell, do not use `echo`. Create the file in the editor, paste the code, save as UTF-8, then `git add` and commit.

[Chapter 8: Making commits](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch8) · [Stage 1 steps](#stage-1-first-repository)

### gitignore is missing the log rule

`.gitignore` must contain a line that is exactly `*.log`. A comment or `*.log.txt` does not count.

You skipped the `echo "*.log"` commands. Run:

```bash
echo "*.log" >> .gitignore
git add .gitignore
git commit -m "Ignore log files"
git push
```

[Chapter 10: Ignoring files](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch10)

### Only two commits

The check needs **three** commits by you after the Start issue: code file, README, and `.gitignore`. Filling `data/profile.json` belongs with the README commit. If you only changed the portfolio, or only the README, paste the missing lines from the Start block.

Commits made before the Start issue do not count. Make new ones.

[Chapter 8: Making commits](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch8) · [Chapter 9: Viewing history](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch9)

### README was not changed

One of your commits after Start must edit `README.md`. The Start block appends a line and commits it. If you skipped that, run:

```bash
echo "I am learning Git with Rohit Manna." >> README.md
git add README.md
git commit -m "Introduce myself in the README"
git push
```

### Wrong repository name on the form

Enter `your-username/git-lab`, using your GitHub login. Stage 7 is the only stage that uses a different repository name.

### Repository not found

The repository is private, misspelled, or not named exactly `git-lab`. Make it public. The portal cannot read private repositories.

### Not created from the template

You created an empty repository. On [rm-git-lab-template](https://github.com/Crazy-Rohit/rm-git-lab-template), choose **Use this template**, tick **Include all branches**, and name the copy `git-lab`.

### Commits are not counted

Git used an email that is not verified on GitHub. In Codespaces this is already correct. On your computer, set `git config --global user.email` to the address on your GitHub account, then make **new** commits. Old commits keep their old email.

[Chapter 5: First-time configuration](https://crazy-rohit.github.io/rm-git-learning-portal/handbook/#ch5)

### Too many checks today

You can submit five times in 24 hours. Try again tomorrow.

### Refusing to merge unrelated histories

This happens on stage 3 if you run `git merge origin/greeting-a` or `git merge origin/greeting-b`. Those branches came with the template. GitHub copied each one with its own first commit, so they share no history with your `main`.

Do not add `--allow-unrelated-histories`. Stay on `main` and follow [Stage 3](#stage-3-merge-conflicts), which creates `greeting-a` and `greeting-b` from your own `main`.

### Pass the previous stage first

Stages open in order. If you chose 2 on the Start form before stage 1 passed, the bot says **Pass stage 1 first**. Finish stage 1, then start stage 2.

[Screens you will see](#screens-you-will-see)

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
