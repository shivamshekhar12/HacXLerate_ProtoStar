export const authState = { account:null, checking:true, demo:false, busy:false };
const key='smart-campus:demo-preview';
export function demoEnabled() {
  try { return sessionStorage.getItem(key)==='enabled'; } catch { return authState.demo; }
}
export function setDemo(enabled) {
  authState.demo=enabled;
  try { if(enabled)sessionStorage.setItem(key,'enabled');else sessionStorage.removeItem(key); } catch { /* Session-only fallback. */ }
}
export function routeRole(name) {
  return name==='faculty'||name.startsWith('faculty/')?'faculty':name==='recruiter'||name.startsWith('recruiter/')?'recruiter':'student';
}
