import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import InfoBanner from "../components/InfoBanner";
import DataTable from "../components/DataTable";
import { TableSkeleton } from "../components/Skeleton";

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const eRes = await API.get("/enrollments");
        setEnrollments(eRes.data || []);
      } catch {
        toast.error("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      key: "teacher",
      label: "Teacher",
      render: (row) =>
        row.courseId?.teacherId?.name || row.courseId?.teacher || "—",
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
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Enrollments"
      subtitle="Read-only view — teachers enroll students into their own courses"
    >
      <PageContentCard
        title="Course enrollments"
        subtitle={`${enrollments.length} total records · managed by subject teachers`}
      >
        <InfoBanner>
          Teachers enroll students into their own courses. Admin has read-only access to
          enrollment records.
        </InfoBanner>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <DataTable
            columns={columns}
            data={enrollments}
            searchKeys={[
              "studentId.name",
              "studentId.email",
              "courseId.courseName",
              "courseId.teacher",
            ]}
            emptyMessage="No enrollments yet."
          />
        )}
      </PageContentCard>
    </PageLayout>
  );
}

export default Enrollments;
