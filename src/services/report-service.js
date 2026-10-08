import {jsPDF} from 'jspdf';
import {analyzeStudent,studentRecord,defaultNarrative,summarizeCohort} from './analytics.js';
const C={navy:[20,33,65],gold:[255,184,0],ink:[35,45,62],muted:[113,124,146],soft:[244,246,251],line:[223,229,240],green:[39,158,109],red:[220,65,70],orange:[229,138,22],blue:[58,106,214],purple:[128,75,215]};
const clean=v=>String(v??'Not recorded').replace(/[^\x20-\x7E]/g,'-');
const fmt=v=>typeof v==='number'?String(Math.round(v*100)/100):'Not recorded';
const labels={cgpa:'CGPA',attendance:'ATT',lmsMarks:'LMS',coding:'CODE'};
function report(title,landscape=false,demo=true){
 const doc=new jsPDF({unit:'mm',format:'a4',orientation:landscape?'landscape':'portrait',compress:true}),w=landscape?297:210,h=landscape?210:297,m=13;
 let y=28;
 function txt(value,x,yy,size=10,color=C.ink,bold=false){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(clean(value),x,yy);}
 function rect(x,yy,width,height,color,r=0){doc.setFillColor(...color);r?doc.roundedRect(x,yy,width,height,r,r,'F'):doc.rect(x,yy,width,height,'F');}
 function header(){rect(0,0,w,14,C.navy);rect(0,14,w,.8,C.gold);txt('Porto-Star',m,9,14,C.gold,true);txt('Student Success Intelligence',m+37,9,8,[176,188,211]);doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(255);doc.text(title,w-m,9,{align:'right'});}
 function next(){doc.addPage();y=28;header();}
 function ensure(height){if(y+height>h-18)next();}
 function heading(value){ensure(18);txt(value,m,y,12,C.navy,true);y+=7;}
 function para(value,size=9,color=C.ink){doc.setFontSize(size);const lines=doc.splitTextToSize(clean(value),w-2*m);for(const line of lines){ensure(5);txt(line,m,y,size,color);y+=4.4;}y+=3;}
 function wrapped(value,x,yy,width,size=9,color=C.ink,bold=false){doc.setFontSize(size);doc.setFont('helvetica',bold?'bold':'normal');const lines=doc.splitTextToSize(clean(value),width);lines.forEach((line,i)=>txt(line,x,yy+i*4.2,size,color,bold));return lines.length*4.2;}
 function badge(value,x,yy,width,color){rect(x,yy-3.4,width,5.3,color.map(v=>Math.round(v*.15+255*.85)),2);txt(value,x+2,yy,7,color,true);}
 function bar(x,yy,width,value,max,color,threshold=null){rect(x,yy,width,2.6,C.line,1);if(typeof value==='number')rect(x,yy,width*Math.min(1,Math.max(0,value/max)),2.6,color,1);if(typeof threshold==='number'){doc.setDrawColor(...C.navy);doc.setLineWidth(.4);doc.line(x+width*threshold/max,yy-1,x+width*threshold/max,yy+3.6);}}
 function truncate(v,width,size=8){doc.setFontSize(size);let s=clean(v);if(doc.getTextWidth(s)<=width)return s;while(s.length&&doc.getTextWidth(s+'...')>width)s=s.slice(0,-1);return s+'...';}
 function table(headers,widths,rows,{font=8,rowHeight=8,drawCell=null}={}){
  const start=()=>{rect(m,y,widths.reduce((a,b)=>a+b,0),7,C.navy);let x=m;headers.forEach((v,i)=>{txt(v,x+2,y+4.8,font,[255,255,255],true);x+=widths[i];});y+=7;};ensure(15);start();
  rows.forEach((row,index)=>{if(y+rowHeight>h-18){next();start();}rect(m,y,widths.reduce((a,b)=>a+b,0),rowHeight,index%2?C.soft:[255,255,255]);let x=m;row.forEach((v,i)=>{if(!drawCell||!drawCell(v,i,x,y,widths[i],row,index))txt(truncate(v,widths[i]-4,font),x+2,y+rowHeight*.65,font,C.ink,i===1);x+=widths[i];});doc.setDrawColor(...C.line);doc.setLineWidth(.1);doc.line(m,y+rowHeight,w-m,y+rowHeight);y+=rowHeight;});y+=5;
 }
 function finish(){const pages=doc.getNumberOfPages();const date=new Date().toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',year:'numeric'});for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor(...C.line);doc.line(m,h-12,w-m,h-12);txt(demo?'Synthetic demo - illustrative rules, not validated predictions':'Private report - recorded evidence only',m,h-8,7,C.muted);doc.setFontSize(7);doc.text(`Page ${i} of ${pages} | ${date}`,w-m,h-8,{align:'right'});}return doc;}
 header();return {doc,w,h,m,txt,rect,next,ensure,heading,para,wrapped,badge,bar,table,truncate,finish,get y(){return y;},set y(v){y=v;}};
}
export function createStudentReport(state){
 const a=analyzeStudent(studentRecord(state),state.analyticsConfig),r=report('Student Progress Report',false,state.mode==='demo');
 r.rect(13,22,184,42,C.navy,3);r.txt(r.truncate(state.student.name,165,20),20,32,20,[255,255,255],true);
 r.txt(r.truncate(`${state.student.id??'Student'} | ${state.student.program} | Year ${state.student.year||'Not supplied'} | Semester ${state.student.semester||'Not supplied'} | Batch ${state.student.batch||'Not recorded'}`,170,8),20,39,8,[183,195,217]);
 r.txt(a.score??'Unavailable',20,54,a.score===null?15:27,C.gold,true);if(a.score!==null)r.txt('/ 100',44,54,10,[255,255,255]);r.txt('SUCCESS SCORE',20,60,7,[183,195,217],true);
 r.txt(a.reviewIndex===null?'Unavailable':a.reviewIndex+'%',78,53,a.reviewIndex===null?14:20,[255,255,255],true);r.txt(`REVIEW INDEX (${a.reasons.length}/${a.assessed} checks)`,78,60,7,[183,195,217]);
 r.badge(a.risk.toUpperCase(),151,54,40,a.risk==='Unconfigured'||!a.complete?C.muted:a.reasons.length?C.orange:C.green);
 r.y=70;r.para(state.mode==='demo'?'SYNTHETIC DEMO: illustrative rules, not validated predictions.':'PRIVATE STUDENT REPORT: missing sources remain unavailable.',8,C.muted);
 r.heading('Summary');
 const summary=[{color:C.green,text:a.score!==null?(a.reasons.length?`Strengths: ${a.factors.filter(f=>!a.reasons.some(reason=>reason.key===f.key)).map(f=>f.label).join(', ')||'review the complete evidence'} meet the configured review thresholds.`:'Good progress under the configured rules. Keep building consistent habits.'):'A complete score is unavailable. Review the recorded evidence and applicable rules.'},{color:a.reasons.length?C.red:C.green,text:a.reasons.length?a.reasons.map(v=>v.text).join(' '):defaultNarrative(a)},{color:C.blue,text:state.narrative?.text??'Next step: discuss the specific evidence with faculty and agree a focused improvement plan.'}];
 for(const row of summary){r.doc.setFontSize(9);const lines=r.doc.splitTextToSize(clean(row.text),174);const height=lines.length*4.2+5;r.ensure(height);r.rect(13,r.y,184,height,C.soft);r.rect(13,r.y,1,height,row.color);r.wrapped(row.text,17,r.y+4.2,174,9);r.y+=height;}r.y+=8;
 r.heading('Indicator results');
 r.table(['Indicator','Result','Against threshold','Review below','Weight','Status'],[40,23,48,27,16,30],a.factors.map(f=>[f.label,f.value===null?'Not recorded':`${fmt(f.value)} / ${f.max}`,f,state.analyticsConfig?.thresholds?.[f.key]===undefined?'Not set':`${state.analyticsConfig.thresholds[f.key]} / ${f.max}`,f.weight===null?'Not set':f.weight+'%',f]),{font:7.5,rowHeight:11,drawCell:(v,i,x,y,width)=>{if(i===2){r.bar(x+2,y+4,width-5,v.value,v.max,a.reasons.some(reason=>reason.key===v.key)?C.red:C.green,state.analyticsConfig?.thresholds?.[v.key]);return true;}if(i===5){const configured=state.analyticsConfig?.approved&&Number.isFinite(state.analyticsConfig?.thresholds?.[v.key]);r.badge(v.value===null?'MISSING':!configured?'NO RULES':a.reasons.some(reason=>reason.key===v.key)?'BELOW':'ON TRACK',x+1,y+7,width-3,v.value===null||!configured?C.muted:a.reasons.some(reason=>reason.key===v.key)?C.red:C.green);return true;}return false;}});
 r.para('Bars show each result against its maximum; the dark tick marks the review threshold. Missing evidence has no filled bar.',8,C.muted);
 r.heading(`How the ${a.score??'score'} is built`);
 if(a.score!==null){const colors=[C.purple,C.green,C.blue,C.orange];let x=13;r.rect(13,r.y,184,7,C.line);a.factors.forEach((f,i)=>{const width=f.contribution/100*184;r.rect(x,r.y,width,7,colors[i]);if(width>10)r.txt(f.contribution.toFixed(2),x+2,r.y+4.8,8,[255,255,255],true);x+=width;});r.y+=13;a.factors.forEach((f,i)=>{r.rect(13+i*46,r.y-2,2,2,colors[i]);r.txt(r.truncate(f.label,40,7),17+i*46,r.y,7);});r.y+=7;}else r.para('A complete score needs four valid measurements and an applicable approved policy.');
 r.para('Each indicator is normalized to its maximum, multiplied by its configured weight, then added. No unverified evidence adds points.',8,C.muted);
 r.next();r.heading(`Subject ledger - Semester ${state.student.semester||'Not supplied'}`);
 r.table(['Subject','Semester','Marks','Attendance','Credits'],[67,21,35,34,27],(state.subjectRecords??[]).map(s=>[s.name,s.semester,s.marks===null||s.marks===undefined?'Not recorded':`${s.marks} / ${s.max}`,s.attendance??'Not recorded',s.credits??'Not recorded']),{rowHeight:10});
 if(!state.subjectRecords?.length)r.para('No subject records supplied.');
 r.heading('Portfolio - self-reported');
 const counts=[['SKILLS',state.portfolio.skills.length],['PROJECTS',state.portfolio.projects.length],['ACHIEVEMENTS',state.portfolio.achievements.length]];r.ensure(28);counts.forEach(([label,n],i)=>{const x=13+i*63;r.rect(x,r.y,58,21,C.soft,2);r.txt(n,x+5,r.y+9,19,C.navy,true);r.txt(label,x+5,r.y+16,8,C.muted,true);});r.y+=28;r.para('Unverified portfolio evidence does not add score points.',8,C.muted);
 r.heading('Other recorded evidence');r.table(['Source','Recorded result'],[65,119],['lms','engagement','feedback'].map(id=>{const d=state.student.domains.find(d=>d.id===id);return [d?.name??id,d?.value===null||d?.value===undefined?'Not recorded':`${d.value} ${d.unit??''}`];}),{rowHeight:8});
 r.heading('Method and limitations');r.para('Success score = sum of normalized indicators x configured weights. Review index = triggered checks / assessed checks x 100; it is not a failure probability. Demo rules are illustrative. No institution-approved policy means no real-account score.');
 for(const f of a.factors)r.para(`${f.label}: ${f.weight===null?'unconfigured':f.weight+'%'} weight; ${f.contribution===null?'unavailable':f.contribution.toFixed(2)} contributing points.`,8,C.muted);
 r.para(`Wording source: ${state.narrative?.source??'deterministic fallback'}. AI changes wording only. Every number comes from source records and code.`,8,C.muted);
 return r.finish();
}
const segmentShort=segment=>({'No current demo flags':'No flags','Academic support suggested':'Academic support','Career practice suggested':'Career practice','Strong academics · career practice needed':'Strong acad. + career gap','Incomplete evidence':'Incomplete evidence'}[segment]??segment);
const segmentColor=segment=>segment.includes('Strong')?C.purple:segment.includes('Academic')?C.orange:segment.includes('Career')?C.blue:segment.includes('Incomplete')?C.muted:C.green;
export function createFacultyReport(rows,config){
 const r=report('Faculty Class Review Report',true),summary=summarizeCohort(rows,config),analyzed=rows.map(s=>({...s,analysis:analyzeStudent(s,config)}));
 r.heading('Faculty Class Review Report');r.para(`Cohort snapshot | ${rows.length} students | SYNTHETIC DEMO DATA, illustrative rules only`,8,C.muted);
 const metrics=[['STUDENTS SCORED',summary.scored,`${summary.incomplete} missing required evidence`,C.blue],['MEAN SUCCESS SCORE',summary.mean===null?'N/A':summary.mean.toFixed(1),'out of 100',C.green],['NEED REVIEW',summary.review,'Unique students with triggered checks',C.orange],['ACADEMIC FLAGS',summary.academic,'CGPA, attendance, LMS',C.orange],['CAREER-PRACTICE FLAGS',summary.placement,'Coding assessment',C.blue]];
 metrics.forEach(([label,value,hint,color],i)=>{const x=13+i*55;r.rect(x,r.y,52,22,C.soft,2);r.rect(x,r.y+3,1,16,color);r.txt(value,x+4,r.y+10,20,C.navy,true);r.txt(label,x+4,r.y+15,7,C.ink,true);r.txt(r.truncate(hint,45,6.5),x+4,r.y+19,6.5,C.muted);});r.y+=31;
 const top=r.y;r.heading('Class segments');for(const [label,n] of Object.entries(summary.segments)){r.txt(label,13,r.y,8,C.ink,true);r.txt(`${n} (${rows.length?(n/rows.length*100).toFixed(1):0}%)`,113,r.y,8,segmentColor(label));r.y+=3;r.bar(13,r.y,122,n,Math.max(1,rows.length),segmentColor(label));r.y+=12;}
 const leftEnd=r.y;r.y=top;r.txt('Review load by department',151,r.y,12,C.navy,true);r.y+=7;
 const departments=[...new Set(rows.map(s=>s.program))].map(name=>{const subset=rows.filter(s=>s.program===name),v=summarizeCohort(subset,config);return {name,...v};}).sort((a,b)=>b.review-a.review);
 const shown=departments.slice(0,8);r.rect(151,r.y,133,6,C.navy);['Department','Students','Mean','Review'].forEach((v,i)=>r.txt(v,[153,222,244,265][i],r.y+4,7,[255,255,255],true));r.y+=6;
 shown.forEach((s,i)=>{r.rect(151,r.y,133,6,i%2?C.soft:[255,255,255]);r.txt(r.truncate(s.name,66,7.5),153,r.y+4,7.5);r.txt(s.count,223,r.y+4,7.5);r.txt(s.mean===null?'N/A':s.mean.toFixed(1),244,r.y+4,7.5);r.txt(s.review,266,r.y+4,7.5);r.y+=6;});r.y=Math.max(leftEnd,r.y)+5;
 r.heading('Suggested action and method');r.para('Prioritize the indicator below its threshold and confirm source data before intervention. Strong academics with a low coding assessment suggest targeted career practice. Academic and career counts overlap; the combined review count includes each student once.');
 r.para(`Score = sum of normalized indicators x configured weights. ${[['cgpa','CGPA'],['attendance','Attendance'],['lmsMarks','LMS'],['coding','Coding']].map(([key,label])=>`${label}: ${config?.weights?.[key]??'not set'}% weight; flag below ${config?.thresholds?.[key]??'not set'}`).join(' | ')}. Review index = flagged / assessed checks x 100; not failure probability.`,8,C.muted);
 function roster(title,data,subtitle){r.next();r.heading(title);r.para(subtitle,8,C.muted);r.para('CGPA / ATT / LMS = academic checks; CODE = career practice. Missing sources are not zero. Review is the share of assessed checks flagged.',7,C.muted);
  r.table(['ID','Student','Department','Yr','Success score','Review','Segment','Flagged indicators'],[21,43,40,8,29,17,48,65],data.map(s=>[s.id,s.name,s.program,s.year,s.analysis.score,s.analysis.reviewIndex,s.analysis.segment,s.analysis]),{font:7,rowHeight:6,drawCell:(v,i,x,y,width,row)=>{if(i===4){r.txt(fmt(v),x+2,y+4,7,C.ink,true);r.bar(x+11,y+2.5,width-13,v,100,v!==null&&v<60?C.red:C.blue);return true;}if(i===5){r.badge(v===null?'N/A':v+'%',x+1,y+4,width-2,v?C.orange:C.green);return true;}if(i===6){r.rect(x,y,1,6,segmentColor(v));r.txt(r.truncate(segmentShort(v),width-5,6.6),x+3,y+4,6.6,segmentColor(v),true);return true;}if(i===7){const flags=v.reasons.map(reason=>`${labels[reason.key]} ${fmt(v.factors.find(f=>f.key===reason.key).value)}`).join(' | ')||'-';r.txt(r.truncate(flags,width-4,6.7),x+2,y+4,6.7,v.reasons.length?C.orange:C.muted);return true;}return false;}});
 }
 const priority=analyzed.filter(s=>s.analysis.reviewIndex>=50).sort((a,b)=>b.analysis.reviewIndex-a.analysis.reviewIndex||(a.analysis.score??Infinity)-(b.analysis.score??Infinity));
 roster('Priority review list',priority,`${priority.length} students with two or more flagged checks (review index 50% or higher), highest review index first.`);
 if(!priority.length)r.para('No students match the priority criterion.');
 roster('Full student roster',[...analyzed].sort((a,b)=>a.id.localeCompare(b.id)),`All ${rows.length} selected students in ID order. Search with Ctrl+F for a name or ID.`);
 return r.finish();
}
export function downloadStudentReport(state){createStudentReport(state).save('Porto-Star_Student_Report.pdf');}
export function downloadFacultyReport(rows,config){createFacultyReport(rows,config).save('Porto-Star_Class_Review_Report.pdf');}
