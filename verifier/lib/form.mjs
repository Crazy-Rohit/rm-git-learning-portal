export function parseForm(body = '') {
  const out = {};
  for (const block of String(body).split(/^### /m).slice(1)) {
    const [label, ...rest] = block.split('\n');
    out[label.trim().toLowerCase()] = rest.join('\n').trim();
  }
  return out;
}

export function normaliseRepo(value) {
  return String(value || '')
    .trim()
    .replace(/^https:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/$/, '');
}
