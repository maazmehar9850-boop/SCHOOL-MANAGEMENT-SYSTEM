import Assignment from "../model/Assignment.js";
import Attendance from "../model/Attendance.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import Mark from "../model/Mark.js";
import PasswordResetRequest from "../model/PasswordResetRequest.js";
import Submission from "../model/Submission.js";
import register from "../model/register.js";

const MAX_ITEMS = 12;

const sortByDate = (items) =>
  items
    .filter((item) => item?.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ITEMS);

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let notifications = [];

    if (role === "admin") {
      const [pendingResets, recentTeachers] = await Promise.all([
        PasswordResetRequest.find({ status: "pending" })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        register.find({ role: "teacher" }).sort({ createdAt: -1 }).limit(6).lean(),
      ]);

      notifications = [
        ...pendingResets.map((item) => ({
          id: `reset-request-${item._id}-${new Date(item.createdAt).getTime()}`,
          type: "info",
          title: "Password reset request",
          message: `${item.name || item.email} requested a password reset.`,
          createdAt: item.createdAt,
        })),
        ...recentTeachers.map((item) => ({
          id: `teacher-joined-${item._id}-${new Date(item.createdAt).getTime()}`,
          type: "success",
          title: "New teacher account",
          message: `${item.name || item.email} joined as a teacher.`,
          createdAt: item.createdAt,
        })),
      ];
    }

    if (role === "teacher") {
      const courses = await Course.find({ teacherId: userId }).select("_id courseName").lean();
      const courseIds = courses.map((course) => course._id);
      const assignments = await Assignment.find({ teacherId: userId }).select("_id title").lean();
      const assignmentIds = assignments.map((assignment) => assignment._id);
      const courseNameMap = new Map(courses.map((course) => [String(course._id), course.courseName]));
      const assignmentTitleMap = new Map(
        assignments.map((assignment) => [String(assignment._id), assignment.title])
      );

      const [enrollments, submissions] = await Promise.all([
        Enrollment.find({ courseId: { $in: courseIds }, status: "active" })
          .populate("studentId", "name")
          .populate("courseId", "courseName")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        Submission.find({ assignmentId: { $in: assignmentIds } })
          .sort({ submittedAt: -1 })
          .limit(6)
          .lean(),
      ]);

      notifications = [
        ...enrollments.map((item) => ({
          id: `teacher-enrollment-${item._id}-${new Date(item.createdAt).getTime()}`,
          type: "success",
          title: "New student enrolled",
          message: `${item.studentId?.name || "A student"} enrolled in ${
            item.courseId?.courseName || courseNameMap.get(String(item.courseId)) || "your course"
          }.`,
          createdAt: item.createdAt,
        })),
        ...submissions.map((item) => ({
          id: `teacher-submission-${item._id}-${new Date(item.submittedAt || item.createdAt).getTime()}`,
          type: "info",
          title: "Assignment submitted",
          message: `${item.studentName || "A student"} submitted ${
            assignmentTitleMap.get(String(item.assignmentId)) || "an assignment"
          }.`,
          createdAt: item.submittedAt || item.createdAt,
        })),
      ];
    }

    if (role === "student") {
      const enrollments = await Enrollment.find({ studentId: userId, status: "active" })
        .select("courseId createdAt")
        .lean();
      const courseIds = enrollments.map((item) => item.courseId);

      const [assignments, marks, attendance, resetRequests] = await Promise.all([
        Assignment.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 }).limit(6).lean(),
        Mark.find({ studentId: userId }).sort({ updatedAt: -1 }).limit(6).lean(),
        Attendance.find({ studentId: userId }).sort({ createdAt: -1 }).limit(6).lean(),
        PasswordResetRequest.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean(),
      ]);

      notifications = [
        ...assignments.map((item) => ({
          id: `student-assignment-${item._id}-${new Date(item.createdAt).getTime()}`,
          type: "info",
          title: "New assignment",
          message: `${item.title} was posted for ${item.course}.`,
          createdAt: item.createdAt,
        })),
        ...marks.map((item) => ({
          id: `student-mark-${item._id}-${new Date(item.updatedAt).getTime()}`,
          type: "success",
          title: "Marks updated",
          message: `${item.subject}: ${item.score}/${item.maxScore}${item.feedback ? ` - ${item.feedback}` : ""}`,
          createdAt: item.updatedAt,
        })),
        ...attendance.map((item) => ({
          id: `student-attendance-${item._id}-${new Date(item.createdAt).getTime()}`,
          type: item.status === "Present" ? "success" : "error",
          title: "Attendance posted",
          message: `${item.course} attendance marked ${item.status.toLowerCase()} for ${item.date}.`,
          createdAt: item.createdAt,
        })),
        ...resetRequests
          .filter((item) => item.status !== "pending")
          .map((item) => ({
            id: `student-reset-${item._id}-${new Date(item.updatedAt || item.createdAt).getTime()}`,
            type: item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "info",
            title: "Password reset update",
            message: `Your password reset request was ${item.status}.`,
            createdAt: item.updatedAt || item.createdAt,
          })),
      ];
    }

    return res.status(200).json({ notifications: sortByDate(notifications) });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};
