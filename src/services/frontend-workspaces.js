import { cohort, professionalCandidates, initialRecruiterRole } from '../data/demo-campus.js';
export const workspace = { notes:[], shortlist:[], requests:[], role:structuredClone(initialRecruiterRole), ui:{ cohort:'all', studentSearch:'', reviewOnly:false, talentSearch:'', talentSkill:'all', talentRole:'all', compare:[], requestFilter:'all', supportFilter:'all', subject:0 } };
const storageKey='smart-campus:role-demos:v1';
export function persistRoleWorkspace() {
  try { localStorage.setItem(storageKey,JSON.stringify({notes:workspace.notes,shortlist:workspace.shortlist,requests:workspace.requests,role:workspace.role})); return true; } catch { return false; }
}
export function restoreRoleWorkspace() {
  try {
    const x=JSON.parse(localStorage.getItem(storageKey)); if(!x) return;
    const str=(v,max)=>typeof v==='string'&&v.length<=max;
    if(Array.isArray(x.notes)&&x.notes.length<=100&&x.notes.every(n=>str(n.id,80)&&cohort.some(s=>s.id===n.studentId)&&str(n.category,80)&&str(n.note,1000)&&str(n.followUp,20)&&['Open','Complete'].includes(n.status))) workspace.notes=x.notes;
    if(Array.isArray(x.shortlist)&&x.shortlist.every(id=>str(id,80))) workspace.shortlist=x.shortlist;
    if(Array.isArray(x.requests)&&x.requests.length<=100&&x.requests.every(r=>str(r.id,80)&&str(r.candidateId,80)&&str(r.message,1000)&&str(r.role,100)&&['Draft','Withdrawn'].includes(r.status))) workspace.requests=x.requests;
    if(x.role&&Array.isArray(x.role.required)&&x.role.required.length>0&&str(x.role.title,100)&&x.role.title.trim()&&str(x.role.description,500)&&str(x.role.education,160)&&['required','preferred'].every(k=>Array.isArray(x.role[k])&&x.role[k].length<=20&&x.role[k].every(s=>str(s,60)))) workspace.role=x.role;
  } catch { /* Use clean fixtures if local data is malformed. */ }
}
export function facultyStudents(state) {
  return cohort.map(s=>s.id==='DEMO-001'?{...s,name:state.student.name,skills:state.portfolio.skills.map(x=>x.name)}:structuredClone(s));
}
export function filteredStudents(state) {
  return facultyStudents(state).filter(s=>(workspace.ui.cohort==='all'||s.cohort===workspace.ui.cohort)&&(!workspace.ui.reviewOnly||s.review.length)&&s.name.toLowerCase().includes(workspace.ui.studentSearch.toLowerCase()));
}
export function candidates(state) {
  const items=structuredClone(professionalCandidates);
  if(state.portfolio.consent.enabled) {
    const consent=state.portfolio.consent;
    items.unshift({id:'talent-aarav',name:state.student.name,targetRole:state.student.targetRole,program:consent.education?state.student.program:'Education not shared',skills:consent.skills?state.portfolio.skills.map(x=>x.name):[],projects:consent.projects?state.portfolio.projects.map(x=>({title:x.title,description:x.description})):[],achievements:[],summary:'Student-selected professional profile from the local demo workspace.'});
  }
  return items;
}
export function filteredCandidates(state) {
  return candidates(state).filter(c=>(workspace.ui.talentRole==='all'||c.targetRole===workspace.ui.talentRole)&&(workspace.ui.talentSkill==='all'||c.skills.includes(workspace.ui.talentSkill))&&`${c.name} ${c.skills.join(' ')} ${c.program}`.toLowerCase().includes(workspace.ui.talentSearch.toLowerCase()));
}
export function matchRequirements(candidate, role=workspace.role) {
  const lookup=new Set(candidate.skills.map(s=>s.toLowerCase()));
  return role.required.map(skill=>({skill,matched:lookup.has(skill.toLowerCase())}));
}
export function toggleShortlist(id) {
  if(workspace.shortlist.includes(id)) workspace.ui.compare=workspace.ui.compare.filter(x=>x!==id);
  workspace.shortlist=workspace.shortlist.includes(id)?workspace.shortlist.filter(x=>x!==id):[...workspace.shortlist,id];
}
