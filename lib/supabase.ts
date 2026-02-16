import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('⚠️  SUPABASE CONFIGURATION ERROR')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('')
  console.error('Required environment variables are missing:')
  if (!supabaseUrl) console.error('  ❌ NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) console.error('  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('')
  console.error('To fix this:')
  console.error('  1. For local development: Create a .env.local file')
  console.error('  2. For deployment: Set environment variables in your hosting platform')
  console.error('  3. Get your credentials from: https://supabase.com/dashboard/project/_/settings/api')
  console.error('')
  console.error('See .env.example for required variable names and format.')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('')
}

// Create Supabase client with fallback values to prevent Header errors
// When credentials are invalid, database operations will fail gracefully with clear error messages
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
