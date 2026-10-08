import {state} from './state.js';
import {getSupabaseClient} from '../services/supabase/client.js';
import {describeProgress} from '../services/narrative-service.js';
import {analyzeStudent,studentRecord} from '../services/analytics.js';
import {scoreExplanation} from '../components/analytics-ui.js';
import {escapeHtml as e,showDialog} from '../components/ui.js';
import {facultyStudents,workspace} from '../services/frontend-workspaces.js';
export function bindAnalyticsActions(){
 document.querySelector('#main').addEventListener('click',async event=>{
  const button=event.target.closest('[data-analytics]');if(!button)return;
  if(button.dataset.analytics==='score-info'){const a=analyzeStudent(studentRecord(state),state.analyticsConfig);showDialog('How the score and review index work',`<p>${e(scoreExplanation(a))}</p><p>The review index is flagged checks divided by assessed checks × 100. A low score, a review flag, and missing evidence mean different things.</p><p>Academic checks use CGPA, attendance and LMS marks; coding is a career-practice check. Recruiters cannot see these internal signals.</p>`);return;}
  button.disabled=true;
  try{
   if(button.dataset.analytics==='narrative'){const scope=state.student.id;const result=await describeProgress(getSupabaseClient(),state);if(state.student?.id!==scope)return;state.narrative=result;const text=document.querySelector('#readable-narrative'),source=document.querySelector('#narrative-source');if(text)text.textContent=result.text;if(source)source.textContent=result.source.startsWith('gemini')?'Gemini wording · calculations unchanged':'Default English explanation · AI unavailable or not requested';}
   if(button.dataset.analytics==='student-pdf'){const {downloadStudentReport}=await import('../services/report-service.js');downloadStudentReport(state);}
   if(button.dataset.analytics==='faculty-pdf'){const {downloadFacultyReport}=await import('../services/report-service.js');downloadFacultyReport(facultyStudents(state).filter(s=>workspace.ui.cohort==='all'||s.cohort===workspace.ui.cohort),state.analyticsConfig);}
  }catch{showDialog('Report unavailable','<p>Please retry. The dashboard and default explanation remain available.</p>');}
  finally{if(button.isConnected)button.disabled=false;}
 });
}
