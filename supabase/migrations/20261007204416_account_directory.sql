create table campus_private.account_managers (
 email text primary key check (email=lower(email))
);
alter table campus_private.account_managers enable row level security;
revoke all on campus_private.account_managers from public,anon,authenticated;
insert into campus_private.account_managers(email) values('shivamshekhar8709@gmail.com');
create function public.can_manage_accounts() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users u join campus_private.account_managers m on m.email=lower(u.email) where u.id=(select auth.uid()) and u.email_confirmed_at is not null);
$$;
revoke all on function public.can_manage_accounts() from public,anon;
grant execute on function public.can_manage_accounts() to authenticated;
create function public.list_campus_accounts(search_text text default '',page_number integer default 0)
returns table(id uuid,display_name text,email text,role text,requested_role text,email_confirmed boolean,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_accounts() then raise exception 'Account directory access denied' using errcode='42501'; end if;
 return query select p.id,coalesce(s.display_name,left(u.raw_user_meta_data->>'display_name',80),''),u.email::text,p.role,p.requested_role,u.email_confirmed_at is not null,p.created_at
 from public.profiles p join auth.users u on u.id=p.id left join public.students s on s.profile_id=p.id
 where u.email ilike '%'||left(search_text,100)||'%' or coalesce(s.display_name,u.raw_user_meta_data->>'display_name','') ilike '%'||left(search_text,100)||'%'
 order by p.created_at desc,p.id limit 25 offset greatest(0,least(page_number,10000))*25;
end; $$;
revoke all on function public.list_campus_accounts(text,integer) from public,anon;
grant execute on function public.list_campus_accounts(text,integer) to authenticated;
