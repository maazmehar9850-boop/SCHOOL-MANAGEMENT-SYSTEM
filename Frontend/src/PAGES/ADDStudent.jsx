import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";

function AddStudent() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    Password: "",
    phone: "",
    courseId: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/courses");
        const list = Array.isArray(res.data) ? res.data : [];
        setCourses(list);
        if (list.length) {
          setForm((f) => ({ ...f, courseId: list[0]._id }));
        }
      } catch {
        toast.error("Failed to load your courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error("Select your course / subject first");
      return;
    }
    setSaving(true);
    try {
      const res = await API.post("/teachers/students", form);
      toast.success(res.data?.message || "Student added to your course");
      navigate("/my-students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title="Add Student"
      subtitle="Add a student to one of your courses — only you can manage them"
    >
      <GlassCard className="mx-auto max-w-2xl p-6 md:p-8" hover={false}>
        {loadingCourses ? (
          <p className="text-slate-500">Loading your courses…</p>
        ) : courses.length === 0 ? (
          <div className="space-y-3 text-center">
            <p className="text-slate-700">
              No courses assigned to you yet. Ask the admin to create a course and
              assign you as the teacher.
            </p>
            <GradientButton variant="secondary" onClick={() => navigate("/teacher-dashboard")}>
              Back to dashboard
            </GradientButton>
          </div>
        ) : (
          <form onSubmit={addStudent} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Your course / subject
              </span>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="input-glass"
                required
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseName} ({c.courseCode})
                    {c.className ? ` · ${c.className}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {["name", "email", "Password", "phone"].map((field) => (
              <label key={field} className="block space-y-2">
                <span className="text-sm font-medium capitalize text-slate-600">
                  {field === "Password" ? "Password" : field}
                </span>
                <input
                  type={
                    field === "Password"
                      ? "password"
                      : field === "email"
                        ? "email"
                        : "text"
                  }
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="input-glass"
                  required={["name", "email", "Password"].includes(field)}
                  placeholder={
                    field === "phone"
                      ? "Optional"
                      : field === "Password"
                        ? "Min 6 characters"
                        : ""
                  }
                />
              </label>
            ))}

            <p className="text-xs text-slate-500">
              If this email already exists as a student, they will be enrolled into
              the selected course only (not other teachers&apos; classes).
            </p>

            <GradientButton type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Add to my course"}
            </GradientButton>
          </form>
        )}
      </GlassCard>
    </PageLayout>
  );
}

export default AddStudent;
