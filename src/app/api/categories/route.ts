import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, created_at')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ categories: categories ?? [] })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
