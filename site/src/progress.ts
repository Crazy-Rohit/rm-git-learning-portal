import { BADGES, startHref } from './catalog';
import { learnerStages, paintStageTab, storeLogin, storeName, storedLogin, storedName } from './path';

type StageRecord = { startedAt?: string; passedAt?: string; credentialId?: string };

const form = document.querySelector<HTMLFormElement>('#lookup');
const nameInput = document.querySelector<HTMLInputElement>('#learner-name');
const loginInput = document.querySelector<HTMLInputElement>('#login');
const status = document.querySelector<HTMLParagraphElement>('#status');
const list = document.querySelector<HTMLOListElement>('#stages');

if (nameInput && storedName()) nameInput.value = storedName();
nameInput?.addEventListener('input', () => storeName(nameInput.value));

function setStatus(message: string) {
  if (status) status.textContent = message;
}

function render(stages: Record<string, StageRecord>) {
  if (!list) return;
  list.replaceChildren();
  BADGES.forEach((badge) => {
    const number = badge.stage;
    const record = stages[String(number)];
    const previousPassed = number === 1 || Boolean(stages[String(number - 1)]?.passedAt);
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'stage-name';
    name.textContent = `Stage ${number}. ${badge.title}`;
    const state = document.createElement('span');
    if (record?.passedAt) {
      state.className = 'pass';
      if (record.credentialId) {
        const image = document.createElement('img');
        image.src = `${import.meta.env.BASE_URL}badges/${badge.slug}.png`;
        image.alt = '';
        name.prepend(image);
        const link = document.createElement('a');
        link.href = `${import.meta.env.BASE_URL}verify.html?id=${encodeURIComponent(record.credentialId)}`;
        link.textContent = `Passed ${record.passedAt.slice(0, 10)}`;
        state.append(link);
      } else {
        state.textContent = `Passed ${record.passedAt.slice(0, 10)}`;
      }
    } else if (previousPassed) {
      state.className = 'open';
      const link = document.createElement('a');
      link.href = startHref(number, storedName());
      link.textContent = record?.startedAt ? 'In progress' : 'Open now';
      state.append(link);
    } else {
      state.className = 'lock';
      state.textContent = 'Locked';
    }
    item.append(name, state);
    list.append(item);
  });
}

function show(login: string) {
  const name = login.trim().replace(/^@/, '');
  if (!name) return;
  if (nameInput) storeName(nameInput.value);
  storeLogin(name);
  setStatus('Looking up the public record…');
  learnerStages(name).then((stages) => {
    setStatus(`Progress for ${name}.`);
    render(stages);
    paintStageTab(stages);
  }).catch((error: unknown) => {
    setStatus(error instanceof Error ? error.message : 'The lookup failed.');
    list?.replaceChildren();
  });
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  show(loginInput?.value || '');
});

const remembered = storedLogin();
if (loginInput && remembered) {
  loginInput.value = remembered;
  show(remembered);
}
