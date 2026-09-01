import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || 'https://mock-hotel-madadjeu.supabase.co';
const supabaseServiceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
