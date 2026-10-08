-- Vault values are never included in migration source or public API responses.
create function campus_private.gemini_secret() returns text
language plpgsql security definer set search_path='' as $$
begin
 if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege; end if;
 return (select decrypted_secret from vault.decrypted_secrets where name='smart_campus_gemini');
end; $$;
revoke all on function campus_private.gemini_secret() from public,anon,authenticated;
grant usage on schema campus_private to service_role;
grant execute on function campus_private.gemini_secret() to service_role;
create function public.server_gemini_secret() returns text language sql security invoker set search_path='' as $$select campus_private.gemini_secret();$$;
revoke all on function public.server_gemini_secret() from public,anon,authenticated;
grant execute on function public.server_gemini_secret() to service_role;
