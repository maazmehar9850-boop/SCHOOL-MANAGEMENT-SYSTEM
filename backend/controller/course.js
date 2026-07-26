import Course from "../model/Course.js";
import register from "../model/register.js";

export const addCourse = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.teacherId) {
      const teacher = await register.findById(payload.teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ success: false, message: "Invalid teacherId" });
      }
      payload.teacher = teacher.name;
    }

    const course = await Course.create(payload);
    res.status(201).json({
      success: true,
      message: "Course Added Successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    let filter = {};

    if (req.user?.role === "teacher") {
      filter = { teacherId: req.user.id };
    } else if (req.user?.role === "student") {
      // Student-scoped courses come from enrollments endpoint; still allow browsing Active
      filter = { status: "Active" };
    }

    const courses = await Course.find(filter).populate("teacherId", "name email subject");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.teacherId) {
      const teacher = await register.findById(payload.teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ success: false, message: "Invalid teacherId" });
      }
      payload.teacher = teacher.name;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: "Course Updated Successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
