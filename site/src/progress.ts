type StageRecord = { startedAt?: string; passedAt?: string };
type LearnerFile = { stages?: Record<string, StageRecord> };

const STAGE_TITLES = [
  'First repository',
  'Branches and pull requests',
  'Merge conflicts',
  'Undo and history',
  'Fork and pull request',
  'Automation',
  'Capstone project',
];

const form = document.querySelector<HTMLFormElement>('#lookup');
const loginInput = document.querySelector<HTMLInputElement>('#login');
const status = document.querySelector<HTMLParagraphElement>('#status');
const list = document.querySelector<HTMLOListElement>('#stages');

function setStatus(message: string) {
  if (status) status.textContent = message;
}

function render(stages: Record<string, StageRecord>) {
  if (!list) return;
  list.replaceChildren();
  STAGE_TITLES.forEach((title, index) => {
    const number = index + 1;
    const record = stages[String(number)];
    const previousPassed = number === 1 || Boolean(stages[String(number - 1)]?.passedAt);
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `Stage ${number}. ${title}`;
    const state = document.createElement('span');
    if (record?.passedAt) {
      state.className = 'pass';
      state.textContent = `Passed ${record.passedAt.slice(0, 10)}`;
    } else if (previousPassed && number === 1) {
      state.className = 'open';
      const link = document.createElement('a');
      link.href = `${import.meta.env.BASE_URL}stage-1.html`;
      link.textContent = record?.startedAt ? 'Started' : 'Available';
      state.append(link);
    } else if (previousPassed) {
      state.className = 'lock';
      state.textContent = 'Not open yet';
    } else {
      state.className = 'lock';
      state.textContent = 'Locked';
    }
    item.append(name, state);
    list.append(item);
  });
}

function cacheGet(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function cacheSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage can be blocked */ }
}

async function lookup(login: string) {
  const key = `rm-portal-id:${login.toLowerCase()}`;
  let id = cacheGet(key);
  if (!id) {
    const user = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`);
    if (user.status === 404) throw new Error('No GitHub account uses that username.');
    if (!user.ok) throw new Error('GitHub did not return that account. Wait a minute and try again.');
    const body = await user.json() as { id: number };
    id = String(body.id);
    cacheSet(key, id);
  }
  const ledger = await fetch(`https://raw.githubusercontent.com/Crazy-Rohit/rm-git-learning-portal/ledger/learners/${id}.json`);
  if (ledger.status === 404) return {};
  if (!ledger.ok) throw new Error('The progress record could not be read.');
  const file = await ledger.json() as LearnerFile;
  return file.stages ?? {};
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const login = loginInput?.value.trim().replace(/^@/, '') ?? '';
  if (!login) return;
  setStatus('Looking up the public record…');
  lookup(login).then((stages) => {
    setStatus(`Progress for ${login}.`);
    render(stages);
  }).catch((error: unknown) => {
    setStatus(error instanceof Error ? error.message : 'The lookup failed.');
    list?.replaceChildren();
  });
});
