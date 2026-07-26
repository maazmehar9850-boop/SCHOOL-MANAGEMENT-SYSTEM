import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, Trash2 } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { TableSkeleton } from "../components/Skeleton";

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        API.get("/enrollments"),
        API.get("/students"),
        API.get("/courses"),
      ]);
      setEnrollments(eRes.data || []);
      setStudents(sRes.data || []);
      setCourses(cRes.data || []);
    } catch {
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enroll = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/enrollments", form);
      toast.success("Student enrolled");
      setModalOpen(false);
      setForm({ studentId: "", courseId: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setSaving(false);
    }
  };

  const unenroll = async (id) => {
    if (!window.confirm("Remove this enrollment?")) return;
    try {
      await API.delete(`/enrollments/${id}`);
      toast.success("Unenrolled");
      load();
    } catch {
      toast.error("Failed to unenroll");
    }
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row) => row.studentId?.name || "—",
    },
    {
      key: "email",
      label: "Email",
      render: (row) => row.studentId?.email || "—",
    },
    {
      key: "course",
      label: "Course",
      render: (row) => row.courseId?.courseName || "—",
    },
    {
      key: "code",
      label: "Code",
      render: (row) => row.courseId?.courseCode || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {row.status || "active"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => unenroll(row._id)}
          className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Enrollments"
      subtitle="Assign students to courses"
    >
      <GlassCard className="p-5 md:p-6" hover={false}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Course enrollments</h2>
            <p className="text-sm text-slate-600">{enrollments.length} total</p>
          </div>
          <GradientButton onClick={() => setModalOpen(true)}>
            <UserPlus size={16} />
            Enroll student
          </GradientButton>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <DataTable
            columns={columns}
            data={enrollments}
            searchKeys={["studentId.name", "courseId.courseName"]}
          />
        )}
      </GlassCard>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enroll student"
      >
        <form onSubmit={enroll} className="space-y-4">
          <FormField
            label="Student"
            name="studentId"
            as="select"
            value={form.studentId}
            onChange={handleChange}
            required
            options={[
              { value: "", label: "Select student" },
              ...students.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.email})`,
              })),
            ]}
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
          <div className="flex justify-end gap-3 pt-2">
            <GradientButton variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </GradientButton>
            <GradientButton type="submit" disabled={saving}>
              {saving ? "Enrolling..." : "Enroll"}
            </GradientButton>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}

export default Enrollments;
