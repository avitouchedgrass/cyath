import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcljekdjzwdrywxryuli.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZbeKmY9Lnhlx77yRWHO2Ew_UZJ69m4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
