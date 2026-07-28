import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import SearchField from "../components/SearchField";
import GradientButton from "../components/GradientButton";
import { SheetMeta, StatPill, StatusBadge } from "../components/SheetUI";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => today().slice(0, 7);

function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const teacher = localStorage.getItem("name") || "Teacher";

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId) || null,
    [courses, courseId]
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data } = await API.get("/courses");
        const list = Array.isArray(data) ? data : [];
        setCourses(list);
        if (list.length) setCourseId(list[0]._id);
      } catch {
        toast.error("Failed to load your courses");
      }
    };
    loadCourses();
  }, []);

  const loadRoster = useCallback(async () => {
    if (!courseId || !date) return;
    setLoading(true);
    try {
      const [enrollRes, attRes] = await Promise.all([
        API.get("/enrollments", { params: { courseId } }),
        API.get("/attendance", { params: { courseId, date } }),
      ]);

      const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      const existing = Array.isArray(attRes.data) ? attRes.data : [];
      const byStudent = new Map(
        existing.map((a) => [String(a.studentId || a.studentName), a])
      );

      const merged = enrollments
        .filter((e) => e.studentId)
        .map((e) => {
          const sid = String(e.studentId._id);
          const prev = byStudent.get(sid);
          return {
            key: sid,
            studentId: sid,
            studentName: e.studentId.name,
            email: e.studentId.email || "",
            phone: e.studentId.phone || "",
            course: selectedCourse?.courseName || e.courseId?.courseName || "",
            courseId,
            date,
            status: prev?.status || "Present",
            _id: prev?._id || null,
          };
        });

      setRows(merged);
      if (!merged.length) {
        toast("No enrolled students for this course yet.", { icon: "ℹ️" });
      }
    } catch {
      toast.error("Failed to load attendance roster");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, date, selectedCourse]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const handleMonthChange = (value) => {
    setMonth(value);
    if (!value) return;
    const [y, m] = value.split("-").map(Number);
    const [dy, dm, dd] = date.split("-").map(Number);
    if (dy !== y || dm !== m) {
      const lastDay = new Date(y, m, 0).getDate();
      const day = Math.min(dd || 1, lastDay);
      setDate(`${value}-${String(day).padStart(2, "0")}`);
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    if (value) setMonth(value.slice(0, 7));
  };

  const monthBounds = useMemo(() => {
    if (!month) return { min: "", max: "" };
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return {
      min: `${month}-01`,
      max: `${month}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [month]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.studentName, row.email, row.phone, row.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const setStatus = (studentId, status) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const markAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const saveAttendance = async () => {
    if (!courseId || !date) {
      toast.error("Select a course and date");
      return;
    }
    if (!rows.length) {
      toast.error("No students to save");
      return;
    }
    setSaving(true);
    try {
      await API.post("/attendance/bulk", {
        courseId,
        date,
        records: rows.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          status: r.status,
        })),
      });
      toast.success("Attendance saved to database");
      loadRoster();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = () => {
    const courseName = selectedCourse?.courseName || "";
    const pdfRows = filtered.map((item) => [
      item.studentName,
      item.email,
      courseName,
      item.date,
      item.status,
    ]);
    saveAsPdf(
      "Attendance Sheet",
      tableHtml(["Student", "Email", "Course", "Date", "Status"], pdfRows, {
        statusColumn: 4,
      }),
      {
        type: "attendance",
        subtitle: "Daily class presence register",
        meta: {
          Teacher: teacher,
          Date: date,
          Course: courseName || "—",
        },
      }
    );
  };

  const presentCount = rows.filter((r) => r.status === "Present").length;
  const absentCount = rows.length - presentCount;

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title="Attendance Sheet"
      subtitle="Daily class register — mark present or absent and export as PDF"
    >
      <div className="space-y-6">
        <PageContentCard padding={false} className="overflow-hidden">
          <div className="inst-sheet p-6 md:p-8">
            <div className="sheet-toolbar">
              <div className="sheet-toolbar__fields">
                <label>
                  <span className="form-label">Course</span>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="input-glass"
                  >
                    {courses.length === 0 && <option value="">No courses assigned</option>}
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="form-label">Month</span>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="input-glass"
                  />
                </label>
                <label>
                  <span className="form-label">Date</span>
                  <input
                    type="date"
                    value={date}
                    min={monthBounds.min}
                    max={monthBounds.max}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="input-glass"
                  />
                </label>
              </div>
              <div className="sheet-toolbar__actions">
                <SaveAsPdfButton onClick={exportPdf} variant="primary" disabled={!filtered.length} />
                <GradientButton onClick={saveAttendance} disabled={saving || !rows.length}>
                  {saving ? "Saving…" : "Save attendance"}
                </GradientButton>
              </div>
            </div>

            <SheetMeta
              items={[
                { label: "Teacher", value: teacher },
                { label: "Course", value: selectedCourse?.courseName || "—" },
                { label: "Month", value: month || "—" },
                { label: "Date", value: date },
                { label: "Class", value: selectedCourse?.className || "—" },
              ]}
            />

            <div className="record-summary-bar">
              <div>
                <h2 className="sheet-section-title">Class register</h2>
                <p className="sheet-section-subtitle">
                  Roster from enrollments. Students see records in their attendance portal.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatPill label="Enrolled" value={rows.length} tone="brand" />
                <StatPill label="Present" value={presentCount} tone="success" />
                <StatPill label="Absent" value={absentCount} tone="danger" />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => markAll("Present")} className="btn-chip btn-chip--present">
                Mark all present
              </button>
              <button type="button" onClick={() => markAll("Absent")} className="btn-chip btn-chip--absent">
                Mark all absent
              </button>
            </div>

            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search enrolled students by name, email, or phone…"
            />

            <div className="inst-table-wrap mt-4">
              <table className="inst-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Mark attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="inst-table__empty">
                        Loading enrolled students…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="inst-table__empty">
                        {rows.length === 0
                          ? "No students enrolled in this course."
                          : "No students match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((record) => (
                      <tr key={record.key}>
                        <td>{record.studentName}</td>
                        <td>{record.email || "—"}</td>
                        <td>
                          <StatusBadge status={record.status} />
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setStatus(record.studentId, "Present")}
                              className={`btn-chip ${
                                record.status === "Present"
                                  ? "btn-chip--present"
                                  : "btn-chip--neutral"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(record.studentId, "Absent")}
                              className={`btn-chip ${
                                record.status === "Absent"
                                  ? "btn-chip--absent"
                                  : "btn-chip--neutral"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </PageContentCard>
      </div>
    </PageLayout>
  );
}

export default TeacherAttendance;
