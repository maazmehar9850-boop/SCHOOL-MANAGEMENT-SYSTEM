import register from "../model/register.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import Attendance from "../model/Attendance.js";
import Mark from "../model/Mark.js";
import Assignment from "../model/Assignment.js";
import Submission from "../model/Submission.js";

export const getPublicStats = async (_req, res) => {
  try {
    const [students, teachers, courses, enrollments, assignments, attendanceTotal, present] =
      await Promise.all([
        register.countDocuments({ role: "student" }),
        register.countDocuments({ role: "teacher" }),
        Course.countDocuments({ status: "Active" }),
        Enrollment.countDocuments({ status: "active" }),
        Assignment.countDocuments(),
        Attendance.countDocuments(),
        Attendance.countDocuments({ status: "Present" }),
      ]);

    const attendanceAccuracy =
      attendanceTotal > 0 ? Math.round((present / attendanceTotal) * 100) : 0;

    const marks = await Mark.find().select("score");
    const avgMarks =
      marks.length > 0
        ? Math.round(marks.reduce((s, m) => s + Number(m.score || 0), 0) / marks.length)
        : 0;

    res.json({
      students,
      teachers,
      courses,
      enrollments,
      assignments,
      attendanceAccuracy,
      avgMarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "admin") {
      const [students, teachers, courses, enrollments, assignments, submissions] =
        await Promise.all([
          register.countDocuments({ role: "student" }),
          register.countDocuments({ role: "teacher" }),
          Course.countDocuments(),
          Enrollment.countDocuments({ status: "active" }),
          Assignment.countDocuments(),
          Submission.countDocuments(),
        ]);

      return res.json({
        students,
        teachers,
        courses,
        enrollments,
        assignments,
        submissions,
        systemHealth: "Excellent",
      });
    }

    if (role === "teacher") {
      const myCourses = await Course.find({ teacherId: req.user.id });
      const courseIds = myCourses.map((c) => c._id);
      const courseNames = myCourses.map((c) => c.courseName);

      const enrollments = await Enrollment.find({
        courseId: { $in: courseIds },
        status: "active",
      });
      const studentIds = [...new Set(enrollments.map((e) => e.studentId.toString()))];

      const attendanceRecords = await Attendance.find({
        $or: [{ teacherId: req.user.id }, { course: { $in: courseNames } }],
      });
      const present = attendanceRecords.filter((a) => a.status === "Present").length;
      const attendanceRate =
        attendanceRecords.length > 0
          ? Math.round((present / attendanceRecords.length) * 100)
          : 0;

      const myAssignments = await Assignment.find({ teacherId: req.user.id }).select("_id");
      const pendingSubmissions = await Submission.countDocuments({
        assignmentId: { $in: myAssignments.map((a) => a._id) },
        status: "submitted",
      });

      return res.json({
        assignedStudents: studentIds.length,
        classes: myCourses.length,
        subjects: myCourses.length,
        attendanceRate,
        attendanceRecords: attendanceRecords.length,
        assignments: myAssignments.length,
        pendingSubmissions,
      });
    }

    if (role === "student") {
      const enrollments = await Enrollment.find({
        studentId: req.user.id,
        status: "active",
      }).populate("courseId");

      const attendanceRecords = await Attendance.find({
        $or: [{ studentId: req.user.id }, { studentName: req.user.name }],
      });
      const present = attendanceRecords.filter((a) => a.status === "Present").length;
      const attendancePercent =
        attendanceRecords.length > 0
          ? Math.round((present / attendanceRecords.length) * 100)
          : 0;

      const marks = await Mark.find({
        $or: [{ studentId: req.user.id }, { studentName: req.user.name }],
      });
      const avgScore =
        marks.length > 0
          ? Math.round(marks.reduce((sum, m) => sum + Number(m.score || 0), 0) / marks.length)
          : 0;

      const grade =
        avgScore >= 90
          ? "A+"
          : avgScore >= 80
            ? "A"
            : avgScore >= 70
              ? "B"
              : avgScore >= 60
                ? "C"
                : avgScore > 0
                  ? "D"
                  : "—";

      const courseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
      const assignments = await Assignment.countDocuments({ courseId: { $in: courseIds } });
      const mySubmissions = await Submission.countDocuments({ studentId: req.user.id });

      return res.json({
        attendancePercent,
        marksAverage: avgScore,
        grade,
        enrolledCourses: enrollments.length,
        assignments,
        submissions: mySubmissions,
        courses: enrollments.map((e) => e.courseId).filter(Boolean),
      });
    }

    return res.status(403).json({ message: "Unknown role" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
