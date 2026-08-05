import register from "../model/register.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import Mark from "../model/Mark.js";
import Attendance from "../model/Attendance.js";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.Password;
  return obj;
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    tokenVersion: user.tokenVersion ?? 0,
  };
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secretKey, { expiresIn: "8h" });
};

const revokeUserTokens = async (userId) => {
  await register.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

/** Teacher must have at least one active enrollment with this student */
const assertTeacherOwnsStudent = async (teacherId, studentId) => {
  const myCourses = await Course.find({ teacherId }).select("_id");
  if (!myCourses.length) {
    return { ok: false, status: 403, message: "No courses assigned to you" };
  }
  const enrolled = await Enrollment.findOne({
    studentId,
    courseId: { $in: myCourses.map((c) => c._id) },
    status: "active",
  });
  if (!enrolled) {
    return { ok: false, status: 403, message: "Not your student" };
  }
  return { ok: true };
};

/** Admin registers teachers only — students are added by subject teachers */
export const registeruser = async (req, res) => {
  try {
    const { name, email, Password, role, bio, subject, experience, phone } = req.body;

    if (role === "student") {
      return res.status(403).json({
        message: "Only subject teachers can add students to their courses",
      });
    }
    if (role && role !== "teacher") {
      return res.status(400).json({ message: "Admin can only register teachers" });
    }

    const existing = await register.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const saveuser = await register.create({
      name,
      email: email.toLowerCase(),
      Password: hashedPassword,
      role: "teacher",
      bio: bio || "",
      subject: subject || "",
      experience: experience || "",
      phone: phone || "",
    });

    return res.status(201).json({
      message: "Teacher registered successfully",
      role: saveuser.role,
      User: sanitizeUser(saveuser),
    });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Teacher adds a student for one of their courses and enrolls them.
 * If email already belongs to a student, enrolls them into this course.
 */
export const addStudentByTeacher = async (req, res) => {
  try {
    const { name, email, Password, phone, courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Please select your course / subject" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!course.teacherId || String(course.teacherId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only add students to your own courses",
      });
    }

    const emailNorm = String(email).toLowerCase().trim();
    let student = await register.findOne({ email: emailNorm });

    if (student && student.role !== "student") {
      return res.status(409).json({
        message: "This email belongs to a non-student account",
      });
    }

    let created = false;
    if (!student) {
      if (!name || !Password) {
        return res.status(400).json({
          message: "Name and password are required for a new student",
        });
      }
      const passwordError = validatePasswordStrength(Password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      const hashedPassword = await bcrypt.hash(Password, 10);
      student = await register.create({
        name: String(name).trim(),
        email: emailNorm,
        Password: hashedPassword,
        role: "student",
        phone: phone || "",
      });
      created = true;
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId: course._id,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "This student is already enrolled in this course",
        student: sanitizeUser(student),
        enrollment: existingEnrollment,
      });
    }

    const enrollment = await Enrollment.create({
      studentId: student._id,
      courseId: course._id,
      status: "active",
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate("studentId", "name email phone")
      .populate("courseId", "courseName courseCode className");

    return res.status(201).json({
      message: created
        ? "Student created and enrolled in your course"
        : "Existing student enrolled in your course",
      created,
      student: sanitizeUser(student),
      enrollment: populated,
    });
  } catch (error) {
    console.error("Error adding student by teacher:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Public signup — teachers only (students added by subject teachers) */
export const signupUser = async (req, res) => {
  try {
    const { name, email, Password, role } = req.body;

    if (role === "student") {
      return res.status(403).json({
        message:
          "Students are added by their subject teacher. Please contact Aspira College.",
      });
    }

    const existing = await register.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const saveuser = await register.create({
      name,
      email: email.toLowerCase(),
      Password: hashedPassword,
      role: "teacher",
    });

    const token = generateToken(saveuser);
    return res.status(201).json({
      message: "Account created successfully",
      token,
      role: saveuser.role,
      User: sanitizeUser(saveuser),
    });
  } catch (error) {
    console.error("Error signing up:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, Password } = req.body;
    const user = await register.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      User: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await revokeUserTokens(req.user.id);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateuser = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await register.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "student") {
      return res.status(403).json({
        message: "Students are managed by their subject teachers (view-only for admin)",
      });
    }

    const { name, email, Password, role, bio, subject, experience, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (subject !== undefined) updateData.subject = subject;
    if (experience !== undefined) updateData.experience = experience;
    if (phone !== undefined) updateData.phone = phone;

    if (email !== undefined && email.toLowerCase() !== target.email) {
      const taken = await register.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (taken) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }

    if (role && ["admin", "teacher"].includes(role)) {
      updateData.role = role;
    }

    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
      await revokeUserTokens(id);
    }

    const updatedUser = await register
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-Password");

    return res.status(200).json({ message: "User updated successfully", User: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await register.findById(req.user.id).select("-Password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ User: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, Password, bio, subject, experience, phone } = req.body;
    const current = await register.findById(req.user.id);
    if (!current) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (subject !== undefined) updateData.subject = subject;
    if (experience !== undefined) updateData.experience = experience;
    if (phone !== undefined) updateData.phone = phone;

    if (email !== undefined) {
      const emailNorm = email.toLowerCase().trim();
      if (emailNorm !== current.email) {
        const taken = await register.findOne({ email: emailNorm, _id: { $ne: req.user.id } });
        if (taken) {
          return res.status(409).json({ message: "Email already registered" });
        }
      }
      updateData.email = emailNorm;
    }

    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
      await revokeUserTokens(req.user.id);
    }

    const updatedUser = await register
      .findByIdAndUpdate(req.user.id, updateData, { new: true })
      .select("-Password");

    return res.status(200).json({ message: "Profile updated successfully", User: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteone = async (req, res) => {
  try {
    const target = await register.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "student") {
      return res.status(403).json({
        message: "Students are managed by their subject teachers (view-only for admin)",
      });
    }

    await register.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** Admin: all students with courses + teachers (read-only overview) */
export const getStudents = async (req, res) => {
  try {
    const students = await register.find({ role: "student" }).select("-Password").lean();

    const enrollments = await Enrollment.find({ status: "active" })
      .populate("courseId", "courseName courseCode className teacher teacherId")
      .populate({
        path: "courseId",
        populate: { path: "teacherId", select: "name email subject" },
      })
      .lean();

    const byStudent = new Map();
    for (const e of enrollments) {
      if (!e.studentId || !e.courseId) continue;
      const sid = String(e.studentId);
      if (!byStudent.has(sid)) byStudent.set(sid, []);
      byStudent.get(sid).push({
        courseName: e.courseId.courseName,
        courseCode: e.courseId.courseCode,
        className: e.courseId.className,
        teacher: e.courseId.teacherId?.name || e.courseId.teacher || "—",
        teacherSubject: e.courseId.teacherId?.subject || "",
      });
    }

    const enriched = students.map((s) => ({
      ...s,
      courses: byStudent.get(String(s._id)) || [],
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await register.findById(req.params.id).select("-Password");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Teachers may only view students enrolled in their courses
    if (req.user.role === "teacher") {
      const myCourses = await Course.find({ teacherId: req.user.id }).select("_id");
      const enrolled = await Enrollment.findOne({
        studentId: student._id,
        courseId: { $in: myCourses.map((c) => c._id) },
        status: "active",
      });
      if (!enrolled) {
        return res.status(403).json({ message: "Not your student" });
      }
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await register.find({ role: "teacher" }).select("-Password");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/** Teacher updates a student enrolled in their courses (name, email, password, phone) */
export const updateStudentByTeacher = async (req, res) => {
  try {
    const student = await register.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const access = await assertTeacherOwnsStudent(req.user.id, student._id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const { name, email, Password, phone } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) {
      const emailNorm = email.toLowerCase().trim();
      if (emailNorm !== student.email) {
        const taken = await register.findOne({ email: emailNorm, _id: { $ne: student._id } });
        if (taken) {
          return res.status(409).json({ message: "Email already registered" });
        }
      }
      updateData.email = emailNorm;
    }
    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
      await revokeUserTokens(student._id);
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updated = await register
      .findByIdAndUpdate(student._id, updateData, { new: true })
      .select("-Password");

    return res.status(200).json({
      message: "Student updated successfully",
      student: updated,
    });
  } catch (error) {
    console.error("Error updating student by teacher:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Teacher deletes a student enrolled in their courses */
export const deleteStudentByTeacher = async (req, res) => {
  try {
    const student = await register.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const access = await assertTeacherOwnsStudent(req.user.id, student._id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    await Promise.all([
      Enrollment.deleteMany({ studentId: student._id }),
      Mark.deleteMany({ studentId: student._id }),
      Attendance.deleteMany({ studentId: student._id }),
    ]);
    await register.findByIdAndDelete(student._id);

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student by teacher:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};
