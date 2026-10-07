import { setStudentDemo } from '../data/demo-student.js';
import { setCampusDemo } from '../data/demo-campus.js';
import { workspace, restoreRoleWorkspace } from './frontend-workspaces.js';
const categories=[['academic','Academic','school',10,'CGPA'],['attendance','Attendance','calendar_month',100,'%'],['lms','LMS activity','menu_book',null,'modules'],['engagement','Engagement','groups',null,'activities'],['placement','Placement','work',100,'/ 100'],['skills','Skills','code',null,'evidenced skills'],['feedback','Feedback','forum',null,'']];
export function emptyDomains() {
  return categories.map(([id,name,icon,max,unit])=>({id,name,icon,max,unit,value:null,state:'Missing',source:'No records supplied',detail:'No data yet',evidence:'No measurement has been recorded. Missing data is not treated as a zero score.'}));
}
export function studentFromRow(row,measurements) {
  const domains=emptyDomains().map(d=>measurements.domains.find(x=>x.id===d.id)??d);
  const evidenced=row.portfolio.skills.filter(x=>x.evidence?.trim()).length;
  domains.find(d=>d.id==='skills').value=evidenced;
  Object.assign(domains.find(d=>d.id==='skills'),{state:'Available',detail:'Skills linked to evidence',source:'Your portfolio',evidence:`${evidenced} skills have self-reported evidence.`});
  return {student:{name:row.display_name,id:row.profile_id,program:row.program,year:row.year,semester:row.semester,targetRole:row.target_role,advisor:'Not assigned',domains},portfolio:row.portfolio,goal:row.goal,history:measurements.history,revision:row.revision};
}
export async function loadStudent(client,id) {
  const [profile,metrics]=await Promise.all([client.from('students').select('*').eq('profile_id',id).single(),client.from('student_measurements').select('domains,history').eq('profile_id',id).single()]);
  if(profile.error||metrics.error) throw new Error('Your workspace could not be loaded. Please retry.');
  return studentFromRow(profile.data,metrics.data);
}
export async function loadDemo(client) {
  if(!client)throw new Error('The database preview is not configured.');
  const {data,error}=await client.from('demo_workspaces').select('payload').eq('slug','aaman').single();
  if(error)throw new Error('The demo could not be loaded from Supabase. Please retry.');
  const p=data.payload;
  setStudentDemo(p);setCampusDemo(p);
  Object.assign(workspace,{notes:[],shortlist:[],requests:[],role:structuredClone(p.initialRecruiterRole)});restoreRoleWorkspace();
  return {student:structuredClone(p.demoStudent),portfolio:structuredClone(p.demoPortfolio),goal:null,history:structuredClone(p.demoHistory),revision:0};
}
export async function persistStudent(client,id,state) {
  const s=state.student;
  const {data,error}=await client.from('students').update({display_name:s.name,program:s.program,year:s.year,semester:s.semester,target_role:s.targetRole,portfolio:state.portfolio,goal:state.goal,revision:state.revision}).eq('profile_id',id).eq('revision',state.revision).select('revision').single();
  if(error||!data)throw new Error('Save failed or another tab changed your account. Reload before trying again.');
  state.revision=data.revision;
}
