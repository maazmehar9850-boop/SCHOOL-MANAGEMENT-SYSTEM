import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  CalendarDays,
  FileText,
  Plus,
  Pencil,
  Trash2,
  FileDown,
  Download,
  Eye,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  FileType,
  CheckCircle2,
  XCircle,
  Lock,
  ShieldCheck,
  Unlock,
} from "lucide-react";
import API, { fileUrl } from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import ResourceTable from "../components/ResourceTable";
import RichTextEditor from "../components/RichTextEditor";
import Modal from "../components/Modal";
import GradientButton from "../components/GradientButton";
import InfoBanner from "../components/InfoBanner";
import { saveAsPdf, tableHtml, paperQuestionsHtml } from "../utils/saveAsPdf";

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dayName(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

function formatTimeRange(entry) {
  if (entry.startTime && entry.endTime) return `${entry.startTime} – ${entry.endTime}`;
  if (entry.time) return entry.time;
  if (entry.startTime) return entry.startTime;
  return "—";
}

function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return d >= today;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FileTypeBadge({ type }) {
  if (!type) return <span className="text-slate-400">—</span>;
  return (
    <span className={`file-type-badge ${type === "pdf" ? "pdf" : "image"}`}>
      {type === "pdf" ? <FileType size={12} /> : <ImageIcon size={12} />}
      {type}
    </span>
  );
}

const emptyEntry = () => ({
  subject: "",
  date: "",
  startTime: "",
  endTime: "",
  room: "",
  invigilator: "",
});

const TABS = [
  { key: "datesheet", label: "Date Sheet", icon: CalendarDays },
  { key: "paper", label: "Exam Papers", icon: FileText },
  { key: "syllabus", label: "Syllabus", icon: BookOpen },
];

function TeacherTools() {
  const role = localStorage.getItem("role") || "teacher";
  const isAdmin = role === "admin";
  const canCreateSyllabusDatesheet = role === "teacher" || role === "admin";
  const canManageSyllabusDatesheet = isAdmin;
  const canManagePapers = role === "teacher";

  const [tab, setTab] = useState(isAdmin ? "datesheet" : "paper");
  const [loading, setLoading] = useState(true);
  const [syllabi, setSyllabi] = useState([]);
  const [datesheets, setDatesheets] = useState([]);
  const [papers, setPapers] = useState([]);
  const [allottedCourses, setAllottedCourses] = useState([]);
  const [examReadiness, setExamReadiness] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [syllabusForm, setSyllabusForm] = useState({
    title: "",
    course: "",
    courseId: "",
    subject: "",
    topics: "",
    content: "",
    file: null,
  });

  const [datesheetForm, setDatesheetForm] = useState({
    title: "",
    course: "",
    courseId: "",
    notes: "",
    entries: [],
  });
  const [entry, setEntry] = useState(emptyEntry());

  const [paperForm, setPaperForm] = useState({
    title: "",
    course: "",
    courseId: "",
    subject: "",
    instructions: "",
    questions: [],
    file: null,
  });
  const [question, setQuestion] = useState({ q: "", marks: "" });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const requests = [
        API.get("/syllabus"),
        API.get("/datesheet"),
        API.get("/paper"),
        API.get("/courses"),
      ];
      if (isAdmin) requests.push(API.get("/datesheet/exam-readiness"));
      const results = await Promise.all(requests);
      const [s, d, p, c, readiness] = results;
      setSyllabi(s.data || []);
      setDatesheets(d.data || []);
      setPapers(p.data || []);
      setAllottedCourses(Array.isArray(c.data) ? c.data : c.data?.courses || []);
      if (isAdmin && readiness) setExamReadiness(readiness.data || null);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const scheduleRows = useMemo(() => {
    const rows = [];
    datesheets.forEach((sheet) => {
      (sheet.entries || []).forEach((en, idx) => {
        rows.push({
          _id: `${sheet._id}-${idx}`,
          datesheetId: sheet._id,
          entryIndex: idx,
          sheetTitle: sheet.title,
          course: sheet.course,
          teacher: sheet.teacher,
          notes: sheet.notes,
          subject: en.subject || "",
          date: en.date || "",
          day: dayName(en.date),
          startTime: en.startTime || "",
          endTime: en.endTime || "",
          timeLabel: formatTimeRange(en),
          room: en.room || "—",
          invigilator: en.invigilator || "—",
          upcoming: isUpcoming(en.date),
          sheet,
        });
      });
    });
    return rows;
  }, [datesheets]);

  const courseSelectOptions = useMemo(
    () =>
      allottedCourses.map((c) => ({
        id: c._id,
        name: c.courseName,
        label: `${c.courseName}${c.courseCode ? ` (${c.courseCode})` : ""}${
          c.className ? ` — ${c.className}` : ""
        }`,
      })),
    [allottedCourses]
  );

  const courseOptions = useMemo(() => {
    const set = new Set();
    allottedCourses.forEach((c) => {
      if (c.courseName) set.add(c.courseName);
    });
    [...datesheets, ...papers, ...syllabi].forEach((i) => {
      if (i.course) set.add(i.course);
    });
    return [...set].sort().map((c) => ({ value: c, label: c }));
  }, [allottedCourses, datesheets, papers, syllabi]);

  const pickCourse = (courseId, setter) => {
    const found = allottedCourses.find((c) => String(c._id) === String(courseId));
    setter((s) => ({
      ...s,
      courseId: courseId || "",
      course: found?.courseName || "",
    }));
  };

  const subjectOptions = useMemo(() => {
    const set = new Set();
    papers.forEach((p) => {
      if (p.subject) set.add(p.subject);
    });
    scheduleRows.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    syllabi.forEach((s) => {
      if (s.subject) set.add(s.subject);
      if (s.title) set.add(s.title);
    });
    return [...set].sort().map((c) => ({ value: c, label: c }));
  }, [papers, scheduleRows, syllabi]);

  const resetForms = () => {
    setEditingId(null);
    setSyllabusForm({
      title: "",
      course: "",
      courseId: "",
      subject: "",
      topics: "",
      content: "",
      file: null,
    });
    setDatesheetForm({ title: "", course: "", courseId: "", notes: "", entries: [] });
    setEntry(emptyEntry());
    setPaperForm({
      title: "",
      course: "",
      courseId: "",
      subject: "",
      instructions: "",
      questions: [],
      file: null,
    });
    setQuestion({ q: "", marks: "" });
  };

  const openCreate = () => {
    if (tab === "paper" && !canManagePapers) {
      toast.error("Only teachers can create exam papers for allotted courses");
      return;
    }
    if ((tab === "datesheet" || tab === "syllabus") && !canCreateSyllabusDatesheet) {
      toast.error("You cannot create syllabus or date sheets");
      return;
    }
    resetForms();
    setShowForm(true);
  };

  const addEntry = () => {
    if (!entry.subject || !entry.date) {
      toast.error("Subject and exam date are required");
      return;
    }
    setDatesheetForm((s) => ({
      ...s,
      entries: [...s.entries, { ...entry }],
    }));
    setEntry(emptyEntry());
  };

  const submitDatesheet = async (e) => {
    e.preventDefault();
    if (!canCreateSyllabusDatesheet) {
      toast.error("You cannot create date sheets");
      return;
    }
    if (editingId && !canManageSyllabusDatesheet) {
      toast.error("Only admin can edit date sheets");
      return;
    }
    if (!datesheetForm.title || (!datesheetForm.course && !datesheetForm.courseId)) {
      toast.error("Title and course are required");
      return;
    }
    if (!datesheetForm.entries.length) {
      toast.error("Add at least one exam schedule row");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: datesheetForm.title,
        course: datesheetForm.course,
        courseId: datesheetForm.courseId || undefined,
        notes: datesheetForm.notes || "",
        entries: datesheetForm.entries,
      };
      if (editingId) {
        await API.put(`/datesheet/${editingId}`, payload);
        toast.success("Date sheet updated");
      } else {
        await API.post("/datesheet", payload);
        toast.success("Date sheet saved");
      }
      setShowForm(false);
      resetForms();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editDatesheet = (sheet) => {
    if (!canManageSyllabusDatesheet) return;
    const matched = allottedCourses.find((c) => c.courseName === sheet.course);
    setEditingId(sheet._id);
    setDatesheetForm({
      title: sheet.title || "",
      course: sheet.course || "",
      courseId: matched?._id || "",
      notes: sheet.notes || "",
      entries: (sheet.entries || []).map((en) => ({
        subject: en.subject || "",
        date: en.date || "",
        startTime: en.startTime || "",
        endTime: en.endTime || "",
        room: en.room || "",
        invigilator: en.invigilator || "",
      })),
    });
    setTab("datesheet");
    setShowForm(true);
  };

  const deleteDatesheet = async (id) => {
    if (!canManageSyllabusDatesheet) {
      toast.error("Only admin can delete date sheets");
      return;
    }
    if (!window.confirm("Delete this date sheet and all its exam rows?")) return;
    try {
      await API.delete(`/datesheet/${id}`);
      toast.success("Date sheet deleted");
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const finalizeExams = async () => {
    if (!examReadiness?.summary?.canFinalize) return;
    if (
      !window.confirm(
        "Finalize the exam schedule? Date sheets will be locked and teachers can enter marks only after each paper's end time."
      )
    ) {
      return;
    }
    setFinalizing(true);
    try {
      const { data } = await API.post("/datesheet/finalize");
      toast.success(data?.message || "Exams finalized");
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not finalize exams");
    } finally {
      setFinalizing(false);
    }
  };

  const finalizeCourse = async (datesheetId, courseName) => {
    if (!datesheetId) {
      toast.error("Create a date sheet for this course first");
      return;
    }
    if (
      !window.confirm(`Finalize exam for ${courseName}? Teachers can enter marks after the paper end time.`)
    ) {
      return;
    }
    setFinalizing(true);
    try {
      const { data } = await API.post(`/datesheet/${datesheetId}/finalize`);
      toast.success(data?.message || "Course exam finalized");
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not finalize");
    } finally {
      setFinalizing(false);
    }
  };

  const unfinalizeExams = async () => {
    if (!examReadiness?.summary?.canUnfinalize) return;
    if (
      !window.confirm(
        "Reopen all finalized date sheets? Marks entry will be closed until you finalize again."
      )
    ) {
      return;
    }
    setFinalizing(true);
    try {
      const { data } = await API.post("/datesheet/unfinalize");
      toast.success(data?.message || "Exams reopened");
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reopen exams");
    } finally {
      setFinalizing(false);
    }
  };

  const unfinalizeCourse = async (datesheetId, courseName) => {
    if (!datesheetId) return;
    if (!window.confirm(`Reopen date sheet for ${courseName}?`)) return;
    setFinalizing(true);
    try {
      const { data } = await API.post(`/datesheet/${datesheetId}/unfinalize`);
      toast.success(data?.message || "Date sheet reopened");
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reopen");
    } finally {
      setFinalizing(false);
    }
  };

  const printDatesheet = (sheet) => {
    const sorted = [...(sheet.entries || [])].sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || ""))
    );
    const rows = sorted.map((en) => [
      en.subject || "—",
      en.date || "—",
      dayName(en.date),
      formatTimeRange(en),
      en.room || "—",
      en.invigilator || "—",
    ]);
    saveAsPdf(
      sheet.title || "Examination Date Sheet",
      `<p><strong>Course / Class:</strong> ${sheet.course || "—"} · <strong>Teacher:</strong> ${sheet.teacher || "—"}</p>
       ${sheet.notes || ""}
       ${tableHtml(["Subject", "Exam Date", "Day", "Time", "Room / Hall", "Invigilator"], rows)}`,
      {
        type: "datesheet",
        subtitle: "Official examination timetable",
        meta: {
          Course: sheet.course || "—",
          Teacher: sheet.teacher || "—",
          Entries: String(sorted.length),
        },
      }
    );
  };

  const printScheduleRow = (row) => printDatesheet(row.sheet);

  const addQuestion = () => {
    if (!stripHtml(question.q)) {
      toast.error("Write a question first");
      return;
    }
    setPaperForm((p) => ({
      ...p,
      questions: [...p.questions, { q: question.q, marks: Number(question.marks) || 0 }],
    }));
    setQuestion({ q: "", marks: "" });
  };

  const submitPaper = async (e) => {
    e.preventDefault();
    if (!canManagePapers) {
      toast.error("Only teachers can create papers for allotted courses");
      return;
    }
    if (!paperForm.title || (!paperForm.course && !paperForm.courseId)) {
      toast.error("Title and allotted course are required");
      return;
    }
    if (!paperForm.file && !paperForm.questions.length && !editingId) {
      toast.error("Upload a paper file or add at least one question");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: paperForm.title,
        course: paperForm.course,
        courseId: paperForm.courseId || undefined,
        subject: paperForm.subject || "",
        instructions: paperForm.instructions || "",
        questions: paperForm.questions || [],
      };

      let body = payload;
      if (paperForm.file) {
        const fd = new FormData();
        fd.append("title", payload.title);
        fd.append("course", payload.course);
        if (payload.courseId) fd.append("courseId", payload.courseId);
        fd.append("subject", payload.subject);
        fd.append("instructions", payload.instructions);
        fd.append("questions", JSON.stringify(payload.questions));
        fd.append("file", paperForm.file);
        body = fd;
      }

      if (editingId) {
        await API.put(`/paper/${editingId}`, body);
        toast.success("Paper updated");
      } else {
        await API.post("/paper", body);
        toast.success("Paper saved");
      }
      setShowForm(false);
      resetForms();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editPaper = (item) => {
    if (!canManagePapers) return;
    const matched = allottedCourses.find((c) => c.courseName === item.course);
    setEditingId(item._id);
    setPaperForm({
      title: item.title || "",
      course: item.course || "",
      courseId: matched?._id || "",
      subject: item.subject || "",
      instructions: item.instructions || "",
      questions: item.questions || [],
      file: null,
    });
    setTab("paper");
    setShowForm(true);
  };

  const deletePaper = async (id) => {
    if (!canManagePapers) {
      toast.error("Only teachers can delete their course papers");
      return;
    }
    if (!window.confirm("Delete this exam paper?")) return;
    try {
      await API.delete(`/paper/${id}`);
      toast.success("Paper deleted");
      fetchResources();
    } catch {
      toast.error("Delete failed");
    }
  };

  const exportPaper = (item) => {
    const qs = paperQuestionsHtml(item.questions || []);
    saveAsPdf(
      item.title || "Exam Paper",
      `<p><strong>Subject:</strong> ${item.subject || "—"} · <strong>Course:</strong> ${item.course || "—"} · <strong>Teacher:</strong> ${item.teacher || "—"}</p>
       ${item.instructions ? `<div style="margin:12px 0;padding:10px 12px;border:1px solid #c7d2fe;background:#eef2ff;border-radius:8px"><strong>Instructions</strong><div>${item.instructions}</div></div>` : ""}
       ${qs}`,
      {
        type: "paper",
        subtitle: "Examination question paper",
        meta: {
          Subject: item.subject || "—",
          Course: item.course || "—",
          Teacher: item.teacher || "—",
        },
      }
    );
  };

  const submitSyllabus = async (e) => {
    e.preventDefault();
    if (!canCreateSyllabusDatesheet) {
      toast.error("You cannot create syllabus");
      return;
    }
    if (editingId && !canManageSyllabusDatesheet) {
      toast.error("Only admin can edit syllabus");
      return;
    }
    if (!syllabusForm.title || (!syllabusForm.course && !syllabusForm.courseId)) {
      toast.error("Title and course are required");
      return;
    }
    if (!stripHtml(syllabusForm.content) && !syllabusForm.topics && !syllabusForm.file && !editingId) {
      toast.error("Add topics, content, or upload a file");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: syllabusForm.title,
        course: syllabusForm.course,
        courseId: syllabusForm.courseId || undefined,
        subject: syllabusForm.subject || syllabusForm.title,
        topics: syllabusForm.topics || "",
        content: syllabusForm.content || "",
      };

      let body = payload;
      if (syllabusForm.file) {
        const fd = new FormData();
        fd.append("title", payload.title);
        fd.append("course", payload.course);
        if (payload.courseId) fd.append("courseId", payload.courseId);
        fd.append("subject", payload.subject);
        fd.append("topics", payload.topics);
        fd.append("content", payload.content);
        fd.append("file", syllabusForm.file);
        body = fd;
      }

      if (editingId) {
        await API.put(`/syllabus/${editingId}`, body);
        toast.success("Syllabus updated");
      } else {
        await API.post("/syllabus", body);
        toast.success("Syllabus saved");
      }
      setShowForm(false);
      resetForms();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editSyllabus = (item) => {
    if (!canManageSyllabusDatesheet) return;
    const matched = allottedCourses.find((c) => c.courseName === item.course);
    setEditingId(item._id);
    setSyllabusForm({
      title: item.title || "",
      course: item.course || "",
      courseId: matched?._id || "",
      subject: item.subject || item.title || "",
      topics: item.topics || "",
      content: item.content || "",
      file: null,
    });
    setTab("syllabus");
    setShowForm(true);
  };

  const deleteSyllabus = async (id) => {
    if (!canManageSyllabusDatesheet) {
      toast.error("Only admin can delete syllabus");
      return;
    }
    if (!window.confirm("Delete this syllabus?")) return;
    try {
      await API.delete(`/syllabus/${id}`);
      toast.success("Syllabus deleted");
      fetchResources();
    } catch {
      toast.error("Delete failed");
    }
  };

  const datesheetColumns = [
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const finalized = row.sheet?.status === "finalized";
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              finalized
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {finalized ? <Lock size={12} /> : null}
            {finalized ? "Finalized" : "Draft"}
          </span>
        );
      },
    },
    {
      key: "subject",
      label: "Subject Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.subject}</p>
          <p className="text-xs text-slate-500">{row.sheetTitle}</p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Exam Date",
      render: (row) => (
        <span className="tabular-nums font-medium text-slate-800">{row.date || "—"}</span>
      ),
    },
    { key: "day", label: "Day" },
    {
      key: "timeLabel",
      label: "Time (Start – End)",
      render: (row) => <span className="tabular-nums">{row.timeLabel}</span>,
    },
    { key: "room", label: "Room / Hall" },
    { key: "invigilator", label: "Invigilator" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {canManageSyllabusDatesheet && row.sheet?.status !== "finalized" && (
            <button
              type="button"
              className="action-icon-btn"
              title="Edit date sheet"
              onClick={() => editDatesheet(row.sheet)}
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            type="button"
            className="action-icon-btn"
            title="Save as PDF"
            onClick={() => printScheduleRow(row)}
          >
            <FileDown size={14} />
          </button>
          {canManageSyllabusDatesheet && row.sheet?.status !== "finalized" && (
            <button
              type="button"
              className="action-icon-btn danger"
              title="Delete date sheet"
              onClick={() => deleteDatesheet(row.datesheetId)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const paperColumns = [
    {
      key: "title",
      label: "Paper Title",
      render: (row) => <span className="font-semibold text-slate-900">{row.title}</span>,
    },
    {
      key: "subject",
      label: "Subject",
      render: (row) => row.subject || "—",
    },
    { key: "course", label: "Class / Course" },
    {
      key: "createdAt",
      label: "Upload Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "fileType",
      label: "File Type",
      render: (row) => <FileTypeBadge type={row.fileType} />,
    },
    {
      key: "preview",
      label: "Download / Preview",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.fileUrl ? (
            <>
              <button
                type="button"
                className="action-icon-btn"
                title="Preview"
                onClick={() => setPreview(row)}
              >
                <Eye size={14} />
              </button>
              <a
                href={fileUrl(row.fileUrl)}
                download={row.fileName || true}
                target="_blank"
                rel="noreferrer"
                className="action-icon-btn"
                title="Download"
              >
                <Download size={14} />
              </a>
            </>
          ) : (
            <button
              type="button"
              className="action-icon-btn"
              title="Save questions as PDF"
              onClick={() => exportPaper(row)}
            >
              <FileDown size={14} />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) =>
        canManagePapers ? (
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="action-icon-btn" title="Edit" onClick={() => editPaper(row)}>
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="action-icon-btn danger"
              title="Delete"
              onClick={() => deletePaper(row._id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">View only</span>
        ),
    },
  ];

  const syllabusColumns = [
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.subject || row.title}</p>
          <p className="text-xs text-slate-500">{row.title}</p>
        </div>
      ),
    },
    { key: "course", label: "Course / Class" },
    {
      key: "topics",
      label: "Topics Covered",
      render: (row) => (
        <span className="line-clamp-2 max-w-[220px] text-slate-600">
          {row.topics || stripHtml(row.content).slice(0, 80) || "—"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (row) => formatDate(row.updatedAt || row.createdAt),
    },
    {
      key: "fileType",
      label: "File",
      render: (row) =>
        row.fileUrl ? (
          <div className="flex items-center gap-1.5">
            <FileTypeBadge type={row.fileType || "pdf"} />
            <button
              type="button"
              className="action-icon-btn"
              title="Preview"
              onClick={() => setPreview(row)}
            >
              <Eye size={14} />
            </button>
          </div>
        ) : (
          <span className="text-slate-400">Text only</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) =>
        canManageSyllabusDatesheet ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className="action-icon-btn"
              title="Edit"
              onClick={() => editSyllabus(row)}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="action-icon-btn danger"
              title="Delete"
              onClick={() => deleteSyllabus(row._id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">View only</span>
        ),
    },
  ];

  return (
    <PageLayout
      role={role}
      variant={isAdmin ? "admin" : "teacher"}
      title={isAdmin ? "Syllabus & Date Sheets" : "Teacher Tools"}
      subtitle={
        isAdmin
          ? "Create and manage syllabus and examination date sheets for every subject"
          : "Create syllabus, date sheets, and exam papers only for courses allotted to you"
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setShowForm(false);
                resetForms();
              }}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === key
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "glass-panel text-slate-700 hover:bg-white/80"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {tab === "datesheet" && (
          <GlassCard className="p-5 md:p-7" hover={false}>
            {isAdmin && examReadiness && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Exam readiness review
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Finalize when every teacher has uploaded syllabus and exam paper
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <GradientButton
                      type="button"
                      onClick={finalizeExams}
                      disabled={!examReadiness.summary?.canFinalize || finalizing}
                      className="!gap-2"
                    >
                      <ShieldCheck size={16} />
                      {finalizing ? "Working…" : "Finalize all"}
                    </GradientButton>
                    {examReadiness.summary?.canUnfinalize && (
                      <button
                        type="button"
                        onClick={unfinalizeExams}
                        disabled={finalizing}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Unlock size={16} />
                        Reopen all
                      </button>
                    )}
                  </div>
                </div>

                {examReadiness.summary?.examsFinalized ? (
                  <InfoBanner variant="success">
                    All date sheets are finalized. Teachers can enter marks after each paper&apos;s
                    scheduled end time.
                  </InfoBanner>
                ) : examReadiness.summary?.canFinalize ? (
                  <InfoBanner variant="success">
                    All teachers have completed syllabus and papers. You can finalize the exam
                    schedule now.
                  </InfoBanner>
                ) : (
                  <InfoBanner variant="warning">
                    Waiting on teachers — {examReadiness.summary?.readyCourses || 0} of{" "}
                    {examReadiness.summary?.totalCourses || 0} courses ready (syllabus + paper
                    required for each).
                  </InfoBanner>
                )}

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
                      <tr>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Teacher</th>
                        <th className="px-4 py-3">Syllabus</th>
                        <th className="px-4 py-3">Exam paper</th>
                        <th className="px-4 py-3">Ready</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(examReadiness.courses || []).map((c) => (
                        <tr key={c.courseId} className="border-t border-slate-100 bg-white/80">
                          <td className="px-4 py-3 font-medium text-slate-900">{c.courseName}</td>
                          <td className="px-4 py-3 text-slate-600">{c.teacher || "—"}</td>
                          <td className="px-4 py-3">
                            {c.hasSyllabus ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 size={14} /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700">
                                <XCircle size={14} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {c.hasPaper ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 size={14} /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700">
                                <XCircle size={14} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {c.ready ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                Ready
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                                Incomplete
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {c.datesheetStatus === "finalized" ? (
                              <button
                                type="button"
                                onClick={() => unfinalizeCourse(c.datesheetId, c.courseName)}
                                disabled={finalizing}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <Unlock size={12} />
                                Reopen
                              </button>
                            ) : c.canFinalizeCourse ? (
                              <button
                                type="button"
                                onClick={() => finalizeCourse(c.datesheetId, c.courseName)}
                                disabled={finalizing}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                              >
                                <ShieldCheck size={12} />
                                Finalize
                              </button>
                            ) : c.ready && !c.hasDatesheet ? (
                              <span className="text-xs text-amber-700">No date sheet</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isAdmin && (
              <InfoBanner variant="info">
                Upload syllabus and exam paper for your allotted courses. Admin will finalize the
                date sheet when all teachers are ready — marks entry opens after the exam end time.
              </InfoBanner>
            )}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Examination Date Sheet
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Official schedule table — upcoming exams are highlighted in green
                </p>
              </div>
            </div>

            <ResourceTable
              loading={loading}
              columns={datesheetColumns}
              data={scheduleRows}
              searchKeys={["subject", "course", "room", "invigilator", "sheetTitle", "day"]}
              searchPlaceholder="Search subject, room, invigilator…"
              defaultSortKey="date"
              defaultSortDir="asc"
              pageSize={10}
              emptyMessage="No exam schedule published"
              emptyHint={
                canCreateSyllabusDatesheet
                  ? "Create a date sheet with subject, date, time, and hall details."
                  : "Admin publishes date sheets for your allotted courses."
              }
              filters={[
                { key: "course", label: "All courses", options: courseOptions },
              ]}
              rowClassName={(row) => (row.upcoming ? "row-upcoming" : "row-past")}
              toolbar={
                <>
                  {canCreateSyllabusDatesheet && (
                    <GradientButton type="button" onClick={openCreate} className="!gap-2">
                      <Plus size={16} />
                      New date sheet
                    </GradientButton>
                  )}
                  <button
                    type="button"
                    onClick={fetchResources}
                    className="action-icon-btn !h-11 !w-11"
                    title="Refresh"
                  >
                    <RefreshCw size={16} />
                  </button>
                </>
              }
            />
          </GlassCard>
        )}

        {tab === "paper" && (
          <GlassCard className="p-5 md:p-7" hover={false}>
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-slate-900">Exam Papers</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload PDF or image papers, preview, download, and manage by subject or class
              </p>
            </div>
            <ResourceTable
              loading={loading}
              columns={paperColumns}
              data={papers}
              searchKeys={["title", "subject", "course", "teacher", "fileName"]}
              searchPlaceholder="Search by subject or class…"
              defaultSortKey="createdAt"
              defaultSortDir="desc"
              emptyMessage="No exam papers yet"
              emptyHint={
                canManagePapers
                  ? "Upload a PDF/image paper for a course allotted to you."
                  : "Teachers upload papers for their allotted courses."
              }
              filters={[
                { key: "course", label: "All courses", options: courseOptions },
                { key: "subject", label: "All subjects", options: subjectOptions },
              ]}
              toolbar={
                <>
                  {canManagePapers && (
                    <GradientButton type="button" onClick={openCreate} className="!gap-2">
                      <Upload size={16} />
                      Upload paper
                    </GradientButton>
                  )}
                  <button
                    type="button"
                    onClick={fetchResources}
                    className="action-icon-btn !h-11 !w-11"
                    title="Refresh"
                  >
                    <RefreshCw size={16} />
                  </button>
                </>
              }
            />
          </GlassCard>
        )}

        {tab === "syllabus" && (
          <GlassCard className="p-5 md:p-7" hover={false}>
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-slate-900">Syllabus</h2>
              <p className="mt-1 text-sm text-slate-500">
                Expand a row to read full syllabus content — search and filter by course
              </p>
            </div>
            <ResourceTable
              loading={loading}
              columns={syllabusColumns}
              data={syllabi}
              searchKeys={["title", "subject", "course", "topics", "teacher"]}
              searchPlaceholder="Search syllabus by subject or course…"
              defaultSortKey="updatedAt"
              defaultSortDir="desc"
              emptyMessage="No syllabus published"
              emptyHint={
                canCreateSyllabusDatesheet
                  ? "Add topics, rich content, or upload a syllabus file."
                  : "Admin publishes syllabus for your allotted courses."
              }
              filters={[{ key: "course", label: "All courses", options: courseOptions }]}
              expandable
              renderExpanded={(row) => (
                <div className="space-y-3">
                  {row.topics ? (
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Topics: </span>
                      {row.topics}
                    </p>
                  ) : null}
                  {row.content ? (
                    <div
                      className="prose-rich rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-slate-700"
                      dangerouslySetInnerHTML={{ __html: row.content }}
                    />
                  ) : (
                    <p className="text-sm text-slate-500">No detailed content.</p>
                  )}
                  {row.fileUrl ? (
                    <a
                      href={fileUrl(row.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b5bdb]"
                    >
                      <Download size={14} />
                      Download {row.fileName || "file"}
                    </a>
                  ) : null}
                </div>
              )}
              toolbar={
                <>
                  {canCreateSyllabusDatesheet && (
                    <GradientButton type="button" onClick={openCreate} className="!gap-2">
                      <Plus size={16} />
                      Add syllabus
                    </GradientButton>
                  )}
                  <button
                    type="button"
                    onClick={fetchResources}
                    className="action-icon-btn !h-11 !w-11"
                    title="Refresh"
                  >
                    <RefreshCw size={16} />
                  </button>
                </>
              }
            />
          </GlassCard>
        )}

        {/* ——— Create / Edit forms ——— */}
        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            resetForms();
          }}
          title={
            tab === "datesheet"
              ? editingId
                ? "Edit date sheet"
                : "Create date sheet"
              : tab === "paper"
                ? editingId
                  ? "Edit exam paper"
                  : "Upload exam paper"
                : editingId
                  ? "Edit syllabus"
                  : "Create syllabus"
          }
          size="xl"
        >
          {tab === "datesheet" && (
            <form onSubmit={submitDatesheet} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Date sheet title (e.g. Mid-Term Exams 2026)"
                  value={datesheetForm.title}
                  onChange={(e) => setDatesheetForm((s) => ({ ...s, title: e.target.value }))}
                  className="input-glass"
                  required
                />
                <select
                  value={datesheetForm.courseId}
                  onChange={(e) => pickCourse(e.target.value, setDatesheetForm)}
                  className="input-glass"
                  required
                >
                  <option value="">Select course / class</option>
                  {courseSelectOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Notes / instructions</p>
                <RichTextEditor
                  value={datesheetForm.notes}
                  onChange={(html) => setDatesheetForm((s) => ({ ...s, notes: html }))}
                  placeholder="Exam rules, reporting time, hall instructions…"
                  minHeight={100}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">Add exam row</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    placeholder="Subject name"
                    value={entry.subject}
                    onChange={(e) => setEntry({ ...entry, subject: e.target.value })}
                    className="input-glass !h-10"
                  />
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => setEntry({ ...entry, date: e.target.value })}
                    className="input-glass !h-10"
                  />
                  <input
                    placeholder="Room / Hall"
                    value={entry.room}
                    onChange={(e) => setEntry({ ...entry, room: e.target.value })}
                    className="input-glass !h-10"
                  />
                  <input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) => setEntry({ ...entry, startTime: e.target.value })}
                    className="input-glass !h-10"
                    title="Start time"
                  />
                  <input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) => setEntry({ ...entry, endTime: e.target.value })}
                    className="input-glass !h-10"
                    title="End time"
                  />
                  <input
                    placeholder="Invigilator (optional)"
                    value={entry.invigilator}
                    onChange={(e) => setEntry({ ...entry, invigilator: e.target.value })}
                    className="input-glass !h-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={addEntry}
                  className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Add to schedule
                </button>

                {datesheetForm.entries.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-3 py-2">Subject</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Day</th>
                          <th className="px-3 py-2">Time</th>
                          <th className="px-3 py-2">Room</th>
                          <th className="px-3 py-2">Invigilator</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {datesheetForm.entries.map((en, i) => (
                          <tr key={i} className="border-t border-slate-100 bg-white">
                            <td className="px-3 py-2 font-medium">{en.subject}</td>
                            <td className="px-3 py-2">{en.date}</td>
                            <td className="px-3 py-2">{dayName(en.date)}</td>
                            <td className="px-3 py-2">{formatTimeRange(en)}</td>
                            <td className="px-3 py-2">{en.room || "—"}</td>
                            <td className="px-3 py-2">{en.invigilator || "—"}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                className="text-rose-600"
                                onClick={() =>
                                  setDatesheetForm((s) => ({
                                    ...s,
                                    entries: s.entries.filter((_, idx) => idx !== i),
                                  }))
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForms();
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <GradientButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update date sheet" : "Save date sheet"}
                </GradientButton>
              </div>
            </form>
          )}

          {tab === "paper" && (
            <form onSubmit={submitPaper} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Paper title"
                  value={paperForm.title}
                  onChange={(e) => setPaperForm((p) => ({ ...p, title: e.target.value }))}
                  className="input-glass"
                  required
                />
                <input
                  placeholder="Subject"
                  value={paperForm.subject}
                  onChange={(e) => setPaperForm((p) => ({ ...p, subject: e.target.value }))}
                  className="input-glass"
                />
                <select
                  value={paperForm.courseId}
                  onChange={(e) => pickCourse(e.target.value, setPaperForm)}
                  className="input-glass"
                  required
                >
                  <option value="">Select allotted course</option>
                  {courseSelectOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <label className="input-glass flex cursor-pointer items-center gap-2 !h-auto min-h-[3.1rem] py-2">
                  <Upload size={16} className="text-slate-500" />
                  <span className="truncate text-sm text-slate-600">
                    {paperForm.file?.name || "Upload PDF / Image (optional)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      setPaperForm((p) => ({ ...p, file: e.target.files?.[0] || null }))
                    }
                  />
                </label>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Instructions</p>
                <RichTextEditor
                  value={paperForm.instructions}
                  onChange={(html) => setPaperForm((p) => ({ ...p, instructions: html }))}
                  placeholder="Time allowed, attempt all questions…"
                  minHeight={100}
                />
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Questions (optional if file uploaded)
                </p>
                <RichTextEditor
                  value={question.q}
                  onChange={(html) => setQuestion((q) => ({ ...q, q: html }))}
                  placeholder="Type question…"
                  minHeight={110}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    placeholder="Marks"
                    type="number"
                    min="0"
                    value={question.marks}
                    onChange={(e) => setQuestion((q) => ({ ...q, marks: e.target.value }))}
                    className="input-glass !h-10 !w-28"
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add question
                  </button>
                </div>
                <ul className="space-y-2">
                  {paperForm.questions.map((qq, i) => (
                    <li key={i} className="rounded-xl border bg-white/80 p-3 text-sm">
                      <div className="mb-1 flex justify-between">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Q{i + 1} · {qq.marks} marks
                        </span>
                        <button
                          type="button"
                          className="text-rose-600"
                          onClick={() =>
                            setPaperForm((p) => ({
                              ...p,
                              questions: p.questions.filter((_, idx) => idx !== i),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div
                        className="prose-rich"
                        dangerouslySetInnerHTML={{ __html: qq.q }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForms();
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <GradientButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update paper" : "Save paper"}
                </GradientButton>
              </div>
            </form>
          )}

          {tab === "syllabus" && (
            <form onSubmit={submitSyllabus} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Title"
                  value={syllabusForm.title}
                  onChange={(e) => setSyllabusForm((s) => ({ ...s, title: e.target.value }))}
                  className="input-glass"
                  required
                />
                <input
                  placeholder="Subject"
                  value={syllabusForm.subject}
                  onChange={(e) => setSyllabusForm((s) => ({ ...s, subject: e.target.value }))}
                  className="input-glass"
                />
                <select
                  value={syllabusForm.courseId}
                  onChange={(e) => pickCourse(e.target.value, setSyllabusForm)}
                  className="input-glass"
                  required
                >
                  <option value="">Select course / class</option>
                  {courseSelectOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <label className="input-glass flex cursor-pointer items-center gap-2 !h-auto min-h-[3.1rem] py-2">
                  <Upload size={16} className="text-slate-500" />
                  <span className="truncate text-sm text-slate-600">
                    {syllabusForm.file?.name || "Upload PDF / Image (optional)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      setSyllabusForm((s) => ({ ...s, file: e.target.files?.[0] || null }))
                    }
                  />
                </label>
              </div>
              <textarea
                placeholder="Topics covered (comma-separated or short summary)"
                value={syllabusForm.topics}
                onChange={(e) => setSyllabusForm((s) => ({ ...s, topics: e.target.value }))}
                className="input-glass !h-auto min-h-[5rem] py-3"
                rows={3}
              />
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Full syllabus content</p>
                <RichTextEditor
                  value={syllabusForm.content}
                  onChange={(html) => setSyllabusForm((s) => ({ ...s, content: html }))}
                  placeholder="Write detailed syllabus…"
                  minHeight={160}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForms();
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <GradientButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update syllabus" : "Save syllabus"}
                </GradientButton>
              </div>
            </form>
          )}
        </Modal>

        {/* File preview */}
        <Modal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={preview?.title || preview?.fileName || "Preview"}
          size="xl"
        >
          {preview?.fileUrl ? (
            preview.fileType === "pdf" || preview.fileUrl.toLowerCase().endsWith(".pdf") ? (
              <iframe
                title="PDF preview"
                src={fileUrl(preview.fileUrl)}
                className="h-[65vh] w-full rounded-2xl border border-slate-200 bg-white"
              />
            ) : (
              <img
                src={fileUrl(preview.fileUrl)}
                alt={preview.fileName || "Preview"}
                className="max-h-[65vh] w-full rounded-2xl object-contain"
              />
            )
          ) : (
            <p className="text-slate-500">No file attached.</p>
          )}
          {preview?.fileUrl ? (
            <a
              href={fileUrl(preview.fileUrl)}
              download={preview.fileName || true}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3b5bdb]"
            >
              <Download size={16} />
              Download file
            </a>
          ) : null}
        </Modal>
      </div>
    </PageLayout>
  );
}

export default TeacherTools;
