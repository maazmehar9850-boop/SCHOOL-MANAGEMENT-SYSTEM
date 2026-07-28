import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import SearchField from "../components/SearchField";
import GradientButton from "../components/GradientButton";
import InfoBanner from "../components/InfoBanner";
import { SheetMeta, StatPill } from "../components/SheetUI";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

function TeacherMarks() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const teacher = localStorage.getItem("name") || "Teacher";

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId) || null,
    [courses, courseId]
  );
  const subject = selectedCourse?.courseName || "";

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
    if (!courseId || !subject) return;
    setLoading(true);
    try {
      const [enrollRes, marksRes] = await Promise.all([
        API.get("/enrollments", { params: { courseId } }),
        API.get("/marks", { params: { courseId, subject } }),
      ]);

      const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
      const existing = Array.isArray(marksRes.data) ? marksRes.data : [];
      const byStudent = new Map(
        existing
          .filter((m) => !m.assignmentId)
          .map((m) => [String(m.studentId), m])
      );

      const merged = enrollments
        .filter((e) => e.studentId)
        .map((e) => {
          const sid = String(e.studentId._id);
          const prev = byStudent.get(sid);
          const maxScore = prev?.maxScore ?? 100;
          return {
            key: sid,
            studentId: sid,
            studentName: e.studentId.name,
            email: e.studentId.email || "",
            course: subject,
            courseId,
            subject,
            score: prev?.score ?? 0,
            maxScore,
            feedback: prev?.feedback || "",
            _id: prev?._id || null,
          };
        });

      setRows(merged);
      const sheetTotal = merged.find((r) => r.maxScore)?.maxScore ?? 100;
      setTotalMarks(sheetTotal);
    } catch {
      toast.error("Failed to load marks roster");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, subject]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    if (!courseId) {
      setEligibility(null);
      return;
    }
    const loadEligibility = async () => {
      setEligibilityLoading(true);
      try {
        const { data } = await API.get("/marks/eligibility", { params: { courseId } });
        setEligibility(data);
      } catch {
        setEligibility({
          allowed: false,
          reason: "Could not verify marks entry eligibility.",
        });
      } finally {
        setEligibilityLoading(false);
      }
    };
    loadEligibility();
  }, [courseId]);

  const marksLocked = eligibilityLoading || !eligibility?.allowed;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.studentName, row.email, row.score, row.feedback]
        .filter((v) => v !== undefined && v !== null && v !== "")
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const updateRow = (studentId, patch) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r))
    );
  };

  const applyTotalMarks = (value) => {
    const total = Number(value) || 0;
    setTotalMarks(total);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        maxScore: total,
        score: Math.min(Number(r.score) || 0, total || 0),
      }))
    );
  };

  const saveGrades = async () => {
    if (!courseId || !subject) {
      toast.error("Select one of your allotted courses");
      return;
    }
    if (marksLocked) {
      toast.error(eligibility?.reason || "Marks entry is not open yet");
      return;
    }
    if (!rows.length) {
      toast.error("No enrolled students");
      return;
    }
    setSaving(true);
    try {
      await API.post("/marks/bulk", {
        courseId,
        subject,
        maxScore: Number(totalMarks) || 100,
        records: rows.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          score: Math.min(Number(r.score) || 0, Number(totalMarks) || 100),
          maxScore: Number(totalMarks) || 100,
          feedback: r.feedback || "",
        })),
      });
      toast.success("Marks saved — visible to admin and students");
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = () => {
    const pdfRows = filtered.map((item) => [
      item.studentName,
      item.course,
      item.subject,
      `${item.score} / ${item.maxScore ?? totalMarks}`,
      item.feedback || "—",
    ]);
    saveAsPdf(
      "Marks Sheet",
      tableHtml(
        ["Student", "Course", "Subject", "Obtained / Total", "Feedback"],
        pdfRows
      ),
      {
        type: "marks",
        subtitle: `Official marks register`,
        meta: {
          Teacher: teacher,
          Subject: subject,
          "Total marks": String(totalMarks),
        },
      }
    );
  };

  const averageScore = rows.length
    ? Math.round(
        rows.reduce((sum, item) => {
          const max = Number(item.maxScore || totalMarks) || 100;
          return sum + (Number(item.score || 0) / max) * 100;
        }, 0) / rows.length
      )
    : 0;

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title="Marks Sheet"
      subtitle="Official score entry for your allotted subject — exportable as PDF"
    >
      <div className="space-y-6">
        {eligibility && !eligibilityLoading && (
          <InfoBanner variant={eligibility.allowed ? "success" : "warning"}>
            {eligibility.reason}
            {eligibility.examEndAt && !eligibility.allowed ? (
              <span className="mt-1 block text-xs opacity-90">
                Exam ends: {new Date(eligibility.examEndAt).toLocaleString()}
              </span>
            ) : null}
          </InfoBanner>
        )}

        <PageContentCard padding={false} className="overflow-hidden">
          <div className="inst-sheet p-6 md:p-8">
            <div className="sheet-toolbar">
              <div className="sheet-toolbar__fields">
                <label>
                  <span className="form-label">Course / subject</span>
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
                  <span className="form-label">Total marks</span>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    disabled={marksLocked}
                    onChange={(e) => applyTotalMarks(e.target.value)}
                    className="input-glass disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
              <div className="sheet-toolbar__actions">
                <SaveAsPdfButton onClick={exportPdf} variant="primary" disabled={!filtered.length} />
                <GradientButton
                  onClick={saveGrades}
                  disabled={saving || !rows.length || marksLocked}
                >
                  {saving ? "Saving…" : "Save marks"}
                </GradientButton>
              </div>
            </div>

            <SheetMeta
              items={[
                { label: "Teacher", value: teacher },
                { label: "Subject", value: subject || "—" },
                { label: "Class code", value: selectedCourse?.courseCode || "—" },
                { label: "Total marks", value: totalMarks },
                { label: "Students", value: rows.length },
              ]}
            />

            <div className="record-summary-bar">
              <div>
                <h2 className="sheet-section-title">Marks register</h2>
                <p className="sheet-section-subtitle">
                  Enter scores for enrolled students. Changes sync to admin and student portals.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatPill label="Average %" value={averageScore} tone="success" />
                <StatPill label="Entered" value={filtered.length} tone="brand" />
              </div>
            </div>

            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search students by name, email, or score…"
            />

            <div className="inst-table-wrap inst-table-wrap--stack mt-4">
              <table className="inst-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Obtaining marks</th>
                    <th>Out of</th>
                    <th>Teacher feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="inst-table__empty">
                        Loading enrolled students…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="inst-table__empty">
                        {rows.length === 0
                          ? "No students enrolled in this course."
                          : "No students match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <tr key={student.key}>
                        <td data-label="Student">{student.studentName}</td>
                        <td data-label="Email">{student.email || "—"}</td>
                        <td data-label="Obtaining marks">
                          <input
                            type="number"
                            min="0"
                            max={totalMarks || 100}
                            value={student.score}
                            disabled={marksLocked}
                            onChange={(e) => {
                              const obtained = Number(e.target.value) || 0;
                              const cap = Number(totalMarks) || 100;
                              updateRow(student.studentId, {
                                score: Math.min(obtained, cap),
                              });
                            }}
                            className="table-input table-input--score disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                        <td data-label="Out of" className="text-slate-600">{totalMarks}</td>
                        <td data-label="Teacher feedback">
                          <input
                            type="text"
                            value={student.feedback || ""}
                            disabled={marksLocked}
                            onChange={(e) =>
                              updateRow(student.studentId, { feedback: e.target.value })
                            }
                            placeholder="Optional remarks"
                            className="table-input disabled:cursor-not-allowed disabled:opacity-60"
                          />
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

export default TeacherMarks;
