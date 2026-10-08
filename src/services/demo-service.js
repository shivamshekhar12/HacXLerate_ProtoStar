import { getSupabaseClient } from './supabase/client.js';
import { loadDemo } from './student-service.js';
export async function loadDemoStudent(){return (await loadDemo(getSupabaseClient())).student;}
