import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcuwnujdrbalpmfajzvc.supabase.co';
const supabaseAnonKey = 'sb_publishable_rz3hrYx2BKBRgSm7t_c2Vg_cF6fEPCa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);