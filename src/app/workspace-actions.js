import { icon,escapeHtml as e,announce } from '../components/ui.js';
import { formDialog } from './actions.js';
import { state } from './state.js';
import { workspace,persistRoleWorkspace,facultyStudents,candidates,toggleShortlist,resetTalentFilters,filteredCandidates,filteredStudents } from '../services/frontend-workspaces.js';
import { studentRows } from '../pages/faculty/workspace.js';
import { candidateCards } from '../pages/recruiter/workspace.js';
function saved(render,message){const persisted=persistRoleWorkspace();render();announce(`${message}${persisted?' Saved in this browser.':' Saved for this session only; storage is unavailable.'}`);}
export function bindWorkspaceActions(render){
  const main=document.querySelector('#main');
  function updatePager(kind,count){const id=kind==='talent'?'talent-page-count':'student-page-count';const label=document.getElementById(id);if(label)label.textContent=`Page 1 of ${Math.max(1,Math.ceil(count/25))}`;const prev=main.querySelector(`[data-page="${kind}-prev"]`),next=main.querySelector(`[data-page="${kind}-next"]`);if(prev)prev.disabled=true;if(next)next.disabled=count<=25;}

  function supportDialog(studentId){
    const students=facultyStudents(state);
    formDialog('Log faculty support action',`<p>Use synthetic information only. This is a local faculty preview.</p><label for="support-student">Student</label><select name="studentId" id="support-student">${students.map(s=>`<option value="${s.id}" ${s.id===studentId?'selected':''}>${e(s.name)}</option>`).join('')}</select><label for="support-category">Support category</label><select id="support-category" name="category"><option>Academic guidance</option><option>Learning support</option><option>Career preparation</option></select><label for="support-note">Action & context</label><textarea id="support-note" name="note" rows="4" maxlength="1000" required></textarea><label for="support-date">Follow-up date (optional)</label><input type="date" id="support-date" name="followUp"/>`,v=>{
      if(!v.note||v.note.length>1000)return 'Enter a supportive action of 1–1000 characters.';
      if(workspace.notes.length>=100)return 'The demo supports up to 100 support records.';
      workspace.notes.unshift({id:crypto.randomUUID(),...v,status:'Open'});saved(render,'Support action recorded.');
    });
  }
  main.addEventListener('click',event=>{
    const page=event.target.closest('[data-page]');if(page){const kind=page.dataset.page.startsWith('talent')?'talentPage':'studentPage';const count=kind==='talentPage'?filteredCandidates(state).length:filteredStudents(state).length;workspace.ui[kind]=Math.max(0,Math.min(Math.max(0,Math.ceil(count/25)-1),(workspace.ui[kind]??0)+(page.dataset.page.endsWith('next')?1:-1)));render();return;}

    const button=event.target.closest('[data-support-student],[data-support-toggle],[data-shortlist],[data-request],[data-withdraw-request],[data-action="record-support"],[data-action="reset-talent-filters"]');if(!button)return;
    if(button.dataset.action==='reset-talent-filters'){resetTalentFilters();render();return;}
    if(button.hasAttribute('data-support-student')||button.dataset.action==='record-support'){supportDialog(button.dataset.supportStudent);return;}
    if(button.dataset.supportToggle){const n=workspace.notes.find(x=>x.id===button.dataset.supportToggle);if(n){n.status=n.status==='Open'?'Complete':'Open';saved(render,'Support action updated.');}return;}
    if(button.dataset.shortlist){if(!candidates(state).some(c=>c.id===button.dataset.shortlist))return;toggleShortlist(button.dataset.shortlist);saved(render,'Shortlist updated.');return;}
    if(button.dataset.request){
      const c=candidates(state).find(c=>c.id===button.dataset.request);if(!c)return;
      formDialog('Draft candidate introduction',`<p>Prepare a local draft for ${e(c.name)}. No message will be sent.</p><label for="intro-message">Purpose & introduction message</label><textarea id="intro-message" name="message" rows="5" maxlength="1000" required></textarea><small>Active role: ${e(workspace.role.title)}. Contact details remain private.</small>`,v=>{
        if(!v.message||v.message.length>1000)return 'Enter a purpose and message of 1–1000 characters.';
        if(workspace.requests.some(r=>r.candidateId===c.id&&r.status==='Draft'))return 'A local draft already exists for this candidate. Review it in Introduction Requests.';
        if(workspace.requests.length>=100)return 'The demo supports up to 100 drafts.';
        workspace.requests.unshift({id:crypto.randomUUID(),candidateId:c.id,role:workspace.role.title,message:v.message,status:'Draft'});saved(render,'Introduction draft created; not sent.');
      });return;
    }
    if(button.dataset.withdrawRequest){const r=workspace.requests.find(r=>r.id===button.dataset.withdrawRequest);if(r){r.status='Withdrawn';saved(render,'Local draft withdrawn.');}}
  });
  main.addEventListener('input',event=>{
    if(event.target.id==='student-search'){workspace.ui.studentPage=0;workspace.ui.studentSearch=event.target.value;document.querySelector('#student-results').innerHTML=studentRows(state);updatePager('students',filteredStudents(state).length);}
    if(event.target.id==='talent-search'){workspace.ui.talentPage=0;workspace.ui.talentSearch=event.target.value;document.querySelector('#talent-results').innerHTML=candidateCards(state);document.querySelector('#talent-match-count').textContent=`${filteredCandidates(state).length} of ${candidates(state).length} visible profiles match.`;updatePager('talent',filteredCandidates(state).length);}
  });
  main.addEventListener('change',event=>{
    const t=event.target;
    if(t.dataset.multiFilter){const key={'talent-skill':'talentSkill','talent-year':'talentYear','talent-semester':'talentSemester'}[t.dataset.multiFilter];workspace.ui[key]=[...main.querySelectorAll(`[data-multi-filter="${t.dataset.multiFilter}"]:checked`)].map(input=>input.value);workspace.ui.talentPage=0;document.querySelector('#talent-results').innerHTML=candidateCards(state);document.querySelector('#talent-match-count').textContent=`${filteredCandidates(state).length} of ${candidates(state).length} visible profiles match.`;t.closest('details').querySelector('summary span').textContent=workspace.ui[key].join(', ')||'Any';updatePager('talent',filteredCandidates(state).length);return;}
    const controls={'subject-sort':'subjectSort','cohort-filter':'cohort','support-filter':'supportFilter','request-filter':'requestFilter','talent-skill':'talentSkill','talent-role':'talentRole','talent-program':'talentProgram','talent-degree':'talentDegree','talent-year':'talentYear','talent-semester':'talentSemester','talent-batch':'talentBatch','talent-evidence':'talentEvidence','talent-sort':'talentSort'};
    if(controls[t.id]){workspace.ui.talentPage=0;workspace.ui.studentPage=0;workspace.ui[controls[t.id]]=t.value;Promise.resolve(render()).then(()=>document.getElementById(t.id)?.focus());}
    if(t.id==='review-only'){workspace.ui.studentPage=0;workspace.ui.reviewOnly=t.checked;document.querySelector('#student-results').innerHTML=studentRows(state);updatePager('students',filteredStudents(state).length);}
    if(t.id==='subject-filter'){workspace.ui.subject=Number(t.value);Promise.resolve(render()).then(()=>document.querySelector('#subject-filter')?.focus());}
    if(t.dataset.compare){
      if(t.checked&&workspace.ui.compare.length>=3){t.checked=false;announce('Choose up to three candidates for comparison.');return;}
      workspace.ui.compare=t.checked?[...workspace.ui.compare,t.dataset.compare]:workspace.ui.compare.filter(id=>id!==t.dataset.compare);render();
      document.querySelector(`[data-compare="${t.dataset.compare}"]`)?.focus();
    }
  });
  main.addEventListener('submit',event=>{
    if(event.target.id!=='role-form')return;event.preventDefault();const form=event.target;
    const v=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,value.trim()]));
    const split=value=>[...new Map(value.split(',').map(s=>s.trim()).filter(Boolean).map(s=>[s.toLowerCase(),s])).values()];
    const required=split(v.required),preferred=split(v.preferred);
    if(!v.title||!required.length||required.length>20||preferred.length>20||[...required,...preferred].some(s=>s.length>60)){form.querySelector('.field-error').textContent='Enter a title and 1–20 required skills (up to 60 characters each). Preferred skills may contain up to 20 names.';return;}
    workspace.role={title:v.title,description:v.description,education:v.education,required,preferred};saved(render,'Role requirements updated.');
  });
}
