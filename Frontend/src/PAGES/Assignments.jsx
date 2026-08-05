import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Eye,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import API, { fileUrl } from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import SearchField from "../components/SearchField";
import { TableSkeleton } from "../components/Skeleton";

const emptyForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
};

function Assignments() {
  const role = localStorage.getItem("role") || "student";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const canManage = isTeacher;
  const canViewOverview = isTeacher || isAdmin;
  const isStudent = role === "student";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [subsOpen, setSubsOpen] = useState(false);
  const [roster, setRoster] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [rosterQuery, setRosterQuery] = useState("");
  const [gradeForm, setGradeForm] = useState({ id: null, score: "", feedback: "" });
  const [grading, setGrading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        API.get("/assignments"),
        canManage ? API.get("/courses") : Promise.resolve({ data: [] }),
      ]);
      setItems(aRes.data || []);
      setCourses(cRes.data || []);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title || "",
      description: row.description || "",
      courseId: row.courseId?._id || row.courseId || "",
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString().slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error("Please select a course");
      return;
    }
    setSaving(true);
    try {
      const course = courses.find((c) => c._id === form.courseId);
      const payload = {
        title: form.title,
        description: form.description,
        courseId: form.courseId,
        course: course?.courseName || "Course",
        dueDate: new Date(form.dueDate).toISOString(),
      };

      if (editingId) {
        await API.put(`/assignments/${editingId}`, payload);
        toast.success("Assignment updated");
      } else {
        await API.post("/assignments", payload);
        toast.success("Assignment created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await API.delete(`/assignments/${id}`);
      toast.success("Assignment deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openSubmit = (row) => {
    setActiveAssignment(row);
    setFile(null);
    setSubmitOpen(true);
  };

  const uploadSubmission = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a PDF or image file");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      await API.post(`/assignments/${activeAssignment._id}/submit`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Submission uploaded");
      setSubmitOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openSubmissions = async (row) => {
    setActiveAssignment(row);
    setSubsOpen(true);
    setSubsLoading(true);
    setRosterQuery("");
    setGradeForm({ id: null, score: "", feedback: "" });
    try {
      const res = await API.get(`/assignments/${row._id}/submissions`);
      const data = res.data;
      if (Array.isArray(data)) {
        setRoster(
          data.map((s) => ({
            studentId: s.studentId,
            studentName: s.studentId?.name || s.studentName,
            email: s.studentId?.email || "",
            status: s.status === "graded" ? "graded" : "submitted",
            submission: s,
          }))
        );
      } else {
        setRoster(data.roster || []);
      }
    } catch {
      toast.error("Failed to load class roster");
      setRoster([]);
    } finally {
      setSubsLoading(false);
    }
  };

  const saveGrade = async (e) => {
    e.preventDefault();
    if (!gradeForm.id) return;
    setGrading(true);
    try {
      await API.put(`/submissions/${gradeForm.id}/grade`, {
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
      });
      toast.success("Graded — marks synced to results");
      await openSubmissions(activeAssignment);
      setGradeForm({ id: null, score: "", feedback: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Grading failed");
    } finally {
      setGrading(false);
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "course",
      label: "Course",
      render: (row) => row.courseId?.courseName || row.course || "—",
    },
    {
      key: "dueDate",
      label: "Due date",
      render: (row) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—",
    },
  ];

  if (isStudent) {
    columns.push({
      key: "status",
      label: "Status",
      render: (row) => {
        const sub = row.mySubmission;
        if (!sub) {
          return (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Pending
            </span>
          );
        }
        if (sub.status === "graded") {
          return (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Graded · {sub.score}
            </span>
          );
        }
        return (
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            Submitted
          </span>
        );
      },
    });
    columns.push({
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openSubmit(row)}
            className="btn-edit"
          >
            <Upload size={14} />
            {row.mySubmission ? "Update file" : "Upload"}
          </button>
          {row.mySubmission?.fileUrl && (
            <a
              href={fileUrl(row.mySubmission.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="btn-edit"
            >
              <Eye size={14} />
              View
            </a>
          )}
        </div>
      ),
    });
  }

  if (canViewOverview) {
    columns.push({
      key: "subs",
      label: "Progress",
      render: (row) =>
        `${row.submissionCount || 0}/${row.enrolledCount || 0} submitted · ${row.gradedCount || 0} graded`,
    });
    columns.push({
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openSubmissions(row)}
            className="btn-edit"
          >
            <Eye size={14} />
            {isAdmin ? "View" : "Review"}
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="btn-edit"
                title="Edit"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(row._id)}
                className="btn-delete"
                title="Delete"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      ),
    });
  }

  const variant =
    role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student";

  return (
    <PageLayout
      role={role}
      variant={variant}
      title="Assignments"
      subtitle={
        isTeacher
          ? "Create assignments, review submissions, and grade work"
          : isAdmin
            ? "View campus-wide assignments and submission progress"
            : "View course assignments and upload PDF or image submissions"
      }
    >
      <GlassCard className="p-5 md:p-6" hover={false}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {canViewOverview ? "Course assignments" : "My assignments"}
            </h2>
            <p className="text-sm text-slate-600">
              {items.length} assignment{items.length === 1 ? "" : "s"}
            </p>
          </div>
          {canManage && (
            <GradientButton onClick={openCreate}>
              <Plus size={16} />
              New assignment
            </GradientButton>
          )}
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            searchKeys={["title", "course", "description"]}
            emptyMessage="No assignments yet."
          />
        )}
      </GlassCard>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit assignment" : "New assignment"}
      >
        <form onSubmit={save} className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormField
            label="Description"
            name="description"
            as="textarea"
            value={form.description}
            onChange={handleChange}
          />
          <FormField
            label="Course"
            name="courseId"
            as="select"
            value={form.courseId}
            onChange={handleChange}
            required
            options={[
              { value: "", label: "Select course" },
              ...courses.map((c) => ({
                value: c._id,
                label: `${c.courseName} (${c.courseCode})`,
              })),
            ]}
          />
          <FormField
            label="Due date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <GradientButton variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GradientButton>
            <GradientButton type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </GradientButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title={activeAssignment ? `Submit: ${activeAssignment.title}` : "Submit"}
      >
        <form onSubmit={uploadSubmission} className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a <strong>PDF</strong> or <strong>image</strong> (JPG / PNG / WEBP), max 10MB.
            You can update before the deadline.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-8 text-center hover:bg-indigo-50">
            <Upload className="text-indigo-600" size={28} />
            <span className="text-sm font-semibold text-slate-800">
              {file ? file.name : "Choose file"}
            </span>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <div className="flex justify-end gap-3">
            <GradientButton variant="secondary" type="button" onClick={() => setSubmitOpen(false)}>
              Cancel
            </GradientButton>
            <GradientButton type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload submission"}
            </GradientButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={subsOpen}
        onClose={() => setSubsOpen(false)}
        title={
          activeAssignment
            ? `Class roster · ${activeAssignment.title}`
            : "Class roster"
        }
        size="lg"
      >
        {subsLoading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {isAdmin
                ? "All students enrolled in this course and their submission status."
                : "All students enrolled in this course. Grade work after they upload a submission."}
            </p>
            <SearchField
              value={rosterQuery}
              onChange={setRosterQuery}
              placeholder="Search students by name or email…"
            />
            {roster.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No enrolled students for this assignment&apos;s course.
              </p>
            ) : (
              roster
                .filter((s) => {
                  const q = rosterQuery.trim().toLowerCase();
                  if (!q) return true;
                  return [s.studentName, s.email, s.status]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
                })
                .map((s) => {
                  const sub = s.submission;
                  const key = s.studentId?._id || s.studentId || s.email || s.studentName;
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {s.studentName || s.studentId?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.email || s.studentId?.email || "—"}
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                s.status === "graded"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : s.status === "submitted"
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {s.status === "not_submitted"
                                ? "Not submitted"
                                : s.status}
                            </span>
                            {sub && (
                              <>
                                {sub.type === "pdf" ? (
                                  <FileText size={16} />
                                ) : (
                                  <ImageIcon size={16} />
                                )}
                                {sub.fileName || "File"}
                                {sub.score != null && (
                                  <span className="inline-flex items-center gap-1 text-emerald-700">
                                    <CheckCircle2 size={14} />
                                    {sub.score}/100
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                          {sub?.feedback && (
                            <p className="mt-1 text-sm text-slate-500">
                              Feedback: {sub.feedback}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sub?.fileUrl ? (
                            <>
                              <a
                                href={fileUrl(sub.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                              >
                                Preview / Download
                              </a>
                              {canManage && (
                                <button
                                  type="button"
                                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
                                  onClick={() =>
                                    setGradeForm({
                                      id: sub._id,
                                      score: sub.score ?? "",
                                      feedback: sub.feedback || "",
                                    })
                                  }
                                >
                                  Grade
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                              Waiting for upload
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}

            {canManage && gradeForm.id && (
              <form
                onSubmit={saveGrade}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3"
              >
                <p className="text-sm font-semibold text-slate-800">Grade submission</p>
                <FormField
                  label="Score (0–100)"
                  name="score"
                  type="number"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  required
                />
                <FormField
                  label="Feedback"
                  name="feedback"
                  as="textarea"
                  value={gradeForm.feedback}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, feedback: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <GradientButton type="submit" disabled={grading}>
                    {grading ? "Saving..." : "Save grade"}
                  </GradientButton>
                  <GradientButton
                    variant="secondary"
                    type="button"
                    onClick={() => setGradeForm({ id: null, score: "", feedback: "" })}
                  >
                    Cancel
                  </GradientButton>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}

export default Assignments;
