import './badges.css';

export function badgeImageSrc(slug: string) {
  return `${import.meta.env.BASE_URL}badges/${slug}.png`;
}

export function nameLines(name: string) {
  const words = name.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length <= 1) return [words[0] || 'Learner'];
  return [words[0], words.slice(1).join(' ')];
}

function paintLines(label: HTMLElement, name: string) {
  const lines = nameLines(name);
  label.replaceChildren(...lines.map((text) => {
    const line = document.createElement('span');
    line.className = 'badge-name-line';
    line.textContent = text;
    return line;
  }));
  label.classList.toggle('badge-name--stack', lines.length > 1);
}

function lineOverflow(label: HTMLElement) {
  return Array.from(label.querySelectorAll<HTMLElement>('.badge-name-line'))
    .some((line) => line.scrollWidth > line.clientWidth + 1);
}

export function nameOverflows(box: HTMLElement) {
  return box.scrollWidth > box.clientWidth + 1
    || box.scrollHeight > box.clientHeight + 1
    || lineOverflow(box);
}

export function fitNameBox(box: HTMLElement, startCqi: number, minCqi = 1.6) {
  let size = startCqi;
  let track = 0.02;
  box.style.fontSize = `${size}cqi`;
  box.style.letterSpacing = `${track}em`;
  for (let i = 0; i < 70 && nameOverflows(box); i += 1) {
    size -= 0.08;
    if (track > 0.002) track -= 0.0008;
    box.style.fontSize = `${Math.max(minCqi, size)}cqi`;
    box.style.letterSpacing = `${track}em`;
    if (size <= minCqi) break;
  }
  return !nameOverflows(box);
}

function startFont(el: HTMLElement, property: string, fallback: number) {
  const host = el.closest('.badge-face, .cert-face');
  const raw = host ? parseFloat(getComputedStyle(host).getPropertyValue(property)) : NaN;
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

export function fitBadgeName(label: HTMLElement) {
  return fitNameBox(label, startFont(label, '--plaque-font', 5.0), 1.6);
}

export function fitCertName(label: HTMLElement) {
  const text = (label.dataset.name || label.textContent || 'Learner').replace(/\s+/g, ' ').trim() || 'Learner';
  const start = startFont(label, '--cert-name-font', 8.4);
  label.textContent = text;
  label.classList.remove('badge-name--stack');
  if (fitNameBox(label, start, 3.8)) return true;
  paintLines(label, text);
  return fitNameBox(label, start, 2.6);
}

export function setCertName(label: HTMLElement, name: string) {
  const text = name.replace(/\s+/g, ' ').trim() || 'Learner';
  label.dataset.name = text;
  paintLines(label, text);
  fitCertName(label);
}

export function watchNameBox(face: HTMLElement, fit: () => void) {
  const image = face.querySelector('img');
  if (image?.complete) fit();
  else image?.addEventListener('load', fit, { once: true });
  if (typeof ResizeObserver !== 'undefined') {
    const watch = new ResizeObserver(fit);
    watch.observe(face);
  }
}

export function badgeFace(slug: string, title: string, name: string) {
  const labelText = name.replace(/\s+/g, ' ').trim() || 'Learner';
  const face = document.createElement('div');
  face.className = `badge-face badge-face--${slug}`;
  const image = document.createElement('img');
  image.src = badgeImageSrc(slug);
  image.alt = `${title} for ${labelText}`;
  const area = document.createElement('div');
  area.className = 'badge-name-area';
  area.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'badge-name';
  paintLines(label, labelText);
  face.append(image, area, label);
  watchNameBox(face, () => fitBadgeName(label));
  return face;
}

export function setBadgeName(face: HTMLElement, name: string, title?: string) {
  const label = face.querySelector<HTMLElement>('.badge-name');
  const image = face.querySelector<HTMLImageElement>('img');
  const labelText = name.replace(/\s+/g, ' ').trim() || 'Learner';
  if (label) {
    paintLines(label, labelText);
    fitBadgeName(label);
  }
  if (image && title) image.alt = `${title} for ${labelText}`;
}

function readVar(style: CSSStyleDeclaration, name: string) {
  return style.getPropertyValue(name).trim();
}

function percent(style: CSSStyleDeclaration, name: string) {
  return parseFloat(readVar(style, name)) / 100;
}

export function plaqueFromCss(slug: string) {
  const probe = document.createElement('div');
  probe.className = `badge-face badge-face--${slug}`;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.width = '720px';
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const plaque = {
    top: percent(style, '--plaque-top'),
    height: percent(style, '--plaque-height'),
    minWidth: percent(style, '--plaque-min-width'),
    maxWidth: percent(style, '--plaque-max-width'),
    font: parseFloat(readVar(style, '--plaque-font')) || 4.2,
    color: readVar(style, '--plaque-color'),
    from: readVar(style, '--plaque-from') || '#ffffff',
    mid: readVar(style, '--plaque-mid') || '',
    to: readVar(style, '--plaque-to') || '#ffffff',
    glow: readVar(style, '--plaque-glow'),
  };
  probe.remove();
  return plaque;
}
