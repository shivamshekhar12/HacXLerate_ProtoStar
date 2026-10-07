import test from 'node:test';
import assert from 'node:assert/strict';
import { readSupabaseConfig } from '../src/services/supabase/config.js';
import { checkSupabaseConnection } from '../src/services/supabase/connection.js';
const env = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' };
test('unconfigured Supabase permits the demo and partial configuration is rejected', () => {
  assert.equal(readSupabaseConfig({}).configured, false);
  assert.throws(() => readSupabaseConfig({ VITE_SUPABASE_URL: env.VITE_SUPABASE_URL }));
});
test('public config rejects privileged and legacy keys without echoing their value', () => {
  for (const key of ['sb_secret_test', 'service_role', 'eyJ.fake.jwt']) {
    assert.throws(() => readSupabaseConfig({ ...env, VITE_SUPABASE_PUBLISHABLE_KEY: key }), error => !error.message.includes(key));
  }
  assert.equal(readSupabaseConfig(env).configured, true);
});
test('project URL rejects insecure remote URLs and embedded credentials', () => {
  for (const url of ['http://example.com', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?key=test']) {
    assert.throws(() => readSupabaseConfig({ ...env, VITE_SUPABASE_URL: url }));
  }
  assert.equal(readSupabaseConfig({ ...env, VITE_SUPABASE_URL: 'http://127.0.0.1:54321' }).configured, true);
});
test('connection check uses a read-only public endpoint and handles rejected keys', async () => {
  const config = readSupabaseConfig(env);
  const result = await checkSupabaseConnection(config, async (url, options) => {
    assert.equal(url, 'https://example.supabase.co/auth/v1/settings');
    assert.equal(options.headers.apikey, env.VITE_SUPABASE_PUBLISHABLE_KEY);
    assert.equal(options.method, undefined);
    return { ok: true, status: 200, json: async () => ({ external: {} }) };
  });
  assert.equal(result.connected, true);
  assert.deepEqual(await checkSupabaseConnection(config, async () => ({ ok: false, status: 401 })), { connected: false, reason: 'key_rejected', status: 401 });
});
test('connection failures are explicit and do not leak error details', async () => {
  const config = readSupabaseConfig(env);
  assert.deepEqual(await checkSupabaseConnection(config, async () => { throw Error('sensitive details'); }), { connected: false, reason: 'network_error' });
  assert.deepEqual(await checkSupabaseConnection(config, async () => ({ ok: true, json: async () => ({}) })), { connected: false, reason: 'unexpected_response' });
});
