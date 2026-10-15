import assert from 'node:assert/strict';
import test from 'node:test';
import { aboutProblem, contactProblem, educationProblem, experienceProblem, filledText, parseData, profileProblem, projectsProblem, skillsProblem } from '../lib/portfolio.mjs';

test('filledText rejects placeholders and short values', () => {
  assert.equal(filledText('YOUR NAME'), false);
  assert.equal(filledText('YOUR-USERNAME'), false);
  assert.equal(filledText('Student'), true);
});

test('profileProblem accepts a filled identity for the signed-in account', () => {
  const ready = {
    name: 'Rohit Learner',
    headline: 'Student',
    githubUsername: 'learner',
  };
  assert.equal(profileProblem(ready, 'learner'), '');
  assert.match(profileProblem({ ...ready, name: 'YOUR NAME' }, 'learner'), /real name/);
  assert.match(profileProblem({ ...ready, githubUsername: 'someone' }, 'learner'), /learner/);
  assert.match(profileProblem(parseData('{'), 'learner'), /JSON object/);
  assert.equal(profileProblem(parseData(`\uFEFF${JSON.stringify(ready)}`), 'learner'), '');
});

test('later portfolio sections reject placeholders', () => {
  assert.equal(educationProblem([{ institution: 'State University', qualification: 'B.Tech', description: 'I studied computer science.' }]), '');
  assert.match(educationProblem([{ institution: 'YOUR INSTITUTION', qualification: 'B.Tech', description: 'I studied computer science.' }]), /YOUR/);
  assert.match(skillsProblem({ technical: ['Gittt'], tools: [], professional: [] }), /Gittt/);
  assert.equal(skillsProblem({ technical: ['Git'], tools: [], professional: [] }), '');
  assert.equal(experienceProblem([{ role: 'Student developer', description: 'I build small sites while learning.' }]), '');
  assert.equal(projectsProblem([{ name: 'git-lab', description: 'My portfolio for this course.' }]), '');
  assert.equal(contactProblem({ github: 'https://github.com/learner' }), '');
});

test('aboutProblem requires a summary and a goal or interest', () => {
  assert.equal(aboutProblem({
    summary: 'I am a student learning Git so I can share projects with a team.',
    careerGoal: '',
    interests: ['Teaching'],
  }), '');
  assert.match(aboutProblem({ summary: 'YOUR SUMMARY', careerGoal: '', interests: [] }), /YOUR SUMMARY/);
});
