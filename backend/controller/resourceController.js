import Syllabus from "../model/Syllabus.js";
import Datesheet from "../model/Datesheet.js";
import Paper from "../model/Paper.js";
import Attendance from "../model/Attendance.js";
import Mark from "../model/Mark.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import register from "../model/register.js";

const getTeacherCourseIds = async (teacherId) => {
  const courses = await Course.find({ teacherId }).select("_id courseName");
  return courses;
};

const getStudentCourseIds = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId, status: "active" }).select("courseId");
  return enrollments.map((e) => e.courseId);
};

// --- Syllabus ---
export const addSyllabus = async (req, res) => {
  try {
    const doc = await Syllabus.create({
      ...req.body,
      teacher: req.body.teacher || req.user.name,
    });
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSyllabi = async (req, res) => {
  try {
    const items = await Syllabus.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSyllabus = async (req, res) => {
  try {
    const item = await Syllabus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSyllabus = async (req, res) => {
  try {
    await Syllabus.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Datesheet ---
export const addDatesheet = async (req, res) => {
  try {
    const doc = await Datesheet.create(req.body);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDatesheets = async (req, res) => {
  try {
    const items = await Datesheet.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDatesheet = async (req, res) => {
  try {
    const item = await Datesheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDatesheet = async (req, res) => {
  try {
    await Datesheet.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Paper ---
export const addPaper = async (req, res) => {
  try {
    const doc = await Paper.create(req.body);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPapers = async (req, res) => {
  try {
    const items = await Paper.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePaper = async (req, res) => {
  try {
    const item = await Paper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePaper = async (req, res) => {
  try {
    await Paper.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Attendance ---
export const addAttendance = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      teacherId: req.body.teacherId || req.user.id,
      teacher: req.body.teacher || req.user.name,
    };

    if (!payload.studentId && payload.studentName) {
      const student = await register.findOne({
        name: payload.studentName,
        role: "student",
      });
      if (student) payload.studentId = student._id;
    }

    const doc = await Attendance.create(payload);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "student") {
      filter.$or = [
        { studentId: req.user.id },
        { studentName: req.user.name },
      ];
    } else if (req.user.role === "teacher") {
      const courses = await getTeacherCourseIds(req.user.id);
      const names = courses.map((c) => c.courseName);
      filter.$or = [
        { teacherId: req.user.id },
        { teacher: req.user.name },
        { course: { $in: names } },
      ];
    }

    const items = await Attendance.find(filter).sort({ date: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const item = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Marks ---
export const addMark = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      teacherId: req.body.teacherId || req.user.id,
      teacher: req.body.teacher || req.user.name,
    };

    if (!payload.studentId && payload.studentName) {
      const student = await register.findOne({
        name: payload.studentName,
        role: "student",
      });
      if (student) payload.studentId = student._id;
    }

    const doc = await Mark.create(payload);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMarks = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "student") {
      filter.$or = [
        { studentId: req.user.id },
        { studentName: req.user.name },
      ];
    } else if (req.user.role === "teacher") {
      filter.$or = [{ teacherId: req.user.id }, { teacher: req.user.name }];
    }

    const items = await Mark.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMark = async (req, res) => {
  try {
    const item = await Mark.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMark = async (req, res) => {
  try {
    await Mark.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getStudentCourseIds };
