import { icon } from './ui.js';
const navigation = {
  student: [['overview','dashboard','Overview'],['growth','trending_up','My Growth'],['subjects','menu_book','Subject Analysis'],['skills','explore','Skills / Target Role'],['simulator','tune','What-If Simulator'],['profile','verified_user','Profile & Consent']],
  faculty: [['faculty','dashboard','Overview'],['faculty/students','groups','Students & Support Queue'],['faculty/insights','insights','Cohort Insights'],['faculty/subjects','menu_book','Subject Analytics'],['faculty/support','assignment','Support & Intervention Log']],
  recruiter: [['recruiter','dashboard','Talent Overview'],['recruiter/talent','person_search','Candidate Discovery'],['recruiter/roles','work','Role Requirements'],['recruiter/shortlist','bookmark','Shortlists'],['recruiter/requests','mail','Introduction Requests']],
};
export function updateRoleNavigation(role) {
  document.querySelector('.nav-label').textContent = `${role.toUpperCase()} WORKSPACE`;
  document.querySelector('.sidebar').setAttribute('aria-label', `${role} navigation`);
  document.querySelector('.sidebar nav').innerHTML = navigation[role].map(([route,symbol,label])=>`<a href="#/${route}" data-route="${route}">${icon(symbol)}${label}</a>`).join('');
  document.querySelector('.brand').href = role === 'student' ? '#/overview' : `#/${role}`;
  document.querySelector('#workspace-role').value = role;
  document.querySelector('.hub-label').textContent = {student:'Student Success Hub',faculty:'Faculty Success Hub',recruiter:'Campus Talent Hub'}[role];
}
export function renderShell() {
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar" aria-label="Student navigation">
      <a class="brand" href="#/overview"><span class="brand-icon">${icon('school')}</span><span>Porto-Star<small>SUCCESS PORTAL</small></span></a>
      <p class="nav-label">STUDENT WORKSPACE</p>
      <nav></nav>
      <div class="sidebar-bottom"><p>Student · Faculty · Recruiter<br>Switch workspaces in the header.</p><small>Round 1 · Frontend first</small></div>
    </aside>
    <div class="workspace"><header class="topbar"><button class="icon-button menu-button" aria-label="Toggle navigation" aria-expanded="false" id="menu">${icon('menu')}</button><span class="hub-label">Student Success Hub</span><label class="sr-only" for="workspace-role">Workspace preview</label><select id="workspace-role"><option value="student">Student</option><option value="faculty">Faculty</option><option value="recruiter">Recruiter</option></select><span class="topbar-context"><span id="account-name"></span> <span id="account-program"></span></span><button class="auth-exit" id="auth-exit" type="button">Exit preview</button><a class="avatar" href="#/profile" aria-label="Open my profile" id="account-avatar">AS</a></header>
    <main id="main" tabindex="-1"></main><footer>Porto-Star <span>Sample records · No outcome guarantees</span></footer></div>`;
  const sidebar = document.querySelector('.sidebar');
  const mobile = matchMedia('(max-width: 680px)');
  const updateNavigation = () => { sidebar.inert = mobile.matches && !sidebar.classList.contains('is-open'); };
  mobile.addEventListener('change', updateNavigation);
  updateNavigation();
  document.querySelector('#menu').addEventListener('click', (event) => {
    const open = sidebar.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    updateNavigation();
  });
  return () => mobile.removeEventListener('change', updateNavigation);
}
