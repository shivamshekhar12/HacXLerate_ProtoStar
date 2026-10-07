import './demo-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { demoStudent,demoPortfolio } from '../src/data/demo-student.js';
import { candidates,matchRequirements,workspace,toggleShortlist,filteredStudents } from '../src/services/frontend-workspaces.js';
const sample=()=>({student:structuredClone(demoStudent),portfolio:structuredClone(demoPortfolio)});
test('student consent controls candidate visibility and individual professional fields',()=>{
  const s=sample();assert.equal(candidates(s).some(c=>c.id==='talent-aarav'),false);
  s.portfolio.consent={enabled:true,education:false,skills:false,projects:false};
  const c=candidates(s).find(c=>c.id==='talent-aarav');
  assert.equal(c.program,'Education not shared');assert.deepEqual(c.skills,[]);assert.deepEqual(c.projects,[]);
});
test('recruiter model does not include faculty notes or internal measurements',()=>{
  const s=sample();s.portfolio.consent.enabled=true;
  const allowed=['id','name','program','targetRole','skills','projects','achievements','summary'];
  candidates(s).forEach(c=>assert.ok(Object.keys(c).every(key=>allowed.includes(key))));
  assert.ok(!JSON.stringify(candidates(s)).includes('attendance'));
});
test('role comparison is case-insensitive and missing skills are explicit',()=>{
  assert.deepEqual(matchRequirements({skills:['SQL']},{required:['sql','Python']}),[{skill:'sql',matched:true},{skill:'Python',matched:false}]);
});
test('removing a shortlisted candidate clears its comparison selection',()=>{
  workspace.shortlist=['talent-priya'];workspace.ui.compare=['talent-priya'];toggleShortlist('talent-priya');
  assert.deepEqual(workspace.shortlist,[]);assert.deepEqual(workspace.ui.compare,[]);
});
test('faculty search and cohort filters compose with review-only selection',()=>{
  workspace.ui.studentSearch='Vikram';workspace.ui.cohort='CSE · Year 3';workspace.ui.reviewOnly=true;
  assert.deepEqual(filteredStudents(sample()).map(s=>s.id),['DEMO-003']);
  workspace.ui.cohort='AI · Year 3';assert.deepEqual(filteredStudents(sample()),[]);
});
