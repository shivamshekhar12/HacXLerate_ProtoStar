import {analyzeStudent,studentRecord,defaultNarrative} from './analytics.js';
export async function describeProgress(client,state){
 const fallback={text:defaultNarrative(analyzeStudent(studentRecord(state),state.analyticsConfig)),source:'fallback'};
 if(state.mode==='demo')return state.demoNarrative?{text:state.demoNarrative,source:'gemini'}:fallback;
 try{const {data,error}=await client.functions.invoke('describe-progress');if(error||typeof data?.text!=='string'||!data.text.trim()||data.text.length>1200||!['gemini','gemini-cached','fallback'].includes(data.source))return fallback;return {text:data.text,source:data.source};}catch{return fallback;}
}
