import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./PAGES/Landing.jsx";
import Login from "./PAGES/Login.jsx";
import Register from "./PAGES/Register.jsx";
import AdminDashboard from "./PAGES/AdminDashboard.jsx";
import TeacherDashboard from "./PAGES/TeacherDashboard.jsx";
import StudentHome from "./PAGES/StudentHome.jsx";
import Students from "./PAGES/Students.jsx";
import AddStudent from "./PAGES/ADDStudent.jsx";
import Teachers from "./PAGES/Teacher.jsx";
import AddTeacher from "./PAGES/ADDTeacher.jsx";
import MyStudents from "./PAGES/MyStudents.jsx";
import Courses from "./PAGES/Courses.jsx";
import AddCourses from "./PAGES/ADDCourses.jsx";
import TeacherTools from "./PAGES/TeacherTools.jsx";
import TeacherAttendance from "./PAGES/TeacherAttendance.jsx";
import TeacherMarks from "./PAGES/TeacherMarks.jsx";
import StudentResources from "./PAGES/StudentResources.jsx";
import StudentResults from "./PAGES/StudentResults.jsx";
import StudentAttendance from "./PAGES/StudentAttendance.jsx";
import Profile from "./PAGES/Profile.jsx";
import StudentSubjects from "./PAGES/StudentSubjects.jsx";
import Assignments from "./PAGES/Assignments.jsx";
import Enrollments from "./PAGES/Enrollments.jsx";
import ForgotPassword from "./PAGES/ForgotPassword.jsx";
import ResetPassword from "./PAGES/ResetPassword.jsx";
import AdminPasswordResets from "./PAGES/AdminPasswordResets.jsx";
import SessionManager from "./components/SessionManager.jsx";

function App() {
  return (
    <>
      <SessionManager />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/password-resets"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPasswordResets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-student"
        element={
          <ProtectedRoute roles={["teacher"]}>
            <AddStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-teacher"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-course"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollments"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Enrollments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute roles={["teacher", "admin"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-tools"
        element={
          <ProtectedRoute roles={["teacher", "admin"]}>
            <TeacherTools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute roles={["teacher"]}>
            <TeacherAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marks"
        element={
          <ProtectedRoute roles={["teacher"]}>
            <TeacherMarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["admin", "teacher", "student"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-profile"
        element={
          <ProtectedRoute roles={["teacher", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-students"
        element={
          <ProtectedRoute roles={["teacher"]}>
            <MyStudents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-home"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <StudentHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-profile"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-attendance"
        element={
          <ProtectedRoute roles={["admin"]}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-marks"
        element={
          <ProtectedRoute roles={["admin"]}>
            <StudentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-attendance"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-subjects"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute roles={["student", "teacher", "admin"]}>
            <StudentResources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-results"
        element={
          <ProtectedRoute roles={["student", "teacher", "admin"]}>
            <StudentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute roles={["student", "admin", "teacher"]}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute roles={["student", "teacher", "admin"]}>
            <Assignments />
          </ProtectedRoute>
        }
      />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
