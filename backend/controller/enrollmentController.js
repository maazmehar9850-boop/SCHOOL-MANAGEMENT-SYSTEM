import Enrollment from "../model/Enrollment.js";
import Course from "../model/Course.js";
import register from "../model/register.js";

const assertTeacherOwnsCourse = async (req, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) return { ok: false, status: 404, message: "Course not found" };
  if (
    req.user.role === "teacher" &&
    (!course.teacherId || String(course.teacherId) !== String(req.user.id))
  ) {
    return { ok: false, status: 403, message: "Not your course" };
  }
  return { ok: true, course };
};

export const enrollStudent = async (req, res) => {
  try {
    // Admin is view-only for enrollments — teachers enroll their own students
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admin can view enrollments only. Teachers enroll their own students.",
      });
    }

    const { studentId, courseId } = req.body;

    const ownership = await assertTeacherOwnsCourse(req, courseId);
    if (!ownership.ok) {
      return res.status(ownership.status).json({ message: ownership.message });
    }

    const student = await register.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const enrollment = await Enrollment.create({ studentId, courseId });
    const populated = await Enrollment.findById(enrollment._id)
      .populate("studentId", "name email")
      .populate("courseId");

    res.status(201).json({ message: "Enrolled successfully", enrollment: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Student already enrolled in this course" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const filter = { status: "active" };

    if (req.user.role === "student") {
      filter.studentId = req.user.id;
    } else if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.user.role === "teacher") {
      const myCourses = await Course.find({ teacherId: req.user.id }).select("_id");
      const courseIds = myCourses.map((c) => String(c._id));

      if (req.query.courseId) {
        if (!courseIds.includes(String(req.query.courseId))) {
          return res.status(200).json([]);
        }
        filter.courseId = req.query.courseId;
      } else {
        filter.courseId = { $in: myCourses.map((c) => c._id) };
      }
    } else if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("studentId", "name email phone")
      .populate({
        path: "courseId",
        populate: { path: "teacherId", select: "name email subject" },
      });

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const myCourses = await Course.find({ teacherId: req.user.id });
    const courseIds = myCourses.map((c) => c._id);

    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      status: "active",
    })
      .populate("studentId", "name email phone")
      .populate("courseId", "courseName courseCode className");

    const map = new Map();
    for (const e of enrollments) {
      if (!e.studentId) continue;
      const key = e.studentId._id.toString();
      if (!map.has(key)) {
        map.set(key, {
          ...e.studentId.toObject(),
          courses: [],
        });
      }
      if (e.courseId) {
        map.get(key).courses.push(e.courseId);
      }
    }

    res.status(200).json(Array.from(map.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unenrollStudent = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admin can view enrollments only. Teachers manage their own students.",
      });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const ownership = await assertTeacherOwnsCourse(req, enrollment.courseId);
    if (!ownership.ok) {
      return res.status(ownership.status).json({ message: ownership.message });
    }

    await Enrollment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
