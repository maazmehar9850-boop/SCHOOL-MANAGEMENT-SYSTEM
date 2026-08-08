# College Management System

**Full-stack MERN campus platform** for Aspira College — a public-facing college website plus a role-based academic CMS for admins, teachers, and students.

Built with React, Node.js, Express, and MongoDB. Designed for real campus operations: admissions visibility, student records, attendance, grades, fees, assignments, and resource management — all in one responsive product.

---

## Project Summary (for portfolio / Fiverr)

> A complete College Management System built with the MERN stack. It includes a modern public college website (Home, Academics, Admissions, Gallery, Contact, and more) and a secure multi-role portal for Admin, Teacher, and Student. Core modules cover dashboards & analytics, student/teacher management, courses, enrollments, attendance, marks/results, fee tracking, assignments, academic resources, password-reset approvals, and PDF export. The UI is fully responsive with a premium dark admin workspace and polished public marketing pages.

---

## Live Concept

| Surface | Purpose |
|---|---|
| **Public website** | Brand, programs, admissions info, campus life, gallery, news, contact |
| **Admin portal** | Operations dashboard, users, courses, fees, enrollments, academic oversight |
| **Teacher portal** | Classroom tools, attendance, marks, assignments, resources |
| **Student portal** | Personal dashboard, results, attendance, fees, submissions |

---

## Key Features

### Public College Website
- Homepage hero, featured programs, campus highlights, testimonials, FAQs
- Academics / programs overview
- Admissions guidance and scholarship sections
- Faculty and campus life pages
- Photo gallery with category filters
- News / portal pages
- Contact form with campus details and map

### Admin Dashboard & CMS
- KPI cards and analytics charts
- Student and teacher management
- Course and enrollment management
- Fee management
- Attendance and marks oversight
- Assignments and academic resources
- Password-reset request approvals
- Quick actions for common workflows

### Teacher Tools
- Teacher dashboard insights
- Attendance marking
- Marks / results entry
- Assignment creation and grading
- Student lists and course materials

### Student Experience
- Student dashboard with progress insights
- View attendance and results
- Course / subject access
- Assignment submissions
- Fee status
- Profile management

### Platform Capabilities
- JWT authentication and role-based protected routes
- Secure password hashing
- Input validation on critical flows
- File uploads for academic resources
- PDF export for selected academic records
- Responsive desktop + mobile UI
- Toast notifications and session inactivity handling

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Lucide / React Icons |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB |
| **Auth** | JWT, bcrypt |
| **Validation** | express-validator |
| **Uploads** | Multer |
| **Email** | Nodemailer |
| **Tooling** | Concurrently, Nodemon, Playwright (preview captures) |

---

## Project Structure

```text
College Management System/
├── Frontend/                 # React + Vite client
│   ├── public/
│   ├── scripts/              # Build, favicon, Fiverr preview capture
│   └── src/
│       ├── PAGES/            # Public site + portal screens
│       ├── components/       # Shared UI, layout, charts
│       ├── data/             # Site content & images
│       ├── hooks/
│       └── utils/
├── backend/                  # Express API
│   ├── api/                  # Vercel serverless entry
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routing/
│   └── utils/
├── fiverr-preview/           # Portfolio / Fiverr gallery PNGs
├── package.json              # Workspace root scripts
└── README.md
```

---

## Features by Role

### Admin
- Live dashboard statistics and charts
- Manage students, teachers, and courses
- Track enrollments and fees
- Oversee attendance, marks, assignments, and resources
- Approve password-reset requests
- Add teachers and courses quickly from the dashboard

### Teacher
- Access teacher dashboard and classroom tools
- Mark attendance and enter marks
- Create assignments and review submissions
- Manage assigned students and course resources

### Student
- View personal academic dashboard
- Check attendance, marks, and enrolled subjects
- Submit assignments and download resources
- Track fee status and update profile

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/maazmehar9850-boop/COLLEGE-MANAGEMENT-SYSTEM.git
cd COLLEGE-MANAGEMENT-SYSTEM
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment files

```bash
cp backend/.env.example backend/.env
cp Frontend/.env.example Frontend/.env
```

**Backend (`backend/.env`):**

```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=3030
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAIL_USER=
EMAIL_PASS=
```

**Frontend (`Frontend/.env`):**

```env
VITE_API_URL=http://localhost:3030/api/v1
```

### 4. Optional demo seed

```bash
npm --prefix backend run seed
```

### 5. Run both apps

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3030/api/v1 |

---

## Demo Accounts (after seed)

Use only in local / demo environments:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `123456` |
| Teacher | `teacher@gmail.com` | `123456` |
| Student | `student@gmail.com` | `123456` |

---

## API Overview

Base path:

```text
/api/v1
```

Main module groups:
- Auth & profile
- Users
- Dashboard stats
- Courses & enrollments
- Assignments & submissions
- Attendance & marks
- Fees
- Academic resources (syllabus, datesheet, papers)
- Password reset
- Public campus / contact endpoints

Protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Deployment

### Frontend (Vercel)
- **Root Directory:** `Frontend`
- **Install:** `npm install`
- **Build:** `npm run build`
- **Output:** `dist`
- **Env:** `VITE_API_URL=https://your-backend-domain/api/v1`

### Backend (Vercel)
- **Root Directory:** `backend`
- **Install:** `npm install`
- **Build:** leave empty
- **Env:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, email credentials if used

---

## Portfolio Preview Pack

High-resolution Fiverr / Behance style mockups live in:

```text
fiverr-preview/
```

Includes:
- Main project cover (`fiverr-main-preview.png`)
- Homepage hero
- Admin dashboard
- Featured programs, campus life, login, and contact form section shots

Regenerate (dev server must be running):

```bash
npm --prefix Frontend run fiverr:preview
```

---

## Security Notes

- Passwords hashed with bcrypt
- JWT authentication for protected routes
- Role-based access control for admin / teacher / student
- Validation on critical auth and data endpoints
- Upload type/size limits via Multer
- Do **not** commit real `.env` files or secrets
- Serverless uploads are temporary unless moved to durable storage (S3, Cloudinary, Vercel Blob, etc.)

---

## Ideal Use Cases

- College / school operations portal
- Full-stack MERN portfolio project
- Fiverr / Upwork education CMS delivery
- Campus website + internal ERP-style admin panel in one codebase

---

## Author

**Maaz Mehar**  
Full Stack Developer  

- GitHub: [maazmehar9850-boop](https://github.com/maazmehar9850-boop)
- Repository: [COLLEGE-MANAGEMENT-SYSTEM](https://github.com/maazmehar9850-boop/COLLEGE-MANAGEMENT-SYSTEM)

---

## License

This project is intended for educational, portfolio, and client-demo use.
