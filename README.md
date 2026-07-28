# School Management System

A modern full-stack school platform for managing students, teachers, courses, attendance, marks, assignments, and academic resources from a single dashboard.

## Overview
This project combines a React frontend with an Express and MongoDB backend to support role-based workflows for admins, teachers, and students. It includes authentication, protected routes, file uploads, academic record management, PDF export, and responsive dashboards.

## Highlights
- Role-based dashboards for `admin`, `teacher`, and `student`
- Course, syllabus, datesheet, and paper management
- Attendance and marks management with bulk workflows
- Assignment creation, submission, and grading
- Password reset approval flow and profile management
- PDF export for selected academic records
- Responsive UI with modern motion and glass-style components

## Tech Stack
| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| Validation | express-validator |
| Uploads | Multer |

## Project Structure
```text
School Management System/
├── Frontend/              # React client
│   ├── public/
│   └── src/
│       ├── PAGES/
│       ├── components/
│       └── utils/
├── backend/               # Express API
│   ├── api/               # Vercel serverless entry
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routing/
│   └── utils/
├── package.json
└── README.md
```

## Features by Role
### Admin
- View live dashboard statistics
- Register and manage teachers
- Manage courses and school-wide records
- Review password reset requests
- Monitor enrollments and academic readiness

### Teacher
- Manage assigned students
- Enroll students into courses
- Mark attendance and enter marks
- Create assignments and grade submissions
- Upload course materials and resources

### Student
- View dashboard insights
- Check attendance and marks
- Access courses and resources
- Submit assignments
- Update profile information

## Local Setup
### 1. Clone the repository
```bash
git clone https://github.com/maazmehar9850-boop/SCHOOL-MANAGEMENT-SYSTEM.git
cd SCHOOL-MANAGEMENT-SYSTEM
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment files
Create real env files from the examples:

```bash
cp backend/.env.example backend/.env
cp Frontend/.env.example Frontend/.env
```

Minimum backend variables:

```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=3030
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAIL_USER=
EMAIL_PASS=
```

Frontend variable:

```env
VITE_API_URL=http://localhost:3030/api/v1
```

### 4. Seed demo data (optional)
```bash
npm --prefix backend run seed
```

### 5. Start the app
```bash
npm run dev
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3030/api/v1`

## Deployment Notes
### Frontend on Vercel
- Root Directory: `Frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Required env:

```env
VITE_API_URL=https://your-backend-domain/api/v1
```

### Backend on Vercel
- Root Directory: `backend`
- Install Command: `npm install`
- Build Command: leave empty

Required env:

```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
EMAIL_USER=
EMAIL_PASS=
```

## API Modules
Base URL:

```text
/api/v1
```

Available module groups:
- Auth
- Profile
- Users
- Dashboard
- Courses
- Enrollments
- Assignments
- Submissions
- Attendance
- Marks
- Academic Resources
- Password Reset

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Security
- Passwords are hashed with `bcrypt`
- JWT-based authentication is used for session control
- Role-based authorization is enforced on protected routes
- Input validation runs on both critical auth and data flows
- File type and size restrictions are applied to uploads

## Notes
- Do not commit real `.env` files or secrets
- Vercel file uploads are temporary unless moved to persistent storage such as S3, Cloudinary, or Vercel Blob

## Author
**Maaz Mehar**  
GitHub: [@maazmehar9850-boop](https://github.com/maazmehar9850-boop)

## License
This project is intended for educational and portfolio use.
