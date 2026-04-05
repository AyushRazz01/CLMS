import { NextRequest, NextResponse } from 'next/server'
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

    // Update fine status to paid
    const fine = await db.fine.update({
      where: { id: fineId },
      data: {
        status: 'PAID',
        paid_date: new Date()
      }
    })

    return NextResponse.json({
      message: 'Fine paid successfully',
      fine
    })

  } catch (error) {
    console.error('Fine payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
