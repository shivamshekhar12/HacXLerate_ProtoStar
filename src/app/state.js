import { persistStudent } from '../services/student-service.js';
import { getSupabaseClient } from '../services/supabase/client.js';
import { authState } from './auth-state.js';
const goalKey = 'smart-campus:demo-goal:v2';
const workspaceKey = 'smart-campus:demo-workspace:v2';
export function readGoal() {
  try {
    const goal = JSON.parse(localStorage.getItem(goalKey));
    if (goal && typeof goal.text === 'string' && goal.text.trim() && goal.text.length <= 240 && ['planned', 'complete'].includes(goal.status)) return goal;
  } catch { /* Browser storage may be unavailable. */ }
  return null;
}
export const state = {
  student: null, goal: null, portfolio: null, history: [], subjectRecords: [], mode: null, revision: 0,
  storageAvailable: true, ui: { chartMetric: 'academic', skillSearch: '', skillFilter: 'all', scenario: null },
};
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); state.storageAvailable = true; return true; }
  catch { state.storageAvailable = false; return false; }
}
export async function saveGoal(goal) { state.goal = goal; return state.mode==='live' ? saveWorkspace() : persist(goalKey, goal); }
export async function saveWorkspace() {
  if(state.mode==='live'){await persistStudent(getSupabaseClient(),authState.account.user.id,state);return true;}
  return persist(workspaceKey, { student: state.student, portfolio: state.portfolio });
}
// Validate local records before rendering. Bad or obsolete data falls back to fixtures.
export function restoreWorkspace() {
  if(state.mode==='live')return;
  try {
    const saved = JSON.parse(localStorage.getItem(workspaceKey));
    if (!saved || !saved.student || !saved.portfolio) return;
    const { student: s, portfolio: p } = saved;
    if (typeof s.name !== 'string' || !s.name.trim() || s.name.length > 80 || typeof s.program !== 'string' || s.program.length > 120 || !Number.isInteger(s.year) || s.year < 1 || s.year > 10 || !Number.isInteger(s.semester) || s.semester < 1 || s.semester > 20) return;
    if (typeof s.targetRole!=='string'||s.targetRole.length>100) return;
    if (!Array.isArray(p.skills) || p.skills.length > 30 || !p.skills.every(x => typeof x.id === 'string' && typeof x.name === 'string' && x.name.length <= 60 && typeof x.evidence === 'string' && x.evidence.length <= 160 && ['Developing', 'Intermediate', 'Advanced'].includes(x.level))) return;
    if (!Array.isArray(p.projects) || p.projects.length > 20 || !p.projects.every(x => ['id','title','description','skills','url'].every(k => typeof x[k] === 'string') && x.title.length <= 100 && x.description.length <= 500 && x.skills.length <= 160 && x.url.length <= 500)) return;
    if (!p.consent || !['enabled','skills','projects','education'].every(k => typeof p.consent[k] === 'boolean')) return;
    // Never restore externally edited raw indicators or identity/authorization fields.
    Object.assign(state.student, { name: s.name, program: s.program, year: s.year, semester: s.semester, targetRole: s.targetRole,degree:typeof s.degree==='string'&&s.degree.length<=80?s.degree:'',batch:typeof s.batch==='string'&&s.batch.length<=40?s.batch:'' });
    Object.assign(state.portfolio, { skills: p.skills, projects: p.projects, consent: p.consent });
    for (const key of ['experience','achievements']) {
      if (Array.isArray(p[key]) && p[key].length <= 20 && p[key].every(x => x && typeof x.id === 'string' && typeof x.title === 'string' && x.title.length <= 100 && typeof x.description === 'string' && x.description.length <= 500)) state.portfolio[key] = p[key];
    }
  } catch { /* Fall back to the seed if browser storage is invalid. */ }
}
