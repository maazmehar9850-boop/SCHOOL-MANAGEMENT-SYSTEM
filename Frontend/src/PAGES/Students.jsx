import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const delstudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await API.delete(`/delete/${id}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateStudent = async () => {
    try {
      await API.put(`/update/${editingStudent._id}`, {
        name: editingStudent.name,
        email: editingStudent.email,
      });
      toast.success("Student updated");
      setEditingStudent(null);
      fetchStudents();
    } catch {
      toast.error("Update failed");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
            onClick={() => setEditingStudent(row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
            onClick={() => delstudent(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout role="admin" variant="admin" title="Students" subtitle="Manage student accounts">
      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable columns={columns} data={students} searchKeys={["name", "email"]} />
        )}
      </GlassCard>

      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <GlassCard className="w-full max-w-md space-y-4 p-6" hover={false}>
            <h3 className="text-xl font-bold">Edit student</h3>
            <input
              className="input-glass"
              value={editingStudent.name}
              onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
            />
            <input
              className="input-glass"
              value={editingStudent.email}
              onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
            />
            <div className="flex gap-3">
              <GradientButton onClick={updateStudent}>Save</GradientButton>
              <GradientButton variant="secondary" onClick={() => setEditingStudent(null)}>
                Cancel
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      )}
    </PageLayout>
  );
}

export default Students;
