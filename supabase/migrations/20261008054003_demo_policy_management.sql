create function campus_private.set_demo_policy(policy jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare key text; total numeric:=0; weight numeric; threshold numeric;
begin
 if not campus_private.can_manage_accounts() then raise insufficient_privilege;end if;
 if jsonb_typeof(policy)<>'object' or jsonb_typeof(policy->'approved')<>'boolean' then raise exception 'Invalid policy';end if;
 foreach key in array array['cgpa','attendance','lmsMarks','coding'] loop
  weight:=(policy->'weights'->>key)::numeric;threshold:=(policy->'thresholds'->>key)::numeric;
  if weight is null or weight<0 or weight>100 or threshold is null or threshold<0 or threshold>(case when key='cgpa' then 10 else 100 end) then raise exception 'Invalid policy values';end if;
  total:=total+weight;
 end loop;
 if total<>100 then raise exception 'Weights must total 100';end if;
 if (policy->>'strongAcademic')::numeric is null or (policy->>'strongAcademic')::numeric not between 0 and 10 then raise exception 'Invalid segment threshold';end if;
 update public.demo_workspaces set payload=jsonb_set(payload-'demoNarrative','{analyticsConfig}',jsonb_build_object('version','demo-v1','approved',policy->'approved','label','Illustrative demo rubric','weights',policy->'weights','thresholds',policy->'thresholds','strongAcademic',policy->'strongAcademic')) where slug='aaman';
end; $$;
revoke all on function campus_private.set_demo_policy(jsonb) from public,anon;
grant execute on function campus_private.set_demo_policy(jsonb) to authenticated;
create function public.set_demo_policy(policy jsonb) returns void language sql security invoker set search_path='' as $$select campus_private.set_demo_policy(policy);$$;
revoke all on function public.set_demo_policy(jsonb) from public,anon;
grant execute on function public.set_demo_policy(jsonb) to authenticated;
