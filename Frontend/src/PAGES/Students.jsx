import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import InfoBanner from "../components/InfoBanner";
import DataTable from "../components/DataTable";
import { TableSkeleton } from "../components/Skeleton";
import { cachedFetch, getCached } from "../utils/apiCache";

const CACHE_KEY = "list:students";

function Students() {
  const cached = getCached(CACHE_KEY);
  const [students, setStudents] = useState(() => (Array.isArray(cached) ? cached : []));
  const [loading, setLoading] = useState(!Array.isArray(cached));

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await cachedFetch(
          CACHE_KEY,
          async () => {
            const res = await API.get("/students");
            return Array.isArray(res.data) ? res.data : [];
          },
          45000
        );
        if (!ignore) setStudents(data);
      } catch {
        if (!ignore) toast.error("Failed to load students");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "—",
    },
    {
      key: "teachers",
      label: "Teacher(s)",
      sortable: false,
      render: (row) => {
        const teachers = [
          ...new Set((row.courses || []).map((c) => c.teacher).filter(Boolean)),
        ];
        return teachers.length ? teachers.join(", ") : "—";
      },
    },
    {
      key: "courses",
      label: "Course(s)",
      sortable: false,
      render: (row) =>
        Array.isArray(row.courses) && row.courses.length
          ? row.courses.map((c) => c.courseName || c).join(", ")
          : "Not enrolled",
    },
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Students"
      subtitle="Read-only overview — students are added and managed by their subject teachers"
    >
      <PageContentCard
        title="Student directory"
        subtitle="Read-only overview of all learners and their course assignments"
      >
        <InfoBanner>
          Admin can <strong>view</strong> all students and which teacher/course they belong to.
          Adding, attendance, and marks are handled by each subject teacher only.
        </InfoBanner>
        {loading ? (
          <TableSkeleton rows={6} label="Loading students..." />
        ) : (
          <DataTable
            columns={columns}
            data={students}
            searchKeys={["name", "email", "phone"]}
            searchPlaceholder="Search students…"
            emptyMessage="No students yet. Teachers will add students to their courses."
          />
        )}
      </PageContentCard>
    </PageLayout>
  );
}

export default Students;
