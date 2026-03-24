import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const supabase = createAdminClient()

    let query = supabase
      .from('borrow_records')
      .select(`
        *,
        profiles:user_id ( id, full_name, email, role ),
        books:book_id ( id, title, author )
      `)
      .order('borrow_date', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: records, error } = await query
    if (error) throw error

    return NextResponse.json(records ?? [])
  } catch (error) {
    console.error('Issues fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, bookId } = await request.json()

    if (!userId || !bookId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check book availability
    const { data: book, error: bookErr } = await supabase
      .from('books')
      .select('id, available_copies')
      .eq('id', bookId)
      .single()

    if (bookErr || !book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    if (book.available_copies === 0) return NextResponse.json({ error: 'No copies available' }, { status: 400 })

    // Check active borrow limit
    const { data: active } = await supabase
      .from('borrow_records')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'BORROWED')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
    
    // Limits: Staff 10, Faculty 5, Student 3
    let limit = 3
    if (profile?.role === 'ADMIN' || profile?.role === 'LIBRARIAN') limit = 10
    else if (profile?.role === 'FACULTY') limit = 5
    
    if ((active?.length ?? 0) >= limit) {
      return NextResponse.json({ error: `You have reached your borrow limit of ${limit} books` }, { status: 400 })
    }

    // Due date: 14 days for students, 30 days for staff/faculty
    const daysToAdd = (profile?.role === 'STUDENT') ? 14 : 30
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + daysToAdd)

    // Create borrow record
    const { data: record, error: recErr } = await supabase
      .from('borrow_records')
      .insert({ 
        user_id: userId, 
        book_id: bookId, 
        due_date: dueDate.toISOString(), 
        status: 'BORROWED' 
      })
      .select()
      .single()

    if (recErr) throw recErr

    // Decrement available_copies
    const { error: updateErr } = await supabase
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', bookId)

    if (updateErr) throw updateErr

    return NextResponse.json({ message: 'Book issued successfully', issue: record })
  } catch (error) {
    console.error('Issue book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
