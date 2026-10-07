import { canonical } from './canonical';
import { CERTIFICATE_COURSE, ISSUER, LEDGER, SITE, badgeFor, sharePageUrl } from './catalog';
import { downloadCertificateImage, downloadCertificatePdf, downloadUrl } from './export';

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

function svgMark(path: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  node.setAttribute('d', path);
  svg.append(node);
  return svg;
}

function whatsAppMark() {
  return svgMark('M12 2a10 10 0 0 0-8.48 15.3L2 22l4.84-1.47A10 10 0 1 0 12 2Zm5.47 14.32c-.23.65-1.34 1.2-1.86 1.27-.48.07-1.1.1-1.77-.11a13.4 13.4 0 0 1-5.7-4.96 6.2 6.2 0 0 1-1.3-3.27c-.03-.74.2-1.46.62-1.95.18-.21.48-.34.8-.34h.58c.25 0 .47.02.67.51.23.57.78 1.97.85 2.12.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.08.13.08.73-.15 1.38Z');
}

function facebookMark() {
  return svgMark('M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.87 6.48 1.87 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.41V9.85c0-2.38 1.42-3.7 3.59-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.91h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93Z');
}

function linkedInMark() {
  return svgMark('M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z');
}

function shareButton(label: string, kind: string, href: string, mark: SVGSVGElement) {
  const link = document.createElement('a');
  link.className = `share-btn ${kind}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.append(mark, document.createTextNode(label));
  return link;
}

async function copyText(value: string, button: HTMLButtonElement) {
  await navigator.clipboard.writeText(value);
  const previous = button.textContent;
  button.textContent = 'Copied';
  window.setTimeout(() => { button.textContent = previous; }, 1600);
}

function downloadButton(label: string, run: () => Promise<void>) {
  const button = document.createElement('button');
  button.className = 'btn';
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', async () => {
    const previous = button.textContent;
    button.disabled = true;
    button.textContent = 'Preparing…';
    try {
      await run();
      button.textContent = 'Downloaded';
    } catch {
      button.textContent = 'Could not download';
    }
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = previous;
    }, 1600);
  });
  return button;
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

  if (status === 'valid') {
    const page = sharePageUrl(credential.id);
    const text = `${credential.title || credential.course || 'Credential'}\nAwarded by Rohit Manna\n${page}`;
    const panel = document.createElement('section');
    panel.className = 'share-panel';
    const heading = document.createElement('h2');
    heading.textContent = 'Share this credential';
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = 'The link opens a card with the badge, the learner, and Rohit Manna as the issuer. Send it from the app. LinkedIn will not add a verified tick.';
    const row = document.createElement('div');
    row.className = 'share-row';
    row.append(
      shareButton('WhatsApp', 'wa', `https://wa.me/?text=${encodeURIComponent(text)}`, whatsAppMark()),
      shareButton('Facebook', 'fb', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(page)}`, facebookMark()),
      shareButton('LinkedIn', 'in', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}`, linkedInMark()),
    );
    const copies = document.createElement('div');
    copies.className = 'share-copy';
    const copyLink = document.createElement('button');
    copyLink.className = 'btn';
    copyLink.type = 'button';
    copyLink.textContent = 'Copy verify link';
    copyLink.addEventListener('click', () => copyText(`${SITE}verify.html?id=${encodeURIComponent(credential.id)}`, copyLink));
    copies.append(copyLink);

    const downloadHead = document.createElement('h2');
    downloadHead.textContent = 'Download';
    const downloads = document.createElement('div');
    downloads.className = 'share-copy';
    if (credential.type === 'GitGitHubPractitioner') {
      downloads.append(
        downloadButton('Download certificate image', async () => downloadCertificateImage(credential)),
        downloadButton('Download certificate PDF', async () => downloadCertificatePdf(credential)),
      );
    } else if (badge) {
      downloads.append(
        downloadButton('Download badge image', async () => {
          await downloadUrl(`${import.meta.env.BASE_URL}badges/${badge.slug}.png`, `${credential.id}-${badge.slug}.png`);
        }),
      );
    }

    panel.append(heading, note, row, copies, downloadHead, downloads);
    root.append(panel);
  }
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
