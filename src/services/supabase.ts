import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua os valores abaixo pelas credenciais do seu projeto Supabase,
// ou configure em um arquivo .env como VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use a fallback dummy URL to prevent the app from crashing entirely if the user hasn't set it yet
const safeUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'https://dummy-project.supabase.co';

export const supabase = createClient(safeUrl, supabaseAnonKey);
