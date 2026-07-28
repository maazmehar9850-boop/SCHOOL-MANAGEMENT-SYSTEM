import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  Award,
  Clock,
  CalendarCheck,
  User,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import DashboardPanel from "../components/DashboardPanel";
import ResourceSummaryCard from "../components/ResourceSummaryCard";
import ResourceItemCard from "../components/ResourceItemCard";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import GradientButton from "../components/GradientButton";
import { StatSkeleton } from "../components/Skeleton";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

function ResourceEmpty({ title, text }) {
  return (
    <div className="resource-empty-state">
      <p className="resource-empty-state__title">{title}</p>
      {text ? <p className="resource-empty-state__text">{text}</p> : null}
    </div>
  );
}

function StudentResources() {
  const role = localStorage.getItem("role") || "student";
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const [syllabi, setSyllabi] = useState([]);
  const [datesheets, setDatesheets] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d, m, a] = await Promise.all([
          API.get("/syllabus"),
          API.get("/datesheet"),
          API.get("/marks"),
          API.get("/attendance"),
        ]);
        setSyllabi(s.data || []);
        setDatesheets(d.data || []);
        setMarks(m.data || []);
        setAttendance(Array.isArray(a.data) ? a.data : []);
      } catch {
        toast.error("Failed to load resources");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const attendancePresent = useMemo(
    () => attendance.filter((a) => a.status === "Present").length,
    [attendance]
  );

  const exportSyllabus = (item) => {
    saveAsPdf(
      item.title || "Syllabus",
      `<p><strong>Course:</strong> ${item.course || "—"} · <strong>Teacher:</strong> ${item.teacher || "—"}</p>
       ${item.content || "<p>No content.</p>"}`,
      {
        type: "syllabus",
        subtitle: "Course syllabus & learning outline",
        meta: {
          Course: item.course || "—",
          Teacher: item.teacher || "—",
        },
      }
    );
  };

  const exportAllSyllabi = () => {
    const blocks = syllabi
      .map(
        (item) =>
          `<h2>${item.title}</h2>
           <p style="color:#64748b;font-size:13px">${item.course || ""} · ${item.teacher || ""}</p>
           ${item.content || ""}`
      )
      .join("");
    saveAsPdf("All syllabi", blocks || "<p>No syllabus available.</p>", {
      type: "syllabus",
      subtitle: "Complete course syllabi pack",
      meta: { Documents: String(syllabi.length) },
    });
  };

  const exportDatesheet = (d) => {
    const rows = (d.entries || []).map((e) => {
      const day = e.date
        ? new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" })
        : "—";
      const time =
        e.startTime && e.endTime ? `${e.startTime} – ${e.endTime}` : e.time || "—";
      return [e.subject, e.date, day, time, e.room || "—"];
    });
    saveAsPdf(
      d.title || "Exam date sheet",
      `<p><strong>Course:</strong> ${d.course || "—"} · <strong>Teacher:</strong> ${d.teacher || "—"}</p>
       ${d.notes || ""}
       ${tableHtml(["Subject", "Date", "Day", "Time", "Room"], rows)}`,
      {
        type: "datesheet",
        subtitle: "Official examination schedule",
        meta: {
          Course: d.course || "—",
          Teacher: d.teacher || "—",
        },
      }
    );
  };

  const exportAllDatesheets = () => {
    const blocks = datesheets
      .map((d) => {
        const rows = (d.entries || []).map((e) => {
          const day = e.date
            ? new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
              })
            : "—";
          const time =
            e.startTime && e.endTime ? `${e.startTime} – ${e.endTime}` : e.time || "—";
          return [e.subject, e.date, day, time, e.room || "—"];
        });
        return `<h2>${d.title}</h2>
          <p style="color:#64748b;font-size:13px">${d.course || ""} · ${d.teacher || ""}</p>
          ${tableHtml(["Subject", "Date", "Day", "Time", "Room"], rows)}`;
      })
      .join("");
    saveAsPdf("All date sheets", blocks || "<p>No date sheets available.</p>", {
      type: "datesheet",
      subtitle: "Complete exam schedule",
      meta: { Sheets: String(datesheets.length) },
    });
  };

  const exportResults = () => {
    const rows = marks.map((i) => [
      i.studentName || "—",
      i.course,
      i.subject,
      i.score,
      i.feedback || "—",
    ]);
    saveAsPdf(
      isStudent ? "My Results / Grades" : "Marks Report",
      tableHtml(["Student", "Course", "Subject", "Score", "Feedback"], rows),
      {
        type: "results",
        subtitle: isStudent ? "Student academic results" : "Course marks overview",
        meta: { Records: String(marks.length) },
      }
    );
  };

  const exportAttendance = () => {
    const rows = attendance.map((i) => [
      i.studentName || "—",
      i.course,
      i.date,
      i.status,
      i.teacher || "—",
    ]);
    saveAsPdf(
      isStudent ? "My Attendance" : "Attendance Report",
      tableHtml(["Student", "Course", "Date", "Status", "Teacher"], rows, {
        statusColumn: 3,
      }),
      {
        type: "attendance",
        subtitle: isStudent ? "Your attendance records" : "Attendance overview",
        meta: { Records: String(attendance.length) },
      }
    );
  };

  const layoutRole = isAdmin ? "admin" : isTeacher ? "teacher" : "student";
  const layoutVariant = isAdmin ? "admin" : isTeacher ? "teacher" : "courses";

  return (
    <PageLayout
      role={layoutRole}
      variant={layoutVariant}
      title="Resources"
      subtitle={
        isStudent
          ? "Syllabus, date sheets, attendance, and grades — export any report as PDF"
          : isTeacher
            ? "Your course resources, attendance, and marks — export as PDF"
            : "School resources overview"
      }
    >
      <div className="resources-page-stack">
        {loading ? (
          <StatSkeleton />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResourceSummaryCard
              title="Syllabus"
              value={syllabi.length}
              icon={BookOpen}
              accent="from-sky-500 to-blue-600"
              hint="Course outlines from teachers"
              delay={0}
              actions={
                <SaveAsPdfButton
                  onClick={exportAllSyllabi}
                  disabled={!syllabi.length}
                  className="!py-2 !text-xs"
                >
                  Export all
                </SaveAsPdfButton>
              }
            />
            <ResourceSummaryCard
              title="Date sheets"
              value={datesheets.length}
              icon={CalendarDays}
              accent="from-indigo-500 to-violet-600"
              hint="Exam schedules and timings"
              delay={0.05}
              actions={
                <SaveAsPdfButton
                  onClick={exportAllDatesheets}
                  disabled={!datesheets.length}
                  className="!py-2 !text-xs"
                >
                  Export all
                </SaveAsPdfButton>
              }
            />
            <ResourceSummaryCard
              title="Grades"
              value={marks.length}
              icon={Award}
              accent="from-emerald-500 to-teal-600"
              hint={isStudent ? "Your published marks" : "Marks across your courses"}
              delay={0.1}
              actions={
                <>
                  <SaveAsPdfButton
                    onClick={exportResults}
                    disabled={!marks.length}
                    className="!py-2 !text-xs"
                  />
                  <Link to="/student-results">
                    <GradientButton
                      variant="ghost"
                      className="!border-slate-200 !px-3 !py-2 !text-xs !text-slate-800"
                    >
                      {isTeacher ? "View marks" : "Open results"}
                    </GradientButton>
                  </Link>
                </>
              }
            />
            <ResourceSummaryCard
              title="Attendance"
              value={attendance.length}
              icon={CalendarCheck}
              accent="from-amber-500 to-orange-500"
              hint={
                attendance.length
                  ? `${attendancePresent} present of ${attendance.length} records`
                  : "Attendance records"
              }
              delay={0.15}
              actions={
                <>
                  <SaveAsPdfButton
                    onClick={exportAttendance}
                    disabled={!attendance.length}
                    className="!py-2 !text-xs"
                  />
                  {isStudent && (
                    <Link to="/student-attendance">
                      <GradientButton
                        variant="ghost"
                        className="!border-slate-200 !px-3 !py-2 !text-xs !text-slate-800"
                      >
                        Open
                      </GradientButton>
                    </Link>
                  )}
                  {isTeacher && (
                    <Link to="/attendance">
                      <GradientButton
                        variant="ghost"
                        className="!border-slate-200 !px-3 !py-2 !text-xs !text-slate-800"
                      >
                        Manage
                      </GradientButton>
                    </Link>
                  )}
                </>
              }
            />
          </section>
        )}

        {loading ? null : (
          <>
            <DashboardPanel
              title="Syllabus"
              subtitle="Course outlines published by your teachers"
              action={
                <SaveAsPdfButton
                  onClick={exportAllSyllabi}
                  disabled={!syllabi.length}
                  className="!py-2"
                />
              }
              delay={0.08}
            >
              {syllabi.length === 0 ? (
                <ResourceEmpty
                  title="No syllabus published yet"
                  text="Your teachers will publish course outlines here when ready."
                />
              ) : (
                <div className="resources-section-grid">
                  {syllabi.map((item) => (
                    <ResourceItemCard
                      key={item._id}
                      title={item.title}
                      badge={item.subject || "Syllabus"}
                      meta={[item.course, item.teacher || "Teacher"].filter(Boolean)}
                      accent="from-sky-500 to-blue-600"
                      actions={
                        <SaveAsPdfButton
                          onClick={() => exportSyllabus(item)}
                          className="!py-2 !text-xs"
                        />
                      }
                    >
                      {item.content ? (
                        <div
                          className="prose-rich line-clamp-6 text-sm leading-relaxed text-slate-700"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      ) : (
                        <p className="text-sm text-slate-500">No detailed content available.</p>
                      )}
                    </ResourceItemCard>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Exam date sheets"
              subtitle="Official schedules with subject, date, time, and room"
              action={
                <SaveAsPdfButton
                  onClick={exportAllDatesheets}
                  disabled={!datesheets.length}
                  className="!py-2"
                />
              }
              delay={0.12}
            >
              {datesheets.length === 0 ? (
                <ResourceEmpty
                  title="No date sheets published yet"
                  text="Exam schedules will appear here once published by admin or teachers."
                />
              ) : (
                <div className="resources-section-grid">
                  {datesheets.map((d) => (
                    <ResourceItemCard
                      key={d._id}
                      title={d.title}
                      badge={d.status === "finalized" ? "Finalized" : "Draft"}
                      meta={[d.course, d.teacher || "Teacher"].filter(Boolean)}
                      accent="from-indigo-500 to-violet-600"
                      actions={
                        <SaveAsPdfButton
                          onClick={() => exportDatesheet(d)}
                          className="!py-2 !text-xs"
                        />
                      }
                    >
                      {d.notes ? (
                        <div
                          className="prose-rich mb-4 line-clamp-4 text-sm text-slate-700"
                          dangerouslySetInnerHTML={{ __html: d.notes }}
                        />
                      ) : null}
                      <div className="inst-table-wrap">
                        <table className="inst-table">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Date</th>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Room</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(d.entries || []).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="inst-table__empty">
                                  No schedule rows
                                </td>
                              </tr>
                            ) : (
                              (d.entries || []).map((e, idx) => {
                                const day = e.date
                                  ? new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined, {
                                      weekday: "short",
                                    })
                                  : "—";
                                const time =
                                  e.startTime && e.endTime
                                    ? `${e.startTime} – ${e.endTime}`
                                    : e.time || "—";
                                return (
                                  <tr key={idx}>
                                    <td className="font-medium text-slate-800">{e.subject}</td>
                                    <td>
                                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                                        <CalendarDays size={14} className="text-indigo-500" />
                                        {e.date}
                                      </span>
                                    </td>
                                    <td className="text-slate-600">{day}</td>
                                    <td>
                                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                                        <Clock size={14} className="text-cyan-600" />
                                        {time}
                                      </span>
                                    </td>
                                    <td className="text-slate-600">{e.room || "—"}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </ResourceItemCard>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Attendance snapshot"
              subtitle={
                isStudent
                  ? "Records marked by your teachers"
                  : "Attendance records for your courses"
              }
              action={
                <SaveAsPdfButton
                  onClick={exportAttendance}
                  disabled={!attendance.length}
                  className="!py-2"
                />
              }
              delay={0.16}
            >
              {attendance.length === 0 ? (
                <ResourceEmpty
                  title="No attendance records yet"
                  text="Attendance will show here after teachers mark your class."
                />
              ) : (
                <div className="inst-table-wrap">
                  <table className="inst-table">
                    <thead>
                      <tr>
                        {!isStudent && <th>Student</th>}
                        <th>Course</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a) => (
                        <tr key={a._id}>
                          {!isStudent && (
                            <td>
                              <span className="inline-flex items-center gap-1.5">
                                <User size={14} className="text-slate-400" />
                                {a.studentName}
                              </span>
                            </td>
                          )}
                          <td>
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap size={14} className="text-slate-400" />
                              {a.course}
                            </span>
                          </td>
                          <td className="tabular-nums">{a.date}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                a.status === "Present"
                                  ? "status-badge--present"
                                  : "status-badge--absent"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td>{a.teacher || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Grades snapshot"
              subtitle={isStudent ? "Your marks from published results" : "Marks for your courses"}
              action={
                <SaveAsPdfButton
                  onClick={exportResults}
                  disabled={!marks.length}
                  className="!py-2"
                />
              }
              delay={0.2}
            >
              {marks.length === 0 ? (
                <ResourceEmpty
                  title="No grades published yet"
                  text="Marks will appear here after teachers enter and publish scores."
                />
              ) : (
                <div className="inst-table-wrap">
                  <table className="inst-table">
                    <thead>
                      <tr>
                        {!isStudent && <th>Student</th>}
                        <th>Course</th>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m) => (
                        <tr key={m._id}>
                          {!isStudent && <td>{m.studentName}</td>}
                          <td>{m.course}</td>
                          <td>{m.subject}</td>
                          <td>
                            <span className="font-display text-base font-bold text-indigo-700">
                              {m.score}
                            </span>
                          </td>
                          <td className="text-slate-600">{m.feedback || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardPanel>
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default StudentResources;
