const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const students = [
  { email: 'test123@gmail.com', password: 'test123', name: 'Test Student' },
  { email: 'joy123@gmail.com', password: 'joy123', name: 'Joy' },
  { email: 'dilip45@gmail.com', password: 'dilip45', name: 'Dilip' },
  { email: 'sandy967@gmail.com', password: 'sandy967', name: 'Sandy' }
]

async function seed() {
  for (const student of students) {
    console.log(`Registering ${student.email}...`)
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: student.email,
      password: student.password,
      email_confirm: true,
      user_metadata: { 
        full_name: student.name,
        role: 'STUDENT'
      }
    })

    if (createError) {
      if (createError.message.includes('already registered')) {
        console.log(`${student.email} already exists.`)
      } else {
        console.error(`Error creating ${student.email}:`, createError.message)
      }
      continue
    }

    console.log(`Registered ${student.email} successfully (ID: ${userData.user.id})`)
  }
}

seed()
