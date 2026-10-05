import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function emptyLearner(githubId, login) {
  return { githubId, login, stages: {}, attempts: {}, certificateId: null };
}

export function learnerPath(dir, githubId) {
  return path.join(dir, 'learners', `${githubId}.json`);
}

export function loadLearner(dir, githubId, login) {
  const file = learnerPath(dir, githubId);
  if (!existsSync(file)) return emptyLearner(githubId, login);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  data.login = login;
  data.githubId = githubId;
  data.stages ??= {};
  data.attempts ??= {};
  if (!Object.hasOwn(data, 'certificateId')) data.certificateId = null;
  return data;
}

export function saveLearner(dir, learner) {
  const file = learnerPath(dir, learner.githubId);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(learner, null, 2)}\n`);
}
