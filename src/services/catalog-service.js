import {setRoleTemplates} from '../data/demo-student.js';
export const catalog={roles:[],degrees:[],programs:[],subjects:[]};
export async function loadCatalog(client){
 if(!catalog.roles.length){
  const {data,error}=await client.from('campus_catalog').select('payload').eq('slug','default').single();
  if(error||!data?.payload?.roles?.length)throw new Error('The campus catalog could not be loaded. Please retry.');
  Object.assign(catalog,data.payload);
 }
 setRoleTemplates(catalog.roles);return catalog;
}
export function validateEducation(values){
 const year=Number(values.year),semester=Number(values.semester);
 if(!values.name?.trim()||values.name.length>80||!values.program?.trim()||values.program.length>120||!values.degree?.trim()||values.degree.length>80||!values.batch?.trim()||values.batch.length>40||!Number.isInteger(year)||year<1||year>10||!Number.isInteger(semester)||semester<1||semester>20)return 'Enter your name, degree, course, batch, year (1–10) and semester (1–20).';
 return null;
}
