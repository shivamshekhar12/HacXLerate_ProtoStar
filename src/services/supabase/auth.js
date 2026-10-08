export const roles = ['student', 'faculty', 'recruiter'];
export const roleHome = role => ({student:'overview',faculty:'faculty',recruiter:'recruiter',management:'management'}[role]);
export function authErrorMessage(error) {
  if (error?.code === 'over_email_send_rate_limit') return 'Confirmation email could not be sent because the project has reached its email limit. Please try later or contact the project team. If you already confirmed your account, use Sign in.';
  if (error?.code === 'email_not_confirmed') return 'Confirm your email address before signing in.';
  if (error?.status === 429 || error?.code === 'over_request_rate_limit') return 'Too many attempts. Wait a moment and try again.';
  if (error?.name === 'AuthRetryableFetchError' || error?.status >= 500) return 'We couldn’t reach the sign-in service. Try again shortly.';
  return 'We couldn’t sign you in. Check your email and password, then try again.';
}
export async function accountForUser(client,user) {
  const {data,error}=await client.from('profiles').select('role,requested_role').eq('id',user.id).single();
  if(error)throw new Error('Could not verify campus account access.');
  return {user,role:roles.includes(data.role)?data.role:null,requestedRole:data.requested_role};
}
export async function verifyCurrentAccount(client) {
  if (!client) return null;
  // A stored session is only a hint; getUser verifies identity with Supabase.
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError || !sessionData.session) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return accountForUser(client,data.user);
}
export async function signInAccount(client, email, password, selectedRole) {
  if (!client) return { error:'Sign-in is not configured yet. You can explore the demo preview.' };
  if (!roles.includes(selectedRole) && selectedRole!=='management') return { error:'Choose a valid workspace.' };
  const { error } = await client.auth.signInWithPassword({ email:email.trim(), password });
  if (error) return { error:authErrorMessage(error) };
  const { data, error: verificationError } = await client.auth.getUser();
  if(verificationError||!data.user)return {error:'Could not verify your account. Please try again.'};
  if(selectedRole==='management'){
    const permission=await client.rpc('can_manage_accounts');
    if(permission.error||!permission.data){await client.auth.signOut({scope:'local'});return {error:'This account is not authorized for account management.'};}
    return {account:{user:data.user,role:'management'}};
  }
  const account=await accountForUser(client,data.user);
  const role=account.role;
  if (!role || role !== selectedRole) {
    await client.auth.signOut({scope:'local'});
    return { error: role ? 'This account belongs to a different workspace. Choose your assigned role and sign in again.' : 'Your account has no assigned campus role yet. Ask your campus coordinator to finish account setup.' };
  }
  return { account };
}

export async function signUpAccount(client,{email,password,name,role}) {
  if(!client)return {error:'Sign-up is not configured.'};
  if(!roles.includes(role)||!name.trim()||name.trim().length>80||password.length<8)return {error:'Check your name, role, and password (at least 8 characters).'};
  const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim(),requested_role:role},emailRedirectTo:window.location.origin+window.location.pathname}});
  if(error){
    if(error.code==='over_email_send_rate_limit')return {error:authErrorMessage(error)};
    if(error.code==='email_address_not_authorized')return {error:'Email delivery is restricted in this Supabase project. Ask the project owner to configure SMTP.'};
    if(error.code==='weak_password')return {error:'Choose a stronger password, following the project password requirements.'};
    return {error:error.status===429||error.status>=500?authErrorMessage(error):'We couldn’t create the account. Check your details and try again.'};
  }
  if(data.session){return {account:await accountForUser(client,data.user)};}
  return {confirmation:true};
}
