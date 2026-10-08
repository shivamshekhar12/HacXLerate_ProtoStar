import test from 'node:test';
import assert from 'node:assert/strict';
import { accountForUser,verifyCurrentAccount,signInAccount,signUpAccount,authErrorMessage } from '../src/services/supabase/auth.js';
const user=role=>({id:'sample-id',app_metadata:{role},user_metadata:{role:'faculty'}});
function mockClient(account){
  const calls=[];
  return {calls,from:()=>({select:()=>({eq:()=>({single:async()=>({data:{role:account.app_metadata.role,requested_role:'student'},error:null})})})}),rpc:async()=>({data:false}),auth:{
    getSession:async()=>({data:{session:{user:account}}}),
    getUser:async()=>({data:{user:account},error:null}),
    signInWithPassword:async v=>{calls.push(['login',v]);return {error:null};},
    signOut:async v=>{calls.push(['logout',v]);return {error:null};},
  }};
}
test('database role wins over user-editable and app metadata claims',async()=>{
 const account={id:'sample-id',user_metadata:{role:'faculty'},app_metadata:{role:'faculty'}};
 const c=mockClient(account);
 c.from=()=>({select:()=>({eq:()=>({single:async()=>({data:{role:'student',requested_role:'student'}})})})});
 assert.equal((await accountForUser(c,account)).role,'student');
 c.from=()=>({select:()=>({eq:()=>({single:async()=>({data:{role:'admin',requested_role:'student'}})})})});
 assert.equal((await accountForUser(c,account)).role,null);
});
test('sign-in verifies the account and keeps password whitespace intact',async()=>{
  const c=mockClient(user('student'));
  const result=await signInAccount(c,' student@example.test ',' password ','student');
  assert.equal(result.account.role,'student');
  assert.deepEqual(c.calls[0],['login',{email:'student@example.test',password:' password '}]);
});
test('wrong workspace and unprovisioned roles fail closed and sign out locally',async()=>{
  for(const role of ['student',undefined]){
    const c=mockClient(user(role));const result=await signInAccount(c,'sample@example.test','sample-password','faculty');
    assert.ok(result.error);assert.equal(result.account,undefined);
    assert.deepEqual(c.calls.at(-1),['logout',{scope:'local'}]);
  }
});
test('session restoration requires server-verified identity rather than cached user data',async()=>{
  const c=mockClient(user('student'));
  c.auth.getSession=async()=>({data:{session:{user:user('faculty')}}});
  assert.equal((await verifyCurrentAccount(c)).role,'student');
  c.auth.getUser=async()=>({data:{user:null},error:{message:'invalid token'}});
  assert.equal(await verifyCurrentAccount(c),null);
});
test('authentication errors use safe copy and preserve rate-limit meaning',()=>{
  assert.ok(authErrorMessage({status:429}).includes('Too many attempts'));
  assert.ok(authErrorMessage({code:'email_not_confirmed'}).includes('Confirm'));
  assert.ok(!authErrorMessage({message:'database secrets here'}).includes('secrets'));
});

test('production signup requests the exact HTTPS confirmation destination without router hash',async()=>{
 const previous=globalThis.window;let request;
 globalThis.window={location:{origin:'https://protostar-campus.vercel.app',pathname:'/',hash:'#/signup'}};
 try{
  const client={auth:{signUp:async input=>{request=input;return {data:{session:null,user:{id:'new-user'}},error:null};}}};
  assert.deepEqual(await signUpAccount(client,{email:'student@example.test',password:'test-password',name:'Student',role:'student'}),{confirmation:true});
  assert.equal(request.options.emailRedirectTo,'https://protostar-campus.vercel.app/');
  assert.doesNotMatch(request.options.emailRedirectTo,/localhost|#\/signup/);
 }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
