import register from "../model/register.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import Attendance from "../model/Attendance.js";
import Mark from "../model/Mark.js";
import Assignment from "../model/Assignment.js";
import Submission from "../model/Submission.js";
import Fee from "../model/Fee.js";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastNMonths(n = 6) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_LABELS[d.getMonth()],
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }
  return months;
}

async function monthlySeries(Model, match = {}, dateField = "createdAt", months = 6) {
  const buckets = lastNMonths(months);
  const counts = await Promise.all(
    buckets.map(async (b) =>
      Model.countDocuments({
        ...match,
        [dateField]: { $gte: b.start, $lt: b.end },
      })
    )
  );
  return {
    labels: buckets.map((b) => b.label),
    values: counts,
  };
}

async function monthlyAttendanceRate(match = {}, months = 6) {
  const buckets = lastNMonths(months);
  const rates = await Promise.all(
    buckets.map(async (b) => {
      const filter = {
        ...match,
        createdAt: { $gte: b.start, $lt: b.end },
      };
      const [total, present] = await Promise.all([
        Attendance.countDocuments(filter),
        Attendance.countDocuments({ ...filter, status: "Present" }),
      ]);
      return total > 0 ? Math.round((present / total) * 100) : 0;
    })
  );
  return {
    labels: buckets.map((b) => b.label),
    values: rates,
  };
}

async function monthlyFeeCollected(months = 6) {
  const buckets = lastNMonths(months);
  const amounts = await Promise.all(
    buckets.map(async (b) => {
      const rows = await Fee.aggregate([
        {
          $match: {
            paidAt: { $gte: b.start, $lt: b.end },
            amountPaid: { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]);
      return Math.round(rows[0]?.total || 0);
    })
  );
  return {
    labels: buckets.map((b) => b.label),
    values: amounts,
  };
}

/** Active student counts grouped by course.className */
async function studentsByClass(courseFilter = {}) {
  const courses = await Course.find(courseFilter).select("_id className").lean();
  if (!courses.length) return { labels: [], values: [] };

  const courseIds = courses.map((c) => c._id);
  const enrollments = await Enrollment.find({
    courseId: { $in: courseIds },
    status: "active",
  })
    .select("courseId studentId")
    .lean();

  const classOf = new Map(courses.map((c) => [String(c._id), c.className || "Other"]));
  const byClass = new Map();

  for (const e of enrollments) {
    const cls = classOf.get(String(e.courseId)) || "Other";
    if (!byClass.has(cls)) byClass.set(cls, new Set());
    byClass.get(cls).add(String(e.studentId));
  }

  const entries = [...byClass.entries()]
    .map(([label, set]) => ({ label, value: set.size }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    labels: entries.map((e) => e.label),
    values: entries.map((e) => e.value),
  };
}

export const getPublicStats = async (_req, res) => {
  try {
    const [
      students,
      teachers,
      courses,
      enrollments,
      assignments,
      attendanceTotal,
      present,
      featuredCourses,
      faculty,
      byClass,
    ] = await Promise.all([
      register.countDocuments({ role: "student" }),
      register.countDocuments({ role: "teacher" }),
      Course.countDocuments({ status: "Active" }),
      Enrollment.countDocuments({ status: "active" }),
      Assignment.countDocuments(),
      Attendance.countDocuments(),
      Attendance.countDocuments({ status: "Present" }),
      Course.find({ status: "Active" })
        .select("courseName courseCode className teacher duration description schedule maxStudents")
        .sort({ updatedAt: -1 })
        .limit(12)
        .lean(),
      register
        .find({ role: "teacher" })
        .select("name subject experience")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      studentsByClass({ status: "Active" }),
    ]);

    const attendanceAccuracy =
      attendanceTotal > 0 ? Math.round((present / attendanceTotal) * 100) : 0;

    const marks = await Mark.find().select("score").lean();
    const avgMarks =
      marks.length > 0
        ? Math.round(marks.reduce((s, m) => s + Number(m.score || 0), 0) / marks.length)
        : 0;

    res.json({
      college: {
        name: "Aspira College",
        campus: "Dolat Nagar, Gujrat",
        phone: "0319 8018795",
        email: "maazmehar9850@gmail.com",
      },
      students,
      teachers,
      courses,
      enrollments,
      assignments,
      attendanceAccuracy,
      avgMarks,
      featuredCourses: featuredCourses.map((c) => ({
        id: c._id,
        name: c.courseName,
        code: c.courseCode,
        className: c.className,
        teacher: c.teacher,
        duration: c.duration,
        description: c.description || "",
        schedule: c.schedule || "",
        maxStudents: c.maxStudents || 0,
      })),
      faculty: faculty.map((t) => ({
        id: t._id,
        name: t.name,
        subject: t.subject || "Faculty",
        experience: t.experience || "",
      })),
      classes: byClass,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "admin") {
      const [
        students,
        teachers,
        courses,
        enrollments,
        assignments,
        submissions,
        enrollmentTrend,
        attendanceTrend,
        assignmentTrend,
        submissionTrend,
        byClass,
      ] = await Promise.all([
        register.countDocuments({ role: "student" }),
        register.countDocuments({ role: "teacher" }),
        Course.countDocuments(),
        Enrollment.countDocuments({ status: "active" }),
        Assignment.countDocuments(),
        Submission.countDocuments(),
        monthlySeries(Enrollment, {}, "createdAt", 6),
        monthlyAttendanceRate({}, 6),
        monthlySeries(Assignment, {}, "createdAt", 6),
        monthlySeries(Submission, {}, "createdAt", 6),
        studentsByClass(),
      ]);

      let feeCollected = 0;
      let feeTrend = { labels: [], values: [] };
      let attendanceRate = 0;
      try {
        const [attendanceTotal, attendancePresent, feePaidAgg, fees] = await Promise.all([
          Attendance.countDocuments(),
          Attendance.countDocuments({ status: "Present" }),
          Fee.aggregate([{ $group: { _id: null, totalPaid: { $sum: "$amountPaid" } } }]),
          monthlyFeeCollected(6),
        ]);
        attendanceRate =
          attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;
        feeCollected = Math.round(feePaidAgg[0]?.totalPaid || 0);
        feeTrend = fees;
      } catch {
        // Fee / attendance extras should not break core dashboard stats
      }

      return res.json({
        students,
        teachers,
        courses,
        enrollments,
        assignments,
        submissions,
        attendanceRate,
        feeCollected,
        systemHealth: "Operational",
        charts: {
          overview: {
            labels: ["Students", "Teachers", "Courses", "Enrolled"],
            values: [students, teachers, courses, enrollments],
          },
          enrollments: enrollmentTrend,
          attendance: attendanceTrend,
          assignments: assignmentTrend,
          submissions: submissionTrend,
          fees: feeTrend,
          byClass,
        },
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

      const attendanceMatch = {
        $or: [{ teacherId: req.user.id }, { course: { $in: courseNames } }],
      };
      const attendanceRecords = await Attendance.find(attendanceMatch);
      const present = attendanceRecords.filter((a) => a.status === "Present").length;
      const attendanceRate =
        attendanceRecords.length > 0
          ? Math.round((present / attendanceRecords.length) * 100)
          : 0;

      const myAssignments = await Assignment.find({ teacherId: req.user.id }).select("_id");
      const assignmentIds = myAssignments.map((a) => a._id);
      const pendingSubmissions = await Submission.countDocuments({
        assignmentId: { $in: assignmentIds },
        status: "submitted",
      });

      const [attendanceTrend, assignmentTrend, byClass] = await Promise.all([
        monthlyAttendanceRate(attendanceMatch, 6),
        monthlySeries(Assignment, { teacherId: req.user.id }, "createdAt", 6),
        studentsByClass({ teacherId: req.user.id }),
      ]);

      return res.json({
        assignedStudents: studentIds.length,
        classes: myCourses.length,
        subjects: myCourses.length,
        attendanceRate,
        attendanceRecords: attendanceRecords.length,
        assignments: myAssignments.length,
        pendingSubmissions,
        charts: {
          overview: {
            labels: ["Students", "Classes", "Tasks", "Pending"],
            values: [
              studentIds.length,
              myCourses.length,
              myAssignments.length,
              pendingSubmissions,
            ],
          },
          attendance: attendanceTrend,
          assignments: assignmentTrend,
          byClass,
        },
      });
    }

    if (role === "student") {
      const enrollments = await Enrollment.find({
        studentId: req.user.id,
        status: "active",
      }).populate("courseId");

      const attendanceMatch = {
        $or: [{ studentId: req.user.id }, { studentName: req.user.name }],
      };
      const attendanceRecords = await Attendance.find(attendanceMatch);
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

      const [attendanceTrend, marksTrend] = await Promise.all([
        monthlyAttendanceRate(attendanceMatch, 6),
        monthlySeries(
          Mark,
          { $or: [{ studentId: req.user.id }, { studentName: req.user.name }] },
          "updatedAt",
          6
        ),
      ]);

      return res.json({
        attendancePercent,
        marksAverage: avgScore,
        grade,
        enrolledCourses: enrollments.length,
        assignments,
        submissions: mySubmissions,
        courses: enrollments.map((e) => e.courseId).filter(Boolean),
        charts: {
          overview: {
            labels: ["Courses", "Tasks", "Submitted", "Avg marks"],
            values: [enrollments.length, assignments, mySubmissions, avgScore],
          },
          attendance: attendanceTrend,
          marks: marksTrend,
        },
      });
    }

    return res.status(403).json({ message: "Unknown role" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
