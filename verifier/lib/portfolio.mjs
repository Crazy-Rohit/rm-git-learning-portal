import { displayName } from './form.mjs';

export function parseData(text) {
  try {
    return JSON.parse(String(text).replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

export function filledText(value, min = 2) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length < min) return false;
  if (/^YOUR(?:[\s-]|$)/i.test(text)) return false;
  return true;
}

export function profileProblem(data, login) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'data/profile.json must be a JSON object. Open it in Codespaces and keep the quotes and commas.';
  }
  if (!displayName(data.name, login)) {
    return 'In data/profile.json, set name to your real name. Replace YOUR NAME. Do not type your GitHub username.';
  }
  if (!filledText(data.headline, 3)) {
    return 'In data/profile.json, set headline to what you are, such as Student, Developer, or Working professional. Replace YOUR HEADLINE.';
  }
  const username = String(data.githubUsername || '').replace(/^@/, '').trim();
  if (username.toLowerCase() !== String(login || '').toLowerCase()) {
    return `In data/profile.json, set githubUsername to ${login}. Replace YOUR-USERNAME.`;
  }
  return '';
}

export function aboutProblem(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'data/about.json must be a JSON object. Open it in Codespaces and keep the quotes and commas.';
  }
  if (!filledText(data.summary, 40)) {
    return 'In data/about.json, replace YOUR SUMMARY with at least a couple of sentences about you.';
  }
  const goal = filledText(data.careerGoal, 8);
  const interests = Array.isArray(data.interests) && data.interests.some((item) => filledText(item, 2));
  if (!goal && !interests) {
    return 'In data/about.json, set careerGoal or add one interest. Replace the placeholders.';
  }
  return '';
}
