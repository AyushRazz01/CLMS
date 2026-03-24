import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(profiles ?? [])
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, university_id, branch, year, semester } = await request.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
      }
      throw error
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        full_name: name, 
        role: role ?? 'STUDENT', 
        university_id: university_id ?? null,
        branch: branch ?? null,
        year: year ? parseInt(year) : null,
        semester: semester ? parseInt(semester) : null
      })
      .eq('id', data.user.id)

    if (updateError) throw updateError

    return NextResponse.json({ id: data.user.id, email, name, role }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
