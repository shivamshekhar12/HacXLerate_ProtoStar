import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {analyzeStudent,defaultNarrative} from '../_shared/analytics.js';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const cache=new Map<string,{text:string,time:number}>();
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const header=req.headers.get('Authorization')??'';
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:header}},auth:{persistSession:false}});
 const {data:{user},error}=await client.auth.getUser(header.replace(/^Bearer /,''));
 if(error||!user)return reply({error:'Sign in required'},401);
 const {data:role}=await client.from('profiles').select('role').eq('id',user.id).single();
 if(role?.role!=='student')return reply({error:'Student workspace required'},403);
 const {data:metrics,error:readError}=await client.from('student_measurements').select('domains').eq('profile_id',user.id).single();
 if(readError)return reply({error:'Records unavailable'},503);
 const value=(id:string)=>metrics.domains.find((d:{id:string})=>d.id===id)?.value??null;
 const analysis=analyzeStudent({cgpa:value('academic'),attendance:value('attendance'),coding:value('placement'),lmsMarks:null},null);
 const fallback=defaultNarrative(analysis);
 const facts=analysis.factors.map((f:{label:string,value:number|null,max:number})=>({indicator:f.label,value:f.value,max:f.max}));
 const cacheKey=JSON.stringify(facts),previous=cache.get(cacheKey);
 if(previous&&Date.now()-previous.time<3600000)return reply({text:previous.text,source:'gemini-cached'});
 // At most one attempt per user per hour per warm instance; caching is a cost aid,
 // not a global rate limit. Gateway JWT + verified identity prevents public invocation.
 const attemptKey='attempt:'+user.id,attempt=cache.get(attemptKey);
 if(attempt&&Date.now()-attempt.time<3600000)return reply({text:fallback,source:'fallback'});
 cache.set(attemptKey,{text:'',time:Date.now()});
 try{
  const server=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const secret=Deno.env.get('GEMINI_API_KEY')||(await server.rpc('server_gemini_secret')).data;
  if(!secret)return reply({text:fallback,source:'fallback'});
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${Deno.env.get('GEMINI_MODEL')??'gemini-3.5-flash-lite'}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':secret},signal:AbortSignal.timeout(10000),body:JSON.stringify({systemInstruction:{parts:[{text:'Translate provided source indicators into supportive English in at most three short sentences. Never calculate, invent thresholds, diagnose risk, predict outcomes, or include digits. Missing evidence must be acknowledged. No institution-approved scoring rules exist. Do not infer achievements or personal traits.'}]},contents:[{parts:[{text:JSON.stringify(facts)}]}],generationConfig:{maxOutputTokens:250}})});
  if(!response.ok)throw new Error('Provider unavailable');
  const body=await response.json(),text=body.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text??'').join('').trim();
  if(typeof text!=='string'||!text.length||text.length>1200||/\d/.test(text))throw new Error('Unsupported narration');
  if(cache.size>1000)cache.clear();cache.set(cacheKey,{text,time:Date.now()});
  return reply({text,source:'gemini'});
 }catch{return reply({text:fallback,source:'fallback'});}
});
