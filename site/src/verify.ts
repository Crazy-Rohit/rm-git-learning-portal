import { canonical } from './canonical';
import { CERTIFICATE_COURSE, ISSUER, LEDGER, SITE, badgeFor, profileSnippet } from './catalog';

type PublicKey = { kid: string; x: string; validFrom?: string };
type RevokedItem = string | { id?: string };
type Credential = {
  id: string;
  type: string;
  title?: string;
  course?: string;
  stage?: number;
  stages?: number[];
  issuedAt?: string;
  kid?: string;
  signature?: string;
  recipient?: { githubId?: number; githubLogin?: string; name?: string };
  issuer?: { name?: string };
  evidence?: { repo?: string; issue?: number };
};

const ID_RE = /^GGP-\d{4}-\d+(?:-S[1-7])?$/;

function bytes(value: string) {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function signatureMatches(credential: Credential, key: PublicKey) {
  if (!credential.signature || !key.x) return false;
  const { signature, ...unsigned } = credential;
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'OKP', crv: 'Ed25519', x: key.x },
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    { name: 'Ed25519' },
    cryptoKey,
    bytes(signature),
    new TextEncoder().encode(canonical(unsigned)),
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

function field(label: string, value: string) {
  const row = document.createElement('div');
  const name = document.createElement('dt');
  const data = document.createElement('dd');
  name.textContent = label;
  data.textContent = value;
  row.append(name, data);
  return row;
}

function renderBadge(credential: Credential, root: HTMLElement) {
  const badge = badgeFor(Number(credential.stage));
  const figure = document.createElement('figure');
  figure.className = 'issued';
  if (badge) {
    const image = document.createElement('img');
    image.src = `${import.meta.env.BASE_URL}badges/${badge.slug}.png`;
    image.alt = badge.title;
    figure.append(image);
  }
  const caption = document.createElement('figcaption');
  caption.textContent = `@${credential.recipient?.githubLogin || 'unknown'}`;
  figure.append(caption);
  root.append(figure);
}

function renderCertificate(credential: Credential, root: HTMLElement) {
  const sheet = document.createElement('article');
  sheet.className = 'sheet';
  const copy = document.createElement('div');
  copy.className = 'sheet-copy';
  const kicker = document.createElement('p');
  kicker.className = 'by';
  kicker.textContent = 'Certificate of completion';
  const title = document.createElement('h2');
  title.textContent = credential.course || CERTIFICATE_COURSE;
  const presented = document.createElement('p');
  presented.className = 'sheet-kicker';
  presented.textContent = 'Presented to';
  const person = document.createElement('p');
  person.className = 'sheet-name';
  person.textContent = credential.recipient?.name || credential.recipient?.githubLogin || '';
  const facts = document.createElement('dl');
  facts.append(
    field('GitHub account', `@${credential.recipient?.githubLogin || ''} · ${credential.recipient?.githubId ?? ''}`),
    field('Completed', credential.issuedAt ? formatDate(credential.issuedAt) : ''),
    field('Credential ID', credential.id),
    field('Issuer', `${credential.issuer?.name || ISSUER}, course creator`),
  );
  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Checked against the learner\'s public GitHub repositories. This is not a GitHub certification.';
  copy.append(kicker, title, presented, person, facts, note);
  const art = document.createElement('div');
  art.className = 'sheet-art';
  art.style.backgroundImage = `url("${import.meta.env.BASE_URL}badges/certificate-side.webp")`;
  art.setAttribute('role', 'img');
  art.setAttribute('aria-label', '');
  sheet.append(copy, art);
  root.append(sheet);
}

async function copyText(value: string, button: HTMLButtonElement) {
  await navigator.clipboard.writeText(value);
  const previous = button.textContent;
  button.textContent = 'Copied';
  window.setTimeout(() => { button.textContent = previous; }, 1600);
}

function renderRecord(credential: Credential, status: 'valid' | 'revoked' | 'invalid', root: HTMLElement) {
  root.replaceChildren();
  const banner = document.createElement('p');
  banner.className = `verdict ${status}`;
  banner.textContent = status === 'valid'
    ? `Valid. Signed for @${credential.recipient?.githubLogin || 'this account'} by ${ISSUER}.`
    : status === 'revoked'
      ? 'Revoked. This record was withdrawn by the issuer.'
      : 'Invalid. The signature does not match the public key.';
  root.append(banner);

  if (credential.type === 'GitGitHubPractitioner') renderCertificate(credential, root);
  else renderBadge(credential, root);

  const facts = document.createElement('dl');
  facts.className = 'record';
  const badge = badgeFor(Number(credential.stage));
  facts.append(
    field('Credential', credential.type === 'GitGitHubPractitioner' ? (credential.course || CERTIFICATE_COURSE) : (credential.title || badge?.title || 'Badge')),
    field('GitHub account', `@${credential.recipient?.githubLogin || ''} (${credential.recipient?.githubId ?? ''})`),
    field('Issued', credential.issuedAt ? formatDate(credential.issuedAt) : ''),
    field('Credential ID', credential.id),
    field('Signing key', credential.kid || ''),
  );
  if (credential.evidence?.repo) {
    const repo = document.createElement('div');
    const name = document.createElement('dt');
    name.textContent = 'Evidence';
    const data = document.createElement('dd');
    const link = document.createElement('a');
    link.href = `https://github.com/${credential.evidence.repo}`;
    link.textContent = credential.evidence.repo;
    data.append(link);
    if (credential.evidence.issue) {
      data.append(document.createTextNode(' · '));
      const issue = document.createElement('a');
      issue.href = `https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/${credential.evidence.issue}`;
      issue.textContent = `issue ${credential.evidence.issue}`;
      data.append(issue);
    }
    repo.append(name, data);
    facts.append(repo);
  }
  root.append(facts);

  if (status !== 'valid' || credential.type === 'GitGitHubPractitioner' || !credential.stage) return;
  const snippet = profileSnippet(credential.stage, credential.id);
  const actions = document.createElement('div');
  actions.className = 'actions';
  const copyLink = document.createElement('button');
  copyLink.className = 'btn';
  copyLink.type = 'button';
  copyLink.textContent = 'Copy verify link';
  copyLink.addEventListener('click', () => copyText(`${SITE}verify.html?id=${encodeURIComponent(credential.id)}`, copyLink));
  const copySnippet = document.createElement('button');
  copySnippet.className = 'btn';
  copySnippet.type = 'button';
  copySnippet.textContent = 'Copy profile snippet';
  copySnippet.addEventListener('click', () => copyText(snippet, copySnippet));
  actions.append(copyLink, copySnippet);
  const code = document.createElement('pre');
  code.className = 'snippet';
  code.textContent = snippet;
  root.append(actions, code);
}

function showMessage(root: HTMLElement, message: string) {
  root.replaceChildren();
  const paragraph = document.createElement('p');
  paragraph.className = 'verdict invalid';
  paragraph.textContent = message;
  root.append(paragraph);
}

async function loadCredential(id: string) {
  const response = await fetch(`${LEDGER}/certificates/${id}.json`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The credential record could not be read.');
  return await response.json() as Credential;
}

export async function checkCredential(id: string) {
  if (!ID_RE.test(id)) throw new Error('That credential id is not in the right form.');
  const [credential, keysResponse, revokedResponse] = await Promise.all([
    loadCredential(id),
    fetch(`${import.meta.env.BASE_URL}keys.json`),
    fetch(`${import.meta.env.BASE_URL}revoked.json`),
  ]);
  if (!credential || credential.id !== id) return { status: 'missing' as const, credential: null };
  if (!keysResponse.ok || !revokedResponse.ok) throw new Error('The public key could not be read.');
  const keys = await keysResponse.json() as PublicKey[];
  const revoked = await revokedResponse.json() as RevokedItem[];
  const withdrawn = revoked.some((item) => (typeof item === 'string' ? item : item.id) === id);
  if (withdrawn) return { status: 'revoked' as const, credential };
  const key = keys.find((item) => item.kid === credential.kid);
  if (!key) return { status: 'invalid' as const, credential };
  const matches = await signatureMatches(credential, key);
  return { status: matches ? 'valid' as const : 'invalid' as const, credential };
}

const form = document.querySelector<HTMLFormElement>('#lookup');
const input = document.querySelector<HTMLInputElement>('#credential-id');
const result = document.querySelector<HTMLElement>('#result');

async function show(id: string) {
  if (!result) return;
  result.replaceChildren();
  const pending = document.createElement('p');
  pending.className = 'note';
  pending.textContent = 'Checking the public record…';
  result.append(pending);
  try {
    const outcome = await checkCredential(id);
    if (outcome.status === 'missing' || !outcome.credential) {
      showMessage(result, 'No signed record uses that id.');
      return;
    }
    renderRecord(outcome.credential, outcome.status, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The check failed.';
    if (message.includes('Ed25519') || message.includes('Algorithm')) {
      showMessage(result, 'This browser cannot check the signature. Open the page in a current version of Chrome, Edge, Firefox, or Safari.');
      return;
    }
    showMessage(result, message);
  }
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = input?.value.trim() ?? '';
  if (!id) return;
  const next = new URL(window.location.href);
  next.searchParams.set('id', id);
  window.history.replaceState(null, '', next);
  show(id);
});

const initial = new URLSearchParams(window.location.search).get('id')?.trim() ?? '';
if (initial && input) {
  input.value = initial;
  show(initial);
}
