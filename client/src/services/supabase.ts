// client/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Inicializa cliente Supabase lendo as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação de erro caso faltem variáveis de ambiente do .env
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase no .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);