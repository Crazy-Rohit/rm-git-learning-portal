import { paintStageTabFromStorage } from './path';

paintStageTabFromStorage();

const KEY = 'hb-theme';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

function current() {
  return root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
}

function save(value: string) {
  try { localStorage.setItem(KEY, value); } catch { /* storage can be blocked */ }
}

function label(button: HTMLButtonElement) {
  const dark = current() === 'dark';
  button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  button.title = dark ? 'Light theme' : 'Dark theme';
}

document.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach((button) => {
  label(button);
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    save(next);
    label(button);
  });
  media.addEventListener?.('change', () => label(button));
});
