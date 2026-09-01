import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://mock-hotel-madadjeu.supabase.co';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-madadjeu-2024';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
