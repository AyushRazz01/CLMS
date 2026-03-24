import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Use SSR-friendly client to handle cookies
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Supabase login error:', error.message)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Use admin client to fetch profile (bypasses RLS so it always works)
    // Profile information is needed to determine the user's role and status
    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name ?? data.user.email,
        role: profile?.role ?? 'STUDENT',
        status: profile?.status ?? 'PENDING',
        university_id: profile?.university_id,
      },
      token: data.session.access_token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
