export function parseForm(body = '') {
  const out = {};
  for (const block of String(body).split(/^### /m).slice(1)) {
    const [label, ...rest] = block.split('\n');
    out[label.trim().toLowerCase()] = rest.join('\n').trim();
  }
  return out;
}

export function displayName(value, login = '') {
  const typed = String(value || '').replace(/\s+/g, ' ').trim();
  if (/^xyz$/i.test(typed) || /^your name$/i.test(typed)) return '';
  if (login && typed.toLowerCase() === String(login).replace(/^@/, '').toLowerCase()) return '';
  if (typed.length >= 2 && typed.length <= 80 && !/[^\p{L}\p{M}\p{N} .'-]/u.test(typed)) return typed;
  return '';
}

export function normaliseRepo(value) {
  return String(value || '')
    .trim()
    .replace(/^https:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/$/, '');
}
