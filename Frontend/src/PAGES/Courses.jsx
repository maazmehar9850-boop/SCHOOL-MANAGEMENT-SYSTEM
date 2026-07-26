import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function Courses() {
  const role = localStorage.getItem("role") || "student";
  const isAdmin = role === "admin";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    teacher: "",
    duration: "",
    className: "",
  });

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchCourses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName || "",
      courseCode: course.courseCode || "",
      teacher: course.teacher || "",
      duration: course.duration || "",
      className: course.className || "",
    });
  };

  const submitEdit = async () => {
    try {
      await API.put(`/courses/${editingCourse._id}`, formData);
      toast.success("Course updated");
      setEditingCourse(null);
      fetchCourses();
    } catch {
      toast.error("Update failed");
    }
  };

  const columns = [
    { key: "courseName", label: "Course" },
    { key: "courseCode", label: "Code" },
    { key: "teacher", label: "Teacher" },
    { key: "className", label: "Class" },
    { key: "duration", label: "Duration" },
    ...(isAdmin
      ? [
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (row) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteCourse(row._id)}
                  className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageLayout
      role={role}
      variant="courses"
      title="Courses"
      subtitle={isAdmin ? "Manage all academic courses" : "Browse available courses"}
    >
      {isAdmin && (
        <div className="flex justify-end">
          <Link to="/add-course">
            <GradientButton>Add course</GradientButton>
          </Link>
        </div>
      )}

      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            searchKeys={["courseName", "courseCode", "teacher", "className"]}
          />
        )}
      </GlassCard>

      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <GlassCard className="w-full max-w-lg space-y-4 p-6" hover={false}>
            <h3 className="text-xl font-bold text-slate-900">Edit course</h3>
            {Object.keys(formData).map((key) => (
              <input
                key={key}
                name={key}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="input-glass"
                placeholder={key}
              />
            ))}
            <div className="flex gap-3">
              <GradientButton onClick={submitEdit}>Save</GradientButton>
              <GradientButton variant="secondary" onClick={() => setEditingCourse(null)}>
                Cancel
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </PageLayout>
  );
}

export default Courses;
