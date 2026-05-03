# TaskFlow Pro 🎯

![TaskFlow Pro Banner](https://img.shields.io/badge/TaskFlow-Pro-7c3aed?style=for-the-badge) 
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js) 
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

TaskFlow Pro is a premium, high-fidelity task management application designed for speed, interactivity, and absolute focus. Built with a modern Next.js architecture, it features a fluid drag-and-drop Kanban board, real-time syncing, and a built-in automated deadline reminder system that hooks straight into your email.

**Live Demo:** [Check out the live application on Render!](https://taskflow-pro-1kaf.onrender.com)

---

## ✨ Features

- **Interactive Kanban Board**: Effortlessly move tasks between columns with drag-and-drop functionality, powered by `@hello-pangea/dnd`.
- **Automated Email Reminders**: Never miss a deadline. Set a due date and precise time, and the backend engine will instantly dispatch an email telling you exactly how much time you have left!
- **Celebratory Micro-Interactions**: Experience a burst of confetti when you quickly check off a task using the "Mark as Done" action.
- **Real-Time Syncing**: Uses Server-Sent Events (SSE) to update the dashboard instantly across devices.
- **Premium Dark Mode UI**: A stunning, custom-built interface using vanilla CSS, modern typography, and glassmorphic elements.

---

## 🚀 Running Locally

Want to test TaskFlow Pro on your own machine? It's incredibly simple to set up.

### 1. Clone the repository
```bash
git clone https://github.com/SRIKRISH-S/taskflow-pro.git
cd taskflow-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env` in the root of your project and add the following keys. You will need to generate an [App Password](https://myaccount.google.com/security) from your Google Account for the email notifications to work.

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
AUTH_SECRET="your-super-secret-key-change-in-production"

# Email Engine (For deadline reminders)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
```

### 4. Initialize the Database
Run the following command to build the Prisma client and create your local SQLite database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Application
Fire up the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Create an account, add a task with a specific Due Time, and watch the magic happen!

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Email Service**: Nodemailer
- **Interactivity**: Canvas-Confetti, React Drag-and-Drop

---

*Designed and developed by SRIKRISHNA S.*
