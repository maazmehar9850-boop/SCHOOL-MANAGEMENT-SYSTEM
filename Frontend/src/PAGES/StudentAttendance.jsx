import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import DataTable from "../components/DataTable";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import { TableSkeleton } from "../components/Skeleton";
import { StatPill, StatusBadge } from "../components/SheetUI";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

function StudentAttendance() {
  const role = localStorage.getItem("role") || "student";
  const isAdmin = role === "admin";
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/attendance");
        setAttendance(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.length - presentCount;
  const rate = attendance.length
    ? Math.round((presentCount / attendance.length) * 100)
    : 0;

  const columns = useMemo(() => {
    const base = [
      { key: "course", label: "Course" },
      { key: "date", label: "Date" },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      { key: "teacher", label: "Teacher" },
    ];
    if (isAdmin) {
      return [{ key: "studentName", label: "Student" }, ...base];
    }
    return base;
  }, [isAdmin]);

  const exportPdf = () => {
    const rows = attendance.map((i) =>
      isAdmin
        ? [i.studentName, i.course, i.date, i.status, i.teacher || "-"]
        : [i.course, i.date, i.status, i.teacher || "-"]
    );
    const headers = isAdmin
      ? ["Student", "Course", "Date", "Status", "Teacher"]
      : ["Course", "Date", "Status", "Teacher"];
    saveAsPdf(
      isAdmin ? "All Attendance Records" : "My Attendance Sheet",
      tableHtml(headers, rows, { statusColumn: isAdmin ? 3 : 2 }),
      {
        type: "attendance",
        subtitle: isAdmin
          ? "Campus-wide attendance records"
          : "Student attendance record",
        meta: {
          Records: String(attendance.length),
          Scope: isAdmin ? "All students" : "My courses",
        },
      }
    );
  };

  return (
    <PageLayout
      role={isAdmin ? "admin" : "student"}
      variant={isAdmin ? "admin" : "student"}
      title={isAdmin ? "Attendance Records" : "My Attendance"}
      subtitle={
        isAdmin
          ? "Official attendance register for all students"
          : "Records marked by your teachers for enrolled courses"
      }
    >
      <PageContentCard
        title="Attendance overview"
        subtitle={
          isAdmin
            ? "Filter, review, and export attendance sheets"
            : "Your presence across all allotted subjects"
        }
        action={<SaveAsPdfButton onClick={exportPdf} disabled={!attendance.length} />}
      >
        <div className="mb-5 flex flex-wrap gap-2">
          <StatPill label="Total records" value={attendance.length} tone="brand" />
          <StatPill label="Present" value={presentCount} tone="success" />
          <StatPill label="Absent" value={absentCount} tone="danger" />
          {!isAdmin && <StatPill label="Attendance %" value={`${rate}%`} tone="info" />}
        </div>

        {loading ? (
          <TableSkeleton rows={5} label="Loading attendance..." />
        ) : (
          <DataTable
            columns={columns}
            data={attendance}
            searchKeys={
              isAdmin
                ? ["studentName", "course", "date", "status", "teacher"]
                : ["course", "date", "status", "teacher"]
            }
            emptyMessage={
              isAdmin
                ? "No attendance records found."
                : "No attendance records yet for your courses."
            }
            searchPlaceholder="Search attendance records…"
          />
        )}
      </PageContentCard>
    </PageLayout>
  );
}

export default StudentAttendance;
