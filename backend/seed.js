import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Register from "./model/register.js";
import Course from "./model/Course.js";
import Enrollment from "./model/Enrollment.js";
import Attendance from "./model/Attendance.js";
import Mark from "./model/Mark.js";
import Assignment from "./model/Assignment.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Register.deleteMany({
        email: {
          $in: [
            "admin@gmail.com",
            "teacher@gmail.com",
            "student@gmail.com",
            "sara.student@gmail.com",
            "bilal.student@gmail.com",
            "zara.student@gmail.com",
          ],
        },
      }),
      Course.deleteMany({ courseCode: { $in: ["MATH101", "ENG201", "SCI301"] } }),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Mark.deleteMany({}),
      Assignment.deleteMany({}),
    ]);

    const password = await bcrypt.hash("123456", 10);

    const admin = await Register.create({
      name: "Admin",
      email: "admin@gmail.com",
      Password: password,
      role: "admin",
      bio: "System administrator",
    });

    const teacher = await Register.create({
      name: "Sara Khan",
      email: "teacher@gmail.com",
      Password: password,
      role: "teacher",
      subject: "Mathematics",
      experience: "8 years",
      bio: "Passionate about making math approachable.",
      phone: "0300-1112233",
    });

    const student = await Register.create({
      name: "Ali Ahmed",
      email: "student@gmail.com",
      Password: password,
      role: "student",
      bio: "Curious learner and football enthusiast.",
      phone: "0300-4445566",
    });

    const extraStudents = await Register.insertMany([
      {
        name: "Sara Malik",
        email: "sara.student@gmail.com",
        Password: password,
        role: "student",
        phone: "0300-7778899",
        bio: "Loves science experiments.",
      },
      {
        name: "Bilal Khan",
        email: "bilal.student@gmail.com",
        Password: password,
        role: "student",
        phone: "0301-2223344",
        bio: "Enjoys reading and debate.",
      },
      {
        name: "Zara Hussain",
        email: "zara.student@gmail.com",
        Password: password,
        role: "student",
        phone: "0302-5556677",
        bio: "Aspiring engineer.",
      },
    ]);

    const math = await Course.create({
      courseName: "Mathematics",
      courseCode: "MATH101",
      teacher: teacher.name,
      teacherId: teacher._id,
      className: "Grade 10-A",
      duration: "1 Year",
      description: "Algebra, geometry, and introductory calculus.",
      roomNumber: "B-12",
      schedule: "Mon/Wed 09:00",
      status: "Active",
    });

    const english = await Course.create({
      courseName: "English Literature",
      courseCode: "ENG201",
      teacher: teacher.name,
      teacherId: teacher._id,
      className: "Grade 10-A",
      duration: "1 Year",
      description: "Reading, writing, and literary analysis.",
      roomNumber: "A-04",
      schedule: "Tue/Thu 10:00",
      status: "Active",
    });

    const science = await Course.create({
      courseName: "General Science",
      courseCode: "SCI301",
      teacher: teacher.name,
      teacherId: teacher._id,
      className: "Grade 10-A",
      duration: "1 Year",
      description: "Physics, chemistry, and biology fundamentals.",
      roomNumber: "Lab-1",
      schedule: "Fri 11:00",
      status: "Active",
    });

    await Enrollment.insertMany([
      { studentId: student._id, courseId: math._id },
      { studentId: student._id, courseId: english._id },
      { studentId: student._id, courseId: science._id },
      { studentId: extraStudents[0]._id, courseId: math._id },
      { studentId: extraStudents[0]._id, courseId: english._id },
      { studentId: extraStudents[1]._id, courseId: english._id },
      { studentId: extraStudents[1]._id, courseId: math._id },
      { studentId: extraStudents[2]._id, courseId: science._id },
      { studentId: extraStudents[2]._id, courseId: math._id },
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const attendanceRows = [];
    const mathStudents = [student, extraStudents[0], extraStudents[1], extraStudents[2]];
    for (const s of mathStudents) {
      attendanceRows.push({
        studentName: s.name,
        studentId: s._id,
        course: math.courseName,
        courseId: math._id,
        date: today,
        status: "Present",
        teacher: teacher.name,
        teacherId: teacher._id,
      });
    }
    await Attendance.insertMany(attendanceRows);

    await Mark.insertMany([
      {
        studentName: student.name,
        studentId: student._id,
        course: math.courseName,
        courseId: math._id,
        subject: "Algebra",
        score: 88,
        feedback: "Strong work on factoring.",
        teacher: teacher.name,
        teacherId: teacher._id,
      },
      {
        studentName: student.name,
        studentId: student._id,
        course: english.courseName,
        courseId: english._id,
        subject: "Essay Writing",
        score: 92,
        feedback: "Excellent structure and clarity.",
        teacher: teacher.name,
        teacherId: teacher._id,
      },
    ]);

    await Assignment.create({
      title: "Quadratic Equations Worksheet",
      description: "Solve problems 1–20 from chapter 4.",
      course: math.courseName,
      courseId: math._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      teacher: teacher.name,
      teacherId: teacher._id,
    });

    console.log("✅ Seed completed");
    console.log("Admin:   admin@gmail.com / 123456");
    console.log("Teacher: teacher@gmail.com / 123456");
    console.log("Student: student@gmail.com / 123456");
    console.log("IDs:", { admin: admin._id.toString(), teacher: teacher._id.toString(), student: student._id.toString() });

    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
