/**
 * Clears students (and related school data) so admin can re-add users from scratch.
 * Keeps the admin account.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Register from "./model/register.js";
import Enrollment from "./model/Enrollment.js";
import Attendance from "./model/Attendance.js";
import Mark from "./model/Mark.js";
import Assignment from "./model/Assignment.js";
import Submission from "./model/Submission.js";
import Course from "./model/Course.js";
import Syllabus from "./model/Syllabus.js";
import Datesheet from "./model/Datesheet.js";
import Paper from "./model/Paper.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const students = await Register.find({ role: "student" }).select("_id email name");
    const teachers = await Register.find({ role: "teacher" }).select("_id email name");
    const studentIds = students.map((s) => s._id);
    const teacherIds = teachers.map((t) => t._id);

    const [
      delStudents,
      delTeachers,
      delEnroll,
      delAtt,
      delMarks,
      delSubs,
      delAssign,
      delCourses,
      delSyl,
      delDate,
      delPaper,
    ] = await Promise.all([
      Register.deleteMany({ role: "student" }),
      Register.deleteMany({ role: "teacher" }),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Mark.deleteMany({}),
      Submission.deleteMany({}),
      Assignment.deleteMany({}),
      Course.deleteMany({}),
      Syllabus.deleteMany({}),
      Datesheet.deleteMany({}),
      Paper.deleteMany({}),
    ]);

    console.log("✅ Cleared for fresh admin setup");
    console.log(`   Students removed: ${delStudents.deletedCount} (${students.map((s) => s.email).join(", ") || "none"})`);
    console.log(`   Teachers removed: ${delTeachers.deletedCount} (${teachers.map((t) => t.email).join(", ") || "none"})`);
    console.log(`   Enrollments: ${delEnroll.deletedCount}`);
    console.log(`   Attendance: ${delAtt.deletedCount}`);
    console.log(`   Marks: ${delMarks.deletedCount}`);
    console.log(`   Submissions: ${delSubs.deletedCount}`);
    console.log(`   Assignments: ${delAssign.deletedCount}`);
    console.log(`   Courses: ${delCourses.deletedCount}`);
    console.log(`   Syllabus/Date sheets/Papers: ${delSyl.deletedCount}/${delDate.deletedCount}/${delPaper.deletedCount}`);
    console.log("   Admin kept — login with admin@gmail.com / 123456 (if seeded) or your admin account");
    console.log("IDs cleared:", { studentIds: studentIds.length, teacherIds: teacherIds.length });

    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
