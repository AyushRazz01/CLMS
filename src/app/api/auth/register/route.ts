import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_ROLES = ['ADMIN', 'STUDENT', 'LIBRARIAN', 'FACULTY']

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, university_id, branch, year, semester } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resolvedRole = VALID_ROLES.includes(role) ? role : 'STUDENT'

    // Use admin client for creation and upsert as it bypasses RLS
    const adminClient = createAdminClient()

    let userId: string

    // Create user in Supabase Auth
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      }
      throw createError
    }

    userId = userData.user.id

    // Upsert profile with ALL fields
    const { error: upsertError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name,
        email,
        role: resolvedRole as any,
        university_id: university_id ?? null,
        branch: branch ?? null,
        year: year ? parseInt(year) : null,
        semester: semester ? parseInt(semester) : null,
        status: 'APPROVED', // Auto-approve for now based on previous app logic
      })

    if (upsertError) throw upsertError

    // Automatically sign in the user after registration so they have a session
    const supabase = await createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (loginError) {
      console.error('Post-registration login error:', loginError.message)
      // We don't fail registration if login fails, but they'll have to log in manually
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully.', 
        user: { id: userId, email, name, role: resolvedRole } 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
