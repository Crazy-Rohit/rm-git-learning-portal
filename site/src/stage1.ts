import { startIssueUrl } from './catalog';
import { badgeFace, setBadgeName } from './badge';
import { storeName, storedName, tidyName } from './path';

const form = document.querySelector<HTMLFormElement>('#start-stage');
const input = document.querySelector<HTMLInputElement>('#learner-name');
const hint = document.querySelector<HTMLElement>('#name-hint');
const preview = document.querySelector<HTMLElement>('#badge-preview');

const saved = storedName();
if (input && saved) input.value = saved;

const face = badgeFace('first-repository', 'First Repository', tidyName(input?.value || '') || 'Your name');
preview?.append(face);

function paintName() {
  const typed = tidyName(input?.value || '');
  setBadgeName(face, typed || 'Your name', 'First Repository');
  if (hint) {
    hint.textContent = typed
      ? 'This name is printed on your badges.'
      : 'This name is printed on your badges. Use your real name, not xyz.';
  }
}

input?.addEventListener('input', paintName);
paintName();

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const typed = storeName(input?.value || '');
  if (!typed) {
    if (hint) hint.textContent = 'Enter your real name, for example Rohit Manna. Do not type xyz.';
    input?.focus();
    return;
  }
  window.location.href = startIssueUrl(1, typed);
});
