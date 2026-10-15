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

function listProblem(data, file) {
  if (!Array.isArray(data)) {
    return `${file} must be a JSON list. Open it in Codespaces and keep the square brackets.`;
  }
  if (JSON.stringify(data).includes('<<<<<<<')) {
    return `Delete every <<<<<<<, =======, and >>>>>>> line from ${file}, then keep one valid list.`;
  }
  return '';
}

export function educationProblem(data) {
  const broken = listProblem(data, 'data/education.json');
  if (broken) return broken;
  const ready = data.some((item) => (
    filledText(item?.institution, 2)
    && filledText(item?.qualification, 2)
    && filledText(item?.description, 8)
  ));
  if (!ready) {
    return 'In data/education.json, add one school, college, or course. Fill institution, qualification, and description. Replace every YOUR value.';
  }
  return '';
}

export function skillsProblem(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'data/skills.json must be a JSON object. Open it in Codespaces and keep the quotes and commas.';
  }
  if (JSON.stringify(data).includes('Gittt')) {
    return 'data/skills.json still contains Gittt. Revert that commit and push. Do not leave the mistake in the file.';
  }
  const technical = Array.isArray(data.technical) && data.technical.some((item) => filledText(item, 2));
  if (!technical) {
    return 'In data/skills.json, replace YOUR SKILL with at least one real technical skill.';
  }
  return '';
}

export function experienceProblem(data) {
  const broken = listProblem(data, 'data/experience.json');
  if (broken) return broken;
  const ready = data.some((item) => filledText(item?.role, 2) && filledText(item?.description, 8));
  if (!ready) {
    return 'In data/experience.json, add one role. A job, internship, college activity, or fresher profile is fine. Replace YOUR ROLE and write what you did.';
  }
  return '';
}

export function projectsProblem(data) {
  const broken = listProblem(data, 'data/projects.json');
  if (broken) return broken;
  const ready = data.some((item) => filledText(item?.name, 2) && filledText(item?.description, 8));
  if (!ready) {
    return 'In data/projects.json, add one project with a name and a description. Replace YOUR PROJECT.';
  }
  return '';
}

export function contactProblem(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'data/contact.json must be a JSON object. Open it in Codespaces and keep the quotes and commas.';
  }
  const ready = ['email', 'github', 'linkedin', 'portfolio', 'resume'].some((key) => filledText(data[key], 3));
  if (!ready) {
    return 'In data/contact.json, add one way to reach you, such as a GitHub URL, email, or LinkedIn URL.';
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
