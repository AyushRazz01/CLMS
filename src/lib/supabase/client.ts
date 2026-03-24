import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../../database.types'

/**
 * Supabase browser client — use in Client Components ('use client')
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('books').select('*')
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
