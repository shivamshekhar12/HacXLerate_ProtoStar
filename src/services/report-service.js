import {jsPDF} from 'jspdf';
import {analyzeStudent,studentRecord,defaultNarrative,summarizeCohort} from './analytics.js';
const clean=value=>String(value??'Unavailable').replace(/[^\x20-\x7E]/g,'-');
function report(title){
 const doc=new jsPDF({unit:'mm',format:'a4'});let y=35;
 const heading=()=>{doc.setFillColor(42,67,205);doc.rect(0,0,210,23,'F');doc.setTextColor(255);doc.setFontSize(17);doc.text(clean(title),15,15);doc.setTextColor(30);};heading();
 const next=()=>{doc.addPage();heading();y=35;};
 const text=(value,size=11)=>{doc.setFontSize(size);const lines=doc.splitTextToSize(clean(value),178);for(const line of lines){if(y>275)next();doc.text(line,15,y);y+=size*.5;}y+=4;};
 const bar=(label,value,max)=>{text(`${label}: ${value??'No data'} / ${max}`);if(value!==null&&typeof value==='number'){if(y>266)next();doc.setFillColor(230,233,250);doc.rect(15,y,178,3,'F');doc.setFillColor(42,67,205);doc.rect(15,y,178*Math.min(1,Math.max(0,value/max)),3,'F');y+=11;}};
 const finish=()=>{const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(100);doc.text(`Porto-Star | ${i} / ${n} | ${new Date().toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}`,15,289);}return doc;};
 const group=(parts)=>{const height=parts.reduce((sum,[value,size])=>sum+doc.splitTextToSize(clean(value),178).length*size*.5+4,0);if(y+height>275)next();for(const [value,size] of parts)text(value,size);};
 return {doc,text,bar,next,finish,group};
}
export function createStudentReport(state){
 const r=report('Student Progress Report'),a=analyzeStudent(studentRecord(state),state.analyticsConfig);
 r.text(state.student.name,18);r.text(`${state.student.degree??''} | ${state.student.program} | Year ${state.student.year} | Semester ${state.student.semester} | Batch ${state.student.batch??''}`);
 r.text(state.mode==='demo'?'SYNTHETIC DEMO - illustrative rules, not validated predictions':'PRIVATE STUDENT REPORT - source data only');
 r.text(`Success score: ${a.score??'Unavailable'} / 100. Combined review index: ${a.reviewIndex===null?'Unavailable':a.reviewIndex+'%'}. ${a.risk}`,13);
 r.text('Readable interpretation',14);r.text(state.narrative?.text??defaultNarrative(a));
 r.text('Numerical evidence and visual comparison',14);for(const f of a.factors)r.bar(f.label,f.value,f.max);
 r.text('Review reasons and practical actions',14);if(!a.reasons.length)r.text('No configured review checks triggered, or rules/evidence are unavailable. Missing evidence is not proof of poor performance.');
 for(const reason of a.reasons)r.text(`${reason.text} Review feedback and agree a focused improvement plan with faculty.`);
 r.next();r.text('Method, evidence and limitations',16);
 r.text('The demo success score is the sum of normalized indicator percentages multiplied by the configured weights. All four indicators are required. The review index is triggered checks / assessed checks x 100, not failure probability. No institution-approved policy means no real-account score.');
 for(const f of a.factors)r.text(`${f.label}: weight ${f.weight}%; contribution ${f.contribution===null?'Unavailable':f.contribution.toFixed(2)} points.`);
 r.text(`Portfolio: ${state.portfolio.skills.length} self-reported skills; ${state.portfolio.projects.length} projects; ${state.portfolio.achievements.length} achievements. Unverified evidence does not add score points.`);
 r.text('Subject ledger',14);for(const s of state.subjectRecords??[])r.text(`${s.name} | Semester ${s.semester} | Marks ${s.marks??'Missing'}/${s.max} | Attendance ${s.attendance??'Missing'} | Credits ${s.credits??'Missing'}`);
 if(!state.subjectRecords?.length)r.text('No subject records supplied.');
 r.text(`Narrative source: ${state.narrative?.source??'deterministic fallback'}. AI changes wording only; all displayed numerical values come from code and source records.`);
 return r.finish();
}
export function createFacultyReport(rows,config){
 const r=report('Faculty Class Review Report'),summary=summarizeCohort(rows,config);
 r.text('SYNTHETIC DEMO - selected cohort snapshot',15);
 r.text(`Students: ${summary.count}. Scored records: ${summary.scored}. Mean success score: ${summary.mean===null?'Unavailable':summary.mean.toFixed(1)} / 100.`,13);
 r.text(`${summary.review} students warrant review under the demo rules. Academic checks flagged ${summary.academic}; career-practice checks flagged ${summary.placement}. Categories overlap. Missing required evidence: ${summary.incomplete}.`);
 r.text('Class segments',14);for(const [label,count] of Object.entries(summary.segments))r.bar(label,count,Math.max(1,summary.count));
 r.text('Suggested action',14);r.text('Prioritize conversations about the specific indicator below its threshold. Confirm the source data before intervention. Strong academic results with a low coding assessment suggest targeted career practice rather than a broad academic judgment.');
 r.text('Methodology',14);r.text(`Success is the sum of normalized indicators times their weights. ${[['cgpa','CGPA'],['attendance','Attendance'],['lmsMarks','LMS marks'],['coding','Coding']].map(([key,label])=>`${label}: ${config?.weights?.[key]??'unconfigured'}% weight, review below ${config?.thresholds?.[key]??'unconfigured'}`).join('; ')}. Demo rules are illustrative; no calibrated academic or placement predictions.`);
 r.next();r.text('Student review ledger',16);
 for(const s of rows){const a=analyzeStudent(s,config);r.group([[`${s.id} | ${s.name} | ${s.cohort}`,11],[`Score ${a.score??'Unavailable'} / 100 | Review index ${a.reviewIndex===null?'Unavailable':a.reviewIndex+'%'} | ${a.segment}`,10],[a.reasons.length?a.reasons.map(reason=>reason.text).join(' '):defaultNarrative(a),10]]);}
 return r.finish();
}
export function downloadStudentReport(state){createStudentReport(state).save('smart-campus-student-report.pdf');}
export function downloadFacultyReport(rows,config){createFacultyReport(rows,config).save('smart-campus-class-report.pdf');}
