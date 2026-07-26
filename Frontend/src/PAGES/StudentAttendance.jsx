import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import DataTable from "../components/DataTable";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/attendance");
        setAttendance(res.data);
      } catch {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const printAttendance = () => {
    const html = `
      <html><head><title>Attendance</title>
      <style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px}th{background:#0f172a;color:#fff}</style>
      </head><body><h1>Attendance Report</h1>
      <table><thead><tr><th>Course</th><th>Date</th><th>Status</th><th>Teacher</th></tr></thead>
      <tbody>${attendance
        .map(
          (i) =>
            `<tr><td>${i.course}</td><td>${i.date}</td><td>${i.status}</td><td>${i.teacher || "-"}</td></tr>`
        )
        .join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const columns = [
    { key: "course", label: "Course" },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === "Present"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { key: "teacher", label: "Teacher" },
  ];

  return (
    <PageLayout
      role="student"
      variant="student"
      title="My Attendance"
      subtitle="Records filtered to your account"
    >
      <GlassCard className="flex items-center justify-between gap-4 p-5" hover={false}>
        <p className="text-sm text-slate-600">{attendance.length} records</p>
        <GradientButton onClick={printAttendance}>Print report</GradientButton>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            columns={columns}
            data={attendance}
            searchKeys={["course", "date", "status", "teacher"]}
            emptyMessage="No attendance records found."
          />
        )}
      </GlassCard>
    </PageLayout>
  );
}

export default StudentAttendance;
