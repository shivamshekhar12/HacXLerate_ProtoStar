import './demo-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { demoStudent, demoPortfolio } from '../src/data/demo-student.js';
import { compareScenario } from '../src/app/scenario.js';
import { state, restoreWorkspace } from '../src/app/state.js';
import { safeProjectUrl } from '../src/pages/student/profile.js';

test('scenario comparison keeps real measurements immutable and uses original units', () => {
  const before = structuredClone(demoStudent);
  const result = compareScenario(demoStudent, { attendance: 90, placement: 60, lms: 6 });
  assert.deepEqual(demoStudent, before);
  assert.equal(result.find(r => r.id === 'attendance').delta, 1);
  assert.equal(result.find(r => r.id === 'placement').scenario, 60);
  assert.equal(result.find(r => r.id === 'lms').delta, 2);
});
test('scenario boundaries reject invalid values and accept limits', () => {
  for (const value of [-1, 101, NaN, 50.5, '90']) {
    assert.throws(() => compareScenario(demoStudent, { attendance: value, placement: 48, lms: 4 }), RangeError);
  }
  assert.doesNotThrow(() => compareScenario(demoStudent, { attendance: 0, placement: 100, lms: 6 }));
});
test('project URLs reject executable or invalid protocols', () => {
  assert.equal(safeProjectUrl('javascript:alert(1)'), null);
  assert.equal(safeProjectUrl('data:text/html,hello'), null);
  assert.equal(safeProjectUrl('not-a-link'), null);
  assert.equal(safeProjectUrl('https://example.com/project'), 'https://example.com/project');
});
test('workspace restore preserves fixture baselines while restoring demo edits', () => {
  state.student = structuredClone(demoStudent);
  state.portfolio = structuredClone(demoPortfolio);
  const saved = { student: { ...structuredClone(demoStudent), name: 'Demo Reviewer', targetRole: 'Data Analyst' }, portfolio: structuredClone(demoPortfolio) };
  saved.student.domains[0].value = 0;
  globalThis.localStorage = { getItem: () => JSON.stringify(saved) };
  restoreWorkspace();
  assert.equal(state.student.name, 'Demo Reviewer');
  assert.equal(state.student.targetRole, 'Data Analyst');
  assert.equal(state.student.domains[0].value, 8.2);
  saved.portfolio.consent.enabled = 'yes';
  saved.student.name = 'Should not restore';
  restoreWorkspace();
  assert.equal(state.student.name, 'Demo Reviewer');
  delete globalThis.localStorage;
});
