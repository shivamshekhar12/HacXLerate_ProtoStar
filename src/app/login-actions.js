import { signInAccount, signUpAccount, roleHome } from '../services/supabase/auth.js';
import { authState,setDemo } from './auth-state.js';
import { icon } from '../components/ui.js';
export function bindLogin(client, onAccount) {
  const form=document.querySelector('#login-form');
  const signup=form.dataset.mode==='signup',management=form.dataset.mode==='management';
  const message=document.querySelector('#login-error');
  const email=form.elements.email,password=form.elements.password;
  const resetErrors=()=>{message.hidden=true;message.textContent='';message.classList.remove('login-success');for(const field of [email,password]){field.removeAttribute('aria-invalid');document.querySelector(`#${field.id==='login-email'?'email':'password'}-error`).textContent='';}};
  const label=()=>management?'Sign in to manage accounts':signup?`Create ${form.elements.role.value[0].toUpperCase()+form.elements.role.value.slice(1)} account`:`Sign in as ${form.elements.role.value[0].toUpperCase()+form.elements.role.value.slice(1)}`;
  form.addEventListener('change',()=>{if(!authState.busy){document.querySelector('#login-button-label').textContent=label();resetErrors();}});
  form.addEventListener('input',event=>{if(event.target===email||event.target===password)event.target.removeAttribute('aria-invalid');});
  document.querySelector('.password-toggle').addEventListener('click',event=>{
    const show=password.type==='password';password.type=show?'text':'password';
    event.currentTarget.setAttribute('aria-label',show?'Hide password':'Show password');event.currentTarget.setAttribute('aria-pressed',String(show));event.currentTarget.innerHTML=icon(show?'visibility_off':'visibility');
  });
  document.querySelector('#demo-preview').addEventListener('click',()=>{if(authState.busy)return;password.value='';setDemo(true);location.hash='#/overview';});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(authState.busy)return;resetErrors();
    if(signup&&!form.elements.displayName.value.trim()){document.querySelector('#name-error').textContent='Enter your name.';form.elements.displayName.focus();return;}
    if(signup)document.querySelector('#name-error').textContent='';
    if(!email.value.trim()||!email.validity.valid){email.setAttribute('aria-invalid','true');document.querySelector('#email-error').textContent='Enter a valid email address.';email.focus();return;}
    if(!password.value || (signup&&password.value.length<8)){password.setAttribute('aria-invalid','true');document.querySelector('#password-error').textContent=signup?'Use at least 8 characters.':'Enter your password.';password.focus();return;}
    const selectedRole=form.elements.role.value;
    authState.busy=true;form.setAttribute('aria-busy','true');
    form.querySelectorAll('input,button').forEach(x=>x.disabled=true);document.querySelector('#demo-preview').disabled=true;
    document.querySelector('#login-button-label').textContent='Signing in…';document.querySelector('#login-status').textContent='Signing in. Please wait.';
    try {
      const result=signup?await signUpAccount(client,{email:email.value,password:password.value,name:form.elements.displayName.value,role:selectedRole}):await signInAccount(client,email.value,password.value,selectedRole);
      password.value='';
      if(result.error){message.textContent=result.error;message.hidden=false;}
      else if(result.confirmation){message.textContent='Check your email for a confirmation link, then return here to sign in. If this email is already registered, use Sign in.';message.hidden=false;message.classList.add('login-success');}
      else {setDemo(false);onAccount(result.account);location.hash='#/'+(roleHome(result.account.role)??'pending');}
    } catch {password.value='';message.textContent='We couldn’t reach the sign-in service. Please try again.';message.hidden=false;}
    finally {
      authState.busy=false;
      if(form.isConnected){form.removeAttribute('aria-busy');form.querySelectorAll('input,button').forEach(x=>x.disabled=false);if(!client)form.querySelector('[type=submit]').disabled=true;document.querySelector('#demo-preview').disabled=false;document.querySelector('#login-button-label').textContent=label();document.querySelector('#login-status').textContent=message.hidden?'Sign-in complete.':'Sign-in unsuccessful.';}
    }
  });
}
