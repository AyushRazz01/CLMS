import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data: records, error } = await supabase
      .from('borrow_records')
      .select(`
        *,
        user:user_id ( id, full_name, email, role ),
        book:book_id ( id, title, author, isbn )
      `)
      .eq('status', 'BORROWED')
      .lt('due_date', now)
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(records ?? [])
  } catch (error) {
    console.error('Error fetching overdue issues:', error)
    return NextResponse.json({ error: 'Failed to fetch overdue issues' }, { status: 500 })
  }
}
