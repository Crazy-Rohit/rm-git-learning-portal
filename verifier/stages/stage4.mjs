import { beginLab, codeFileCheck, labOf, listCommits, ownCommits, publicRepo } from '../lib/github.mjs';

function isRevert(commit) {
  const message = String(commit.commit?.message || '');
  return /^Revert "/m.test(message) && /This reverts commit [0-9a-f]{7,}/i.test(message);
}

export async function checkStage4({ gh, login, userId, startedAt, code, declaredRepo }) {
  const repo = labOf(login);
  const info = await publicRepo(gh, repo);
  const begun = beginLab({ login, userId, declaredRepo, info });
  const { checks, evidence } = begun;
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });
  if (begun.stop) return { checks, evidence };

  checks.push(await codeFileCheck(gh, repo, 4, code));

  const own = ownCommits(await listCommits(gh, repo, startedAt), userId, startedAt);
  add(
    'A revert commit undoes one of your commits',
    own.some(isRevert),
    'Commit something, push it, then run git revert on that commit and push the revert. Keep the message Git writes.',
  );

  let annotated = false;
  try {
    const ref = await gh.git.getRef({ ...repo, ref: 'tags/v1.0.0' });
    if (ref.data.object?.type === 'tag') {
      const tag = await gh.git.getTag({ ...repo, tag_sha: ref.data.object.sha });
      const when = new Date(tag.data.tagger?.date || 0);
      annotated = Boolean(String(tag.data.message || '').trim()) && when > new Date(startedAt);
    }
  } catch {
    annotated = false;
  }
  add(
    'An annotated tag v1.0.0 is on GitHub',
    annotated,
    'Create it with git tag -a v1.0.0 -m "First stable version of my lab" and run git push origin v1.0.0. A lightweight tag does not count.',
  );
  evidence.commits = own.slice(0, 20).map((commit) => commit.sha);
  return { checks, evidence };
}
