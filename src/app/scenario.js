// This compares raw measurements only; it is not a prediction or score model.
export function compareScenario(student, values) {
  const copy = structuredClone(student);
  const bounds = { attendance: 100, placement: 100, lms: 6 };
  for (const [id, max] of Object.entries(bounds)) {
    if (!Number.isInteger(values[id]) || values[id] < 0 || values[id] > max) throw new RangeError(`Invalid ${id} scenario`);
    copy.domains.find(d => d.id === id).value = values[id];
  }
  return Object.keys(bounds).map(id => {
    const baseline = student.domains.find(d => d.id === id);
    const scenario = copy.domains.find(d => d.id === id);
    return { id, name: baseline.name, baseline: baseline.value, scenario: scenario.value, delta: scenario.value - baseline.value, unit: baseline.unit };
  });
}

// Illustrative effort-response model; coefficients are assumptions, not learned causality.
export const effortFields=[['study','Focused study'],['attendance','Class participation'],['lms','Assignment practice'],['coding','Coding practice'],['projects','Project building'],['achievements','Competitions & achievements']];
export const defaultEffort=()=>Object.fromEntries(effortFields.map(([id])=>[id,0]));
export function simulateEffort(record,effort,config){
 const e=Object.fromEntries(effortFields.map(([key])=>{const value=effort[key]??0;if(!Number.isFinite(value)||value < -100||value > 100)throw new RangeError('Effort must be between -100 and 100');return [key,value/100];}));
 const clamp=(v,max)=>Math.max(0,Math.min(max,v));
 const overload=Math.max(0,Object.values(e).reduce((sum,v)=>sum+Math.max(0,v),0)-2)*3;
 const response=(value,max,change)=>typeof value!=='number'||!Number.isFinite(value)||value<0||value>max?null:clamp(value+(change>=0?(max-value)*(1-Math.exp(-1.5*change)):value*(Math.exp(change)-1))-overload*max/100,max);
 const attendance=response(record.attendance,100,.85*e.attendance+.15*e.study);
 const attendanceEffect=attendance===null?0:(attendance-record.attendance)/100;
 const lmsMarks=response(record.lmsMarks,100,.55*e.lms+.2*e.study+.15*e.attendance+.1*e.projects+attendanceEffect*.2);
 const lmsEffect=lmsMarks===null?0:(lmsMarks-record.lmsMarks)/100;
 const coding=response(record.coding,100,.6*e.coding+.25*e.projects+.1*e.study+.05*e.achievements+lmsEffect*.15);
 const cgpa=response(record.cgpa,10,.5*e.study+.2*e.lms+.1*e.attendance+.1*e.projects+.1*e.achievements+attendanceEffect*.2+lmsEffect*.25);
 const round=v=>v===null?null:Math.round(v*100)/100;
 return {record:{...record,cgpa:round(cgpa),attendance:round(attendance),lmsMarks:round(lmsMarks),coding:round(coding)},overload,effort:e};
}
