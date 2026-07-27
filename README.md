# School Management System

A full-stack web application for managing school operations online — students, teachers, courses, attendance, marks, assignments, and academic resources in one platform.

**Stack:** React (Vite) · Express · MongoDB · JWT Authentication

---

## Features

### Admin
- Dashboard with live system statistics
- Register and manage teachers
- Create, update, and delete courses
- View enrollments across the school
- Finalize exam datesheets
- Manage syllabus and datesheet records

### Teacher
- Dashboard for assigned students and classes
- Add students and enroll them in own courses
- Mark attendance (single entry + bulk save)
- Enter and update marks (single + bulk)
- Create, edit, and delete assignments
- Review and grade student submissions
- Upload syllabus, datesheets, and exam papers
- Export attendance and marks as PDF

### Student
- Personal dashboard (attendance %, marks average, grade)
- View enrolled subjects and courses
- Submit assignments (PDF / image upload)
- View attendance, results, and graded feedback
- Access syllabus, datesheets, and papers
- Update profile

### Shared
- Role-based authentication and protected routes
- Modern glassmorphism UI with responsive layout
- File uploads for assignments, courses, and resources
- Input validation on frontend and backend

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, React Router, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcrypt |
| Uploads | Multer |
| Validation | express-validator |

---

## Project Structure

```
School Management System/
├── Frontend/          # React client (Vite)
│   └── src/
│       ├── PAGES/     # Route pages (Admin, Teacher, Student)
│       ├── components/
│       └── api.js     # Axios instance + auth interceptor
├── backend/           # Express REST API
│   ├── controller/    # Business logic
│   ├── model/         # Mongoose schemas
│   ├── middleware/    # Auth, validation, file upload
│   ├── routing/       # API routes
│   └── seed.js        # Demo data seeder
├── package.json       # Root workspace scripts
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- npm

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/maazmehar9850-boop/SCHOOL-MANAGEMENT-SYSTEM.git
cd SCHOOL-MANAGEMENT-SYSTEM
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for both the backend and frontend workspaces.

### 3. Configure environment variables

Create `backend/.env` from the example file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/
JWT_SECRET=your_long_random_secret_key
PORT=3030
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
EMAIL_USER=
EMAIL_PASS=
```

Optional frontend override (`Frontend/.env`):

```env
VITE_API_URL=http://localhost:3030/api/v1
```

### 4. Seed demo data (optional)

```bash
cd backend
npm run seed
cd ..
```

### 5. Run the application

From the project root:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3030/api/v1

---

## Demo Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `123456` |
| Teacher | `teacher@gmail.com` | `123456` |
| Student | `student@gmail.com` | `123456` |

---

## API Overview

Base URL: `http://localhost:3030/api/v1`

| Module | Endpoints |
|--------|-----------|
| Auth | `/signup`, `/login`, `/register`, `/me` |
| Users | `/students`, `/teachers`, `/update/:id`, `/delete/:id` |
| Courses | `/courses` |
| Enrollments | `/enrollments`, `/my-students` |
| Attendance | `/attendance`, `/attendance/bulk` |
| Marks | `/marks`, `/marks/bulk` |
| Assignments | `/assignments` |
| Submissions | `/assignments/:id/submit`, `/submissions/mine`, `/submissions/:id/grade` |
| Resources | `/syllabus`, `/datesheet`, `/paper` |
| Dashboard | `/dashboard/stats`, `/public/stats`, `/health` |

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Database Models

- **User** (`register`) — admin, teacher, student
- **Course** — subjects with assigned teacher and materials
- **Enrollment** — student ↔ course relationship
- **Attendance** — daily present/absent records
- **Mark** — subject-wise scores and feedback
- **Assignment** — tasks with due dates
- **Submission** — student file uploads and grades
- **Syllabus**, **Datesheet**, **Paper** — academic resources

---

## Security

- Passwords hashed with **bcrypt**
- **JWT** token-based authentication (8-hour expiry)
- **Role-based access control** (admin / teacher / student)
- Request validation with **express-validator**
- CORS and security headers configured
- File type and size limits on uploads

> **Note:** Never commit `.env` files or real secrets to Git. Use `backend/.env.example` as a template only.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend together |
| `npm --prefix backend run dev` | Start backend only |
| `npm --prefix Frontend run dev` | Start frontend only |
| `npm --prefix backend run seed` | Load demo data |
| `npm --prefix Frontend run build` | Build frontend for production |

---

## Excluded from Repository

The following are intentionally **not** uploaded to GitHub:

- `node_modules/`
- `.env` and secret files
- `backend/uploads/` (user-uploaded files)
- `Frontend/dist/` (build output)
- `VIVA_SUMMARY.md` (local study notes)

---

## Author

**Maaz Mehar**  
GitHub: [@maazmehar9850-boop](https://github.com/maazmehar9850-boop)

---

## License

This project is for educational and portfolio purposes.
