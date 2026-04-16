# 📚 Smart CLMS — Modern Library Management Ecosystem

# Welcome to College Library Management System 📖

# 🌐 Live Demo
Want to see CLMS-UI? [Check it out here] -> https://ayush-razz-clms.vercel.app/
This scaffold provides a robust foundation built with:

**Smart CLMS** is a state-of-the-art College Library Management System designed to bridge the gap between traditional library operations and modern digital efficiency. Built with a bleeding-edge tech stack, it provides a seamless, role-based experience for students, faculty, librarians, and administrators.

---

<img width="1919" height="1048" alt="image" src="https://github.com/user-attachments/assets/dfa8c379-7a41-4e5c-a5fb-3cb851b92713" />
<img width="1919" height="1053" alt="image" src="https://github.com/user-attachments/assets/59c5b038-9031-425a-ad5f-fce747e383c2" />
<img width="1919" height="1053" alt="image" src="https://github.com/user-attachments/assets/f2c1ca7b-56ac-46c7-8178-a92fb5b02049" />
<img width="1917" height="1050" alt="image" src="https://github.com/user-attachments/assets/cfac4e18-8aa9-4eda-9597-b759dbd081ee" />






## ✨ Key Features

### 🔐 Multi-Role Identity Management
- **Students & Faculty**: Personalized dashboards to track borrowings, fines, and notifications.
- **Librarians**: Advanced tools for circulation management, book inventory, and user approvals.
- **Administrators**: Full system oversight, analytics, and configuration control.

### 📖 Intelligent Book Catalog
- **Global Search**: High-performance book discovery with ISBN tracking.
- **Categorization**: Modular organization by genre and department.
- **Real-time Availability**: Instant tracking of "Available vs. Issued" copies.

### 🔄 Circulation Engine
- **One-Click Issue/Return**: Streamlined workflows for book transactions.
- **Overdue Tracking**: Automated system to flag late returns.
- **Dynamic Fines**: Real-time calculation and settlement of library penalties.

### 📊 Advanced Reporting & UX
- **Automated PPT Generation**: Programmatically generate professional technical overviews and reports using `PptxGenJS`.
- **Real-time Notifications**: Instant alerts for transaction updates and system messages via Socket.io.
- **Premium Design**: A high-fidelity, mobile-responsive interface built with **Tailwind CSS 4** and **Shadcn/UI**.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Core Framework** | [Next.js 15+]|
| **Language** | [TypeScript 5]
| **Styling** | [Tailwind CSS 4]
| **Database** | [PostgreSQL (Supabase)]
| **ORM** | [Prisma]
| **Authentication** | [NextAuth.js] & [Supabase Auth]
| **Real-time** | [Socket.io](https://socket.io/) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js]
- [Supabase]Account & Project
- [PostgreSQL] Database

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/clms.git
   cd clms
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your_postgresql_url"
   DIRECT_URL="your_direct_postgresql_url"
   NEXTAUTH_SECRET="your_secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```

4. **Database Initialization**:
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Run the Development Server**:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📂 Project Structure

```text
clms/
├── prisma/             # Database schema and migrations
├── src/
│   ├── app/            # Next.js App Router (Routes & API)
│   ├── components/     # Reusable UI components (Shadcn/UI)
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Configuration (Prisma, Supabase, Utils)
├── public/             # Static assets
└── generate_pptx.js    # Automated reporting utility
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the system, please:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ by <b>Ayush Raj</b>
</p>
