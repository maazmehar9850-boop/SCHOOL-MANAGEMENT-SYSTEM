import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Syllabus from "../model/Syllabus.js";
import Datesheet from "../model/Datesheet.js";
import Paper from "../model/Paper.js";
import Attendance from "../model/Attendance.js";
import Mark from "../model/Mark.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import register from "../model/register.js";
import { detectFileType } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getTeacherCourseIds = async (teacherId) => {
  const courses = await Course.find({ teacherId }).select("_id courseName");
  return courses;
};

const getStudentCourseIds = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId, status: "active" }).select("courseId");
  return enrollments.map((e) => e.courseId);
};

/** null = no course filter (admin sees all); otherwise match resource.course by name */
const getScopedCourseNames = async (req) => {
  if (req.user.role === "admin") return null;

  if (req.user.role === "teacher") {
    const courses = await getTeacherCourseIds(req.user.id);
    return courses.map((c) => c.courseName);
  }

  if (req.user.role === "student") {
    const courseIds = await getStudentCourseIds(req.user.id);
    const courses = await Course.find({ _id: { $in: courseIds } }).select("courseName");
    return courses.map((c) => c.courseName);
  }

  return [];
};

const courseFilter = (names) => {
  if (names == null) return {};
  return { course: { $in: names } };
};

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

/** Students only see their own attendance/marks across enrolled courses */
const buildStudentScopeFilter = async (userId, userName) => {
  const studentObjectId = toObjectId(userId);
  const enrolledCourseIds = await getStudentCourseIds(userId);
  const enrolledCourses = await Course.find({ _id: { $in: enrolledCourseIds } }).select(
    "courseName"
  );
  const courseNames = enrolledCourses.map((c) => c.courseName);

  const or = [];
  if (studentObjectId) {
    or.push({ studentId: studentObjectId });
    or.push({ studentId: String(userId) });
  }
  if (userName) {
    or.push({ studentName: userName });
    if (courseNames.length) {
      or.push({ studentName: userName, course: { $in: courseNames } });
    }
  }
  if (studentObjectId && enrolledCourseIds.length) {
    or.push({ studentId: studentObjectId, courseId: { $in: enrolledCourseIds } });
  }

  return or.length ? { $or: or } : { studentId: null };
};

const buildTeacherCourseScopeFilter = async (teacherId, teacherName) => {
  const courses = await getTeacherCourseIds(teacherId);
  const names = courses.map((c) => c.courseName);
  const courseIds = courses.map((c) => c._id);
  const teacherObjectId = toObjectId(teacherId);

  const or = [];
  if (teacherObjectId) or.push({ teacherId: teacherObjectId });
  or.push({ teacherId: teacherId });
  if (teacherName) or.push({ teacher: teacherName });
  if (names.length) or.push({ course: { $in: names } });
  if (courseIds.length) or.push({ courseId: { $in: courseIds } });

  return { $or: or };
};

/** Resolve course by id or name; for teachers must be allotted to them */
const resolveAllottedCourse = async (req, { courseId, courseName } = {}) => {
  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
  } else if (courseName) {
    const filter = { courseName: String(courseName).trim() };
    if (req.user.role === "teacher") filter.teacherId = req.user.id;
    course = await Course.findOne(filter);
  }

  if (!course) return { error: { status: 404, message: "Course not found" } };

  if (
    req.user.role === "teacher" &&
    course.teacherId &&
    String(course.teacherId) !== String(req.user.id)
  ) {
    return {
      error: {
        status: 403,
        message: "You can only manage resources for courses allotted to you",
      },
    };
  }

  return { course };
};

const removeFileIfExists = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const abs = path.join(__dirname, "..", fileUrl.replace(/^\//, ""));
  if (fs.existsSync(abs)) {
    try {
      fs.unlinkSync(abs);
    } catch {
      /* ignore */
    }
  }
};

const attachResourceFile = (req, payload) => {
  if (!req.file) return payload;
  payload.fileUrl = `/uploads/resources/${req.file.filename}`;
  payload.fileName = req.file.originalname;
  payload.fileType = detectFileType(req.file.mimetype);
  return payload;
};

const parseMaybeJson = (value, fallback) => {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeDatesheetEntries = (entries = []) =>
  entries.map((en) => {
    const startTime = en.startTime || "";
    const endTime = en.endTime || "";
    const time =
      en.time ||
      (startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || "");
    return {
      subject: en.subject || "",
      date: en.date || "",
      startTime,
      endTime,
      time,
      room: en.room || "",
      invigilator: en.invigilator || "",
    };
  });

const getExamEndDateTime = (entry) => {
  if (!entry?.date) return null;
  let endTime = (entry.endTime || "").trim();
  if (!endTime && entry.time) {
    const parts = String(entry.time).split(/[-–]/);
    endTime = (parts[1] || "").trim();
  }
  if (!endTime) endTime = "23:59";
  const dt = new Date(`${entry.date}T${endTime}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const getLatestExamEndForCourse = (datesheets, courseName) => {
  let latest = null;
  for (const sheet of datesheets) {
    if (sheet.course !== courseName || sheet.status !== "finalized") continue;
    for (const entry of sheet.entries || []) {
      const end = getExamEndDateTime(entry);
      if (end && (!latest || end > latest)) latest = end;
    }
  }
  return latest;
};

/** Active courses with assigned teachers must have syllabus + paper before admin can finalize */
const buildExamReadiness = async () => {
  const courses = await Course.find({ status: "Active", teacherId: { $ne: null } })
    .select("courseName courseCode teacher teacherId className")
    .sort({ courseName: 1 });

  const [syllabi, papers, datesheets] = await Promise.all([
    Syllabus.find({ course: { $in: courses.map((c) => c.courseName) } }).select("course"),
    Paper.find({ course: { $in: courses.map((c) => c.courseName) } }).select("course"),
    Datesheet.find().select("status course _id"),
  ]);

  const syllabusCourses = new Set(syllabi.map((s) => s.course));
  const paperCourses = new Set(papers.map((p) => p.course));
  const draftDatesheets = datesheets.filter((d) => d.status !== "finalized").length;
  const finalizedDatesheets = datesheets.filter((d) => d.status === "finalized").length;

  const datesheetsByCourse = {};
  for (const sheet of datesheets) {
    if (!datesheetsByCourse[sheet.course]) datesheetsByCourse[sheet.course] = [];
    datesheetsByCourse[sheet.course].push(sheet);
  }

  const courseStatus = courses.map((c) => {
    const hasSyllabus = syllabusCourses.has(c.courseName);
    const hasPaper = paperCourses.has(c.courseName);
    const courseSheets = datesheetsByCourse[c.courseName] || [];
    const draftSheet = courseSheets.find((d) => d.status !== "finalized");
    const finalizedSheet = courseSheets.find((d) => d.status === "finalized");
    const ready = hasSyllabus && hasPaper;
    return {
      courseId: c._id,
      courseName: c.courseName,
      courseCode: c.courseCode,
      className: c.className,
      teacher: c.teacher,
      hasSyllabus,
      hasPaper,
      ready,
      hasDatesheet: courseSheets.length > 0,
      datesheetId: draftSheet?._id || finalizedSheet?._id || null,
      datesheetStatus: finalizedSheet
        ? "finalized"
        : draftSheet
          ? "draft"
          : courseSheets.length
            ? "draft"
            : "none",
      canFinalizeCourse: ready && !!draftSheet,
      canUnfinalizeCourse: !!finalizedSheet,
    };
  });

  const allCoursesReady =
    courseStatus.length > 0 && courseStatus.every((c) => c.ready);
  const hasDatesheets = datesheets.length > 0;

  return {
    courses: courseStatus,
    summary: {
      totalCourses: courseStatus.length,
      readyCourses: courseStatus.filter((c) => c.ready).length,
      allCoursesReady,
      hasDatesheets,
      draftDatesheets,
      finalizedDatesheets,
      canFinalize: allCoursesReady && hasDatesheets && draftDatesheets > 0,
      canUnfinalize: finalizedDatesheets > 0,
      examsFinalized: datesheets.length > 0 && draftDatesheets === 0,
    },
  };
};

const getMarksEligibilityForCourse = async (courseName) => {
  const datesheets = await Datesheet.find({ course: courseName }).lean();
  const finalized = datesheets.filter((d) => d.status === "finalized");

  if (!finalized.length) {
    return {
      allowed: false,
      finalized: false,
      reason:
        "Exam schedule has not been finalized by admin. Marks entry opens after admin finalizes the date sheet.",
    };
  }

  const examEndAt = getLatestExamEndForCourse(finalized, courseName);
  if (!examEndAt) {
    return {
      allowed: false,
      finalized: true,
      reason: "No exam end time found on the finalized date sheet for this course.",
    };
  }

  const now = new Date();
  if (now < examEndAt) {
    return {
      allowed: false,
      finalized: true,
      examEndAt: examEndAt.toISOString(),
      reason: `Exam is still in progress. You can enter marks after ${examEndAt.toLocaleString()}.`,
    };
  }

  return {
    allowed: true,
    finalized: true,
    examEndAt: examEndAt.toISOString(),
    reason: "Marks entry is open for this course.",
  };
};

// --- Syllabus (admin creates; teachers/students view scoped courses) ---
export const addSyllabus = async (req, res) => {
  try {
    if (!req.body?.title || (!req.body?.course && !req.body?.courseId)) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    const { course, error } = await resolveAllottedCourse(req, {
      courseId: req.body.courseId,
      courseName: req.body.course,
    });
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const payload = attachResourceFile(req, {
      title: req.body.title,
      course: course.courseName,
      subject: req.body.subject || req.body.title || "",
      topics: req.body.topics || "",
      content: req.body.content || "",
      teacher: course.teacher || req.body.teacher || req.user.name,
      updatedAt: new Date(),
    });
    const doc = await Syllabus.create(payload);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    if (req.file) removeFileIfExists(`/uploads/resources/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSyllabi = async (req, res) => {
  try {
    const names = await getScopedCourseNames(req);
    const items = await Syllabus.find(courseFilter(names)).sort({
      updatedAt: -1,
      createdAt: -1,
    });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSyllabus = async (req, res) => {
  try {
    const existing = await Syllabus.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Syllabus not found" });

    let courseName = req.body.course ?? existing.course;
    if (req.body.courseId || req.body.course) {
      const { course, error } = await resolveAllottedCourse(req, {
        courseId: req.body.courseId,
        courseName: req.body.course || existing.course,
      });
      if (error) return res.status(error.status).json({ success: false, message: error.message });
      courseName = course.courseName;
    }

    const payload = {
      title: req.body.title ?? existing.title,
      course: courseName,
      subject: req.body.subject ?? existing.subject,
      topics: req.body.topics ?? existing.topics,
      content: req.body.content ?? existing.content,
      updatedAt: new Date(),
    };
    attachResourceFile(req, payload);
    if (req.file && existing.fileUrl) removeFileIfExists(existing.fileUrl);

    const item = await Syllabus.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    if (req.file) removeFileIfExists(`/uploads/resources/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSyllabus = async (req, res) => {
  try {
    const item = await Syllabus.findByIdAndDelete(req.params.id);
    if (item?.fileUrl) removeFileIfExists(item.fileUrl);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Datesheet (admin creates; teachers/students view scoped courses) ---
export const addDatesheet = async (req, res) => {
  try {
    if (!req.body?.title || (!req.body?.course && !req.body?.courseId)) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    const { course, error } = await resolveAllottedCourse(req, {
      courseId: req.body.courseId,
      courseName: req.body.course,
    });
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const entries = normalizeDatesheetEntries(parseMaybeJson(req.body.entries, req.body.entries || []));
    const doc = await Datesheet.create({
      title: req.body.title,
      course: course.courseName,
      notes: req.body.notes || "",
      entries,
      teacher: course.teacher || req.body.teacher || req.user.name,
      updatedAt: new Date(),
    });
    res.status(201).json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDatesheets = async (req, res) => {
  try {
    const names = await getScopedCourseNames(req);
    const items = await Datesheet.find(courseFilter(names)).sort({
      updatedAt: -1,
      createdAt: -1,
    });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDatesheet = async (req, res) => {
  try {
    const existing = await Datesheet.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Date sheet not found" });
    if (existing.status === "finalized") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a finalized date sheet",
      });
    }

    let courseName = req.body.course ?? existing.course;
    if (req.body.courseId || req.body.course) {
      const { course, error } = await resolveAllottedCourse(req, {
        courseId: req.body.courseId,
        courseName: req.body.course || existing.course,
      });
      if (error) return res.status(error.status).json({ success: false, message: error.message });
      courseName = course.courseName;
    }

    const payload = {
      title: req.body.title ?? existing.title,
      course: courseName,
      notes: req.body.notes ?? existing.notes,
      updatedAt: new Date(),
    };
    if (req.body.entries != null) {
      payload.entries = normalizeDatesheetEntries(parseMaybeJson(req.body.entries, req.body.entries));
    }
    const item = await Datesheet.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDatesheet = async (req, res) => {
  try {
    const existing = await Datesheet.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Date sheet not found" });
    if (existing.status === "finalized") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a finalized date sheet",
      });
    }
    await Datesheet.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: readiness overview — all teachers must upload syllabus + paper */
export const getExamReadiness = async (req, res) => {
  try {
    const readiness = await buildExamReadiness();
    res.status(200).json(readiness);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: finalize all draft date sheets when every course is ready */
export const finalizeExam = async (req, res) => {
  try {
    const readiness = await buildExamReadiness();
    if (!readiness.summary.hasDatesheets) {
      return res.status(400).json({
        success: false,
        message: "Create at least one date sheet before finalizing exams",
      });
    }
    if (!readiness.summary.allCoursesReady) {
      return res.status(400).json({
        success: false,
        message:
          "All teachers must upload syllabus and exam paper for their courses before finalizing",
        readiness,
      });
    }
    if (!readiness.summary.canFinalize) {
      return res.status(400).json({
        success: false,
        message: "All date sheets are already finalized",
        readiness,
      });
    }

    const result = await Datesheet.updateMany(
      { status: { $ne: "finalized" } },
      {
        $set: {
          status: "finalized",
          finalizedAt: new Date(),
          finalizedBy: req.user.name || "Admin",
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Exam schedule finalized. Teachers can enter marks after each paper's end time.",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const isCourseReadyForFinalize = async (courseName) => {
  const [syllabus, paper] = await Promise.all([
    Syllabus.findOne({ course: courseName }).select("_id"),
    Paper.findOne({ course: courseName }).select("_id"),
  ]);
  return !!(syllabus && paper);
};

/** Admin: finalize a single course date sheet when that course is ready */
export const finalizeDatesheetById = async (req, res) => {
  try {
    const sheet = await Datesheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Date sheet not found" });
    if (sheet.status === "finalized") {
      return res.status(400).json({ message: "This date sheet is already finalized" });
    }

    const ready = await isCourseReadyForFinalize(sheet.course);
    if (!ready) {
      return res.status(400).json({
        message: "Teacher must upload syllabus and exam paper for this course before finalizing",
      });
    }

    sheet.status = "finalized";
    sheet.finalizedAt = new Date();
    sheet.finalizedBy = req.user.name || "Admin";
    sheet.updatedAt = new Date();
    await sheet.save();

    res.status(200).json({
      success: true,
      message: `${sheet.course} exam finalized. Teachers can enter marks after the paper end time.`,
      item: sheet,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: reopen all finalized date sheets */
export const unfinalizeExam = async (req, res) => {
  try {
    const result = await Datesheet.updateMany(
      { status: "finalized" },
      {
        $set: { status: "draft", updatedAt: new Date() },
        $unset: { finalizedAt: "", finalizedBy: "" },
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ message: "No finalized date sheets to reopen" });
    }

    res.status(200).json({
      success: true,
      message: "Exam schedule reopened for editing. Marks entry is closed until you finalize again.",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: reopen a single finalized date sheet */
export const unfinalizeDatesheetById = async (req, res) => {
  try {
    const sheet = await Datesheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Date sheet not found" });
    if (sheet.status !== "finalized") {
      return res.status(400).json({ message: "This date sheet is not finalized" });
    }

    sheet.status = "draft";
    sheet.finalizedAt = null;
    sheet.finalizedBy = "";
    sheet.updatedAt = new Date();
    await sheet.save();

    res.status(200).json({
      success: true,
      message: `${sheet.course} date sheet reopened for editing.`,
      item: sheet,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Teachers: check if marks entry is allowed for a course */
export const getMarksEligibility = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      req.user.role === "teacher" &&
      course.teacherId &&
      String(course.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your course" });
    }

    const eligibility = await getMarksEligibilityForCourse(course.courseName);
    res.status(200).json(eligibility);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Paper (teacher creates only for allotted courses; admin can view all) ---
export const addPaper = async (req, res) => {
  try {
    if (!req.body?.title || (!req.body?.course && !req.body?.courseId)) {
      return res.status(400).json({
        success: false,
        message: "Title and course are required",
      });
    }

    const { course, error } = await resolveAllottedCourse(req, {
      courseId: req.body.courseId,
      courseName: req.body.course,
    });
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const questions = parseMaybeJson(req.body.questions, []);
    const payload = attachResourceFile(req, {
      title: req.body.title,
      course: course.courseName,
      subject: req.body.subject || "",
      instructions: req.body.instructions || "",
      questions: Array.isArray(questions) ? questions : [],
      teacher: req.user.name,
      updatedAt: new Date(),
    });
    const doc = await Paper.create(payload);
    res.status(201).json({ success: true, doc });
  } catch (err) {
    if (req.file) removeFileIfExists(`/uploads/resources/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPapers = async (req, res) => {
  try {
    const names = await getScopedCourseNames(req);
    const items = await Paper.find(courseFilter(names)).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePaper = async (req, res) => {
  try {
    const existing = await Paper.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Paper not found" });

    const nextCourseName = req.body.course ?? existing.course;
    const { course, error } = await resolveAllottedCourse(req, {
      courseId: req.body.courseId,
      courseName: nextCourseName,
    });
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    // Teachers may only edit papers for their allotted courses
    if (req.user.role === "teacher") {
      const allotted = await getTeacherCourseIds(req.user.id);
      const allowed = allotted.map((c) => c.courseName);
      if (!allowed.includes(existing.course)) {
        return res.status(403).json({ message: "Not your course paper" });
      }
    }

    const questions =
      req.body.questions != null
        ? parseMaybeJson(req.body.questions, existing.questions)
        : existing.questions;

    const payload = {
      title: req.body.title ?? existing.title,
      course: course.courseName,
      subject: req.body.subject ?? existing.subject,
      instructions: req.body.instructions ?? existing.instructions,
      questions: Array.isArray(questions) ? questions : existing.questions,
      updatedAt: new Date(),
    };
    attachResourceFile(req, payload);
    if (req.file && existing.fileUrl) removeFileIfExists(existing.fileUrl);

    const item = await Paper.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.status(200).json({ success: true, item });
  } catch (err) {
    if (req.file) removeFileIfExists(`/uploads/resources/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const existing = await Paper.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Paper not found" });

    if (req.user.role === "teacher") {
      const allotted = await getTeacherCourseIds(req.user.id);
      const allowed = allotted.map((c) => c.courseName);
      if (!allowed.includes(existing.course)) {
        return res.status(403).json({ message: "Not your course paper" });
      }
    }

    const item = await Paper.findByIdAndDelete(req.params.id);
    if (item?.fileUrl) removeFileIfExists(item.fileUrl);
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
      filter = await buildStudentScopeFilter(req.user.id, req.user.name);
    } else if (req.user.role === "teacher") {
      filter = await buildTeacherCourseScopeFilter(req.user.id, req.user.name);
    }

    if (req.query.date) {
      filter.date = req.query.date;
    } else if (req.query.month) {
      filter.date = { $regex: `^${String(req.query.month).slice(0, 7)}` };
    }
    if (req.query.courseId) filter.courseId = req.query.courseId;

    const items = await Attendance.find(filter).sort({ date: -1, studentName: 1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Upsert a full class roster for one course + date */
export const saveAttendanceBulk = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    if (!courseId || !date || !Array.isArray(records)) {
      return res.status(400).json({
        message: "courseId, date, and records[] are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (
      req.user.role === "teacher" &&
      course.teacherId &&
      String(course.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your course" });
    }

    const saved = [];
    for (const row of records) {
      if (!row.studentId || !row.status) continue;
      const student =
        (await register.findById(row.studentId).select("name")) || null;
      const studentObjectId = toObjectId(row.studentId);
      const payload = {
        studentId: studentObjectId || row.studentId,
        studentName: student?.name || row.studentName || "Student",
        courseId: course._id,
        course: course.courseName,
        date,
        status: row.status === "Absent" ? "Absent" : "Present",
        teacher: req.user.name || "",
        teacherId: req.user.id,
      };

      const doc = await Attendance.findOneAndUpdate(
        { studentId: row.studentId, courseId: course._id, date },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      saved.push(doc);
    }

    res.status(200).json({ message: "Attendance saved", records: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    if (req.user.role === "teacher" && req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (course) {
        const eligibility = await getMarksEligibilityForCourse(course.courseName);
        if (!eligibility.allowed) {
          return res.status(403).json({ message: eligibility.reason });
        }
      }
    }

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
      filter = await buildStudentScopeFilter(req.user.id, req.user.name);
    } else if (req.user.role === "teacher") {
      filter = await buildTeacherCourseScopeFilter(req.user.id, req.user.name);
    }

    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.subject) filter.subject = req.query.subject;

    const items = await Mark.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Upsert marks for enrolled students in a course */
export const saveMarksBulk = async (req, res) => {
  try {
    const { courseId, subject, records } = req.body;
    if (!courseId || !Array.isArray(records)) {
      return res.status(400).json({
        message: "courseId and records[] are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (
      req.user.role === "teacher" &&
      course.teacherId &&
      String(course.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your course" });
    }

    const subjectName =
      req.user.role === "teacher"
        ? course.courseName
        : (subject || course.courseName || "").trim();

    if (!subjectName) {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (
      req.user.role === "teacher" &&
      subject &&
      subject.trim() !== course.courseName
    ) {
      return res.status(403).json({
        message: "Teachers can only add marks for their allotted subject/course",
      });
    }

    if (req.user.role === "teacher") {
      const eligibility = await getMarksEligibilityForCourse(course.courseName);
      if (!eligibility.allowed) {
        return res.status(403).json({ message: eligibility.reason });
      }
    }

    const saved = [];
    for (const row of records) {
      if (!row.studentId) continue;
      const student =
        (await register.findById(row.studentId).select("name")) || null;
      const studentObjectId = toObjectId(row.studentId);
      const maxScore = Number(row.maxScore ?? req.body.maxScore) || 100;
      const score = Math.min(Number(row.score) || 0, maxScore);
      const payload = {
        studentId: studentObjectId || row.studentId,
        studentName: student?.name || row.studentName || "Student",
        courseId: course._id,
        course: course.courseName,
        subject: subjectName,
        score,
        maxScore,
        feedback: row.feedback || "",
        teacher: req.user.name || "",
        teacherId: req.user.id,
        updatedAt: new Date(),
      };

      const doc = await Mark.findOneAndUpdate(
        {
          studentId: studentObjectId || row.studentId,
          courseId: course._id,
          subject: subjectName,
          assignmentId: null,
        },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      saved.push(doc);
    }

    res.status(200).json({ message: "Marks saved", records: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
