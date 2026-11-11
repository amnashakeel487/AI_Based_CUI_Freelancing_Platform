/**
 * Supabase client for frontend authentication and data access.
 * Uses the anon key (safe for frontend) with RLS policies for security.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL loaded:', !!supabaseUrl, supabaseUrl?.substring(0, 30))
console.log('Anon key loaded:', !!supabaseAnonKey, supabaseAnonKey?.substring(0, 20))

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
