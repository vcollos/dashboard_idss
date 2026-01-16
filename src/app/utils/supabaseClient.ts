import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Singleton pattern to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (projectId ? `https://${projectId}.supabase.co` : '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Credenciais do Supabase ausentes. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Avoid multiple auth instances
        autoRefreshToken: false
      }
    });
  }
  return supabaseInstance;
};
