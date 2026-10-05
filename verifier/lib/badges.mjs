export const BADGES = [
  { stage: 1, slug: 'first-repository', title: 'First Repository' },
  { stage: 2, slug: 'branches-and-prs', title: 'Branches and PRs' },
  { stage: 3, slug: 'merge-conflicts', title: 'Merge Conflicts' },
  { stage: 4, slug: 'undo-and-tags', title: 'Undo and Tags' },
  { stage: 5, slug: 'fork-and-pr', title: 'Fork and PR' },
  { stage: 6, slug: 'github-actions', title: 'GitHub Actions' },
  { stage: 7, slug: 'capstone-practitioner', title: 'Capstone Practitioner' },
];

export const CERTIFICATE_COURSE = 'Git and GitHub Practitioner';

export function badgeFor(stage) {
  return BADGES.find((item) => item.stage === Number(stage)) || null;
}
