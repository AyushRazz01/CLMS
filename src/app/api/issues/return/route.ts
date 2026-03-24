import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json()

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get borrow record with book info
    const { data: record, error: fetchErr } = await supabase
      .from('borrow_records')
      .select('*, books:book_id(id, available_copies)')
      .eq('id', issueId)
      .single()

    if (fetchErr || !record) {
      return NextResponse.json({ error: 'Borrow record not found' }, { status: 404 })
    }

    // Update record to RETURNED
    const { data: updated, error: updateErr } = await supabase
      .from('borrow_records')
      .update({ return_date: new Date().toISOString(), status: 'RETURNED' })
      .eq('id', issueId)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Increment available_copies on the book
    const book = record.books as any
    if (book) {
      await supabase
        .from('books')
        .update({ available_copies: book.available_copies + 1 })
        .eq('id', book.id)
    }

    return NextResponse.json({ message: 'Book returned successfully', issue: updated })
  } catch (error) {
    console.error('Return book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
