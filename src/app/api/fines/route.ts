import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const supabase = createAdminClient()

    let query = supabase
      .from('fines')
      .select(`
        *,
        profiles:user_id ( id, full_name, email, role )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: fines, error } = await query
    if (error) throw error

    return NextResponse.json(fines ?? [])
  } catch (error) {
    console.error('Fines fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
