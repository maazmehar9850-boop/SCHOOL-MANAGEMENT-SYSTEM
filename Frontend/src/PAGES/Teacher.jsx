import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/teachers");
      setTeachers(res.data);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const delteacher = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await API.delete(`/delete/${id}`);
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateTeacher = async () => {
    try {
      const payload = {
        name: editingTeacher.name,
        email: editingTeacher.email,
        subject: editingTeacher.subject,
      };
      if (editingTeacher.Password?.trim()) {
        payload.Password = editingTeacher.Password;
      }
      await API.put(`/update/${editingTeacher._id}`, payload);
      toast.success("Teacher updated");
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
            onClick={() =>
              setEditingTeacher({
                ...row,
                Password: "",
              })
            }
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
            onClick={() => delteacher(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout role="admin" variant="admin" title="Teachers" subtitle="Manage teacher accounts">
      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable columns={columns} data={teachers} searchKeys={["name", "email", "subject"]} />
        )}
      </GlassCard>

      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <GlassCard className="w-full max-w-md space-y-4 p-6" hover={false}>
            <h3 className="text-xl font-bold">Edit teacher</h3>
            <input
              className="input-glass"
              value={editingTeacher.name || ""}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
            />
            <input
              className="input-glass"
              value={editingTeacher.email || ""}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
            />
            <input
              className="input-glass"
              placeholder="Subject"
              value={editingTeacher.subject || ""}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
            />
            <input
              type="password"
              className="input-glass"
              placeholder="New password (leave blank to keep current)"
              value={editingTeacher.Password || ""}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, Password: e.target.value })}
              minLength={6}
            />
            <div className="flex gap-3">
              <GradientButton onClick={updateTeacher}>Save</GradientButton>
              <GradientButton variant="secondary" onClick={() => setEditingTeacher(null)}>
                Cancel
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </PageLayout>
  );
}

export default Teachers;
