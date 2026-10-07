import { escapeHtml as e } from '../../components/ui.js';
export function renderManagement() {
 return `<main id="main" class="management-page" tabindex="-1"><a href="#/login" class="login-brand">Smart Campus</a><div class="page-heading"><div><p class="eyebrow">AUTHORIZED ACCOUNT DIRECTORY</p><h1>Account management</h1><p>Real registrations and synthetic preview accounts are listed separately.</p></div><button class="button secondary" id="management-exit">Sign out</button></div><section class="panel"><h2>Real accounts</h2><form id="account-search"><label for="directory-search">Search name or email</label><div class="button-row"><input id="directory-search" maxlength="100" type="search"/><button class="button">Search</button></div></form><p id="directory-status" role="status"></p><div id="directory-results"></div><div class="button-row"><button class="button secondary" id="directory-previous">Previous</button><span id="directory-page"></span><button class="button secondary" id="directory-next">Next</button></div></section><section class="panel"><h2>Synthetic ghost accounts</h2><p>Preview fillers only. These do not have passwords or real Auth identities.</p><div id="ghost-accounts"></div></section></main>`;
}
export function accountRows(rows) {
 return rows.length?`<div class="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Workspace</th><th>Email status</th><th>Registered</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${e(r.display_name||'Not supplied')}</td><td>${e(r.email)}</td><td>${e(r.role||`${r.requested_role} · pending approval`)}</td><td>${r.email_confirmed?'Confirmed':'Unconfirmed'}</td><td>${e(new Date(r.created_at).toLocaleDateString())}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state"><h3>No matching accounts</h3><p>New registrations will appear here.</p></div>';
}
export async function bindManagement(client,onExit) {
 let page=0,search='',request=0;
 const status=document.querySelector('#directory-status'),results=document.querySelector('#directory-results');
 async function load(){
  const version=++request;status.textContent='Loading accounts…';
  document.querySelector('#directory-previous').disabled=true;document.querySelector('#directory-next').disabled=true;
  const {data,error}=await client.rpc('list_campus_accounts',{search_text:search,page_number:page});
  if(version!==request||!results.isConnected)return;
  if(error){status.textContent='Could not load the directory. Confirm your authorized account and try again.';results.innerHTML='';return;}
  status.textContent=`${data.length} accounts on this page`;results.innerHTML=accountRows(data);document.querySelector('#directory-page').textContent=`Page ${page+1}`;
  document.querySelector('#directory-previous').disabled=page===0;document.querySelector('#directory-next').disabled=data.length<25;
 }
 document.querySelector('#account-search').addEventListener('submit',event=>{event.preventDefault();search=document.querySelector('#directory-search').value.trim();page=0;load();});
 document.querySelector('#directory-previous').addEventListener('click',()=>{page=Math.max(0,page-1);load();});
 document.querySelector('#directory-next').addEventListener('click',()=>{page++;load();});
 document.querySelector('#management-exit').addEventListener('click',onExit);
 await load();
 const {data,error}=await client.from('demo_workspaces').select('payload').eq('slug','aaman').single();
 const ghosts=document.querySelector('#ghost-accounts');
 if(ghosts)ghosts.innerHTML=error?'<p>Preview unavailable.</p>':`<ul>${data.payload.cohort.map(x=>`<li>${e(x.name)} · ${e(x.id)} · Synthetic</li>`).join('')}</ul>`;
}
