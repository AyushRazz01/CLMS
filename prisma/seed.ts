import { PrismaClient } from '@prisma/client'
import { createAdminClient } from '../src/lib/supabase/admin'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Computer Science' },
      update: {},
      create: {
        name: 'Computer Science',
        description: 'Books related to programming, algorithms, and software development'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Books related to various engineering disciplines'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        description: 'Books on pure and applied mathematics'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Physics' },
      update: {},
      create: {
        name: 'Physics',
        description: 'Books on classical and modern physics'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Literature' },
      update: {},
      create: {
        name: 'Literature',
        description: 'Fiction, poetry, and literary works'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Management' },
      update: {},
      create: {
        name: 'Management',
        description: 'Books on business management and entrepreneurship'
      }
    })
  ])

  console.log(`Created ${categories.length} categories`)

  // Create books
  const books = [
    {
      isbn: '978-0134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      edition: '3rd',
      publisher: 'Addison-Wesley',
      published_year: 2017,
      total_copies: 5,
      available_copies: 5,
      rack_no: 'CS-101',
      category_id: categories[0].id,
      description: 'A comprehensive guide to Java programming best practices'
    },
    {
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      edition: '3rd',
      publisher: 'MIT Press',
      published_year: 2009,
      total_copies: 8,
      available_copies: 6,
      rack_no: 'CS-102',
      category_id: categories[0].id,
      description: 'The definitive introduction to algorithm design and analysis'
    },
    {
      isbn: '978-0131103627',
      title: 'The C Programming Language',
      author: 'Brian W. Kernighan',
      edition: '2nd',
      publisher: 'Prentice Hall',
      published_year: 1988,
      total_copies: 10,
      available_copies: 8,
      rack_no: 'CS-103',
      category_id: categories[0].id,
      description: 'The classic introduction to C programming'
    },
    {
      isbn: '978-0596007126',
      title: 'Head First Design Patterns',
      author: 'Eric Freeman',
      edition: '1st',
      publisher: "O'Reilly Media",
      published_year: 2004,
      total_copies: 6,
      available_copies: 6,
      rack_no: 'CS-104',
      category_id: categories[0].id,
      description: 'A brain-friendly guide to design patterns'
    },
    {
      isbn: '978-0201633610',
      title: 'Design Patterns',
      author: 'Erich Gamma',
      edition: '1st',
      publisher: 'Addison-Wesley',
      published_year: 1994,
      total_copies: 4,
      available_copies: 4,
      rack_no: 'CS-105',
      category_id: categories[0].id,
      description: 'Elements of Reusable Object-Oriented Software'
    },
    {
      isbn: '978-0073383095',
      title: 'Mechanical Engineering Design',
      author: 'Shigley',
      edition: '10th',
      publisher: 'McGraw-Hill',
      published_year: 2014,
      total_copies: 5,
      available_copies: 5,
      rack_no: 'ME-101',
      category_id: categories[1].id,
      description: 'Comprehensive guide to mechanical engineering design'
    },
    {
      isbn: '978-0073529267',
      title: 'Engineering Mechanics: Statics',
      author: 'J.L. Meriam',
      edition: '7th',
      publisher: 'Wiley',
      published_year: 2011,
      total_copies: 6,
      available_copies: 6,
      rack_no: 'ME-102',
      category_id: categories[1].id,
      description: 'Fundamentals of static mechanics'
    },
    {
      isbn: '978-0470458365',
      title: 'Advanced Engineering Mathematics',
      author: 'Erwin Kreyszig',
      edition: '10th',
      publisher: 'Wiley',
      published_year: 2011,
      total_copies: 7,
      available_copies: 7,
      rack_no: 'MATH-101',
      category_id: categories[2].id,
      description: 'Comprehensive mathematics for engineers'
    },
    {
      isbn: '978-0073529281',
      title: 'Engineering Mechanics: Dynamics',
      author: 'J.L. Meriam',
      edition: '7th',
      publisher: 'Wiley',
      published_year: 2012,
      total_copies: 5,
      available_copies: 5,
      rack_no: 'ME-103',
      category_id: categories[1].id,
      description: 'Fundamentals of dynamics in mechanics'
    },
    {
      isbn: '978-0716710883',
      title: 'The Feynman Lectures on Physics',
      author: 'Richard Feynman',
      edition: '2nd',
      publisher: 'Addison-Wesley',
      published_year: 2005,
      total_copies: 4,
      available_copies: 4,
      rack_no: 'PHY-101',
      category_id: categories[3].id,
      description: 'The classic physics lectures by Richard Feynman'
    },
    {
      isbn: '978-0132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      edition: '1st',
      publisher: 'Prentice Hall',
      published_year: 2008,
      total_copies: 6,
      available_copies: 6,
      rack_no: 'CS-106',
      category_id: categories[0].id,
      description: 'A handbook of agile software craftsmanship'
    },
    {
      isbn: '978-0321125217',
      title: 'Refactoring',
      author: 'Martin Fowler',
      edition: '2nd',
      publisher: 'Addison-Wesley',
      published_year: 2019,
      total_copies: 5,
      available_copies: 5,
      rack_no: 'CS-107',
      category_id: categories[0].id,
      description: 'Improving the design of existing code'
    },
    {
      isbn: '978-0061122415',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      edition: '1st',
      publisher: 'Harper Perennial',
      published_year: 2006,
      total_copies: 3,
      available_copies: 3,
      rack_no: 'LIT-101',
      category_id: categories[4].id,
      description: 'A classic American novel'
    },
    {
      isbn: '978-0451524935',
      title: '1984',
      author: 'George Orwell',
      edition: '1st',
      publisher: 'Signet Classic',
      published_year: 1950,
      total_copies: 4,
      available_copies: 4,
      rack_no: 'LIT-102',
      category_id: categories[4].id,
      description: 'A dystopian social science fiction novel'
    },
    {
      isbn: '978-1422124696',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      edition: '1st',
      publisher: 'Currency',
      published_year: 2011,
      total_copies: 5,
      available_copies: 5,
      rack_no: 'MGMT-101',
      category_id: categories[5].id,
      description: 'How Today\'s Entrepreneurs Use Continuous Innovation'
    }
  ]

  const createdBooks = await Promise.all(
    books.map(book =>
      prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book
      })
    )
  )

  console.log(`Created ${createdBooks.length} books`)

  // Create sample users via Supabase Auth Admin
  const adminClient = createAdminClient()
  const password = 'password123'

  const sampleUsers = [
    {
      email: 'admin@clms.edu',
      full_name: 'Admin User',
      role: 'ADMIN',
      university_id: 'ADMIN001'
    },
    {
      email: 'librarian@clms.edu',
      full_name: 'John Librarian',
      role: 'LIBRARIAN',
      university_id: 'LIB001'
    },
    {
      email: 'student@clms.edu',
      full_name: 'Jane Student',
      role: 'STUDENT',
      university_id: 'STU001',
      branch: 'CSE',
      year: 3,
      semester: 5
    },
    {
      email: 'faculty@clms.edu',
      full_name: 'Dr. Smith',
      role: 'FACULTY',
      university_id: 'FAC001',
      branch: 'CSE'
    }
  ]

  for (const user of sampleUsers) {
    const { email, full_name, ...metadata } = user
    
    console.log(`Creating/Seeding user: ${email}`)
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        ...metadata
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${email} already exists in auth.`)
      } else {
        console.error(`Error creating auth user ${email}:`, authError.message)
      }
    } else {
      console.log(`Successfully created auth user: ${email}`)
    }
  }

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
