import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileVideo, FileText } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";

function AddCourses() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    teacher: "",
    teacherId: "",
    className: "",
    duration: "",
    description: "",
    maxStudents: 30,
    roomNumber: "",
    schedule: "",
    status: "Active",
    externalVideoUrl: "",
    videoTitle: "",
    pdfTitle: "",
  });

  useEffect(() => {
    API.get("/teachers")
      .then((res) => setTeachers(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "teacherId") {
        const t = teachers.find((x) => x._id === value);
        next.teacher = t?.name || "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          body.append(key, value);
        }
      });
      body.set("maxStudents", String(Number(formData.maxStudents) || 30));
      if (videoFile) body.append("video", videoFile);
      if (pdfFile) body.append("pdf", pdfFile);

      await API.post("/courses", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Course added with materials");
      navigate("/courses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      role="admin"
      variant="courses"
      title="Add Course"
      subtitle="Create a course and attach video or PDF learning materials"
    >
      <GlassCard className="p-6 md:p-8" hover={false}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {[
            ["courseName", "Course name"],
            ["courseCode", "Course code"],
            ["className", "Class name"],
            ["duration", "Duration"],
            ["roomNumber", "Room number"],
            ["schedule", "Schedule"],
          ].map(([name, label]) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-medium text-slate-600">{label}</span>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="input-glass"
                required={["courseName", "courseCode", "className", "duration"].includes(name)}
              />
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Assign teacher</span>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="input-glass"
            >
              <option value="">Select teacher (optional)</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Teacher name</span>
            <input
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="input-glass"
              required
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-600">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-glass min-h-24"
            />
          </label>

          <div className="md:col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
            <h3 className="font-semibold text-slate-900">Course materials (optional)</h3>
            <p className="text-xs text-slate-500">
              Upload a lecture video (MP4/WEBM) and/or a PDF handout. Students and teachers can view them on the Courses page.
            </p>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600">External video URL (YouTube / Vimeo / direct)</span>
              <input
                name="externalVideoUrl"
                value={formData.externalVideoUrl}
                onChange={handleChange}
                className="input-glass"
                placeholder="https://..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-6 text-center hover:bg-white">
                <FileVideo className="text-indigo-600" size={26} />
                <span className="text-sm font-semibold text-slate-800">
                  {videoFile ? videoFile.name : "Upload video file"}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-white/70 px-4 py-6 text-center hover:bg-white">
                <FileText className="text-cyan-700" size={26} />
                <span className="text-sm font-semibold text-slate-800">
                  {pdfFile ? pdfFile.name : "Upload PDF"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <GradientButton type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save course"}
            </GradientButton>
          </div>
        </form>
      </GlassCard>
    </PageLayout>
  );
}

export default AddCourses;
