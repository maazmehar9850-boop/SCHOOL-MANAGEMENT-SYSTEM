import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { TableSkeleton } from "../components/Skeleton";

const emptyForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
};

function Assignments() {
  const role = localStorage.getItem("role") || "student";
  const canManage = role === "teacher" || role === "admin";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
    {
      key: "teacher",
      label: "Teacher",
      render: (row) => row.teacher || "—",
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="rounded-xl bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => remove(row._id)}
            className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 size={16} />
          </button>
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
        canManage
          ? "Create and manage course assignments"
          : "Assignments for your enrolled courses"
      }
    >
      <GlassCard className="p-5 md:p-6" hover={false}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {canManage ? "All assignments" : "My assignments"}
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
          <DataTable columns={columns} data={items} searchKeys={["title", "course"]} />
        )}
      </GlassCard>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit assignment" : "New assignment"}
      >
        <form onSubmit={save} className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
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
    </PageLayout>
  );
}

export default Assignments;
