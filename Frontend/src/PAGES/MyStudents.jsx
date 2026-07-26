import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import { Users } from "lucide-react";
import Skeleton, { StatSkeleton } from "../components/Skeleton";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/my-students");
        setStudents(res.data);
      } catch {
        toast.error("Failed to load assigned students");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows = students.map((s) => ({
    ...s,
    coursesLabel: (s.courses || []).map((c) => c.courseName).join(", ") || "Not assigned",
  }));

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "coursesLabel", label: "Courses" },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: () => (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Active
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title="My Students"
      subtitle="Only students enrolled in your courses"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Assigned students" value={students.length} icon={Users} />
        </div>
      )}

      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            searchKeys={["name", "email", "coursesLabel"]}
            emptyMessage="No students assigned yet. Enroll students into your courses."
          />
        )}
      </GlassCard>
    </PageLayout>
  );
}

export default MyStudents;
