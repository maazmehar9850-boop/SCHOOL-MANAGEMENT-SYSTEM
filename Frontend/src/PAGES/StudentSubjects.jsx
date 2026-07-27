import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import Skeleton from "../components/Skeleton";

function StudentSubjects() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/enrollments");
        const mapped = res.data.map((e) => ({
          _id: e._id,
          courseName: e.courseId?.courseName || "—",
          courseCode: e.courseId?.courseCode || "—",
          teacher: e.courseId?.teacher || e.courseId?.teacherId?.name || "—",
          schedule: e.courseId?.schedule || "—",
          className: e.courseId?.className || "—",
          status: e.status,
        }));
        setRows(mapped);
      } catch {
        toast.error("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    { key: "courseName", label: "Course" },
    { key: "courseCode", label: "Code" },
    { key: "teacher", label: "Teacher" },
    { key: "className", label: "Class" },
    { key: "schedule", label: "Schedule" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      role="student"
      variant="courses"
      title="My Subjects"
      subtitle="Courses added by your teacher — only enrolled subjects appear here"
    >
      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            searchKeys={["courseName", "courseCode", "teacher"]}
            emptyMessage="You are not enrolled in any courses yet."
          />
        )}
      </GlassCard>
    </PageLayout>
  );
}

export default StudentSubjects;
