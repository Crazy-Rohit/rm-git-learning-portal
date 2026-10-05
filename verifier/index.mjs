import { readFileSync } from 'node:fs';
import { Octokit } from '@octokit/rest';
import { handleIssue } from './handle.mjs';
import { PORTAL } from './lib/portal.mjs';

const keys = JSON.parse(readFileSync(new URL('../site/public/keys.json', import.meta.url), 'utf8'));

const issueNumber = Number(process.env.ISSUE_NUMBER);
if (!issueNumber) {
  console.error('ISSUE_NUMBER is missing.');
  process.exit(1);
}

const gh = new Octokit({ auth: process.env.GH_TOKEN });
const result = await handleIssue({
  gh,
  ledgerDir: process.env.LEDGER_DIR || 'ledger-data',
  issueNumber,
  portal: PORTAL,
  secret: process.env.CHALLENGE_SECRET || '',
  signingKey: process.env.SIGNING_KEY_PEM || '',
  keys,
});

if (result.error) process.exit(1);
