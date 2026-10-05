# Git Learning Portal

A free course by **Rohit Manna**. Learners read the handbook, do the work on their own GitHub account, and submit it. GitHub Actions checks the public repository and records the result.

The certificate, when it is issued, is a completion record from this project. It is not a GitHub certification.

**Stage 1 is open.** Stages 2 to 7, the browser terminal, and the signed certificate are later releases.

## Learner start

1. Read [stage 1](https://crazy-rohit.github.io/rm-git-learning-portal/stage-1.html), or the handbook chapters it links to. The [stage guide](HANDBOOK.md) explains every stage step by step.
2. Use [rm-git-lab-template](https://github.com/Crazy-Rohit/rm-git-lab-template) and name the copy `git-lab`.
3. Open a Start issue, do the work, then open a Submit issue.

Progress for any username: [the progress page](https://crazy-rohit.github.io/rm-git-learning-portal/progress.html).

## Repository map

| Path | What it is |
| --- | --- |
| `src/` | Handbook source. `node build.js` writes `dist/index.html`. |
| `site/` | The portal pages. Vite builds them for GitHub Pages. |
| `verifier/` | The stage checker, run by GitHub Actions. |
| `docs/` | What the checks are, and what the public record stores. |

```bash
npm install --prefix verifier
npm install --prefix site
npm test
npm run build
```

The site is published from `site/dist` by GitHub Actions. The Pages address is `https://crazy-rohit.github.io/rm-git-learning-portal/`.

## One-time secrets

The checker needs two Actions secrets on this repository. The private key and the challenge secret are created outside the repo by `node scripts/create-keys.mjs`. Copy them into a password manager, set the secrets, then delete the local copies.

```bash
gh secret set SIGNING_KEY_PEM < "%LOCALAPPDATA%\rm-git-learning-portal-secrets\private.pem"
gh secret set CHALLENGE_SECRET < "%LOCALAPPDATA%\rm-git-learning-portal-secrets\challenge-secret.txt"
```

The matching public key is `site/public/keys.json`. Never commit the private key.
