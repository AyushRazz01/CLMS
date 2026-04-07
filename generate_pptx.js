const pptxgen = require('pptxgenjs')

let pres = new pptxgen()

// 1. Definition of Colors & Styles
const THEME = {
  primary: '2563EB',   // Blue
  secondary: '0F172A', // Slate
  accent: 'F8FAFC',    // Off-white
  text: '1E293B',      // Slate-800
  muted: '64748B',     // Slate-500
}

// 2. Default Master Slide Definition
pres.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: THEME.accent },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: THEME.primary } } },
    { text: { text: 'Smart CLMS | Technical Overview', options: { x: 0.5, y: 0.2, color: THEME.muted, fontSize: 10 } } },
    { text: { text: '© 2024 AYUSH RAJ', options: { x: 0.5, y: 5.4, color: THEME.muted, fontSize: 10 } } },
  ],
})

// --- SLIDE 1: TITLE ---
let slide1 = pres.addSlide()
slide1.background = { color: THEME.secondary }
slide1.addText('Smart CLMS', { x: 1, y: 1.5, w: 8, h: 1, fontSize: 54, bold: true, color: 'FFFFFF', align: 'center' })
slide1.addText('College Library Management System', { x: 1, y: 2.5, w: 8, h: 0.5, fontSize: 24, italic: true, color: THEME.primary, align: 'center' })
slide1.addText('Architecture, Features, and Technical Breakdown', { x: 1, y: 4.5, w: 8, h: 0.5, fontSize: 14, color: 'CBD5E1', align: 'center' })

// --- SLIDE 2: PROJECT OVERVIEW & PURPOSE ---
let slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide2.addText('Project Overview & Purpose', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })
slide2.addText('Modernizing the campus library experience.', { x: 0.5, y: 1.8, w: 9, h: 0.5, fontSize: 18, bold: true, color: THEME.text })
slide2.addText(
  [
    { text: '\u2022 Integrated Digital Operations: ', options: { bold: true } },
    { text: 'Eliminating paper-based book tracking for student efficiency.' },
    { text: '\n\u2022 Centralized Management: ', options: { bold: true } },
    { text: 'Unified control of circulation, book inventory, and user privileges.' },
    { text: '\n\u2022 Automated Financial Tracking: ', options: { bold: true } },
    { text: 'Dynamic calculation of fines and real-time status reporting.' },
    { text: '\n\u2022 Modern User Experience: ', options: { bold: true } },
    { text: 'Highly interactive dashboards for students and librarians.' },
  ], 
  { x: 0.7, y: 2.5, w: 8.5, h: 2, fontSize: 16, color: THEME.text, lineSpacing: 28 }
)

// --- SLIDE 3: TECH STACK & DEPENDENCIES ---
let slide3 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide3.addText('Tech Stack & Dependencies', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide3.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

const techRows = [
  ['Category', 'Technology Choice'],
  ['Core Framework', 'Next.js 16 (App Router)'],
  ['Language', 'TypeScript 5'],
  ['Styling', 'Tailwind CSS 4'],
  ['Database Engine', 'PostgreSQL (Supabase)'],
  ['Data Access', 'Prisma ORM'],
  ['Authentication', 'NextAuth.js / Supabase Auth'],
  ['UI Components', 'shadcn/ui (Radix UI)'],
]
slide3.addTable(techRows, { x: 1, y: 2, w: 8, h: 3, border: { pt: 1, color: 'CBD5E1' }, fill: { color: 'FFFFFF' }, fontSize: 14, color: THEME.text })

// --- SLIDE 4: SYSTEM ARCHITECTURE ---
let slide4 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide4.addText('System Architecture', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide4.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide4.addText('The "Smart CLMS" ecosystem bridge:', { x: 0.5, y: 1.8, w: 9, h: 0.4, fontSize: 16, color: THEME.text })

// Architecture Diagram simulation using shapes
slide4.addShape(pres.ShapeType.rect, { x: 1, y: 2.5, w: 2, h: 1.5, fill: { color: 'E2E8F0' }, line: { color: THEME.primary, width: 2 } })
slide4.addText('Frontend\n(Next.js App)', { x: 1, y: 2.5, w: 2, h: 1.5, fontSize: 14, align: 'center', valign: 'middle' })

slide4.addShape(pres.ShapeType.rightArrow, { x: 3.1, y: 3.1, w: 0.8, h: 0.3, fill: { color: THEME.primary } })

slide4.addShape(pres.ShapeType.rect, { x: 4, y: 2.5, w: 2, h: 1.5, fill: { color: 'E2E8F0' }, line: { color: THEME.primary, width: 2 } })
slide4.addText('API & Prisma\n(TypeScript)', { x: 4, y: 2.5, w: 2, h: 1.5, fontSize: 14, align: 'center', valign: 'middle' })

slide4.addShape(pres.ShapeType.rightArrow, { x: 6.1, y: 3.1, w: 0.8, h: 0.3, fill: { color: THEME.primary } })

slide4.addShape(pres.ShapeType.rect, { x: 7, y: 2.5, w: 2, h: 1.5, fill: { color: 'E2E8F0' }, line: { color: THEME.primary, width: 2 } })
slide4.addText('Database\n(Supabase)', { x: 7, y: 2.5, w: 2, h: 1.5, fontSize: 14, align: 'center', valign: 'middle' })

slide4.addText('Role-Based Auth Middleware protects all core routes.', { x: 1, y: 4.5, w: 8, h: 0.4, fontSize: 14, italic: true, color: THEME.muted, align: 'center' })

// --- SLIDE 5: FOLDER & FILE STRUCTURE ---
let slide5 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide5.addText('Folder & File Structure', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide5.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide5.addText(
  [
    { text: 'clms/src/', options: { bold: true, color: THEME.primary } },
    { text: '\n  - app/              : Routes, API endpoints, App Layouts.' },
    { text: '\n  - components/       : Modular UI & reusable logic.' },
    { text: '\n  - lib/              : Centralized client and ORM singleton setup.' },
    { text: '\n  - hooks/            : Custom interaction logic (e.g. use-toast).' },
    { text: '\n\nclms/prisma/', options: { bold: true, color: THEME.primary } },
    { text: '\n  - schema.prisma     : The source-of-truth for multi-schema DB.' },
    { text: '\n  - migrations/       : Versioned SQL schema changes.' },
  ],
  { x: 1, y: 2, w: 8, h: 3.5, fontSize: 16, color: THEME.text }
)

// --- SLIDE 6: CORE MODULES BREAKDOWN ---
let slide6 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide6.addText('Core Modules Breakdown', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide6.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

const coreModules = [
  ['Authentication', 'Seamless login/register with multi-role identity management.'],
  ['Book Catalog', 'Inventory tracking with ISBN, edition, and category mapping.'],
  ['Circulation Engine', 'Tracks issue dates, return statuses, and overdue events.'],
  ['Fines System', 'Automated fine calculation based on due-date slippage.'],
  ['Profile Sync', 'Dynamic synchronization between Supabase Auth and Public profiles.'],
]
slide6.addTable(coreModules, { x: 0.5, y: 2.2, w: 9, h: 2.5, colW: [2.5, 6.5], border: { pt: 1, color: 'CBD5E1' }, fontSize: 14, color: THEME.text })

// --- SLIDE 7: KEY FEATURES & FUNCTIONALITY ---
let slide7 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide7.addText('Key Features & Functionality', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide7.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide7.addText(
  [
    { text: '• Smart Dashboard: ', options: { bold: true } },
    { text: 'Real-time metrics for Issued, Overdue, and Available books.' },
    { text: '\n• Global Search: ', options: { bold: true } },
    { text: 'High-performance book discovery and filtering.' },
    { text: '\n• Role-Specific UI: ', options: { bold: true } },
    { text: 'Tailored views for Students, Librarians, and Admins.' },
    { text: '\n• Responsive Layout: ', options: { bold: true } },
    { text: 'Built mobile-first with Tailwind CSS 4 utilities.' },
  ],
  { x: 1, y: 2.2, w: 8, h: 2.8, fontSize: 18, color: THEME.text, lineSpacing: 34 }
)

// --- SLIDE 8: DATA FLOW (REQUEST-RESPONSE) ---
let slide8 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide8.addText('Data Flow | Technical Cycle', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide8.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide8.addText(
  [
    { text: '1. Request Phase: ', options: { bold: true, color: THEME.primary } },
    { text: 'User performs an action (e.g., borrowing a book).' },
    { text: '\n2. Middleware: ', options: { bold: true, color: THEME.primary } },
    { text: 'Session validation ensures the user is active.' },
    { text: '\n3. API Execution: ', options: { bold: true, color: THEME.primary } },
    { text: 'Server route triggers Prisma transaction (optimistic locking).' },
    { text: '\n4. DB Sync: ', options: { bold: true, color: THEME.primary } },
    { text: 'Supabase PostgreSQL updates public records.' },
    { text: '\n5. Client Update: ', options: { bold: true, color: THEME.primary } },
    { text: 'State is updated via Toast notifications and re-fetching logic.' },
  ],
  { x: 1, y: 2.2, w: 8, h: 3, fontSize: 16, color: THEME.text, lineSpacing: 30 }
)

// --- SLIDE 9: API ENDPOINTS ---
let slide10 = pres.addSlide({ masterName: 'MASTER_SLIDE' }) // Using index 10 for ordering
slide10.addText('API Endpoints & Design', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide10.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

const apiRows = [
  ['Path', 'Method', 'Purpose'],
  ['/api/auth/login', 'POST', 'Identity verification & session start'],
  ['/api/auth/register', 'POST', 'Profile creation & schema initialization'],
  ['/api/dashboard/stats', 'GET', 'Real-time metrics for current user role'],
  ['/api/books', 'GET/POST', 'Catalog retrieval and inventory management'],
  ['/api/fines', 'GET/PATCH', 'Tracking and settling overdue payments'],
]
slide10.addTable(apiRows, { x: 0.5, y: 2.2, w: 9, h: 2.5, colW: [3, 2, 4], border: { pt: 1, color: 'CBD5E1' }, fontSize: 14, color: THEME.text })

// --- SLIDE 10: DESIGN PATTERNS ---
let slide11 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide11.addText('Notable Design Patterns', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide11.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide11.addText(
  [
    { text: '\u2022 Data Layer: ', options: { bold: true } },
    { text: 'Prisma Client Singleton to prevent connection exhaustion.' },
    { text: '\n\u2022 Security: ', options: { bold: true } },
    { text: 'Cookie-based session handling with middleware protection.' },
    { text: '\n\u2022 Schema Strategy: ', options: { bold: true } },
    { text: 'Dual-schema approach to keep Auth and App data separate yet linked.' },
    { text: '\n\u2022 UX Design: ', options: { bold: true } },
    { text: 'Declarative UI with React Hooks and Shadcn component reusability.' },
  ],
  { x: 1, y: 2.2, w: 8, h: 3, fontSize: 16, color: THEME.text, lineSpacing: 30 }
)

// --- SLIDE 11: FUTURE ROADMAP ---
let slide12 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide12.addText('Future Roadmap', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: THEME.primary })
slide12.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 0.05, fill: { color: THEME.secondary } })

slide12.addText(
  [
    { text: '• AI Integration: ', options: { bold: true } },
    { text: 'Provide smart book recommendations based on user history.' },
    { text: '\n• IoT Support: ', options: { bold: true } },
    { text: 'Integrate RFID and QR-code scanners for instant issue/return.' },
    { text: '\n• Mobile Ecosystem: ', options: { bold: true } },
    { text: 'Develop a dedicated React Native companion app for students.' },
    { text: '\n• Advanced Reporting: ', options: { bold: true } },
    { text: 'Generative AI reports for librarian-level inventory insights.' },
  ],
  { x: 1, y: 2.2, w: 8, h: 3, fontSize: 18, color: THEME.text, lineSpacing: 34 }
)

// --- SLIDE 12: CONCLUSION ---
let slide13 = pres.addSlide({ masterName: 'MASTER_SLIDE' })
slide13.background = { color: THEME.secondary }
slide13.addText('Thank You!', { x: 1, y: 2, w: 8, h: 1, fontSize: 54, bold: true, color: 'FFFFFF', align: 'center' })
slide13.addText('Summary: Smart CLMS is a modern, secure, and production-ready system.', { x: 1, y: 3.2, w: 8, h: 1, fontSize: 18, color: THEME.primary, align: 'center' })
slide13.addText('Developed by Ayush Raj', { x: 1, y: 4.5, w: 8, h: 0.5, fontSize: 14, color: 'CBD5E1', align: 'center' })

// 3. Save the File
pres.writeFile('Smart_CLMS_Overview.pptx')
  .then(fileName => {
    console.log(`Presentation saved as: ${fileName}`)
  })
  .catch(err => {
    console.error('Error saving presentation:', err)
  })
