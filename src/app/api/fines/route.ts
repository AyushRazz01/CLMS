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
        user:user_id ( id, full_name, email, role )
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

export async function POST(request: NextRequest) {
  try {
    const { userId, borrowRecordId, amount, reason } = await request.json()
    const supabase = createAdminClient()

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: fine, error } = await supabase
      .from('fines')
      .insert({
        user_id: userId,
        borrow_record_id: borrowRecordId || null,
        amount,
        reason: reason || 'Overdue fine',
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) throw error

    // Create a notification for the student
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'New Fine Issued',
      message: `A fine of $${amount} has been issued: ${reason || 'Overdue fine'}.`,
      type: 'ALERT'
    })

    return NextResponse.json(fine, { status: 201 })
  } catch (error: any) {
    console.error('Fine creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create fine' }, { status: 500 })
  }
}
