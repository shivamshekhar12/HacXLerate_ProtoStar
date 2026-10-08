// Numerical results are deterministic; AI never supplies these values.
const finite=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
export function analyzeStudent(record,config){
 const factors=[['cgpa','CGPA',10],['attendance','Attendance',100],['lmsMarks','LMS assignment marks',100],['coding','Coding assessment',100]].map(([key,label,max])=>({key,label,value:finite(record[key],0,max)?record[key]:null,max,weight:config?.weights?.[key]??0}));
 const measured=factors.filter(f=>f.value!==null),complete=measured.length===factors.length;
 const approved=Boolean(config?.approved),validWeights=factors.every(f=>Number.isFinite(f.weight)&&f.weight>=0)&&factors.reduce((sum,f)=>sum+f.weight,0)===100;
 const score=approved&&validWeights&&complete?Math.round(factors.reduce((sum,f)=>sum+f.value/f.max*f.weight,0)*10)/10:null;
 const reasons=approved?factors.filter(f=>f.value!==null&&Number.isFinite(config.thresholds?.[f.key])&&f.value<config.thresholds[f.key]).map(f=>({key:f.key,text:`${f.label} ${f.value}/${f.max} is below the demo review threshold ${config.thresholds[f.key]}/${f.max}.`,category:f.key==='coding'?'placement':'academic'})):[];
 const segment=!approved?'Rules awaiting review':record.cgpa>=config.strongAcademic&&reasons.some(r=>r.category==='placement')?'Strong academics · career practice needed':reasons.some(r=>r.category==='academic')?'Academic support suggested':reasons.some(r=>r.category==='placement')?'Career practice suggested':complete?'No current demo flags':'Incomplete evidence';
 const assessed=approved?measured.filter(f=>Number.isFinite(config.thresholds?.[f.key])).length:0;
 const reviewIndex=assessed?Math.round(reasons.length/assessed*100):null;
 return {score,reviewIndex,assessed,factors: factors.map(f=>({...f,contribution:f.value===null?null:f.value/f.max*f.weight})),complete,available:measured.length,risk:!approved?'Unconfigured':reasons.length?'Review suggested':complete?'No current flags':'Insufficient data',reasons,segment,version:config?.version??null,illustrative:true};
}
export function studentRecord(state){
 const domain=id=>state.student.domains.find(d=>d.id===id)?.value??null;
 return state.analyticsRecord??{cgpa:domain('academic'),attendance:domain('attendance'),coding:domain('placement'),lmsMarks:null};
}
export function summarizeCohort(rows,config){
 const analyses=rows.map(r=>analyzeStudent(r,config)),scored=analyses.filter(a=>a.score!==null),segments={};
 for(const a of analyses)segments[a.segment]=(segments[a.segment]??0)+1;
 return {count:rows.length,scored:scored.length,mean:scored.length?scored.reduce((n,a)=>n+a.score,0)/scored.length:null,academic:analyses.filter(a=>a.reasons.some(r=>r.category==='academic')).length,placement:analyses.filter(a=>a.reasons.some(r=>r.category==='placement')).length,review:analyses.filter(a=>a.reasons.length).length,incomplete:analyses.filter(a=>!a.complete).length,segments};
}
export function defaultNarrative(a){
 if(!a.version||a.risk==='Unconfigured')return 'Scoring rules are awaiting approval. Your recorded indicators remain available for review.';
 if(a.available===0)return 'There is not enough recorded data yet. Add source records before drawing conclusions.';
 if(!a.complete)return 'Some records are missing. Available indicators can support a conversation, but a complete success score cannot be calculated.';
 if(a.reasons.length)return `Some areas need improvement. ${a.reasons.map(r=>r.text).join(' ')} Discuss these areas with your faculty advisor; these flags are review aids, not predictions.`;
 return 'Good progress under the demo rules. Keep building consistent study habits and evidence of your skills; you can do even better. This does not guarantee placement or academic outcomes.';
}
