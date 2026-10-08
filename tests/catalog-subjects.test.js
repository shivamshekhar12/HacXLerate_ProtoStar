import './demo-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,validateEducation} from '../src/services/catalog-service.js';
import {filteredSubjectRecords,subjectSummary,renderStudentSubjects} from '../src/pages/student/subjects.js';
import {filterCandidateRecords,candidates,workspace,resetTalentFilters} from '../src/services/frontend-workspaces.js';
import {demoStudent,demoPortfolio} from '../src/data/demo-student.js';
import {renderSubjects} from '../src/pages/faculty/workspace.js';
import {subjects} from '../src/data/demo-campus.js';
const state=()=>({student:structuredClone(demoStudent),portfolio:structuredClone(demoPortfolio),ui:{},mode:'demo'});
test('catalog covers several disciplines and custom education remains valid',()=>{
 assert.equal(catalog.roles.length,40);
 assert.ok(catalog.degrees.includes('MBBS'));
 assert.equal(validateEducation({name:'New Student',degree:'Custom degree',program:'Custom course',batch:'2026-A',year:8,semester:16}),null);
 assert.ok(validateEducation({name:'N',degree:'BSc',program:'Maths',batch:'A',year:11,semester:22}));
});
test('subject averages exclude missing marks and retain original marking scales',()=>{
 const rows=[{name:'Maths',semester:1,marks:40,max:50},{name:'Physics',semester:2,marks:90,max:100},{name:'Chemistry',semester:2,marks:null,max:100}];
 assert.equal(subjectSummary(rows).mean,85);
 assert.equal(subjectSummary(rows).measured,2);
 assert.equal(subjectSummary([]).mean,null);
 assert.deepEqual(filteredSubjectRecords(rows,{subjectSemester:'2',subjectSearch:'PHYS'}),[rows[1]]);
 const html=renderStudentSubjects({...state(),subjectRecords:[]});
 assert.match(html,/No subject records yet/);assert.doesNotMatch(html,/NaN|undefined/);
});
test('recruiter education filters compose and cannot infer withheld education',()=>{
 const s=state();s.portfolio.consent={enabled:true,education:false,skills:true,projects:true};
 const self=candidates(s).find(c=>c.id==='talent-aarav');
 assert.equal(self.degree,undefined);assert.equal(self.batch,undefined);
 assert.deepEqual(filterCandidateRecords([self],{talentYear:'3'}),[]);
 const items=[{name:'A',skills:['SQL'],projects:[],degree:'BSc',year:3,semester:5,batch:'X',program:'Maths',targetRole:'Analyst'},{name:'B',skills:['SQL'],projects:[{}],degree:'BSc',year:3,semester:5,batch:'X',program:'Maths',targetRole:'Analyst'}];
 assert.deepEqual(filterCandidateRecords(items,{talentDegree:'BSc',talentYear:'3',talentBatch:'X',talentSkill:'sql',talentEvidence:'projects'}).map(c=>c.name),['B']);
 assert.deepEqual(filterCandidateRecords(items,{talentSort:'projects'}).map(c=>c.name),['B','A']);
 Object.assign(workspace.ui,{talentYear:'4',talentBatch:'X',talentSearch:'hidden'});resetTalentFilters();
 assert.equal(workspace.ui.talentBatch,'all');assert.equal(workspace.ui.talentSearch,'');
});
test('faculty subject selections without measurements show no data',()=>{
 workspace.ui.cohort='all';workspace.ui.subject=[...new Set([...subjects,...catalog.subjects])].indexOf('Architectural Design');
 const html=renderSubjects(state());assert.match(html,/No recorded marks for this selection/);assert.doesNotMatch(html,/NaN|undefined/);
 workspace.ui.subject=0;
});
