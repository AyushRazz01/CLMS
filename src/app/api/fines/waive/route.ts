import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fineId } = body

    if (!fineId) {
      return NextResponse.json(
        { error: 'Fine ID is required' },
        { status: 400 }
      )
    }

    // Check permissions
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    const userRole = user?.user_metadata?.role || 'STUDENT'

    if (userRole !== 'LIBRARIAN' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only librarians can waive fines' }, { status: 403 })
    }

    // Update fine status to waived
    const fine = await db.fine.update({
      where: { id: fineId },
      data: {
        status: 'WAIVED'
      }
    })

    return NextResponse.json({
      message: 'Fine waived successfully',
      fine
    })

  } catch (error) {
    console.error('Fine waive error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
