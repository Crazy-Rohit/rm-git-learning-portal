import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CERTIFICATE_COURSE, badgeFor } from './badges.mjs';
import { PORTAL } from './portal.mjs';

const ID_RE = /^GGP-\d{4}-\d+(?:-S[1-7])?$/;

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sharePageUrl(id) {
  return `${PORTAL.siteUrl}share/${id}.html`;
}

export function writeSharePage(dir, credential) {
  if (!dir || !credential || !ID_RE.test(credential.id)) return '';
  const login = credential.recipient?.githubLogin || '';
  const person = credential.recipient?.name || login;
  const badge = badgeFor(credential.stage);
  const isCertificate = credential.type === 'GitGitHubPractitioner';
  const title = isCertificate
    ? (credential.course || CERTIFICATE_COURSE)
    : (credential.title || badge?.title || 'Credential');
  const image = isCertificate || !badge
    ? `${PORTAL.siteUrl}badges/capstone-practitioner.png`
    : `${PORTAL.siteUrl}badges/${badge.slug}.png`;
  const page = sharePageUrl(credential.id);
  const verify = `${PORTAL.siteUrl}verify.html?id=${encodeURIComponent(credential.id)}`;
  const who = person && person !== login ? `${person} (@${login})` : `@${login}`;
  const description = `Awarded to ${who} by Rohit Manna. A course credential, not a GitHub certification.`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${page}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0; url=${esc(verify)}">
  <link rel="canonical" href="${esc(verify)}">
</head>
<body>
  <p><a href="${esc(verify)}">${esc(title)} for @${esc(login)}</a></p>
</body>
</html>
`;
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${credential.id}.html`);
  writeFileSync(file, html);
  return file;
}
