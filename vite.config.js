import { defineConfig, loadEnv } from 'vite';
import { readSupabaseConfig } from './src/services/supabase/config.js';
export default defineConfig(({ mode }) => {
  // Fail before bundling if a privileged/malformed key was entered in public config.
  readSupabaseConfig(loadEnv(mode, process.cwd(), 'VITE_'));
  return {};
});
