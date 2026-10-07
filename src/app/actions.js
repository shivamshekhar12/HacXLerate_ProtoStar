import { icon, escapeHtml, announce, showDialog } from '../components/ui.js';
import { state, saveGoal, saveWorkspace } from './state.js';
import { demoRecommendation, demoRoles } from '../data/demo-student.js';
import { renderSkillResults } from '../pages/student/skills.js';
import { renderScenarioResults } from '../pages/student/simulator.js';
import { safeProjectUrl } from '../pages/student/profile.js';

const field = (label, name, value = '', max = 100, required = true) => `<label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" value="${escapeHtml(value)}" maxlength="${max}" ${required ? 'required' : ''}/>`;
export function formDialog(title, body, onSave) {
  const dialog = showDialog(title, `<form>${body}<p class="field-error" role="alert"></p><div class="button-row"><button class="button" type="submit">Save changes ${icon('check')}</button><button class="button secondary" type="button" data-cancel>Cancel</button></div></form>`);
  dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
  dialog.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    const snapshot=state.mode==='live'?structuredClone({student:state.student,portfolio:state.portfolio,goal:state.goal,revision:state.revision}):null;
    const values = Object.fromEntries([...new FormData(event.currentTarget)].map(([k,v]) => [k, v.trim()]));
    const button=event.currentTarget.querySelector('[type=submit]');button.disabled=true;
    let error;try{error = await onSave(values);}catch{if(snapshot)Object.assign(state,snapshot);error='Could not save to Supabase. Reload and try again.';}finally{button.disabled=false;}
    if (error) dialog.querySelector('.field-error').textContent = error;
    else dialog.close();
  });
  return dialog;
}
async function confirmSave(render, message) {
  const persisted = await saveWorkspace(); await render();
  announce(persisted ? `${message} ${state.mode==='live'?'Saved to your account.':'Saved in this browser.'}` : `${message} Saved for this session; browser storage is unavailable.`);
}
function goalDialog(render) {
  formDialog('Set a weekly goal', `<p>Choose a concrete next action. Your goal is saved with your workspace.</p><label for="goal-text">Your practice goal</label><textarea id="goal-text" name="goal" required maxlength="240" rows="3">${escapeHtml(state.goal?.text ?? (state.mode==='demo'?demoRecommendation.action:''))}</textarea><small>1–240 characters.</small>`, async values => {
    if (!values.goal || values.goal.length > 240) return 'Enter a goal between 1 and 240 characters.';
    const persisted = await saveGoal({ text: values.goal, status: values.goal === state.goal?.text ? state.goal.status : 'planned' });
    render(); announce(persisted ? state.mode==='live'?'Weekly goal saved to Supabase.':'Weekly goal saved in this browser.' : 'Goal saved for this session. Browser storage is unavailable.');
  });
}
function skillDialog(render, id, suggestedName = '') {
  const skill = state.portfolio.skills.find(s => s.id === id);
  formDialog(skill ? 'Edit skill & evidence' : 'Add a skill', `${field('Skill name','name',skill?.name ?? suggestedName,60)}<label for="skill-level">Self-assessed proficiency</label><select id="skill-level" name="level">${['Developing','Intermediate','Advanced'].map(level => `<option ${level === skill?.level ? 'selected' : ''}>${level}</option>`).join('')}</select>${field('Evidence summary (optional)','evidence',skill?.evidence ?? '',160,false)}<small>Describe a project or practice example. Evidence is self-reported in this preview.</small>`, async values => {
    if (!values.name || values.name.length > 60 || values.evidence.length > 160) return 'Enter a skill name of 1–60 characters and evidence of up to 160 characters.';
    if (state.portfolio.skills.some(s => s.id !== skill?.id && s.name.toLowerCase() === values.name.toLowerCase())) return 'This skill is already recorded. Edit its existing entry.';
    if (!skill && state.portfolio.skills.length >= 30) return 'This preview supports up to 30 skills.';
    const record = { id: skill?.id ?? crypto.randomUUID(), name: values.name, level: values.level, evidence: values.evidence };
    if (skill) Object.assign(skill, record); else state.portfolio.skills.push(record);
    await confirmSave(render, 'Skill updated.');
  });
}
function projectDialog(render, id) {
  const project = state.portfolio.projects.find(x => x.id === id);
  formDialog(project ? 'Edit project' : 'Add project evidence', `${field('Project title','title',project?.title ?? '',100)}<label for="project-description">What did you build?</label><textarea id="project-description" name="description" maxlength="500" required rows="3">${escapeHtml(project?.description ?? '')}</textarea>${field('Skills used','skills',project?.skills ?? '',160)}${field('Project URL (optional)','url',project?.url ?? '',500,false)}<small>Use an http:// or https:// link.</small>`, async values => {
    if (!values.title || !values.description || !values.skills) return 'Complete the project title, description, and skills used.';
    if (values.url && !safeProjectUrl(values.url)) return 'Enter a valid http:// or https:// project URL.';
    if (!project && state.portfolio.projects.length >= 20) return 'This preview supports up to 20 projects.';
    const record = { id: project?.id ?? crypto.randomUUID(), ...values };
    if (project) Object.assign(project, record); else state.portfolio.projects.push(record);
    await confirmSave(render, 'Project updated.');
  });
}
function profileDialog(render) {
  const s = state.student;
  formDialog('Edit profile', `${field('Display name','name',s.name,80)}${field('Program','program',s.program,120)}<div class="two-column form-grid"><div><label for="profile-year">Year</label><input type="number" id="profile-year" name="year" min="1" max="6" value="${s.year}" required/></div><div><label for="profile-semester">Semester</label><input type="number" id="profile-semester" name="semester" min="1" max="12" value="${s.semester}" required/></div></div>`, async values => {
    const year = Number(values.year), semester = Number(values.semester);
    if (!values.name || !values.program || !Number.isInteger(year) || year < 1 || year > 6 || !Number.isInteger(semester) || semester < 1 || semester > 12) return 'Enter your name, program, a year from 1–6, and a semester from 1–12.';
    Object.assign(s, { name: values.name, program: values.program, year, semester });
    await confirmSave(render, 'Demo profile updated.');
  });
}
function portfolioDialog(render, key, id) {
  if (!['experience','achievements'].includes(key)) return;
  const item = state.portfolio[key].find(x => x.id === id);
  formDialog(item ? 'Edit portfolio entry' : `Add ${key === 'experience' ? 'experience' : 'achievement / certification'}`, `${field('Title / role','title',item?.title ?? '',100)}<label for="entry-description">Description & evidence</label><textarea id="entry-description" name="description" maxlength="500" rows="4" required>${escapeHtml(item?.description ?? '')}</textarea><small>Self-reported local demo record; not institutionally verified.</small>`, async values => {
    if (!values.title || !values.description) return 'Enter a title and description with evidence.';
    if (!item && state.portfolio[key].length >= 20) return 'The demo supports up to 20 entries per section.';
    const record = { id: item?.id ?? crypto.randomUUID(), ...values };
    if (item) Object.assign(item, record); else state.portfolio[key].push(record);
    await confirmSave(render, 'Portfolio entry updated.');
  });
}
export function bindActions(render) {
  const main = document.querySelector('#main');
  main.addEventListener('click', async event => {
    const snapshot=state.mode==='live'?structuredClone({student:state.student,portfolio:state.portfolio,goal:state.goal,revision:state.revision}):null;
    try{
    const button = event.target.closest('[data-action],[data-domain],[data-chart],[data-skill],[data-add-skill],[data-project],[data-portfolio-add],[data-portfolio-edit]');
    if (!button) return;
    if (button.dataset.portfolioAdd || button.dataset.portfolioEdit) { portfolioDialog(render, button.dataset.portfolioAdd ?? button.dataset.portfolioEdit, button.dataset.entryId); return; }
    if (button.dataset.chart) { state.ui.chartMetric = button.dataset.chart; render(); document.querySelector(`[data-chart="${state.ui.chartMetric}"]`).focus(); return; }
    if (button.hasAttribute('data-skill')) { skillDialog(render, button.dataset.skill); return; }
    if (button.hasAttribute('data-add-skill')) { skillDialog(render, null, button.dataset.addSkill); return; }
    if (button.hasAttribute('data-project')) { projectDialog(render, button.dataset.project); return; }
    if (button.dataset.domain) {
      const d = state.student.domains.find(d => d.id === button.dataset.domain);
      showDialog(`${escapeHtml(d.name)} evidence`, `<span class="badge ${d.value === null ? 'neutral' : 'positive'}">${escapeHtml(d.state)} · ${state.mode==='demo'?'Synthetic':'Your records'}</span><h3>${escapeHtml(d.source)}</h3><p>${escapeHtml(d.evidence)}</p><div class="reason"><strong>Provenance</strong><p>${state.mode==='demo'?'Synthetic preview from Supabase.':'Source measurements have not been supplied by campus systems. Portfolio evidence is self-reported.'}</p></div>`);
      return;
    }
    switch (button.dataset.action) {
      case 'sources': showDialog('Integrated data sources', `<p>Source categories for this workspace. Missing records stay unavailable.</p><div class="source-list">${state.student.domains.map(d => `<div><span><strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.source)}</small></span><span class="badge ${d.value === null ? 'neutral' : 'positive'}">${d.state}</span></div>`).join('')}</div>`); break;
      case 'goal': goalDialog(render); break;
      case 'toggle-goal': if (state.goal) { const persisted = await saveGoal({ ...state.goal, status: state.goal.status === 'complete' ? 'planned' : 'complete' }); render(); announce(`Goal ${state.goal.status === 'complete' ? 'completed' : 'reopened'}.${persisted ? '' : ' Saved for this session only.'}`); } break;
      case 'add-skill': skillDialog(render); break;
      case 'add-project': projectDialog(render); break;
      case 'edit-profile': profileDialog(render); break;
      case 'reset-scenario': state.ui.scenario = null; render(); announce('Scenario reset to the current sample measurements.'); break;
      case 'advisor': if(state.mode==='live'){showDialog('Advisor Connect','<p>No advisor has been assigned yet. Contact your campus coordinator for support.</p>');break;} showDialog('Advisor Connect', `<div class="preview-person"><span class="profile-initials">RM</span><div><h3>${escapeHtml(state.student.advisor)}</h3><p>Sample faculty advisor · Department of AI</p></div></div><p>Use this space to prepare a question about your progress. Scheduling and messaging will be connected in a later module.</p><a class="button" href="#/growth" data-dismiss-dialog>Review my goal ${icon('arrow_forward')}</a>`).querySelector('[data-dismiss-dialog]').addEventListener('click', () => document.querySelector('dialog').close()); break;
    }
    }catch{if(snapshot){Object.assign(state,snapshot);await render();}showDialog('Save unsuccessful','<p>Your changes could not be saved to Supabase. Reload before trying again.</p>');}
  });
  main.addEventListener('input', event => {
    const target = event.target;
    if (target.id === 'skill-search') {
      state.ui.skillSearch = target.value;
      document.querySelector('#skill-results').innerHTML = renderSkillResults(state);
    }
    if (target.dataset.scenario) {
      state.ui.scenario[target.dataset.scenario] = Number(target.value);
      const units = { attendance: '%', placement: '/ 100', lms: 'of 6' };
      document.querySelector(`#value-${target.dataset.scenario}`).textContent = `${target.value} ${units[target.dataset.scenario]}`;
      document.querySelector('#scenario-results').innerHTML = renderScenarioResults(state);
    }
  });
  main.addEventListener('change', async event => {
    const snapshot=structuredClone({student:state.student,portfolio:state.portfolio,goal:state.goal,revision:state.revision});
    try{
    const target = event.target;
    if (target.id === 'skill-filter') { state.ui.skillFilter = target.value; document.querySelector('#skill-results').innerHTML = renderSkillResults(state); }
    if (target.dataset.control === 'target-role' && demoRoles.some(r => r.title === target.value)) { state.student.targetRole = target.value; await confirmSave(render, 'Target role updated.'); document.querySelector('#target-role').focus(); }
    if (target.dataset.consent) { state.portfolio.consent[target.dataset.consent] = target.checked; await confirmSave(render, 'Local sharing preview updated.'); document.querySelector(`[data-consent="${target.dataset.consent}"]`).focus(); }
    }catch{Object.assign(state,snapshot);await render();announce('Save failed. Your previous values were restored.');}
  });
}
