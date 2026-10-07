// Public browser configuration only. Never include a service-role or secret key.
export function readSupabaseConfig(env = {}) {
  const url = (env.VITE_SUPABASE_URL ?? '').trim();
  const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  if (!url && !key) return { configured: false, url: null, key: null };
  if (!url || !key) throw new Error('Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('VITE_SUPABASE_URL must be a valid HTTPS project URL.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) throw new Error('Supabase requires HTTPS, except for local development.');
  if (parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) throw new Error('Use the Supabase project base URL without a path, query, or credentials.');
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) throw new Error('Use a public sb_publishable_ key. Secret and service-role keys are not allowed in this browser app.');
  return { configured: true, url: parsed.origin, key };
}
