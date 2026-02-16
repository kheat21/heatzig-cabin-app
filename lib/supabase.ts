import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment')
  console.error('Check your Vercel project settings or .env.local file')
}

// Provide fallback empty strings to prevent undefined from being passed to headers
// This prevents the "Failed to execute 'set' on 'Headers': Invalid value" error
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)
