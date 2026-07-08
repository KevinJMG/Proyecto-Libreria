import { createClient } from '@supabase/supabase-js';

// ⚠️ TEMPORAL - Usando tus credenciales directamente
const supabaseUrl = 'https://opbfmhfutusghqrfcybc.supabase.co';
const supabaseKey = 'sb_publishable_CBclRGhi99HXUFJFj47VVQ_kBTj1IGs';

console.log('✅ Supabase client initialized with credentials');
console.log('URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);