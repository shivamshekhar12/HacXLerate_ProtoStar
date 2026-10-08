import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@material-symbols/font-400/outlined.css';
import './styles/app.css';
import './styles/student.css';
import './styles/workspaces.css';
import './styles/login.css';
import { renderLogin } from './pages/auth/login.js';
import { bindLogin } from './app/login-actions.js';
import { authState, demoEnabled, setDemo, routeRole } from './app/auth-state.js';
import { verifyCurrentAccount, roleHome } from './services/supabase/auth.js';
import { bindWorkspaceActions } from './app/workspace-actions.js';
import { renderFacultyOverview, renderStudents, renderStudentDetail, renderInsights, renderSubjects, renderSupport } from './pages/faculty/workspace.js';
import { renderRecruiterOverview, renderTalent, renderCandidate, renderRoles, renderShortlist, renderRequests } from './pages/recruiter/workspace.js';
import { getSupabaseClient } from './services/supabase/client.js';
import { renderShell, updateRoleNavigation } from './components/shell.js';
import { state, restoreWorkspace, readGoal } from './app/state.js';
import { loadDemo,loadStudent } from './services/student-service.js';
import {loadCatalog} from './services/catalog-service.js';
import {renderStudentSubjects} from './pages/student/subjects.js';
import { renderManagement,bindManagement } from './pages/auth/management.js';
import { escapeHtml } from './components/ui.js';
import {bindAnalyticsActions} from './app/analytics-actions.js';
import { bindActions } from './app/actions.js';
import { renderOverview } from './pages/student/overview.js';
import { renderGrowth } from './pages/student/growth.js';
import { renderSkills } from './pages/student/skills.js';
import { renderSimulator } from './pages/student/simulator.js';
import { renderProfile } from './pages/student/profile.js';

const pages = {
  overview: { render: renderOverview, title: 'Student Overview' },
  subjects: {render:renderStudentSubjects,title:'Subject Analysis'},
  growth: { render: renderGrowth, title: 'My Growth' },
  skills: { render: renderSkills, title: 'Skills & Target Role' },
  simulator: { render: renderSimulator, title: 'What-If Simulator' },
  profile: { render: renderProfile, title: 'Profile & Consent' },
  faculty: {render:renderFacultyOverview,title:'Faculty Overview'},
  'faculty/students': {render:renderStudents,title:'Students & Support Queue'},
  'faculty/insights': {render:renderInsights,title:'Cohort Insights'},
  'faculty/subjects': {render:renderSubjects,title:'Subject Analytics'},
  'faculty/support': {render:renderSupport,title:'Support & Intervention Log'},
  recruiter: {render:renderRecruiterOverview,title:'Talent Overview'},
  'recruiter/talent': {render:renderTalent,title:'Candidate Discovery'},
  'recruiter/roles': {render:renderRoles,title:'Role Requirements'},
  'recruiter/shortlist': {render:renderShortlist,title:'Shortlists'},
  'recruiter/requests': {render:renderRequests,title:'Introduction Requests'},
};
let client;
let disposeShell;
let loadedWorkspace=null,loadVersion=0,renderVersion=0;
async function exitAccount(){
  if(client&&authState.account){const {error}=await client.auth.signOut({scope:'local'});if(error)throw new Error('Could not sign out. Please retry.');}
  authState.account=null;setDemo(false);loadedWorkspace=null;state.student=null;state.portfolio=null;state.goal=null;state.history=[];location.hash='#/login';
}
function standalone(markup){if(disposeShell){disposeShell();disposeShell=null;}document.querySelector('#app').innerHTML=markup;}
async function hydrateWorkspace(){
 const id=authState.account?.user.id??'demo';
 if(loadedWorkspace===id)return;
 const version=++loadVersion;
 const live=Boolean(authState.account);
 const data=live?await loadStudent(client,id):await loadDemo(client);
 if(version!==loadVersion||id!==(authState.account?.user.id??'demo')||(!live&&!demoEnabled()))return;
 Object.assign(state,data,{mode:live?'live':'demo',ui:{chartMetric:'academic',skillSearch:'',skillFilter:'all',scenario:null}});
 if(!live){restoreWorkspace();state.goal=readGoal();}
 else await loadCatalog(client);
 loadedWorkspace=id;
}
function mountShell() {
  if (disposeShell) return;
  disposeShell = renderShell();
  bindActions(render); bindWorkspaceActions(render); bindAnalyticsActions();
  document.querySelector('#workspace-role').addEventListener('change', event => {
    if (!authState.account) location.hash = '#/' + {student:'overview',faculty:'faculty',recruiter:'recruiter'}[event.target.value];
  });
  document.querySelector('#auth-exit').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    if (authState.account) {
      try {
        const { error } = await client.auth.signOut({scope:'local'});
        if (error) throw error;
      } catch {
        button.disabled = false; button.textContent = 'Try sign out again'; return;
      }
    }
    authState.account = null; setDemo(false); loadedWorkspace=null; state.student=null;state.portfolio=null;state.goal=null;state.history=[];location.hash = '#/login';
  });
}
async function render() {
  if (authState.checking) return;
  const rendering=++renderVersion;
  const name = location.hash.slice(2) || 'login';
  if (['login','signup','management/login'].includes(name)) {
    if(authState.account&&name==='management/login'){location.hash='#/management';return;}
    if (authState.account) { location.hash = '#/' + (roleHome(authState.account.role)??'pending'); return; }
    if (disposeShell) { disposeShell(); disposeShell = null; }
    document.querySelector('#app').innerHTML = renderLogin({configured:Boolean(client),signup:name==='signup',management:name==='management/login'});
    document.title = `${name==='signup'?'Create Account':'Sign In'} · Porto-Star`;
    bindLogin(client, account => {authState.account = account;loadedWorkspace=null;});
    return;
  }
  if (!authState.account && !demoEnabled()) { location.hash = name==='management'?'#/management/login':'#/login'; return; }
  if(authState.account&&!authState.account.role){
    standalone('<main id="main" class="login-loading"><section class="panel"><h1>Access request received</h1><p>Your account is registered. Your requested workspace needs approval before you can access protected records.</p><button class="button" id="pending-exit">Return to sign in</button></section></main>');
    document.querySelector('#pending-exit').addEventListener('click',()=>exitAccount().catch(()=>alert('Could not sign out. Please retry.')));return;
  }
  if(name==='management'||authState.account?.role==='management'){
    if(!authState.account){location.hash='#/management/login';return;}
    const permission=await client.rpc('can_manage_accounts');
    if(rendering!==renderVersion)return;
    if(permission.error||!permission.data){location.hash='#/'+roleHome(authState.account.role);return;}
    standalone(renderManagement());document.title='Account management · Porto-Star';
    await bindManagement(client,()=>exitAccount().catch(()=>alert('Could not sign out. Please retry.')));return;
  }
  const role = routeRole(name);
  if (authState.account && role !== authState.account.role) { location.hash = '#/' + roleHome(authState.account.role); return; }
  mountShell();
  updateRoleNavigation(role);
  if(authState.account){document.querySelector('#workspace-role').hidden=true;document.querySelector('#account-name').textContent=authState.account.user.email;document.querySelector('#account-program').textContent='· Signed in · Supabase';document.querySelector('#auth-exit').textContent='Sign out';}
  if(loadedWorkspace!==(authState.account?.user.id??'demo'))document.querySelector('#main').innerHTML='<section class="panel" aria-busy="true"><h1>Loading your workspace…</h1><p>Fetching records from Supabase.</p></section>';
  try{
    if(!authState.account||authState.account.role==='student')await hydrateWorkspace();
  }catch(error){if(rendering!==renderVersion)return;document.querySelector('#main').innerHTML=`<section class="panel"><h1>Workspace unavailable</h1><p>${escapeHtml(error.message)}</p><button class="button" id="retry-workspace">Retry</button></section>`;document.querySelector('#retry-workspace').addEventListener('click',render);return;}
  if(rendering!==renderVersion)return;
  if(authState.account&&role!=='student'){document.querySelector('#main').innerHTML='<section class="panel"><h1>Workspace registered</h1><p>Live faculty/recruiter services are awaiting cohort and consent configuration. Real student records are not shown here.</p></section>';return;}
  const page = pages[name] ?? (name.startsWith('faculty/student/') ? {render:s=>renderStudentDetail(s,name.split('/')[2]),title:'Student Detail'} : name.startsWith('recruiter/candidate/') ? {render:s=>renderCandidate(s,name.split('/')[2]),title:'Candidate Profile'} : null);
  document.querySelector('#main').innerHTML = page?.render(state) ?? '<section class="panel"><h1>Page not found</h1><p>This page is not part of this frontend.</p><a class="button" href="#/overview">Return to overview</a></section>';
  document.title = `${page?.title ?? 'Page not found'} · Porto-Star`;
  document.querySelectorAll('[data-route]').forEach(a => {
    const active = name.startsWith('faculty/student/') ? 'faculty/students' : name.startsWith('recruiter/candidate/') ? 'recruiter/talent' : name;
    if (a.dataset.route === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const accountName = authState.account?.user.email;
  document.querySelector('#account-name').textContent = accountName ?? (role === 'student' ? state.student.name : role === 'faculty' ? 'Dr. Reena Mehta' : 'Campus Recruiter');
  document.querySelector('#account-program').textContent = authState.account ? '· Signed in · Supabase' : '· Demo workspace';
  document.querySelector('#workspace-role').hidden = Boolean(authState.account);
  document.querySelector('#auth-exit').textContent = authState.account ? 'Sign out' : 'Exit preview';
  document.querySelector('#account-avatar').setAttribute('aria-label', role === 'student' ? 'Open my profile' : 'Open workspace overview');
  document.querySelector('#account-avatar').href = role === 'student' ? '#/profile' : `#/${role}`;
  document.querySelector('#account-avatar').textContent = (accountName ?? (role === 'student' ? state.student.name : role === 'faculty' ? 'Reena Mehta' : 'Campus Recruiter')).split(/\s+/).map(s => s[0]).slice(0,2).join('');
  document.querySelector('.sidebar').classList.remove('is-open');
  document.querySelector('.sidebar').inert = matchMedia('(max-width: 680px)').matches;
  document.querySelector('#menu').setAttribute('aria-expanded', 'false');
}
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault(); document.querySelector('#main')?.focus(); document.querySelector('#main')?.scrollIntoView();
});
document.querySelector('#app').innerHTML = '<main id="main" class="login-loading" aria-busy="true"><section class="panel"><h1>Welcome to Porto-Star</h1><p>Checking your session…</p></section></main>';
try {
  client = getSupabaseClient();
  
  authState.account = await verifyCurrentAccount(client);
  if(authState.account&&location.hash.startsWith('#/management')){const permission=await client.rpc('can_manage_accounts');if(permission.data)authState.account.role='management';}
  if(location.hash.includes('access_token=')||location.hash.includes('error='))history.replaceState(null,'',location.pathname+location.search+'#/login');
} catch { authState.account = null; }
authState.checking = false;
render();
client?.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT' && authState.account) { authState.account = null; setDemo(false); loadedWorkspace=null; state.student=null;state.portfolio=null;state.goal=null;state.history=[];location.hash = '#/login'; }
});
window.addEventListener('hashchange', () => {
  render(); document.querySelector('#main')?.focus(); window.scrollTo(0, 0);
});
