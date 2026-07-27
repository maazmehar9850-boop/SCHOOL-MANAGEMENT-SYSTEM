import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import DataTable from "../components/DataTable";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import Skeleton from "../components/Skeleton";
import { StatPill } from "../components/SheetUI";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

function StudentResults() {
  const role = localStorage.getItem("role") || "student";
  const isAdmin = role === "admin";
  const isStudent = role === "student";
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/marks");
        setMarks(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const average = marks.length
    ? Math.round(
        marks.reduce((sum, m) => {
          const max = Number(m.maxScore) || 100;
          return sum + (Number(m.score || 0) / max) * 100;
        }, 0) / marks.length
      )
    : 0;

  const columns = useMemo(
    () => [
      ...(role !== "student" ? [{ key: "studentName", label: "Student" }] : []),
      { key: "course", label: "Course" },
      { key: "subject", label: "Subject" },
      {
        key: "score",
        label: "Marks",
        render: (row) => (
          <span className="font-display text-base font-bold text-indigo-700">
            {row.score}
            {row.maxScore != null ? ` / ${row.maxScore}` : ""}
          </span>
        ),
      },
      {
        key: "feedback",
        label: "Feedback",
        render: (row) => row.feedback || "—",
      },
      ...(role !== "student" ? [{ key: "teacher", label: "Teacher" }] : []),
    ],
    [role]
  );

  const exportPdf = () => {
    const rows = marks.map((i) => [
      ...(role !== "student" ? [i.studentName] : []),
      i.course,
      i.subject,
      i.score,
      i.maxScore ?? 100,
      i.feedback || "—",
      ...(role !== "student" ? [i.teacher || "—"] : []),
    ]);
    const headers = [
      ...(role !== "student" ? ["Student"] : []),
      "Course",
      "Subject",
      "Obtained",
      "Total",
      "Feedback",
      ...(role !== "student" ? ["Teacher"] : []),
    ];
    saveAsPdf(
      isAdmin ? "All Marks Sheet" : "Results Report",
      tableHtml(headers, rows),
      { subtitle: "Academic grades and teacher feedback" }
    );
  };

  return (
    <PageLayout
      role={isAdmin ? "admin" : isStudent ? "student" : "teacher"}
      variant={isAdmin ? "admin" : "student"}
      title={isAdmin ? "All Marks / Results" : "Results"}
      subtitle={
        isStudent
          ? "Your marks only — save a PDF copy anytime"
          : isAdmin
            ? "School-wide marks sheet — print or save as PDF"
            : "Marks for your allotted subjects"
      }
    >
      <PageContentCard
        title="Marks sheet"
        subtitle={
          isStudent
            ? "Scores published by your subject teachers"
            : "Complete academic performance records"
        }
        action={<SaveAsPdfButton onClick={exportPdf} disabled={!marks.length} />}
      >
        <div className="mb-5 flex flex-wrap gap-2">
          <StatPill label="Total scores" value={marks.length} tone="brand" />
          <StatPill label="Average %" value={average} tone="success" />
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <DataTable
            columns={columns}
            data={marks}
            searchKeys={["studentName", "course", "subject", "teacher", "feedback"]}
            emptyMessage="No marks found."
            searchPlaceholder="Search marks by student, course, or subject…"
          />
        )}
      </PageContentCard>
    </PageLayout>
  );
}

export default StudentResults;
