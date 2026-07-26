import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function StudentResults() {
  const role = localStorage.getItem("role") || "student";
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/marks");
        setMarks(res.data);
      } catch {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const printReport = () => {
    const html = `
      <html><head><title>Results</title>
      <style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px}th{background:#0f172a;color:#fff}</style>
      </head><body><h1>Result Report</h1>
      <table><thead><tr><th>Student</th><th>Course</th><th>Subject</th><th>Score</th></tr></thead>
      <tbody>${marks
        .map(
          (i) =>
            `<tr><td>${i.studentName}</td><td>${i.course}</td><td>${i.subject}</td><td>${i.score}</td></tr>`
        )
        .join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const columns = [
    { key: "studentName", label: "Student" },
    { key: "course", label: "Course" },
    { key: "subject", label: "Subject" },
    { key: "score", label: "Score" },
  ];

  return (
    <PageLayout
      role={role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student"}
      variant="student"
      title="Results"
      subtitle={
        role === "student"
          ? "Your marks only — scoped by the API"
          : "Marks list for your access level"
      }
    >
      <GlassCard className="flex items-center justify-between gap-4 p-5" hover={false}>
        <p className="text-sm text-slate-600">{marks.length} scores</p>
        <GradientButton onClick={printReport}>Print report</GradientButton>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            columns={columns}
            data={marks}
            searchKeys={["studentName", "course", "subject"]}
            emptyMessage="No marks found."
          />
        )}
      </GlassCard>
    </PageLayout>
  );
}

export default StudentResults;
