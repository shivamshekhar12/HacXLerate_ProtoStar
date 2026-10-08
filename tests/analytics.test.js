import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../supabase/seeds/demo-workspace.json' with {type:'json'};
import {analyzeStudent,summarizeCohort,defaultNarrative} from '../src/services/analytics.js';
import {describeProgress} from '../src/services/narrative-service.js';
const config=seed.analyticsConfig;
test('score arithmetic and combined review reasons are deterministic',()=>{
 const a=analyzeStudent({cgpa:8,attendance:80,lmsMarks:80,coding:40},config);
 assert.equal(a.score,70);assert.equal(a.reviewIndex,25);assert.equal(a.reasons[0].key,'coding');assert.equal(a.segment,'Strong academics · career practice needed');
 assert.equal(a.factors.reduce((s,f)=>s+f.contribution,0),70);
});
test('missing data, invalid measurements and unapproved rules never manufacture a score',()=>{
 const a=analyzeStudent({cgpa:null,attendance:0,lmsMarks:NaN,coding:101},config);assert.equal(a.score,null);assert.equal(a.available,1);assert.equal(a.reviewIndex,100);assert.match(defaultNarrative(a),/missing/);
 assert.equal(analyzeStudent({cgpa:10,attendance:100,lmsMarks:100,coding:100},{...config,approved:false}).score,null);
 assert.equal(analyzeStudent({cgpa:10,attendance:100,lmsMarks:100,coding:100},{...config,weights:{cgpa:80}}).score,null);
});
test('threshold equality is not flagged; scores are bounded; cohort counts do not double count',()=>{
 const a=analyzeStudent(config.thresholds,config);assert.equal(a.reasons.length,0);
 const s=summarizeCohort(seed.cohort,config);assert.equal(s.count,500);assert.equal(s.scored,500);assert.ok(s.review<=s.academic+s.placement);assert.equal(Object.values(s.segments).reduce((a,b)=>a+b,0),500);
 for(const r of seed.cohort){const a=analyzeStudent(r,config);assert.ok(a.score>=0&&a.score<=100);}
});
test('synthetic data has unique IDs and does not leak analytics into professional profiles',()=>{
 assert.equal(new Set(seed.cohort.map(s=>s.id)).size,500);assert.ok(seed.cohort.every(s=>s.synthetic));
 for(const c of seed.professionalCandidates)for(const key of ['cgpa','attendance','coding','lmsMarks','review','feedback'])assert.equal(key in c,false);
});
test('provider errors preserve deterministic English and demo avoids API calls',async()=>{
 const state={mode:'live',student:seed.demoStudent,analyticsRecord:seed.cohort[0],analyticsConfig:config};
 assert.equal((await describeProgress({functions:{invoke:async()=>({error:{}})}},state)).source,'fallback');
 assert.equal((await describeProgress(null,{...state,mode:'demo',demoNarrative:'Cached interpretation'})).text,'Cached interpretation');
});
