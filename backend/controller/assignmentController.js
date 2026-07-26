import Assignment from "../model/Assignment.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";

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
      .sort({ dueDate: 1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const item = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
