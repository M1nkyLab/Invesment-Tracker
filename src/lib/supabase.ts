import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// This client is for server-side use only (e.g., in API routes or Server Actions)
// as it uses the service role key which bypasses RLS.
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);

// This client is for client-side or scoped server-side use (respects RLS)
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
