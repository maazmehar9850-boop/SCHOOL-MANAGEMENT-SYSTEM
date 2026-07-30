import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, PlayCircle, ExternalLink } from "lucide-react";
import API, { fileUrl } from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import { TableSkeleton } from "../components/Skeleton";
import { cachedFetch, clearCache, getCached } from "../utils/apiCache";

function mediaHref(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return fileUrl(url);
}

function Courses() {
  const role = localStorage.getItem("role") || "student";
  const isAdmin = role === "admin";
  const cacheKey = `list:courses:${role}`;
  const cached = getCached(cacheKey);
  const [courses, setCourses] = useState(() => (Array.isArray(cached) ? cached : []));
  const [loading, setLoading] = useState(!Array.isArray(cached));
  const [viewing, setViewing] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    teacher: "",
    duration: "",
    className: "",
  });
  const [editVideo, setEditVideo] = useState(null);
  const [editPdf, setEditPdf] = useState(null);

  const fetchCourses = async ({ force = false } = {}) => {
    try {
      if (force) clearCache(cacheKey);
      // Teachers: ?all=1 shows every active course (materials). Assignments/attendance use own courses.
      const data = await cachedFetch(
        cacheKey,
        async () => {
          const res = await API.get(role === "teacher" ? "/courses?all=1" : "/courses");
          return Array.isArray(res.data) ? res.data : [];
        },
        45000
      );
      setCourses(data);
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
    setEditVideo(null);
    setEditPdf(null);
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
      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      if (editVideo) body.append("video", editVideo);
      if (editPdf) body.append("pdf", editPdf);
      await API.put(`/courses/${editingCourse._id}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
    {
      key: "materials",
      label: "Materials",
      sortable: false,
      render: (row) => {
        const count = row.materials?.length || (row.videoUrl || row.pdfUrl ? 1 : 0);
        return (
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
            {count} file{count === 1 ? "" : "s"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewing(row)}
            className="btn-edit"
          >
            View
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="btn-edit"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteCourse(row._id)}
                className="btn-delete"
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      role={role}
      variant="courses"
      title="Courses"
      subtitle={
        isAdmin
          ? "Manage courses and attach video / PDF materials"
          : role === "student"
            ? "Only courses your teacher enrolled you in"
            : "Browse courses and open learning materials"
      }
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
          <TableSkeleton rows={6} label="Loading courses..." />
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            searchKeys={["courseName", "courseCode", "teacher", "className"]}
          />
        )}
      </GlassCard>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <GlassCard className="max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto p-6" hover={false}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  {viewing.courseName}
                </h3>
                <p className="text-sm text-slate-600">
                  {viewing.courseCode} · {viewing.teacher} · {viewing.className}
                </p>
              </div>
              <GradientButton variant="secondary" onClick={() => setViewing(null)}>
                Close
              </GradientButton>
            </div>
            {viewing.description && (
              <p className="rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-700">
                {viewing.description}
              </p>
            )}
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Learning materials</h4>
              {(viewing.materials || []).length === 0 && !viewing.videoUrl && !viewing.pdfUrl ? (
                <p className="text-sm text-slate-500">No materials attached yet.</p>
              ) : (
                <div className="space-y-3">
                  {(viewing.materials?.length
                    ? viewing.materials
                    : [
                        viewing.videoUrl && {
                          type: "video",
                          title: "Course video",
                          fileUrl: viewing.videoUrl,
                        },
                        viewing.pdfUrl && {
                          type: "pdf",
                          title: "Course PDF",
                          fileUrl: viewing.pdfUrl,
                        },
                      ].filter(Boolean)
                  ).map((m, idx) => (
                    <div
                      key={m._id || idx}
                      className="rounded-2xl border border-white/60 bg-white/70 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2 font-medium text-slate-800">
                        {m.type === "video" ? (
                          <PlayCircle size={18} className="text-indigo-600" />
                        ) : (
                          <FileText size={18} className="text-cyan-700" />
                        )}
                        {m.title || m.fileName || m.type}
                      </div>
                      {m.type === "video" ? (
                        m.fileUrl?.includes("youtube.com") ||
                        m.fileUrl?.includes("youtu.be") ||
                        m.fileUrl?.includes("vimeo.com") ? (
                          <a
                            href={mediaHref(m.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"
                          >
                            Open video <ExternalLink size={14} />
                          </a>
                        ) : (
                          <video
                            controls
                            className="mt-2 max-h-72 w-full rounded-xl bg-black"
                            src={mediaHref(m.fileUrl)}
                          >
                            <track kind="captions" />
                          </video>
                        )
                      ) : (
                        <a
                          href={mediaHref(m.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Open PDF <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

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
            <label className="block text-sm text-slate-600">
              Add / replace video
              <input
                type="file"
                accept="video/*"
                className="mt-1 block w-full text-sm"
                onChange={(e) => setEditVideo(e.target.files?.[0] || null)}
              />
            </label>
            <label className="block text-sm text-slate-600">
              Add / replace PDF
              <input
                type="file"
                accept="application/pdf"
                className="mt-1 block w-full text-sm"
                onChange={(e) => setEditPdf(e.target.files?.[0] || null)}
              />
            </label>
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
