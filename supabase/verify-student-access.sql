begin;
-- Every test identity and write below is rolled back; no test Auth account survives.
select set_config('test.student_a',gen_random_uuid()::text,true),set_config('test.student_b',gen_random_uuid()::text,true),set_config('test.staff',gen_random_uuid()::text,true),set_config('test.manager',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data)
values
(current_setting('test.student_a')::uuid,current_setting('test.student_a')||'@example.invalid',now(),'{"requested_role":"student","display_name":"Access test A"}','{}'),
(current_setting('test.student_b')::uuid,current_setting('test.student_b')||'@example.invalid',now(),'{"requested_role":"student","display_name":"Access test B"}','{}'),
(current_setting('test.staff')::uuid,current_setting('test.staff')||'@example.invalid',now(),'{"requested_role":"faculty","role":"faculty"}','{}'),
(current_setting('test.manager')::uuid,current_setting('test.manager')||'@example.invalid',now(),'{"requested_role":"student"}','{}');
insert into campus_private.account_managers(email) values(current_setting('test.manager')||'@example.invalid');
do $$ begin
 if not exists(select 1 from public.students where profile_id=current_setting('test.student_a')::uuid and jsonb_array_length(portfolio->'skills')=0 and jsonb_array_length(portfolio->'projects')=0 and goal is null and year=0 and program='') then raise exception 'Fresh student defaults failed';end if;
 if not exists(select 1 from public.profiles where id=current_setting('test.staff')::uuid and role is null) then raise exception 'Staff escalation protection failed';end if;
end; $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.student_a'),'role','authenticated')::text,true);
do $$ declare n integer; begin
 select count(*) into n from public.students;if n<>1 then raise exception 'Self-only read failed';end if;
 update public.students set program='Persistence test',degree='Custom degree',batch='2026-A',year=8,semester=16,target_role='Custom career',goal='{"text":"First real goal","status":"planned"}' where profile_id=current_setting('test.student_a')::uuid;
 if not exists(select 1 from public.students where program='Persistence test' and degree='Custom degree' and batch='2026-A' and year=8 and semester=16 and target_role='Custom career' and revision=1) then raise exception 'Owned save failed';end if;
 update public.students set program='Forbidden' where profile_id=current_setting('test.student_b')::uuid;
 get diagnostics n=row_count;if n<>0 then raise exception 'Cross-account update allowed';end if;
 begin update public.profiles set role='faculty';raise exception 'Role modification allowed';exception when insufficient_privilege then null;end;
 begin update public.student_measurements set subject_records='[]';raise exception 'Measurement modification allowed';exception when insufficient_privilege then null;end;
 begin perform public.server_gemini_secret();raise exception 'User secret readable';exception when insufficient_privilege then null;end;
 begin perform public.set_demo_policy('{}');raise exception 'Ordinary policy update allowed';exception when insufficient_privilege then null;end;
 if public.can_manage_accounts() then raise exception 'Ordinary user can manage';end if;
 begin perform * from public.list_campus_accounts();raise exception 'Ordinary user can list accounts';exception when insufficient_privilege then null;end;
end; $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.manager'),'role','authenticated')::text,true);
do $$ begin
 perform public.set_demo_policy('{"approved":true,"weights":{"cgpa":40,"attendance":20,"lmsMarks":20,"coding":20},"thresholds":{"cgpa":6,"attendance":75,"lmsMarks":50,"coding":50},"strongAcademic":8}');
 if not exists(select 1 from public.demo_workspaces where payload->'analyticsConfig'->'weights'->>'cgpa'='40') then raise exception 'Manager policy edit failed';end if;
 if not public.can_manage_accounts() then raise exception 'Manager permission failed';end if;
 if not exists(select 1 from public.list_campus_accounts('Access test') where display_name='Access test A') then raise exception 'Manager directory failed';end if;
end; $$;
reset role;
set local role anon;
do $$ begin
 if not exists(select 1 from public.campus_catalog where slug='default') then raise exception 'Public catalog unavailable';end if;
 begin update public.campus_catalog set payload='{}';raise exception 'Public catalog writable';exception when insufficient_privilege then null;end;
 if not exists(select 1 from public.demo_workspaces where slug='aaman') then raise exception 'Public preview unavailable';end if;
 begin perform * from public.students;raise exception 'Public student data readable';exception when insufficient_privilege then null;end;
 begin perform * from public.list_campus_accounts();raise exception 'Public directory readable';exception when insufficient_privilege then null;end;
end; $$;
reset role;
select 'passed: fresh defaults, staff request, own read/write, cross-account denial, immutable roles/measurements, manager directory, public demo isolation' as verification;
rollback;
