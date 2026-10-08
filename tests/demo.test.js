import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../supabase/seeds/demo-workspace.json' with {type:'json'};
import {loadDemo} from '../src/services/student-service.js';
import catalogSeed from '../supabase/seeds/campus-catalog.json' with {type:'json'};
const client={from:(table)=>({select:()=>({eq:()=>({single:async()=>({data:{payload:table==='campus_catalog'?catalogSeed:seed},error:null})})})})};
import { escapeHtml } from '../src/components/ui.js';
import { readGoal, saveGoal, state } from '../src/app/state.js';

test('demo service isolates fixture data and preserves missing feedback', async () => {
  const first = (await loadDemo(client)).student;
  first.domains[0].value = 0;
  const second = (await loadDemo(client)).student;
  assert.equal(second.domains[0].value, 8.2);
  assert.equal(second.domains.find(d => d.id === 'feedback').value, null);
});
test('user goal content is escaped before interpolation into HTML', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('goal storage rejects malformed data and handles unavailable storage', async () => {
  globalThis.localStorage = { getItem: () => '{invalid' };
  assert.equal(readGoal(), null);
  globalThis.localStorage = { getItem: () => JSON.stringify({ text: 'Test', status: 'invalid' }) };
  assert.equal(readGoal(), null);
  globalThis.localStorage = { setItem: () => { throw new Error('blocked'); } };
  assert.equal(await saveGoal({ text: 'Practice SQL', status: 'planned' }), false);
  assert.equal(state.goal.text, 'Practice SQL');
  delete globalThis.localStorage;
});
