import fs from 'node:fs';
import {analyzeStudent,defaultNarrative} from '../src/services/analytics.js';
const path=new URL('../supabase/seeds/demo-workspace.json',import.meta.url),p=JSON.parse(fs.readFileSync(path)),a=analyzeStudent(p.cohort[0],p.analyticsConfig);
let text=defaultNarrative(a),source='fallback';
try{
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL??'gemini-3.5-flash-lite'}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY??''},signal:AbortSignal.timeout(10000),body:JSON.stringify({systemInstruction:{parts:[{text:'Rewrite the supplied interpretation in supportive English, at most three sentences. Never calculate, invent evidence, or predict outcomes. Do not include digits. Explain the concrete improvement area. This is an illustrative synthetic demo.'}]},contents:[{parts:[{text:defaultNarrative(a)}]}],generationConfig:{maxOutputTokens:250}})});
 if(!response.ok)throw Error('Provider unavailable');
 const body=await response.json(),result=body.candidates?.[0]?.content?.parts?.map(x=>x.text??'').join('').trim();
 if(typeof result==='string'&&result.length>0&&result.length<=1200&&!/\d/.test(result)){text=result;source='gemini';}
}catch{/* No provider details or secrets are logged. */}
p.demoNarrative=source==='gemini'?text:null;
fs.writeFileSync(path,JSON.stringify(p,null,2)+'\n');
fs.writeFileSync(new URL('../supabase/seeds/demo-narrative.json',import.meta.url),JSON.stringify({text,source},null,2)+'\n');
console.log(JSON.stringify({source,characters:text.length}));
