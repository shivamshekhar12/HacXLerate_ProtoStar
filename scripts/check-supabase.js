import { loadEnv } from 'vite';
import { readSupabaseConfig } from '../src/services/supabase/config.js';
import { checkSupabaseConnection } from '../src/services/supabase/connection.js';
try {
  const config = readSupabaseConfig(loadEnv('development', process.cwd(), 'VITE_'));
  const result = await checkSupabaseConnection(config);
  if (!result.connected) {
    console.error(`Supabase connection check failed: ${result.reason}${result.status ? ` (HTTP ${result.status})` : ''}.`);
    process.exitCode = 1;
  } else console.log(`Supabase public API connection verified (HTTP ${result.status}). No tables were modified.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
