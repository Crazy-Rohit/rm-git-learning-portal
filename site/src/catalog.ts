export const SITE = 'https://crazy-rohit.github.io/rm-git-learning-portal/';
export const LEDGER = 'https://raw.githubusercontent.com/Crazy-Rohit/rm-git-learning-portal/ledger';
export const ISSUER = 'Rohit Manna';

export const BADGES = [
  { stage: 1, slug: 'first-repository', title: 'First Repository' },
  { stage: 2, slug: 'branches-and-prs', title: 'Branches and PRs' },
  { stage: 3, slug: 'merge-conflicts', title: 'Merge Conflicts' },
  { stage: 4, slug: 'undo-and-tags', title: 'Undo and Tags' },
  { stage: 5, slug: 'fork-and-pr', title: 'Fork and PR' },
  { stage: 6, slug: 'github-actions', title: 'GitHub Actions' },
  { stage: 7, slug: 'capstone-practitioner', title: 'Capstone Practitioner' },
] as const;

export const CERTIFICATE_COURSE = 'Git and GitHub Practitioner';

export function badgeFor(stage: number) {
  return BADGES.find((item) => item.stage === stage) ?? null;
}

export function startIssueUrl(stage: number, name = '') {
  const params = new URLSearchParams({ template: 'start-stage.yml', stage: String(stage) });
  const typed = name.replace(/\s+/g, ' ').trim();
  if (typed) params.set('name', typed);
  return `https://github.com/Crazy-Rohit/rm-git-learning-portal/issues/new?${params}`;
}

export function startHref(stage: number, name = '') {
  if (stage === 1) return './stage-1.html';
  return startIssueUrl(stage, name);
}

export function sharePageUrl(id: string) {
  return `${SITE}share/${id}.html`;
}

export function profileSnippet(stage: number, id: string) {
  const badge = badgeFor(stage);
  if (!badge) return '';
  const image = `${SITE}badges/${badge.slug}.png`;
  const verify = `${SITE}verify.html?id=${encodeURIComponent(id)}`;
  return `[![${badge.title}](${image})](${verify})`;
}
