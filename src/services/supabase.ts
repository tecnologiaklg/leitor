import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua os valores abaixo pelas credenciais do seu projeto Supabase,
// ou configure em um arquivo .env como VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUBSTITUA_PELA_SUA_URL_DO_SUPABASE';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUBSTITUA_PELA_SUA_ANON_KEY_DO_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
