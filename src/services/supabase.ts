import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcpgaoojovmkjiapytca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcGdhb29qb3Zta2ppYXB5dGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzQwOTIsImV4cCI6MjA5NTY1MDA5Mn0.LEqNwcQ_YGQ8xOFVRMXTNxFtmW3Vjh5yMEKmsQoJS1U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
