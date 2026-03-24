import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const genre = searchParams.get('genre') // replaces 'category'
    const available = searchParams.get('available')

    const supabase = createAdminClient()

    let query = supabase
      .from('books')
      .select('*, categories(id, name)')
      .order('title', { ascending: true })

    if (genre && genre !== 'all') {
      query = query.eq('genre', genre)
    }

    if (available === 'true') {
      query = query.gt('available_copies', 0)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,genre.ilike.%${search}%`)
    }

    const { data: books, error } = await query

    if (error) throw error

    return NextResponse.json({ books: books ?? [] })
  } catch (error) {
    console.error('Books fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const { data: book, error } = await supabase
      .from('books')
      .insert({
        title: body.title,
        author: body.author,
        genre: body.genre ?? null,
        rating: body.rating ?? null,
        total_copies: body.total_copies ?? 1,
        available_copies: body.available_copies ?? body.total_copies ?? 1,
        description: body.description ?? null,
        cover_url: body.cover_url ?? null,
        summary: body.summary ?? null,
        category_id: body.category_id ?? null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('Book create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
