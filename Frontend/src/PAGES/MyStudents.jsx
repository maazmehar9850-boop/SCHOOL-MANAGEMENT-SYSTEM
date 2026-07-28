import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, Mail, BookOpen, UserPlus, Pencil, Trash2 } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import GradientButton from "../components/GradientButton";
import Modal from "../components/Modal";
import Skeleton, { StatSkeleton } from "../components/Skeleton";
import PasswordField from "../components/PasswordField";
import { validatePasswordStrength } from "../utils/passwordPolicy";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await API.get("/my-students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load your students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openEdit = (row) => {
    setEditing({
      _id: row._id,
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      Password: "",
    });
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    if (!editing?._id) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
      };
      if (editing.Password?.trim()) {
        const passwordError = validatePasswordStrength(editing.Password);
        if (passwordError) {
          toast.error(passwordError);
          setSaving(false);
          return;
        }
        payload.Password = editing.Password;
      }
      await API.put(`/teachers/students/${editing._id}`, payload);
      toast.success("Student updated");
      setEditing(null);
      setLoading(true);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (row) => {
    if (
      !window.confirm(
        `Delete ${row.name}? This removes their account, enrollments, and marks permanently.`
      )
    ) {
      return;
    }
    try {
      await API.delete(`/teachers/students/${row._id}`);
      toast.success("Student deleted");
      setStudents((prev) => prev.filter((s) => s._id !== row._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "—",
    },
    {
      key: "courses",
      label: "Your courses",
      sortable: false,
      render: (row) =>
        Array.isArray(row.courses) && row.courses.length
          ? row.courses.map((c) => c.courseName || c).join(", ")
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
            onClick={() => openEdit(row)}
          >
            <span className="inline-flex items-center gap-1">
              <Pencil size={12} />
              Edit
            </span>
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
            onClick={() => deleteStudent(row)}
          >
            <span className="inline-flex items-center gap-1">
              <Trash2 size={12} />
              Delete
            </span>
          </button>
        </div>
      ),
    },
  ];

  const courseCount = students.reduce(
    (n, s) => n + (Array.isArray(s.courses) ? s.courses.length : 0),
    0
  );

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title="My Students"
      subtitle="Manage students enrolled in your courses — update email, password, or remove accounts"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="My students" value={students.length} icon={Users} />
          <StatCard
            title="With email"
            value={students.filter((s) => s.email).length}
            icon={Mail}
            accent="from-sky-500 to-blue-600"
            delay={0.05}
          />
          <StatCard
            title="Course seats"
            value={courseCount}
            icon={BookOpen}
            accent="from-emerald-500 to-teal-600"
            delay={0.1}
          />
        </div>
      )}

      <PageContentCard
        title="Student roster"
        subtitle="Edit email and password or delete students from your roster"
        action={
          <Link to="/add-student">
            <GradientButton>
              <UserPlus size={16} />
              Add student
            </GradientButton>
          </Link>
        }
      >
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <DataTable
            columns={columns}
            data={students}
            searchKeys={["name", "email", "phone"]}
            searchPlaceholder="Search your students…"
            emptyMessage="No students in your courses yet. Click Add student to begin."
          />
        )}
      </PageContentCard>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit student"
        size="md"
      >
        {editing && (
          <form onSubmit={saveStudent} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Full name <span className="text-rose-500">*</span>
              </span>
              <input
                className="input-glass"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Email address <span className="text-rose-500">*</span>
              </span>
              <input
                type="email"
                className="input-glass"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone number</span>
              <input
                className="input-glass"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                placeholder="Optional"
              />
            </label>
            <PasswordField
              label="New password"
              name="Password"
              value={editing.Password}
              onChange={(e) => setEditing({ ...editing, Password: e.target.value })}
              placeholder="Leave blank to keep current password"
              showStrength={Boolean(editing.Password)}
              autoComplete="new-password"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <GradientButton type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </GradientButton>
            </div>
          </form>
        )}
      </Modal>
    </PageLayout>
  );
}

export default MyStudents;
