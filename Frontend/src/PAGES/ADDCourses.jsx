import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";

function AddCourses() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
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
    try {
      await API.post("/courses", {
        ...formData,
        maxStudents: Number(formData.maxStudents) || 30,
      });
      toast.success("Course added successfully");
      navigate("/courses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add course");
    }
  };

  return (
    <PageLayout role="admin" variant="courses" title="Add Course" subtitle="Create a new academic course">
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

          <div className="md:col-span-2">
            <GradientButton type="submit">Save course</GradientButton>
          </div>
        </form>
      </GlassCard>
    </PageLayout>
  );
}

export default AddCourses;
