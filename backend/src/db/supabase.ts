import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && (config.supabaseServiceKey || config.supabaseAnonKey)) {
  const key = config.supabaseServiceKey || config.supabaseAnonKey;
  supabaseClient = createClient(config.supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('[Supabase] Initialized Supabase client successfully');
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = Boolean(supabaseClient || config.databaseUrl);
