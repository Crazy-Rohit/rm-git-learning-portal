# Git Learning Portal: Blueprint and Build Guide

## 1. Summary

You are building a free learning portal where people practise Git in the browser, prove their skills on real GitHub repositories, and earn a signed certificate that anyone can verify, all without running your own server.

### What the learner experiences

1. Opens the portal (a static website on GitHub Pages) and reads the stage instructions.
2. Practises the commands in a terminal simulator inside the browser. No installation, no risk.
3. Repeats the task on GitHub with their own account: creates a repository, branches, pull requests and workflows.
4. Submits the stage by opening a GitHub issue from a prefilled form.
5. A GitHub Actions workflow checks their real repositories through the GitHub API and replies with pass or fail.
6. After the last stage, the workflow issues a signed certificate. A public verify page confirms it is genuine.

### The key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Backend | GitHub itself: Pages, Actions, Issues, a data branch | Free, no server to run, and the evidence already lives on GitHub |
| Identity | The GitHub account that opens the issue | GitHub authenticates it for you; no password system to build |
| Practice environment | Browser terminal using isomorphic-git, plus optional Codespaces | Safe and instant for basics, real terminal for advanced work |
| Proof of skill | Checks on the learner's real public repositories | A pass has to come from real work, not from clicking through a quiz |
| Certificate | JSON signed with an Ed25519 key kept in GitHub Secrets | Anyone can verify it with a public key; nobody can forge it |
| Badges | Per-stage badges, then Open Badges 3.0 export | Lets learners share and verify achievements |

### Three honest limits to accept early

- **A login button needs a small server.** GitHub's sign-in flow cannot be completed from a purely static page. This blueprint avoids the need for it (section 4) and shows an optional upgrade.
- **The certificate is a completion credential from your project, not an official GitHub certification.** Its value comes from how strict your checks are and how transparent your records are. Never describe it as GitHub-certified.
- **A static design cannot stop all cheating.** Section 5 explains the controls that make cheating hard and what remains possible.

### How to read this document

Sections 2 to 8 explain the design. Section 9 is the step-by-step build guide with commands and files. Sections 10 to 12 cover security, the schedule and how to grow the project.

## 2. Architecture

Everything runs on GitHub's free services for public repositories. There is no database and no server of your own. You need three repositories.

| Repository | Visibility | What it holds |
| --- | --- | --- |
| `git-learning-portal` | Public | The website source, the verifier scripts, the workflows, the issue forms, the public key, and a `ledger` branch for records |
| `git-lab-template` | Public, marked as a template | The starter project each learner copies. It includes pre-made branches for the merge-conflict stage |
| `practice-repo` | Public | The repository learners fork and send a pull request to in the collaboration stage |

&#91;embedded content: architecture · 3 columns, 7 connections\]

A learner pushes work to their own lab repository and opens an issue in the portal repository. That issue starts the verifier, which reads the lab repository through the GitHub API, signs the result with a key that only GitHub Actions can read, and writes it to the ledger branch. The verify page reads the ledger.

### Components

| Component | Runs on | Job |
| --- | --- | --- |
| Portal website | GitHub Pages | Stage instructions, simulator, progress view, certificate and verify pages |
| Terminal simulator | The learner's browser | Safe practice of commands. It never grants credit by itself |
| Issue forms | GitHub Issues | Structured start and submit requests, authored by the learner's own account |
| Verifier | GitHub Actions | Reads the learner's public repositories, applies the stage rules, writes results |
| Ledger | A branch in the portal repo | One JSON file per learner and one per certificate, written only by the workflow |
| Signing key | GitHub Secrets | Signs certificates. The matching public key is published in the repo |

### The principle behind the design

Practise in the browser. Prove on GitHub. The simulator makes learning fast and safe, but only evidence on real GitHub repositories can pass a stage, because that evidence is public, timestamped and tied to an account that GitHub has already authenticated.

### Why a ledger branch and not a database

A branch is free, versioned and public, so every record has a history that anyone can audit. Pages can read it as plain files. If you outgrow it, the same JSON schema moves easily into a real database later.

## 3. Learner journey and stages

The course has seven stages. Each stage follows the same cycle, and a stage unlocks only when the ledger shows the one before it as passed.

1. **Read** the stage page, which is a short lesson that links to the matching handbook chapters.
2. **Practise** the task in the browser simulator. The simulator can check the result and give hints, but it never awards a pass.
3. **Do it for real** on GitHub in the learner's own lab repository.
4. **Start** the stage by opening a *Start* issue. The workflow replies with a personal challenge code (section 5).
5. **Submit** by opening a *Submit* issue. The workflow checks the evidence and replies with pass or fail and the reason.
6. **Earn** the stage badge. After stage 7, the certificate is issued.

### The seven stages

| Stage | Skills | Proof the verifier looks for |
| --- | --- | --- |
| 1. First repository | init, add, commit, status, log, `.gitignore` | A public lab repo created from the template. At least three commits by the learner after the start time. `README.md` changed. `.gitignore` contains `*.log`. Challenge code file present |
| 2. Branches and pull requests | branch, switch, merge, pull request | At least one pull request in the lab repo, merged from a `feature/...` branch into `main`, with a written description. No commit messages that are only "update" or "fix" |
| 3. Merge conflicts | conflict markers, resolving, merge commits | A merge commit with two parents on `main`. `greeting.txt` has no conflict markers and contains the required combined text from the stage page |
| 4. Undo and history | revert, reset, tags | A commit that git created with "This reverts commit" naming one of the learner's own commits. An annotated tag `v1.0.0` |
| 5. Fork and pull request | fork, upstream, pull request to another project | A fork of `practice-repo` under the learner's account. A merged pull request from that fork that adds exactly one file, `contributors/<login>.md` |
| 6. Automation | GitHub Actions, red to green | A workflow file in the lab repo. A failed run followed by a successful run on the same branch after the start time |
| 7. Capstone project | everything together | A new public repo with README, licence, `.gitignore`, a passing workflow, GitHub Pages live, at least three merged pull requests, one issue closed by a pull request, and a tagged release |

### Badges and the certificate

| Milestone | Reward |
| --- | --- |
| Stage 3 passed | Badge: Git Foundations |
| Stage 6 passed | Badge: GitHub Collaborator |
| Stage 7 passed | The certificate: Git and GitHub Practitioner |

### Design rules for the stages

- **Every check must be something the GitHub API can read from a public repository.** If the verifier cannot observe it, it cannot be part of a credential. Things like "turned on two-factor authentication" are teaching points, not graded checks.
- **Every stage needs a challenge code** so one learner's finished repository cannot simply be copied by another.
- **Show the reason for a failure.** The reply should say which check failed and link to the relevant handbook chapter. Learners retry far more willingly when they know why they failed.
- **Allow retries but limit them.** For example five submissions per stage per day, counted from earlier issues by the same account.
- **Keep stages short.** Aim for 30 to 60 minutes of real work each. The capstone can take a few hours.

## 4. Login and identity

You asked for a login. This section explains why a classic login is the wrong tool here, what to use instead, and how to add a real sign-in later if you want one.

### Why "Sign in with GitHub" does not work on a static site

GitHub's sign-in (OAuth) ends with your application exchanging a temporary code for an access token. That exchange needs either a **client secret**, which cannot be hidden inside a public web page, or a call to GitHub's token endpoint, which is not built to be called from browser JavaScript. Both problems disappear if you have a few lines of server code, which is exactly what a purely static site lacks. Check GitHub's current OAuth documentation before you decide, because these rules can change.

### The recommended model: GitHub is the login

You do not need to know who is *browsing* the portal. You need to know who *did the work*. GitHub already answers that, every time someone opens an issue or a pull request.

| What the system must know | How it knows, with no login of your own |
| --- | --- |
| Who is submitting? | The workflow reads the issue author's login and numeric id from the GitHub event. A learner cannot fake it |
| Do they own the repository being checked? | The verifier asks the API who owns the repo and compares it with the issue author |
| Which stages have they passed? | A ledger file named after the author's numeric GitHub id |
| Who is the certificate for? | The same numeric id, plus the login and display name at the time of issue |

The portal's "sign in" is then only a convenience: the learner types their GitHub username, the page loads their public ledger file, and it shows their progress and unlocked stages. Nothing secret is involved, so there is nothing to attack.

> **Use the numeric id, not the username.** GitHub usernames can be changed and later reused by someone else. The numeric account id never changes, so certificates and ledger files should be keyed by it. Show the username only for display.

### Optional upgrade: a real sign-in with a tiny serverless function

Add this only after the rest works. Benefits: a personalised dashboard, one-click prefilled issues, and a private view if you ever need one.

1. Register a GitHub OAuth App and keep its client secret in the function's environment variables.
2. Host one small function on a free serverless platform such as Cloudflare Workers, Netlify Functions or Vercel Functions.
3. The function receives the sign-in code from your page, exchanges it for a token using the secret, and returns the token to the page.
4. The page stores the token in memory only and uses it to read the learner's username and id. Request the smallest scope possible.
5. The function stores nothing and does nothing else.

This is still not a backend in the usual sense: no database, no sessions and no state. But it is code you host, so decide whether the convenience is worth the extra moving part.

### What the learner sees

A box that says "Enter your GitHub username", a progress bar, and the next stage unlocked. The proof of identity is the issue they open on GitHub, not the box they typed in.

## 5. Verification engine

The verifier is a GitHub Actions workflow in the portal repository. It reads the learner's public repositories through the GitHub API, applies the rules for the stage and writes the result. It never runs code from a learner's repository, which keeps it safe.

&#91;embedded content: stage cycle · 5 steps, 1 decision\]

A learner opens a Start issue and receives a personal code. They do the work, commit the code into their lab repository as proof, and open a Submit issue. The verifier then passes or fails the stage and explains why.

### 5.1 Two issue forms

Issue forms are YAML files in `.github/ISSUE_TEMPLATE/`. They give the learner a fixed form instead of free text, which makes the data reliable.

```yaml
# .github/ISSUE_TEMPLATE/submit-stage.yml
name: Submit a stage
description: Ask the verifier to check your work
title: "[Submit] "
labels: ["submission"]
body:
  - type: dropdown
    id: stage
    attributes:
      label: Stage
      options: ["1", "2", "3", "4", "5", "6", "7"]
    validations:
      required: true
  - type: input
    id: repo
    attributes:
      label: Your lab repository
      placeholder: your-username/git-lab
    validations:
      required: true
```

Make a second form, `start-stage.yml`, with the title ` [Start]  ` and only the stage dropdown. Create the labels `submission` and `start` in the repository first.

The portal can send learners straight to a prefilled form. Form field ids work as query parameters:

```text
https://github.com/YOUR-ORG/git-learning-portal/issues/new?template=submit-stage.yml&stage=3&repo=octocat/git-lab
```

### 5.2 The challenge code

The Start workflow replies with a code that only that learner can get for that stage. The learner must commit it to a file in their lab repository. A copied repository therefore fails, because it contains someone else's code.

```js
import { createHmac } from 'node:crypto';

export function challengeCode(userId, stage, secret) {
  return createHmac('sha256', secret)
    .update(`${userId}:${stage}`)
    .digest('base64url')
    .slice(0, 12);
}
```

The secret is stored as `CHALLENGE_SECRET` in the portal repository's Actions secrets. The learner commits the code to `.stage/stage-2.txt`, for example. The Start workflow also records the **start time** in the ledger, taken from the workflow's own clock, so the learner cannot choose it.

### 5.3 The workflow

One workflow handles both issue types. The important safety rules are in the comments.

```yaml
# .github/workflows/verify.yml
name: Verify stage
on:
  issues:
    types: [opened]
permissions:
  contents: write   # to push the ledger branch
  issues: write     # to comment and close
concurrency:
  group: ledger     # one run at a time, so ledger writes never collide
  cancel-in-progress: false
jobs:
  verify:
    if: startsWith(github.event.issue.title, '[Submit]') || startsWith(github.event.issue.title, '[Start]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with:
          ref: ledger
          path: ledger-data
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
        working-directory: verifier
      - run: node verifier/index.mjs
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ISSUE_NUMBER: ${{ github.event.issue.number }}
          ISSUE_AUTHOR: ${{ github.event.issue.user.login }}
          ISSUE_AUTHOR_ID: ${{ github.event.issue.user.id }}
          CHALLENGE_SECRET: ${{ secrets.CHALLENGE_SECRET }}
          SIGNING_KEY_PEM: ${{ secrets.SIGNING_KEY_PEM }}
      - name: Publish ledger changes
        working-directory: ledger-data
        run: |
          git config user.name "portal-bot"
          git config user.email "portal-bot@users.noreply.github.com"
          git add -A
          git diff --cached --quiet || (git commit -m "Ledger update for issue ${{ github.event.issue.number }}" && git push)
```

> **Never put the issue title or body into a shell command.** Text typed by a learner could contain shell code and run inside your workflow. Pass only trusted values, such as the issue number, through `env`, and let the script read the form fields from the API and parse them as plain data.

This design uses the `issues` event, not `pull_request_target`, and it never checks out or runs code from a learner's repository. That avoids the most common way that public repositories get attacked through Actions.

### 5.4 The checks in code

Each stage has one function that returns a list of checks. Each check has a name, a pass or fail, and a detail. The reply comment is built from that list, so learners see exactly what failed.

```js
import { Octokit } from '@octokit/rest';
const gh = new Octokit({ auth: process.env.GH_TOKEN });

export async function checkStage2({ login, userId, startedAt, code }) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  const repo = { owner: login, repo: 'git-lab' };

  const info = await gh.repos.get(repo).then(r => r.data).catch(() => null);
  add('Lab repository exists and is public', !!info && !info.private);
  if (!info) return checks;
  add('Repository belongs to the submitter', info.owner.id === userId);

  const file = await gh.repos
    .getContent({ ...repo, path: '.stage/stage-2.txt' })
    .then(r => Buffer.from(r.data.content, 'base64').toString().trim())
    .catch(() => '');
  add('Challenge code file is correct', file === code);

  const prs = await gh.paginate(gh.pulls.list, { ...repo, state: 'closed', per_page: 100 });
  const good = prs.filter(p =>
    p.merged_at &&
    p.base.ref === 'main' &&
    p.head.ref.startsWith('feature/') &&
    new Date(p.merged_at) > new Date(startedAt) &&
    (p.body || '').trim().length >= 20);
  add('A merged feature/ pull request with a description', good.length >= 1,
      good.length ? '' : 'Open a pull request from feature/<name> to main and merge it.');
  return checks;
}
```

### 5.5 Rules for every check

| Rule | Reason |
| --- | --- |
| Compare numeric ids, not usernames | Usernames can be renamed |
| Trust repository owners and pull request authors, not commit authors | Commit author names and emails are set on the learner's computer and are easy to fake. GitHub sets the owner and the pull request author |
| Only count activity after the recorded start time | Stops a learner from submitting work done long before the stage began |
| Save evidence in the ledger | Store commit SHAs and pull request numbers, so the record still makes sense if the learner later deletes the repository |
| Reply with the reason for a failure | Learners retry more when they know what to fix |

### 5.6 Anti-cheating controls and what remains possible

| Control | What it stops |
| --- | --- |
| Personal challenge code | Copying another learner's finished repository |
| Server-side start time | Reusing old work |
| Owner id must equal the issue author id | Submitting someone else's repository |
| Attempt limit, for example five a day | Guessing by trial and error |
| Optional minimum account age for the certificate | Throwaway accounts |
| Optional human review of the capstone | Someone else doing the work for the learner |

No static system can prove that a person did their own work. If you want the certificate to carry weight, keep the optional review of the capstone, even if you only sample a few submissions at random.

### 5.7 Limits to plan for

- The workflow's built-in token has an hourly API limit. Fetch only what each check needs and check GitHub's current limits in its documentation.
- Only public repositories can be checked. Tell learners this at the start.
- Count attempts by listing earlier issues by the same author with the `submission` label in the last 24 hours.
- Use the `concurrency` block shown above so two simultaneous submissions cannot overwrite each other's ledger changes.

## 6. Terminal simulator

The simulator is a terminal inside the web page where learners can type real Git commands safely. It teaches and gives hints. It never awards a pass, because the learner's browser can always be tampered with. Only checks on GitHub count.

### 6.1 Four ways to build it

| Approach | What it is | Good for | Watch out for |
| --- | --- | --- | --- |
| A. isomorphic-git | A JavaScript implementation of Git that runs in the browser on a virtual file system | Real behaviour for init, add, commit, status, log, branches and basic merges | It does not implement everything the Git command line does. Confirm in its documentation that a command exists before you promise it in a stage |
| B. Your own mini Git model | A small in-memory model of commits, branches and files that you write yourself | Teaching rebase, stash, cherry-pick and conflicts with a live commit graph picture | More code to write and test, and you must make its output match real Git |
| C. Git compiled to WebAssembly | A real Git library (libgit2) compiled for the browser | Closer to real Git for more commands | Larger download, less documentation, harder to customise |
| D. A real terminal in Codespaces | GitHub's cloud development environment, opened from your template repository | The most realistic practice, with real GitHub authentication | Needs an account and has a monthly free allowance, so check the current limits |

**Recommendation:** start with **A** for stages 1, 2 and 4, add **B** later for rebase, stash and the conflict stage because it lets you draw the commit graph, and offer **D** as an optional "real terminal" button. Do not try to build all four at once.

### 6.2 Suggested stack

- **Vite and TypeScript** for the website.
- **xterm.js** for the terminal display.
- **isomorphic-git** with **@isomorphic-git/lightning-fs**, which stores a virtual disk in the browser's IndexedDB.
- A small **SVG commit graph panel** next to the terminal, redrawn after every command, so learners see what the command did.
- No framework is required. Add one later if the interface grows.

### 6.3 Parts of the simulator

| Part | Responsibility |
| --- | --- |
| Shell | Reads a line, handles quotes, history with the arrow keys and tab completion, then calls a command |
| Virtual file system | The files of the exercise, reset to a known state for each task |
| Git engine | Maps `git ...` commands to isomorphic-git calls, or to your own model for advanced commands, and prints Git-style output |
| Task engine | Loads a task, sets up its starting state, runs its check after each command, shows hints |
| Graph view | Draws commits, branches and HEAD from the current repository state |

### 6.4 Commands to support

| Group | Commands |
| --- | --- |
| Shell | `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo "text" > file`, `rm`, `mv`, `clear`, `help` |
| Editing | An `edit <file>` command that opens a small text box. A real editor such as nano is not worth building |
| Git, stage 1 to 2 | `init`, `status`, `add`, `commit -m`, `log --oneline`, `diff`, `branch`, `switch`, `checkout`, `merge` |
| Git, stage 3 to 4 | `restore`, `reset`, `revert`, `tag`, and conflict handling with markers you can edit |
| Git, advanced demos | `stash`, `rebase`, `cherry-pick`, using your own model |
| Remote | `remote add`, `push`, `pull`, `fetch` against a **second simulated repository** inside the browser |

Do not make the simulator push to real GitHub. That needs access tokens in the browser and usually a CORS proxy, which adds risk and a server. Real GitHub work belongs on github.com.

### 6.5 Task format

Write tasks as data so you can add new ones without changing code.

```json
{
  "id": "s2-t3",
  "title": "Merge the feature branch",
  "story": "Your teammate finished the login feature. Bring it into main.",
  "setup": {
    "files": { "README.md": "# Demo\n" },
    "commands": [
      "git init", "git add .", "git commit -m 'Start'",
      "git switch -c feature/login", "echo login > login.txt",
      "git add .", "git commit -m 'Add login'", "git switch main"
    ]
  },
  "hints": [
    "Which branch must you be on to merge into it?",
    "You are already on main.",
    "Try: git merge feature/login"
  ],
  "check": { "type": "branchContainsMessage", "branch": "main", "message": "Add login" }
}
```

Build a small set of reusable check types and reuse them everywhere.

| Check type | Passes when |
| --- | --- |
| `fileExists`, `fileContains` | A file is present or holds some text |
| `branchExists` | A branch with that name exists |
| `branchContainsMessage` | A branch's history includes a commit with that message |
| `onBranch` | HEAD points at that branch |
| `commitCount` | A branch has at least n commits |
| `noConflictMarkers` | No file contains `<<<<<<<` |
| `tagExists` | A tag with that name exists |

### 6.5.1 Keeping practice and proof consistent

Use the same task wording in the simulator and on the real stage page. The simulator task teaches "merge the feature branch". The real stage then asks for the same thing in the learner's own repository. That way practice directly prepares the proof.

### 6.6 Saving progress

Store the virtual disk in IndexedDB through lightning-fs and the learner's task progress in the browser's local storage. Wrap every storage call in try and catch and make the page work when storage is empty or blocked. Add a **Reset task** button that rebuilds the starting state.

### 6.7 The optional Codespaces lab

In your template repository add `.devcontainer/devcontainer.json`. When a learner chooses **Code, Codespaces**, they get a real terminal with Git and the GitHub command line ready.

```json
{
  "name": "Git lab",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

Codespaces has a free monthly allowance that changes over time, so link to GitHub's current pricing page instead of promising a number.

### 6.8 Testing the simulator

- Write unit tests for the command parser: quotes, spaces, bad input.
- Replay recorded command lists, called transcripts, and compare the output and final state with real Git run in a test script. This catches output that differs from the real tool.
- Test every task by running its solution transcript and confirming the check passes, and by running nothing and confirming it fails.

## 7. Credentials: ledger, certificate and verification

A credential is only worth something if a stranger can check it without trusting you or the learner. This section shows how to get that with GitHub alone: a public ledger of what each learner achieved, a certificate signed with a key only your workflow can use, and a public page that checks the signature.

### 7.1 The ledger

The ledger lives on a branch named `ledger` in the portal repository. Only the workflow writes to it.

```text
ledger branch
  learners/583231.json        one file per learner, named by numeric GitHub id
  certificates/GGH-2026-7K3QP9XM2D.json   one signed file per certificate
```

A learner file records what was verified, with enough evidence to make sense later:

```json
{
  "githubId": 583231,
  "login": "octocat",
  "stages": {
    "1": {
      "startedAt": "2026-10-20T09:00:00Z",
      "passedAt": "2026-10-20T10:12:00Z",
      "evidence": { "repo": "octocat/git-lab", "commits": ["a1b2c3d", "e4f5a6b"], "issue": 41 }
    }
  },
  "attempts": { "2": 3 },
  "certificateId": null
}
```

### 7.2 The certificate

```json
{
  "id": "GGH-2026-7K3QP9XM2D",
  "type": "GitGitHubPractitioner",
  "version": 1,
  "course": "Git and GitHub Practitioner",
  "recipient": { "githubId": 583231, "githubLogin": "octocat", "name": "Octo Cat" },
  "stages": [1, 2, 3, 4, 5, 6, 7],
  "issuedAt": "2026-11-02T08:30:00Z",
  "issuer": { "name": "Your name or organisation", "url": "https://YOUR-ORG.github.io/git-learning-portal/" },
  "kid": "2026-1",
  "signature": "<base64url signature>"
}
```

| Field | Purpose |
| --- | --- |
| `id` | Short, readable and unique. It is what people type into the verify page |
| `recipient.githubId` | The permanent link to the account that did the work |
| `recipient.name` | A name the learner typed into the Submit form for the certificate. Reject empty or offensive names |
| `stages` | Which stages were passed, so the certificate matches the ledger |
| `kid` | Which public key checks the signature, so you can rotate keys |
| `signature` | Proof that your workflow produced this exact content |

### 7.3 Create the signing key

Do this once, on your own computer.

```bash
openssl genpkey -algorithm ED25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
gh secret set SIGNING_KEY_PEM < private.pem
```

Then store `private.pem` in a password manager and delete the file from the computer. **Never commit it, and never put it in the website.** The website only ever gets the public half. To get the public key in the form that browsers can use, run:

```js
import { createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';

const jwk = createPublicKey(readFileSync('public.pem')).export({ format: 'jwk' });
console.log(jwk.x); // the raw public key, base64url
```

Put it in `public/keys.json` in the **main branch** of the portal repository, where changes need your review:

```json
[ { "kid": "2026-1", "x": "<value printed above>", "validFrom": "2026-10-01" } ]
```

Also publish the key somewhere else you control, such as your LinkedIn profile or company site, so a skeptical reader can compare the two.

### 7.4 Sign in the workflow

```js
import canonicalize from 'canonicalize';
import { createPrivateKey, sign, randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // no 0, O, 1, I or L

export function newCertificateId(year) {
  const bytes = randomBytes(10);
  const tail = [...bytes].map(b => ALPHABET[b % ALPHABET.length]).join('');
  return `GGH-${year}-${tail}`;
}

export function signCertificate(cert, pem) {
  const data = Buffer.from(canonicalize(cert)); // stable key order, so the same input always gives the same bytes
  const signature = sign(null, data, createPrivateKey(pem)).toString('base64url');
  return { ...cert, signature };
}
```

The `canonicalize` package implements the JSON Canonicalization Scheme (RFC 8785). It matters because JSON can be written in many equivalent ways, and the signature only matches if the signer and the verifier turn the data into exactly the same bytes.

The certificate is issued when a Submit issue for stage 7 passes **and** the ledger shows stages 1 to 6 as passed. The workflow then creates the ID, signs the certificate, writes it to `certificates/`, sets `certificateId` in the learner file, and replies on the issue with the verify link.

### 7.5 The verify page

The page takes a certificate ID, loads the JSON, and checks the signature in the visitor's browser. Nothing has to be trusted except the public key on your site.

```js
import * as ed from '@noble/ed25519';
import canonicalize from 'canonicalize';

const b64u = s => Uint8Array.from(
  atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

export async function verifyCertificate(cert, keys, revoked) {
  const { signature, ...unsigned } = cert;
  const key = keys.find(k => k.kid === cert.kid);
  if (!key) return { ok: false, reason: 'Unknown signing key' };
  if (revoked.some(r => r.id === cert.id)) return { ok: false, reason: 'This certificate was revoked' };
  const message = new TextEncoder().encode(canonicalize(unsigned));
  const ok = await ed.verifyAsync(b64u(signature), message, b64u(key.x));
  return { ok, reason: ok ? 'Signature is valid' : 'Signature does not match' };
}
```

I suggest the `@noble/ed25519` library because it is small and works in every browser, whereas the browser's built-in Ed25519 support is newer and not available everywhere.

Fetch the certificate from the ledger branch:

```text
https://raw.githubusercontent.com/YOUR-ORG/git-learning-portal/ledger/certificates/GGH-2026-7K3QP9XM2D.json
```

That host currently allows reads from other websites and caches for a few minutes, so a new certificate may take a short while to appear. Test this with a real fetch before you rely on it.

The page should show: the recipient's name and GitHub account, the course and the date, the stages with their pass dates read from the learner file, a clear green or red result, and the key id used. Show a plain message for each failure: not found, signature does not match, unknown key, revoked.

### 7.6 Revocation and key rotation

- **Revocation:** keep `public/revoked.json` in the main branch with the certificate ID, the date and a reason. The verify page reads it. Use this for mistakes, proven cheating or abuse.
- **Rotation:** create a new key every year with a new `kid` and add it to `keys.json`. Never delete old public keys, because older certificates still need them to verify.
- **If the private key leaks:** generate a new key, mark the old one as compromised in `keys.json`, and re-issue every valid certificate with the new key. The ledger holds the evidence, so re-issuing is a script, not a manual job.

### 7.7 The certificate page

The portal renders the certificate from the JSON, so no server-side PDF is needed. Use a landscape A4 print stylesheet and the browser's "Save as PDF". Add a QR code that links to the verify URL, using a small client-side library such as `qrcode`. Give the page a share image and a "Copy verify link" button.

### 7.8 What the ledger makes public

GitHub username, numeric id, stage dates, challenge-attempt counts and the name typed for the certificate. It stores no email address and no password. Say this clearly in a privacy notice on the portal, and describe how a learner can ask for their record to be removed.

## 8. Badges, sharing and the real value of the credential

### 8.1 Stage badges (phase 1)

Design three SVG badge images, one for each reward in section 3, and store them in the portal's `public/badges/` folder. They are static files, so they cost nothing to host. A learner can embed one in a README or profile and link it to their verify page:

```markdown
[![Git Foundations](https://YOUR-ORG.github.io/git-learning-portal/badges/git-foundations.svg)](https://YOUR-ORG.github.io/git-learning-portal/verify/?id=GGH-2026-7K3QP9XM2D)
```

Because the image is the same for everyone, the proof is the link behind it, which leads to the signed record.

### 8.2 Open Badges 3.0 export (phase 2)

**Open Badges 3.0** is a standard from 1EdTech for portable digital credentials. It is built on W3C Verifiable Credentials, so other systems can read and verify the badge. Do this only after the certificate works, because it adds several moving parts.

| Piece | What it is | Where it lives |
| --- | --- | --- |
| Issuer profile | Who you are, with a name and URL | `issuer.json` on your site |
| Achievement | What the badge means, with criteria | `achievements/practitioner.json` on your site |
| The credential | The badge for one person, signed | `ob/<certificateId>.json` on the ledger branch or your site |
| Badge image | The picture shown in wallets | `badges/practitioner.png` |

A minimal credential looks like this. Treat it as a starting skeleton, because exact fields and context versions change between releases of the specification.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
  ],
  "id": "https://YOUR-ORG.github.io/git-learning-portal/ob/GGH-2026-7K3QP9XM2D.json",
  "type": ["VerifiableCredential", "OpenBadgeCredential"],
  "issuer": {
    "id": "https://YOUR-ORG.github.io/git-learning-portal/issuer.json",
    "type": ["Profile"],
    "name": "Your name or organisation"
  },
  "validFrom": "2026-11-02T08:30:00Z",
  "name": "Git and GitHub Practitioner",
  "credentialSubject": {
    "type": ["AchievementSubject"],
    "achievement": {
      "id": "https://YOUR-ORG.github.io/git-learning-portal/achievements/practitioner.json",
      "type": ["Achievement"],
      "name": "Git and GitHub Practitioner",
      "description": "Completed seven stages of verified Git and GitHub work.",
      "criteria": { "narrative": "Passed all seven stages, each checked against public GitHub repositories." }
    }
  }
}
```

The credential must also carry a signature, either as a signed JWT or with a data-integrity proof, and it needs an identifier for the recipient. Read the current Open Badges 3.0 specification and run your output through 1EdTech's free validator before you publish anything.

### 8.3 Add to LinkedIn

LinkedIn does not import Open Badges directly, but it has a link that opens its "Add licence or certification" form with the fields already filled in. Build the link in the certificate page:

```text
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
  &name=Git%20and%20GitHub%20Practitioner
  &organizationName=YOUR%20ORGANISATION
  &issueYear=2026&issueMonth=11
  &certUrl=https%3A%2F%2FYOUR-ORG.github.io%2Fgit-learning-portal%2Fverify%2F%3Fid%3DGGH-2026-7K3QP9XM2D
  &certId=GGH-2026-7K3QP9XM2D
```

(Join it into a single line.) Test it yourself, because LinkedIn can change these parameters. The `certUrl` should be the verify page, so anyone who sees the entry can check it.

### 8.4 Other options

Badge platforms such as Credly or Accredible give wallets, recognition and analytics, but usually cost money and add an approval process. They are worth a look once you have real learners and a stable course.

### 8.5 What gives a credential its value

| Gives value | Does not give value |
| --- | --- |
| Strict checks on real work that anyone can inspect | A fancy design |
| A public methodology page listing every stage rule | A big-sounding name |
| A verify page that works instantly and shows evidence | Claims you cannot back up |
| A visible number of certificates issued and revoked | Hiding how it is earned |
| Versioning: the certificate says which course version it covers | Silent changes to the rules |
| A real person or organisation behind it, with a track record | Anonymous issuer |

### 8.6 Honesty and branding

- Call it a **completion certificate from your project**. Do not say "GitHub certified", "accredited" or "industry recognised" unless you can prove it.
- GitHub also offers its own official certifications. Mention them as the next step after your course, not as something you replace.
- Use the words "Git" and "GitHub" descriptively, and do not use their logos or names in a way that suggests they endorse you. Check the Git logo's licence and GitHub's logo and trademark guidelines before you use either.
- Publish an About page with the full list of stage checks, so your claims are checkable.

## 9. Build guide

This is the order to build things in. The golden rule is to build **one stage completely, from simulator to certificate**, before you build the others. A thin working slice teaches you more than a half-built everything.

### 9.1 Before you start

- A GitHub account. Use your **personal account** if you want the project and its activity on your own profile. Use an **organisation** if you want a brand and shared admin. Either works, and you can move later.
- Node.js 22 or newer, Git, and the GitHub command line (`gh`) installed and signed in.
- **A second, throwaway GitHub account** for testing as a learner. You cannot test the learner journey properly from your own account.

### 9.2 Repository layout

```text
git-learning-portal/
  .github/
    ISSUE_TEMPLATE/   start-stage.yml, submit-stage.yml, config.yml
    workflows/        verify.yml, deploy-site.yml, test.yml
  site/               the Vite project (the website)
    src/              main.ts, simulator/, stages/, progress/, verify/, certificate/
    public/           keys.json, revoked.json, issuer.json, badges/
  verifier/           Node scripts run by Actions
    index.mjs
    lib/              challenge.mjs, sign.mjs, ledger.mjs, form.mjs, comment.mjs
    stages/           stage1.mjs ... stage7.mjs, index.mjs
    test/             one test file per stage
  docs/               METHODOLOGY.md, PRIVACY.md
  README.md  CONTRIBUTING.md  LICENSE
```

### 9.3 Step by step

**Step 1. Create the portal repository.** Make it public, enable Issues, create the labels `start` and `submission`, and under Settings, then Pages, choose **GitHub Actions** as the source.

**Step 2. Create the ledger branch.** It needs its own history with no source code in it.

```bash
git switch --orphan ledger
mkdir learners certificates
touch learners/.gitkeep certificates/.gitkeep
git add . && git commit -m "Create ledger"
git push -u origin ledger
git switch main
```

Note that the ledger branch must not be protected, because the workflow pushes to it directly. Protect `main` instead.

**Step 3. Add the secrets.**

```bash
openssl rand -hex 32 | gh secret set CHALLENGE_SECRET
gh secret set SIGNING_KEY_PEM < private.pem
```

**Step 4. Build the lab template repository.** Create `git-lab-template` with a `README.md`, a `.stage/` folder with a short note, and the pre-made conflicting branches for stage 3:

```bash
echo "Hello" > greeting.txt
git add . && git commit -m "Add greeting"
git switch -c greeting-a
echo "Hello, welcome to the team" > greeting.txt
git commit -am "Greeting A"
git switch main && git switch -c greeting-b
echo "Hello and good luck" > greeting.txt
git commit -am "Greeting B"
git switch main
git push -u origin --all
```

In the repository's Settings, tick **Template repository**. Tell learners to choose **Include all branches** when they click **Use this template**, and to name their copy `git-lab`. The stage 3 instructions then say: merge `greeting-a` and `greeting-b` into `main`, resolve the conflict, and make `greeting.txt` contain both "welcome" and "good luck".

**Step 5. Build `practice-repo`.** Add a `contributors/` folder and a `CONTRIBUTING.md` that explains the stage 5 task. Add one workflow that merges valid pull requests automatically, so you do not have to merge hundreds by hand. It must never check out the pull request's code. It only reads the list of changed files through the API:

```yaml
name: Merge contributor files
on:
  pull_request_target:
    types: [opened, synchronize]
permissions:
  pull-requests: write
  contents: write
jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - name: Merge if the pull request only adds the author's own file
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR: ${{ github.event.pull_request.number }}
          LOGIN: ${{ github.event.pull_request.user.login }}
          REPO: ${{ github.repository }}
        run: |
          files=$(gh api "repos/$REPO/pulls/$PR/files" --jq '[.[] | "\(.status):\(.filename)"] | join(",")')
          if [ "$files" = "added:contributors/$LOGIN.md" ]; then
            gh pr merge "$PR" --repo "$REPO" --squash
          else
            gh pr comment "$PR" --repo "$REPO" --body "This pull request must add exactly one new file: contributors/$LOGIN.md"
          fi
```

In that repository's settings, allow squash merging and do not require approvals. Also consider limiting the file size, because the file's text is public. Review the safety of this workflow with extra care, since `pull_request_target` runs with write access.

**Step 5b. Write the verifier.** Start the Node project:

```bash
cd verifier
npm init -y
npm install @octokit/rest canonicalize
```

Set `"type": "module"` in `package.json`. The entry script has seven jobs, in this order:

1. Read the issue through the API and parse the form fields (below).
2. Work out whether it is a Start or a Submit request.
3. Load the learner's ledger file, or create an empty one.
4. For Start: check the previous stage passed, record the start time, and reply with the challenge code.
5. For Submit: check the attempt limit, run the stage function, and record the result and evidence.
6. If stage 7 passed and stages 1 to 6 are in the ledger, create and sign the certificate.
7. Reply with the result and close the issue. The workflow then pushes the ledger changes.

Issue forms turn each field into a heading followed by the answer, so a small parser is enough:

```js
export function parseForm(body = '') {
  const out = {};
  for (const block of body.split(/^### /m).slice(1)) {
    const [label, ...rest] = block.split('\n');
    out[label.trim().toLowerCase()] = rest.join('\n').trim();
  }
  return out;
}
```

The keys are the labels you wrote in the form, in lower case, for example `stage` and `your lab repository`. Treat everything it returns as untrusted text, validate it, and never pass it to a shell.

**Step 6. Build the website.**

```bash
npm create vite@latest site -- --template vanilla-ts
cd site
npm install @xterm/xterm isomorphic-git @isomorphic-git/lightning-fs @noble/ed25519 canonicalize qrcode
```

In `vite.config.ts` set `base: '/git-learning-portal/'` so the site works under the project path on GitHub Pages. Add this deploy workflow:

```yaml
# .github/workflows/deploy-site.yml
name: Deploy site
on:
  push:
    branches: [main]
    paths: ['site/**']
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci && npm run build
        working-directory: site
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

Action versions change, so check each action's page for the current major version.

**Step 7. Build the progress page.** The learner types a username. The page calls `https://api.github.com/users/<username>` to get the numeric id, then reads `learners/<id>.json` from the ledger branch and shows the stage list with locked, available and passed states. The public GitHub API allows only a small number of unauthenticated requests per hour per visitor, so cache the id in the browser.

**Step 8. Build the verify and certificate pages** as described in section 7.

**Step 9. Turn off blank issues** so learners only see your two forms, by adding `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
```

**Step 10. Test as a learner.** Use your throwaway account and walk every stage. Break each check on purpose and confirm that the failure message is clear.

### 9.4 Definition of done for a stage

- The stage page is written and links to the handbook chapters.
- The simulator tasks exist, and each one has a tested solution transcript.
- The template or practice repository supports the stage.
- The verifier function exists, with unit tests that use fake GitHub responses for passing and failing cases.
- Every failure produces a message that says what to fix.
- You have run the stage end to end with the throwaway account.

## 10. Security, privacy and legal checklist

Because the portal's workflows hold secrets and write the credential records, treat the portal repository like production software.

### 10.1 Threats and controls

| Threat | What could happen | Control |
| --- | --- | --- |
| Script injection through issue text | A learner writes shell code in a form field and it runs in your workflow | Never put issue titles or bodies into `run:` commands. Read them through the API and parse them as data |
| Leaked signing key or challenge secret | Anyone could forge certificates or codes | Keep both only in Actions secrets. Never print them. Rotate if in doubt (section 7.6) |
| Malicious change to your verifier | Someone makes every check pass | Protect `main`, require a review, and add a `CODEOWNERS` file for `verifier/` and `.github/workflows/`. Keep write access to yourself |
| Forged ledger entries | Someone edits learner files | Only the workflow writes to the ledger branch. Everyone with write access needs two-factor authentication. Review the ledger's commit history now and then |
| Auto-merge workflow abused | A pull request to `practice-repo` carries more than the allowed file | The workflow reads the file list through the API only, never checks out the pull request, and rejects anything but exactly one new file of a small size |
| Offensive or misleading certificate names | Your certificate carries abusive text | Limit the name length, allow letters, spaces and common punctuation only, block links, and reserve the right to revoke |
| API limits | Checks fail during a busy day | Fetch only what a check needs, cache, and limit attempts per learner |
| Vulnerable dependencies | A bug in a package affects the verifier | Turn on Dependabot for npm and for Actions. Pin third-party actions to a full commit hash |

Also turn on **secret scanning and push protection** for the portal repository, and give every workflow the least permissions it needs with a `permissions:` block.

### 10.2 Privacy

- Publish a short **privacy notice**: what the ledger stores, that it is public, and why.
- Store only the GitHub username, numeric id, stage dates, evidence links and the certificate name. Do not store email addresses.
- Describe how someone can ask you to remove their record: delete the learner file, revoke the certificate, and add it to `revoked.json`.
- Because the ledger is public and kept in Git history, a deletion leaves old copies in history. State this honestly in the notice, and consider legal advice if you expect learners in regions with strict privacy laws.

### 10.3 Legal and licensing

- Choose a licence for the code (MIT or Apache 2.0 are common) and a separate one for the written lessons (for example Creative Commons Attribution).
- Add terms that say the certificate is provided as is, is not an accreditation, and can be revoked.
- Follow GitHub's terms and its trademark and logo guidelines.
- If you represent your employer in any way, check with them before you publish.

### 10.4 Accessibility and usability

- Make the simulator usable with the keyboard, with sufficient colour contrast, and offer a way to copy commands.
- Provide a text version of any diagram.
- Make the pages work on a phone. Learners may read the stage on a phone and do the work on a laptop.

## 11. Roadmap and testing

The plan assumes part-time work. Release early: version 0.1 is a working course with stages 1 to 3 and the Foundations badge, and version 1.0 is the full seven stages with the certificate.

### 11.1 Six-week plan

| Week | Goal | Done when |
| --- | --- | --- |
| 1 | Portal repo, labels, issue forms, secrets, ledger branch, site deployed, lab template, stage 1 verifier | A throwaway account passes stage 1 and a learner file appears on the ledger branch |
| 2 | Stage 2 and stage 3 verifiers, conflict branches in the template, progress page | The progress page shows stages 1 to 3 unlocking in order |
| 3 | Simulator version 1 with tasks for stages 1 and 2, and the commit graph panel | A new person can finish the stage 1 simulator tasks without help |
| 4 | Certificate: signing, certificate page, verify page, revoked list. **Release 0.1** | A certificate for stages 1 to 3 verifies on a different computer |
| 5 | Stage 4, 5 and 6 verifiers, `practice-repo` and its auto-merge workflow | A throwaway account passes stages 4 to 6 end to end |
| 6 | Stage 7, badges, LinkedIn link, methodology and privacy pages, beta with five teammates, fixes. **Release 1.0** | Five people finish the course and the problems they found are fixed |

### 11.2 Testing plan

- **Unit tests** (for example with Vitest): each stage function with fake GitHub responses. Write one passing case and one failing case for every check.
- **Golden repositories:** create a few real repositories under the throwaway account that should pass each stage, and others that should fail in specific ways. Run the verifier against them from a script.
- **End-to-end run:** a written checklist where you perform every stage as a new learner, from reading the stage page to receiving the certificate.
- **Signature tests:** verify a good certificate, then change one letter and confirm that the verify page rejects it. Test a revoked one and an unknown key.
- **Security review:** have a second person read the workflows and the issue-handling code with the threat table from section 10 in hand.
- **Beta feedback:** open a GitHub Discussions category and ask beta learners where they got stuck.

### 11.3 What to measure

Started, passed and abandoned counts per stage, the most common failed check, certificates issued and revoked. Publish the totals in the README. They show that the project is alive, and they tell you which stage to improve.

## 12. Growing the project: stars, contributors and commits

You want this project to raise the value of your GitHub profile. The honest way is to build something people choose to use and contribute to. Here is what works, and what to avoid.

### 12.1 What counts on your profile

- **Your own commits** count in your contribution graph when they are made with an email address linked to your account, on the repository's **default branch** (or `gh-pages`). Commits on a feature branch count once they are merged there.
- **Pull requests, issues and code reviews** are counted as separate kinds of activity. Working through issues and pull requests, even on your own repository, shows more than a long run of tiny commits.
- **Commits made by the workflow bot** (the ledger updates) are authored by the bot, so they do **not** count for you. Learners' commits in their own lab repositories count for them, not for you.

So the activity that helps your profile is the real work of building and maintaining the project, plus the reviews and merges of other people's contributions.

### 12.2 Earning stars the right way

- A clear README at the top: what it is, a short screen recording of the simulator, a link to the live site and one-minute instructions to start.
- A good **repository description and topics**, such as `git`, `github`, `learn-git`, `github-actions` and `education`, so people find it in search.
- A soft invitation, such as "If this helped you, a star helps others find it", on the certificate page and in the README.
- Share it where learners are: LinkedIn, developer communities and your own team. Write a short post that explains how you built it, because the story is interesting.
- Release notes for each version, so people can see steady progress.

**Do not require a star to get a stage or the certificate.** GitHub treats incentivised and artificial starring as manipulation, and a star count that jumps because people were forced to click is easy to spot and damages trust in the whole project.

### 12.3 Bring in contributors

Contributors make a project look alive, and their merged pull requests add to your maintainer activity.

- Add a `CONTRIBUTING.md` that explains how to run the site and the verifier.
- Label small tasks `good first issue`. Good examples: add quiz questions, fix a typo, translate a stage, add a simulator task, improve an error message.
- Use pull request and issue templates, and reply quickly to the first few contributors.
- Credit people in the README.
- Open **Discussions** for questions and ideas.

### 12.4 A simple habit that builds a real history

1. Write each piece of work as an issue first.
2. Do it on a branch.
3. Open a pull request that says `Closes #<number>`.
4. Merge it and keep your messages clear.

That is also exactly the workflow your handbook teaches, so the repository becomes a living example of it.
