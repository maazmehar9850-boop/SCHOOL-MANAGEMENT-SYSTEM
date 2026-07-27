# School Management System — Complete Viva Summary
### Subject / Project: Web-Based School Management System (MERN Stack)

> **Yeh file aap ke viva ki tayyari ke liye hai.** Is mein project ki poori summary, architecture, features, database, security aur common viva questions shamil hain.

---

## 1. Project Introduction (تعارف)

**Project Name:** School Management System (SchoolMS)

**Kya hai yeh project?**  
Yeh ek **web-based application** hai jo school/college ki daily activities ko digital banati hai — jaise students manage karna, teachers assign karna, courses banana, attendance lagana, marks dena, assignments dena, syllabus/datesheet/papers upload karna, aur students ko apna result/attendance dekhne dena.

**Problem jo solve karti hai:**  
Pehle schools mein sab kuch manual hota tha — registers, paper files, Excel sheets. Is system se:
- Admin ek jagah se poora school control kar sakta hai
- Teacher apne students ki attendance aur marks online manage kar sakta hai
- Student apna dashboard se attendance, results, assignments dekh sakta hai

**Project Type:** Full-Stack Web Application  
**Architecture Pattern:** Client-Server (React Frontend + Express Backend + MongoDB Database)

---

## 2. Tech Stack (Technologies Used)

| Layer | Technology | Kaam |
|-------|-----------|------|
| **Frontend** | React 19 + Vite | User Interface (UI) |
| **Styling** | Tailwind CSS 4 | Modern responsive design |
| **Animation** | Framer Motion | Smooth page transitions |
| **Routing** | React Router DOM v7 | Page navigation |
| **HTTP Client** | Axios | Backend se data fetch/send |
| **Notifications** | React Hot Toast | Success/error messages |
| **Rich Text** | React Quill | Datesheet/Paper HTML editor |
| **Icons** | Lucide React + React Icons | UI icons |
| **Backend** | Node.js + Express 5 | REST API server |
| **Database** | MongoDB + Mongoose 9 | Data storage (NoSQL) |
| **Authentication** | JWT (JSON Web Token) | Login security |
| **Password Hash** | bcrypt | Password encryption |
| **Validation** | express-validator | Input validation |
| **File Upload** | Multer | PDF, video, image uploads |
| **Email** | Nodemailer | Admin email feature |
| **Dev Tools** | Nodemon, Concurrently | Auto-restart + run both servers |

**Database Name:** `MERNSTAG` (MongoDB Atlas ya local)

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                        │
│         Admin / Teacher / Student                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests (REST API)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                     │
│  Port: http://localhost:5173                            │
│  - Pages (Login, Dashboard, Attendance, etc.)          │
│  - Components (Sidebar, Modal, DataTable, etc.)        │
│  - Protected Routes (Role-based access)                │
│  - Axios API calls + JWT token in headers              │
└────────────────────┬────────────────────────────────────┘
                     │ /api/v1/*
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express.js)                        │
│  Port: http://localhost:3030                           │
│  - Routes (routing.js)                                 │
│  - Controllers (business logic)                        │
│  - Middleware (auth, validation, upload)               │
│  - Models (Mongoose schemas)                           │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                          │
│  Collections: register, courses, enrollments, etc.     │
└─────────────────────────────────────────────────────────┘
```

**MERN Stack ka matlab:**
- **M** = MongoDB (Database)
- **E** = Express.js (Backend framework)
- **R** = React (Frontend library)
- **N** = Node.js (JavaScript runtime for backend)

---

## 4. User Roles & Permissions (3 Roles)

### 4.1 Admin (Administrator)
- Poora system control
- Teachers register karta hai
- Courses create/edit/delete karta hai
- Enrollments dekhta hai (view only)
- Syllabus/Datesheet edit/delete kar sakta hai
- Datesheet finalize/unfinalize karta hai (exam approval)
- System dashboard stats dekhta hai
- Email bhej sakta hai (`/sendMail`)

### 4.2 Teacher (Subject Teacher)
- Apne courses ke students add karta hai
- Students ko courses mein enroll karta hai
- Attendance mark karta hai (single + bulk/CSV)
- Marks enter karta hai (single + bulk)
- Assignments create/edit/delete karta hai
- Assignment submissions grade karta hai
- Syllabus, Datesheet (draft), Papers upload karta hai
- Apna profile update karta hai

### 4.3 Student
- Public signup se register ho sakta hai
- Apna dashboard dekhta hai (attendance %, marks avg, grade)
- Apne enrolled courses/subjects dekhta hai
- Assignments dekhta hai aur file submit karta hai (PDF/image)
- Apni attendance aur results dekhta hai
- Resources (syllabus, datesheet, papers) access karta hai
- Apna profile update karta hai

---

## 5. Database Models (MongoDB Collections)

### 5.1 User Model (`register`)
```
Fields: name, email, Password (hashed), role (admin/teacher/student),
        bio, subject, experience, phone, timestamps
```
- **Password bcrypt se hash hota hai** (plain text kabhi store nahi hota)
- Email unique hai
- Role enum: `admin`, `teacher`, `student`

### 5.2 Course Model (`Course`)
```
Fields: courseName, courseCode (unique), teacher, teacherId (ref: register),
        className, duration, description, maxStudents, roomNumber,
        schedule, status (Active/Inactive), videoUrl, pdfUrl, materials[]
```
- Admin course banata hai aur teacher assign karta hai
- Course mein video/PDF materials attach ho sakte hain

### 5.3 Enrollment Model (`Enrollment`)
```
Fields: studentId (ref: register), courseId (ref: Course),
        status (active/completed/dropped), timestamps
Unique Index: studentId + courseId (ek student ek course mein ek hi baar)
```
- **Relationship:** Student ↔ Course (Many-to-Many through Enrollment)

### 5.4 Attendance Model (`Attendance`)
```
Fields: studentName, studentId, course, courseId, date,
        status (Present/Absent), teacher, teacherId
```

### 5.5 Mark Model (`Mark`)
```
Fields: studentName, studentId, course, courseId, subject,
        score, maxScore (default 100), feedback, assignmentId,
        teacher, teacherId
```

### 5.6 Assignment Model (`Assignment`)
```
Fields: title, description, course, courseId, dueDate,
        teacher, teacherId, timestamps
```

### 5.7 Submission Model (`Submission`)
```
Fields: assignmentId, studentId, studentName, fileUrl, fileName,
        type (pdf/image), status (submitted/graded/returned),
        score, feedback, gradedBy, gradedAt, submittedAt
Unique Index: assignmentId + studentId (ek student ek assignment ek hi baar)
```

### 5.8 Syllabus Model (`Syllabus`)
```
Fields: title, course, subject, teacher, content, topics,
        fileUrl, fileName, fileType
```

### 5.9 Datesheet Model (`Datesheet`)
```
Fields: title, course, teacher, notes (HTML), entries[] (subject, date,
        startTime, endTime, room, invigilator), status (draft/finalized),
        finalizedAt, finalizedBy
```
- Teacher draft banata hai → Admin finalize karta hai

### 5.10 Paper Model (`Paper`)
```
Fields: title, course, subject, teacher, instructions (HTML),
        questions[] (q, marks), fileUrl, fileName
```

### Entity Relationship (Simple)
```
Admin ──creates──► Teacher, Course
Teacher ──adds──► Student (in own course)
Teacher ──enrolls──► Student ──in──► Course
Teacher ──marks──► Attendance, Marks, Assignments
Student ──submits──► Assignment (Submission)
Teacher ──grades──► Submission
Teacher ──uploads──► Syllabus, Datesheet, Paper
Admin ──finalizes──► Datesheet
```

---

## 6. Authentication & Security

### 6.1 Login Flow
1. User email + password bhejta hai → `POST /api/v1/login`
2. Backend password bcrypt se verify karta hai
3. Agar sahi hai → JWT token generate hota hai (8 hours expiry)
4. Token frontend mein `localStorage` mein save hota hai
5. Har API request mein header: `Authorization: Bearer <token>`

### 6.2 JWT Token Payload
```json
{ "id": "user_id", "email": "...", "role": "admin/teacher/student", "name": "..." }
```

### 6.3 Middleware Chain
```
Request → authenticate (JWT verify) → authorizeRoles (role check) → validate (input) → Controller
```

### 6.4 Security Features
| Feature | Detail |
|---------|--------|
| Password Hashing | bcrypt (10 salt rounds) |
| JWT Authentication | Token-based, 8h expiry |
| Role-Based Access | admin / teacher / student |
| Input Validation | express-validator |
| CORS | Configurable origins |
| Security Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| File Upload Limits | Submissions: 10MB, Courses: 80MB, Resources: 15MB |
| File Type Filter | Sirf allowed MIME types (PDF, images, videos) |
| Scoped Queries | Teacher sirf apne courses ka data dekhta hai |
| Unique Indexes | Duplicate enrollment/submission prevent |

### 6.5 Frontend Protection
- `ProtectedRoute` component — bina token ke login page pe redirect
- Role check — galat role wale user ko access nahi milta
- Axios interceptor — 401 pe auto logout

---

## 7. API Endpoints Summary

**Base URL:** `http://localhost:3030/api/v1`

### Auth
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| POST | `/signup` | Public | Student/Teacher self-register |
| POST | `/login` | Public | Login + JWT token |
| POST | `/register` | Admin | Teacher register |
| GET | `/me` | All | Current user profile |
| PUT | `/me` | All | Update own profile |

### Users
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| GET | `/students` | Admin | All students |
| GET | `/teachers` | Admin | All teachers |
| GET | `/student/:id` | Admin, Teacher | Single student |
| PUT | `/update/:id` | Admin | Update any user |
| DELETE | `/delete/:id` | Admin | Delete user |
| POST | `/teachers/students` | Teacher | Add student to own course |
| PUT | `/teachers/students/:id` | Teacher | Update own student |
| DELETE | `/teachers/students/:id` | Teacher | Delete own student |

### Courses & Enrollments
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| POST/GET/PUT/DELETE | `/courses` | Admin (CRUD) | Course management |
| POST | `/enrollments` | Teacher | Enroll student |
| GET | `/enrollments` | All (scoped) | View enrollments |
| DELETE | `/enrollments/:id` | Teacher | Unenroll |
| GET | `/my-students` | Teacher | Teacher's students |

### Academic
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| POST/GET | `/attendance` | Teacher | Attendance |
| POST | `/attendance/bulk` | Teacher, Admin | Bulk attendance |
| POST/GET | `/marks` | Teacher | Marks |
| POST | `/marks/bulk` | Teacher, Admin | Bulk marks |
| GET | `/marks/eligibility` | All | Marks eligibility check |

### Assignments & Submissions
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| POST/GET/PUT/DELETE | `/assignments` | Teacher | Assignment CRUD |
| POST | `/assignments/:id/submit` | Student | Submit file |
| GET | `/assignments/:id/submissions` | Teacher, Admin | View submissions |
| GET | `/submissions/mine` | Student | Own submissions |
| PUT | `/submissions/:id/grade` | Teacher | Grade submission |

### Resources
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| POST/GET | `/syllabus` | Teacher (create), All (read) | Syllabus |
| POST/GET | `/datesheet` | Teacher (create), All (read) | Datesheet |
| POST | `/datesheet/finalize` | Admin | Finalize exam |
| POST/GET | `/paper` | Teacher | Exam papers |

### Dashboard
| Method | Endpoint | Role | Kaam |
|--------|----------|------|------|
| GET | `/dashboard/stats` | All | Role-based dashboard stats |
| GET | `/public/stats` | Public | Landing page stats |
| GET | `/health` | Public | Server health check |

---

## 8. Frontend Pages & Routes

| Route | Page | Role |
|-------|------|------|
| `/` | Landing Page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/admin-dashboard` | Admin Dashboard | Admin |
| `/students` | Students List | Admin |
| `/teachers` | Teachers List | Admin |
| `/add-teacher` | Add Teacher | Admin |
| `/add-course` | Add Course | Admin |
| `/enrollments` | Enrollments | Admin |
| `/teacher-dashboard` | Teacher Dashboard | Teacher, Admin |
| `/my-students` | My Students | Teacher |
| `/add-student` | Add Student | Teacher |
| `/attendance` | Mark Attendance | Teacher |
| `/marks` | Enter Marks | Teacher |
| `/teacher-tools` | Syllabus/Datesheet/Papers | Teacher, Admin |
| `/teacher-profile` | Teacher Profile | Teacher |
| `/student-home` | Student Dashboard | Student, Admin |
| `/student-profile` | Student Profile | Student |
| `/student-attendance` | View Attendance | Student |
| `/student-results` | View Results/Marks | Student, Teacher, Admin |
| `/student-subjects` | Enrolled Subjects | Student |
| `/assignments` | Assignments | All |
| `/resources` | Syllabus/Papers/Datesheet | All |
| `/courses` | Courses List | All |

### Important Frontend Components
| Component | Kaam |
|-----------|------|
| `ProtectedRoute` | Role-based route guard |
| `AnimatedSidebar` | Role ke hisaab se navigation menu |
| `ModernNavbar` | Top navigation bar |
| `DataTable` | Reusable table with search/sort |
| `Modal` | Popup dialogs |
| `StatCard` | Dashboard statistics cards |
| `GlassCard` | Glassmorphism UI cards |
| `RichTextEditor` | HTML editor (datesheet, papers) |
| `SaveAsPdfButton` | Export to PDF |
| `Skeleton` | Loading placeholders |
| `PageContentCard` | Consistent page layout wrapper |

---

## 9. Key Features Detail

### 9.1 Attendance System
- Teacher date select karke Present/Absent mark karta hai
- Bulk save — ek saath poori class ki attendance
- CSV import support
- Print/PDF export
- Student apni attendance percentage dashboard pe dekhta hai

### 9.2 Marks / Results System
- Teacher subject-wise marks enter karta hai
- Score out of maxScore (default 100)
- Feedback optional
- Bulk marks entry
- Student ko grade milta hai: A+ (90+), A (80+), B (70+), C (60+), D (<60)
- Admin bhi marks dekh sakta hai

### 9.3 Assignment Workflow
```
Teacher creates Assignment → Student sees it → Student uploads file (PDF/image)
→ Teacher views submissions → Teacher grades (score + feedback) → Student sees grade
```

### 9.4 Datesheet Finalization Flow
```
Teacher creates Datesheet (status: draft) → Admin checks exam readiness
→ Admin finalizes → Datesheet locked (status: finalized) → Students can view
```

### 9.5 File Upload System (Multer)
| Upload Type | Folder | Max Size | Allowed Types |
|-------------|--------|----------|---------------|
| Submissions | `/uploads/submissions` | 10 MB | PDF, JPG, PNG, WEBP |
| Course Media | `/uploads/courses` | 80 MB | PDF, MP4, WEBM, MOV |
| Resources | `/uploads/resources` | 15 MB | PDF, JPG, PNG, WEBP |

---

## 10. Project Folder Structure

```
School Management System/
├── package.json              # Root workspace (concurrently)
├── backend/
│   ├── index.js              # Express server entry point
│   ├── config/db.js          # MongoDB connection
│   ├── routing/routing.js    # All API routes
│   ├── controller/           # Business logic
│   │   ├── student.js        # Auth + user management
│   │   ├── course.js         # Course CRUD
│   │   ├── enrollmentController.js
│   │   ├── assignmentController.js
│   │   ├── submissionController.js
│   │   ├── resourceController.js  # Syllabus, datesheet, paper, attendance, marks
│   │   └── dashboardController.js
│   ├── model/                # Mongoose schemas (10 models)
│   ├── middleware/
│   │   ├── middleware.js     # JWT auth + role authorization
│   │   ├── validate.js       # Validation middleware
│   │   └── upload.js         # Multer file upload
│   ├── validators/authValidators.js  # Input validation rules
│   ├── nodemailer/gmail.js   # Email sending
│   ├── seed.js               # Demo data seeder
│   └── uploads/              # Uploaded files storage
├── Frontend/
│   ├── src/
│   │   ├── App.jsx           # All routes defined
│   │   ├── api.js            # Axios instance + interceptors
│   │   ├── PAGES/            # All page components (25+ pages)
│   │   ├── components/       # Reusable UI components
│   │   └── utils/saveAsPdf.js
│   └── vite.config.js
└── VIVA_SUMMARY.md           # Yeh file
```

---

## 11. How to Run (Demo ke liye)

```bash
# Step 1: Root se install
npm install

# Step 2: Backend mein .env file banao
# DATABASE_URL=mongodb+srv://...
# JWT_SECRET=your_secret_key
# PORT=3030

# Step 3: Demo data seed karo
cd backend
npm run seed

# Step 4: Dono servers ek saath chalao (root se)
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3030/api/v1

**Demo Accounts (seed ke baad):**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | 123456 |
| Teacher | teacher@gmail.com | 123456 |
| Student | student@gmail.com | 123456 |

---

## 12. Common Viva Questions & Answers

### Q1: Aap ka project kya hai aur kyun banaya?
**A:** Yeh ek School Management System hai jo MERN stack pe bana hai. Is ka maqsad school ki manual paperwork ko digital karna hai — students, teachers, courses, attendance, marks, assignments sab ek platform pe manage ho.

### Q2: MERN stack kya hai?
**A:** MERN = MongoDB + Express + React + Node.js. MongoDB database hai, Express backend framework, React frontend library, aur Node.js JavaScript runtime jo server pe code chalata hai.

### Q3: MongoDB kyun use kiya, SQL kyun nahi?
**A:** MongoDB NoSQL database hai — flexible schema ke saath. School data mein different structures hain (attendance, marks, assignments) jo documents ke form mein easily store ho sakte hain. Scalability aur JSON-like data structure React ke saath naturally fit hota hai.

### Q4: JWT kya hai aur kaise kaam karta hai?
**A:** JWT (JSON Web Token) ek secure token hai jo login ke baad generate hota hai. Is mein user ki ID, email, aur role encoded hoti hai. Har protected API request mein yeh token header mein bheja jata hai. Server token verify karke user ki identity confirm karta hai — bina har baar password pooche.

### Q5: bcrypt kya hai?
**A:** bcrypt ek password hashing algorithm hai. Login pe password ko hash karke database mein store kiya jata hai. Agar database hack bhi ho jaye to original password nahi nikal sakte. bcrypt mein "salt rounds" (10) hain jo brute force attacks ko slow karte hain.

### Q6: Role-Based Access Control (RBAC) kya hai?
**A:** System mein 3 roles hain — admin, teacher, student. Har role ko alag permissions hain. Backend mein `authorizeRoles` middleware check karta hai ke user ka role allowed hai ya nahi. Frontend mein `ProtectedRoute` component routes protect karta hai.

### Q7: Middleware kya hota hai Express mein?
**A:** Middleware ek function hai jo request aur response ke beech mein chalta hai. Jaise: pehle JWT verify (authenticate), phir role check (authorizeRoles), phir input validate (validate), phir controller function. Chain ki tarah kaam karta hai.

### Q8: Mongoose kya hai?
**A:** Mongoose MongoDB ka ODM (Object Document Mapper) hai Node.js ke liye. Yeh schemas define karta hai (validation, types, defaults), relationships handle karta hai (populate/ref), aur queries simplify karta hai.

### Q9: REST API kya hai?
**A:** REST (Representational State Transfer) ek API design pattern hai. HTTP methods use hote hain: GET (read), POST (create), PUT (update), DELETE (delete). Har resource ka apna URL endpoint hota hai, jaise `/api/v1/courses`.

### Q10: Frontend aur Backend alag kyun hain?
**A:** Separation of Concerns — frontend sirf UI handle karta hai, backend sirf business logic aur database. Benefits: independent development, scalability, security (database direct expose nahi hota), aur ek backend multiple clients serve kar sakta hai (web, mobile).

### Q11: CORS kya hai?
**A:** CORS (Cross-Origin Resource Sharing) ek security mechanism hai. Browser by default different origin (port/domain) se requests block karta hai. Hamara frontend (5173) aur backend (3030) alag ports pe hain, is liye CORS configure kiya hai taake frontend backend se baat kar sake.

### Q12: Multer kya hai?
**A:** Multer Express ka middleware hai file uploads handle karne ke liye. Yeh files ko server ke `uploads/` folder mein save karta hai, file type aur size validate karta hai, aur unique filename generate karta hai.

### Q13: Enrollment system kaise kaam karta hai?
**A:** Jab teacher student add karta hai to automatically enrollment create hoti hai. `Enrollment` model mein `studentId` aur `courseId` ka unique combination hai — matlab ek student ek course mein sirf ek baar enroll ho sakta hai. Status: active, completed, ya dropped.

### Q14: Teacher apne students ko kaise manage karta hai?
**A:** Admin pehle course banata hai aur teacher assign karta hai. Phir teacher apne course mein students add karta hai (`POST /teachers/students`). Teacher sirf apne assigned courses ke students ko dekh/edit/delete kar sakta hai — yeh backend mein `assertTeacherOwnsStudent` function se check hota hai.

### Q15: React Router kya hai?
**A:** React Router DOM client-side routing provide karta hai. Bina page reload ke different pages dikhata hai. Hamare project mein `/admin-dashboard`, `/teacher-dashboard`, `/student-home` alag alag routes hain jo role ke hisaab se protect hain.

### Q16: Axios interceptors kya hain?
**A:** Axios interceptors har request/response ke beech mein automatically code chalate hain. Hamara request interceptor har API call mein JWT token header mein add karta hai. Response interceptor 401 (unauthorized) pe user ko logout karke login page pe bhej deta hai.

### Q17: express-validator kya karta hai?
**A:** Request body ke data ko validate karta hai — jaise email format sahi hai, password minimum length hai, required fields hain. Invalid data pe 400 error return hota hai bina controller tak pahunche.

### Q18: Vite kya hai, Create React App se kya farq hai?
**A:** Vite ek modern build tool hai jo development mein bahut fast hai (ES modules use karta hai). Create React App se faster hot start aur hot module replacement deta hai. Production mein Rollup se optimized bundle banata hai.

### Q19: Tailwind CSS kya hai?
**A:** Tailwind ek utility-first CSS framework hai. Pre-built classes use karte hain jaise `bg-blue-500`, `p-4`, `rounded-lg` — custom CSS likhne ki zaroorat kam hoti hai. Responsive design aur dark mode easily implement hota hai.

### Q20: Future improvements kya ho sakti hain?
**A:**
- Mobile app (React Native)
- Real-time notifications (Socket.io)
- Parent portal
- Fee management module
- Online exam system with timer
- Chat/messaging between teacher-student
- Cloud storage (AWS S3) for files instead of local uploads
- Two-factor authentication (2FA)
- Analytics dashboard with charts

---

## 13. Important Code Concepts (Yaad Rakhein)

### JWT Generate (Backend)
```javascript
jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: "8h" })
```

### Password Hash (Registration)
```javascript
const hashedPassword = await bcrypt.hash(Password, 10);
```

### Password Verify (Login)
```javascript
const isMatch = await bcrypt.compare(Password, user.Password);
```

### Protected API Route Pattern
```javascript
router.post("/courses", authenticate, authorizeRoles("admin"), addCourse);
```

### Frontend API Call Pattern
```javascript
const res = await API.get("/dashboard/stats");
// Token automatically added by Axios interceptor
```

### Role-Based Data Filtering (Backend)
```javascript
// Teacher sirf apne courses ka data dekhe
if (req.user.role === "teacher") {
  filter.teacherId = req.user.id;
}
```

---

## 14. Project Highlights (Viva mein batayein)

1. **Full MERN Stack** — Complete end-to-end application
2. **3-Role System** — Admin, Teacher, Student with proper RBAC
3. **JWT Authentication** — Secure token-based login
4. **File Upload System** — Assignments, course materials, resources
5. **Assignment Workflow** — Create → Submit → Grade complete cycle
6. **Bulk Operations** — Attendance aur marks bulk entry + CSV
7. **Datesheet Finalization** — Draft → Admin approval → Finalized workflow
8. **Modern UI** — Glassmorphism design, Framer Motion animations, Tailwind CSS
9. **Input Validation** — Both frontend forms aur backend express-validator
10. **Scoped Data Access** — Teacher sirf apna data, student sirf apna data
11. **Dashboard Analytics** — Role-based live statistics
12. **PDF Export** — Attendance/marks save as PDF
13. **Rich Text Editor** — Datesheet aur papers ke liye HTML editor
14. **Seed Script** — Demo data for testing
15. **Security Headers** — Production-ready security measures

---

## 15. Quick Revision Checklist

- [ ] Project ka naam aur purpose bata sakte hain
- [ ] MERN stack explain kar sakte hain
- [ ] 3 roles aur un ke permissions
- [ ] Database ke 10 models aur un ke relationships
- [ ] JWT authentication flow
- [ ] bcrypt password hashing
- [ ] Middleware chain samajh aati hai
- [ ] REST API endpoints yaad hain
- [ ] Frontend routes aur ProtectedRoute
- [ ] File upload system (Multer)
- [ ] Assignment workflow (create → submit → grade)
- [ ] Enrollment system
- [ ] Project run karna aata hai (npm run dev + seed)
- [ ] Demo accounts yaad hain
- [ ] Future scope bata sakte hain

---

**All the best for your viva! 🎓**

*File created: July 27, 2026*
