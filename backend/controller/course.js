import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import register from "../model/register.js";

const attachUploadedMedia = (payload, files = {}) => {
  const materials = Array.isArray(payload.materials) ? [...payload.materials] : [];

  if (files.video?.[0]) {
    const f = files.video[0];
    const url = `/uploads/courses/${f.filename}`;
    payload.videoUrl = url;
    materials.push({
      type: "video",
      title: payload.videoTitle || f.originalname,
      fileUrl: url,
      fileName: f.originalname,
    });
  }

  if (files.pdf?.[0]) {
    const f = files.pdf[0];
    const url = `/uploads/courses/${f.filename}`;
    payload.pdfUrl = url;
    materials.push({
      type: "pdf",
      title: payload.pdfTitle || f.originalname,
      fileUrl: url,
      fileName: f.originalname,
    });
  }

  // External video link (YouTube / Vimeo / direct URL)
  if (payload.externalVideoUrl && String(payload.externalVideoUrl).trim()) {
    const url = String(payload.externalVideoUrl).trim();
    payload.videoUrl = payload.videoUrl || url;
    materials.push({
      type: "video",
      title: payload.videoTitle || "Course video",
      fileUrl: url,
      fileName: "",
    });
  }

  payload.materials = materials;
  delete payload.videoTitle;
  delete payload.pdfTitle;
  delete payload.externalVideoUrl;
  return payload;
};

export const addCourse = async (req, res) => {
  try {
    let payload = { ...req.body };
    if (payload.maxStudents) payload.maxStudents = Number(payload.maxStudents) || 30;

    if (payload.teacherId) {
      const teacher = await register.findById(payload.teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ success: false, message: "Invalid teacherId" });
      }
      payload.teacher = teacher.name;
    }

    payload = attachUploadedMedia(payload, req.files);

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

    if (req.user?.role === "student") {
      const enrollments = await Enrollment.find({
        studentId: req.user.id,
        status: "active",
      }).select("courseId");
      const courseIds = enrollments.map((e) => e.courseId).filter(Boolean);
      if (!courseIds.length) {
        return res.status(200).json([]);
      }
      filter = { _id: { $in: courseIds }, status: "Active" };
    } else if (req.user?.role === "teacher") {
      // Teacher tools / attendance / assignments: only their courses
      // Use ?all=1 to browse every active course (materials library)
      if (req.query.all === "1") {
        filter = { status: "Active" };
      } else {
        filter = { teacherId: req.user.id };
      }
    }

    const courses = await Course.find(filter)
      .populate("teacherId", "name email subject")
      .sort({ createdAt: -1 });
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
    let payload = { ...req.body };
    if (payload.maxStudents) payload.maxStudents = Number(payload.maxStudents) || 30;

    if (payload.teacherId) {
      const teacher = await register.findById(payload.teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ success: false, message: "Invalid teacherId" });
      }
      payload.teacher = teacher.name;
    }

    const existing = await Course.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    payload.materials = existing.materials || [];
    if (!payload.videoUrl) payload.videoUrl = existing.videoUrl || "";
    if (!payload.pdfUrl) payload.pdfUrl = existing.pdfUrl || "";
    payload = attachUploadedMedia(payload, req.files);

    const course = await Course.findByIdAndUpdate(req.params.id, payload, { new: true });

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
