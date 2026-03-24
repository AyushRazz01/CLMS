import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const role = request.nextUrl.searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    let stats = { issuedBooks: 0, overdueBooks: 0, fines: 0, totalBooks: 0 }

    // Logic for Student or Faculty (Users who borrow books)
    if (role === 'STUDENT' || role === 'FACULTY') {
      const { data: active } = await supabase
        .from('borrow_records')
        .select('id, due_date, status')
        .eq('user_id', userId)
        .eq('status', 'BORROWED')

      stats.issuedBooks = active?.length ?? 0
      stats.overdueBooks = active?.filter(r => r.due_date < now).length ?? 0

      const { data: fines } = await supabase
        .from('fines')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'PENDING')

      stats.fines = fines?.reduce((sum, f) => sum + Number(f.amount), 0) ?? 0

    } 
    // Logic for Admin or Librarian (Staff who manage books)
    else if (role === 'ADMIN' || role === 'LIBRARIAN') {
      const { count: totalBooks } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
      stats.totalBooks = totalBooks ?? 0

      const { data: active } = await supabase
        .from('borrow_records')
        .select('id, due_date')
        .eq('status', 'BORROWED')

      stats.issuedBooks = active?.length ?? 0
      stats.overdueBooks = active?.filter(r => r.due_date < now).length ?? 0

      const { data: fines } = await supabase
        .from('fines')
        .select('amount')
        .eq('status', 'PENDING')

      stats.fines = fines?.reduce((sum, f) => sum + Number(f.amount), 0) ?? 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
