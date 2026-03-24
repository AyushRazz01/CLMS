import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('borrow_records')
      .select(`
        *,
        profiles:user_id ( id, full_name, email, role ),
        books:book_id ( id, title, author )
      `)
      .eq('status', 'BORROWED')
      .lt('due_date', now)
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Error fetching overdue issues:', error)
    return NextResponse.json({ error: 'Failed to fetch overdue issues' }, { status: 500 })
  }
}
