# School Management System — Project Status

**Last updated:** July 26, 2026  
**Stack:** React (Vite) + Tailwind + Framer Motion · Express · MongoDB · JWT

---

## Overview

| Area | Status |
|------|--------|
| Landing page (`/`) | Done |
| Login / Register + JWT roles | Done |
| Admin panel | Done |
| Teacher panel | Done |
| Student panel | Done |
| Glassmorphism UI + backgrounds | Done |
| Assignments & Enrollments UI | Done |
| Security & production readiness | Done |

### Demo accounts (after `npm run seed` in backend)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `123456` |
| Teacher | `teacher@gmail.com` | `123456` |
| Student | `student@gmail.com` | `123456` |

---

## Features

### Public
- [x] SaaS landing at `/` (hero, features, how it works, preview, stats, footer)
- [x] Login + public Register (`/signup` — student/teacher only)
- [x] Admin-created users via `POST /register`

### Admin
- [x] Live dashboard stats
- [x] Students / Teachers / Courses CRUD
- [x] Enrollments management
- [x] Assignments overview
- [x] System health

### Teacher
- [x] Dashboard, My Students, Attendance (CSV + print), Marks (CSV + print)
- [x] Assignments create/edit/delete
- [x] Teacher Tools (syllabus / datesheet / papers)
- [x] Resources + Profile

### Student
- [x] Dashboard (attendance %, marks avg, courses, assignments count)
- [x] Profile, Attendance, Results, Subjects, Assignments, Resources

### Shared UI
- [x] GlassCard, Modal, FormField, StatCard, DataTable, Skeleton
- [x] Role-based AnimatedSidebar + ModernNavbar
- [x] Section backgrounds (landing / login / admin / teacher / student / courses / profile)
- [x] Framer Motion + toasts

### Backend
- [x] JWT `authenticate` + `authorizeRoles`
- [x] Models: User, Course, Enrollment, Attendance, Mark, Assignment, Syllabus, Datesheet, Paper
- [x] Role-filtered queries
- [x] express-validator on auth / courses / enrollments / assignments
- [x] Security headers + CORS env + error handler
- [x] Seed script

---

## How to run

```bash
# From project root
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3030/api/v1

```bash
cd backend
npm run seed
```

Optional frontend API override:

```
# Frontend/.env
VITE_API_URL=http://localhost:3030/api/v1
```

Optional email (admin `/sendMail`):

```
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```
