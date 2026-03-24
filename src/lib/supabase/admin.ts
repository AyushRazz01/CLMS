import { createClient as createBrowserClientBase } from '@supabase/supabase-js'
import type { Database } from '../../../database.types'

/**
 * Supabase admin client — bypasses RLS via service role key.
 * Falls back to anon key if service role key is not set (limited access).
 * ONLY for server-side use. NEVER import this in client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Use service role key if available, otherwise fall back to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClientBase<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

