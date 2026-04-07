import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { is_read } = body

    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Ensure user can only mark their own notifications as read
    // or librarian/admin can do it (though usually students mark their own)
    const { data: notification, error: fetchErr } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchErr || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const userRole = user.user_metadata?.role || 'STUDENT'
    if (notification.user_id !== user.id && userRole !== 'LIBRARIAN' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
