# Contributing

The site is in `site/`. The handbook source is in `src/`. The checker is in `verifier/`.

```bash
npm install --prefix verifier
npm install --prefix site
npm test
npm run build
```

Stage checks belong in `verifier/stages/`. A check has to be something the GitHub API can read on a public repository. Add a passing test and a failing test for each check.

Do not put an issue title or issue body into a workflow `run` command. Read the issue through the API and treat the text as data.
