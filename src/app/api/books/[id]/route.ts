import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: book, error } = await supabase
      .from('books')
      .select('*, categories(id, name)')
      .eq('id', id)
      .single()

    if (error || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Book details fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    const { data: book, error } = await supabase
      .from('books')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Book update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ message: 'Book deleted' })
  } catch (error) {
    console.error('Book delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
