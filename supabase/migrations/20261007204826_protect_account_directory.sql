alter function public.can_manage_accounts() set schema campus_private;
alter function public.list_campus_accounts(text,integer) set schema campus_private;
grant usage on schema campus_private to authenticated;
create function public.can_manage_accounts() returns boolean language sql stable security invoker set search_path='' as $$ select campus_private.can_manage_accounts(); $$;
create function public.list_campus_accounts(search_text text default '',page_number integer default 0)
returns table(id uuid,display_name text,email text,role text,requested_role text,email_confirmed boolean,created_at timestamptz)
language sql stable security invoker set search_path='' as $$ select * from campus_private.list_campus_accounts(search_text,page_number); $$;
revoke all on function public.can_manage_accounts(),public.list_campus_accounts(text,integer) from public,anon;
grant execute on function public.can_manage_accounts(),public.list_campus_accounts(text,integer) to authenticated;
-- No browser role may read the manager allowlist, even through schema access.
create policy no_direct_manager_access on campus_private.account_managers for all to authenticated using (false) with check(false);
