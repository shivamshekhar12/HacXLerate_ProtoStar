import './demo-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { studentFromRow,persistStudent,loadStudent } from '../src/services/student-service.js';
import {renderOverview} from '../src/pages/student/overview.js';
import {renderGrowth} from '../src/pages/student/growth.js';
import {renderProfile} from '../src/pages/student/profile.js';
import {renderSimulator} from '../src/pages/student/simulator.js';
import {signUpAccount,signInAccount} from '../src/services/supabase/auth.js';
const row={profile_id:'new-student',display_name:'New Student',program:'',year:0,semester:0,target_role:'',portfolio:{skills:[],projects:[],experience:[],achievements:[],consent:{enabled:false,skills:false,projects:false,education:false}},goal:null,revision:0};
const fresh=()=>({...studentFromRow(structuredClone(row),{domains:[],history:[]}),mode:'live',ui:{chartMetric:'academic',scenario:null}});
test('fresh accounts have no invented measurements, achievements, history or demo identity',()=>{
 const s=fresh();assert.equal(s.portfolio.skills.length,0);assert.equal(s.portfolio.projects.length,0);assert.equal(s.goal,null);assert.deepEqual(s.history,[]);
 assert.equal(s.student.domains.find(d=>d.id==='academic').value,null);
 assert.equal(s.student.domains.find(d=>d.id==='skills').value,0);
 const html=[renderOverview(s),renderGrowth(s),renderProfile(s),renderSimulator(s)].join('');
 assert.ok(html.includes('No progress history yet'));assert.ok(html.includes('No baseline measurements yet'));
 for(const fixture of ['Aaman Sharma','Aarav Sharma','8.2 / 10','89%','48 / 100','Campus directory'])assert.ok(!html.includes(fixture),fixture);
});
test('student read queries always carry the verified user ID',async()=>{
 const ids=[];const c={from:t=>({select:()=>({eq:(key,id)=>{ids.push([t,key,id]);return {single:async()=>({data:t==='students'?row:{domains:[],history:[]}})};}})})};
 const s=await loadStudent(c,'new-student');assert.equal(s.student.id,'new-student');assert.deepEqual(ids.map(x=>x[2]),['new-student','new-student']);
});
test('save is scoped to the student and detects conflicting revisions',async()=>{
 let update,filters=[];let fail=false;
 const query={
   update(value){update=value;return query;},
   eq(key,value){filters.push([key,value]);return query;},
   select(){return query;},
   async single(){return fail?{error:{code:'PGRST116'}}:{data:{revision:1}};}
 };
 const c={from:()=>query};
 const s=fresh();await persistStudent(c,'new-student',s);assert.equal(s.revision,1);assert.deepEqual(filters,[['profile_id','new-student'],['revision',0]]);assert.ok(!('domains' in update));assert.ok(!('role' in update));
 fail=true;await assert.rejects(()=>persistStudent(c,'new-student',s),/Save failed/);
});
test('signup requests a role without granting one and handles email confirmation',async()=>{
 let args;globalThis.window={location:{origin:'http://127.0.0.1:5173',pathname:'/'}};
 const c={auth:{signUp:async v=>{args=v;return {data:{user:{id:'new'},session:null},error:null};}}};
 const r=await signUpAccount(c,{email:' new@example.test ',password:'test-password',name:' New Student ',role:'faculty'});
 assert.equal(r.confirmation,true);assert.equal(args.options.data.requested_role,'faculty');assert.ok(!args.options.data.app_metadata);assert.equal(args.options.data.display_name,'New Student');
 assert.equal((await signUpAccount(c,{email:'new@example.test',password:'short',name:'Name',role:'student'})).account,undefined);delete globalThis.window;
});
test('management login requires the database permission, not selected role',async()=>{
 const c={auth:{signInWithPassword:async()=>({error:null}),getUser:async()=>({data:{user:{id:'ordinary'}}}),signOut:async()=>({error:null})},rpc:async()=>({data:false,error:null})};
 assert.ok((await signInAccount(c,'test@example.test','password','management')).error);
 c.rpc=async()=>({data:true,error:null});assert.equal((await signInAccount(c,'test@example.test','password','management')).account.role,'management');
});
