import { BADGES, LEDGER, startHref } from './catalog';

export const LOGIN_KEY = 'rm-portal-login';

export type StageRecord = { startedAt?: string; passedAt?: string; credentialId?: string };

export function storedLogin() {
  try { return localStorage.getItem(LOGIN_KEY) || ''; } catch { return ''; }
}

export function storeLogin(login: string) {
  try { localStorage.setItem(LOGIN_KEY, login); } catch { /* storage can be blocked */ }
}

function cacheGet(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function cacheSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage can be blocked */ }
}

export async function learnerStages(login: string) {
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
  const ledger = await fetch(`${LEDGER}/learners/${id}.json`);
  if (ledger.status === 404) return {};
  if (!ledger.ok) throw new Error('The progress record could not be read.');
  const file = await ledger.json() as { stages?: Record<string, StageRecord> };
  return file.stages ?? {};
}

export function nextStage(stages: Record<string, StageRecord>) {
  return BADGES.find((badge) => !stages[String(badge.stage)]?.passedAt) ?? null;
}

export function paintStageTab(stages: Record<string, StageRecord>) {
  const next = nextStage(stages);
  const onStage1 = /stage-1\.html(?:$|[?#])/.test(location.pathname);
  document.querySelectorAll<HTMLAnchorElement>('.js-stage').forEach((tab) => {
    if (!next) {
      tab.textContent = 'Done';
      tab.href = './progress.html';
      tab.removeAttribute('aria-current');
      return;
    }
    tab.textContent = `Stage ${next.stage}`;
    tab.href = startHref(next.stage);
    if (next.stage === 1 && onStage1) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
}

export function paintStageTabFromStorage() {
  const login = storedLogin();
  if (!login) return;
  void learnerStages(login).then(paintStageTab).catch(() => {});
}
