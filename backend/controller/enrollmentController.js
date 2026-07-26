import Enrollment from "../model/Enrollment.js";
import Course from "../model/Course.js";
import register from "../model/register.js";

export const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await register.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
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
    const filter = {};

    if (req.user.role === "student") {
      filter.studentId = req.user.id;
    } else if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    if (req.user.role === "teacher") {
      const myCourses = await Course.find({ teacherId: req.user.id }).select("_id");
      const courseIds = myCourses.map((c) => c._id);
      filter.courseId = { $in: courseIds };
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
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
