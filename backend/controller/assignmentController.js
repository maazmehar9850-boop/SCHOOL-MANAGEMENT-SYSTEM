import Assignment from "../model/Assignment.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import Submission from "../model/Submission.js";

export const addAssignment = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      teacherId: req.user.id,
      teacher: req.user.name || "",
    };

    if (payload.courseId) {
      const course = await Course.findById(payload.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (
        req.user.role === "teacher" &&
        course.teacherId &&
        String(course.teacherId) !== String(req.user.id)
      ) {
        return res.status(403).json({ message: "You can only assign work for your courses" });
      }
      payload.course = course.courseName;
    }

    const doc = await Assignment.create(payload);
    res.status(201).json({ success: true, doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "teacher") {
      filter.teacherId = req.user.id;
    } else if (req.user.role === "student") {
      const enrollments = await Enrollment.find({
        studentId: req.user.id,
        status: "active",
      }).select("courseId");
      const courseIds = enrollments.map((e) => e.courseId);
      filter.courseId = { $in: courseIds };
    }

    const items = await Assignment.find(filter)
      .populate("courseId", "courseName courseCode")
      .populate("teacherId", "name email")
      .sort({ dueDate: 1 });

    if (req.user.role === "student") {
      const ids = items.map((a) => a._id);
      const submissions = await Submission.find({
        assignmentId: { $in: ids },
        studentId: req.user.id,
      });
      const map = new Map(submissions.map((s) => [String(s.assignmentId), s]));
      const enriched = items.map((a) => {
        const obj = a.toObject();
        const sub = map.get(String(a._id));
        obj.mySubmission = sub || null;
        return obj;
      });
      return res.status(200).json(enriched);
    }

    if (req.user.role === "teacher" || req.user.role === "admin") {
      const ids = items.map((a) => a._id);
      const courseIds = [
        ...new Set(items.map((a) => a.courseId?._id || a.courseId).filter(Boolean)),
      ];

      const [counts, enrollAgg] = await Promise.all([
        Submission.aggregate([
          { $match: { assignmentId: { $in: ids } } },
          {
            $group: {
              _id: "$assignmentId",
              total: { $sum: 1 },
              graded: {
                $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] },
              },
            },
          },
        ]),
        Enrollment.aggregate([
          {
            $match: {
              courseId: { $in: courseIds },
              status: "active",
            },
          },
          { $group: { _id: "$courseId", total: { $sum: 1 } } },
        ]),
      ]);

      const map = new Map(counts.map((c) => [String(c._id), c]));
      const enrollMap = new Map(enrollAgg.map((e) => [String(e._id), e.total]));

      const enriched = items.map((a) => {
        const obj = a.toObject();
        const c = map.get(String(a._id));
        const courseKey = String(a.courseId?._id || a.courseId || "");
        obj.submissionCount = c?.total || 0;
        obj.gradedCount = c?.graded || 0;
        obj.enrolledCount = enrollMap.get(courseKey) || 0;
        return obj;
      });
      return res.status(200).json(enriched);
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const existing = await Assignment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (
      req.user.role === "teacher" &&
      String(existing.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your assignment" });
    }

    if (req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (course) req.body.course = course.courseName;
    }

    const item = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const existing = await Assignment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (
      req.user.role === "teacher" &&
      String(existing.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your assignment" });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
