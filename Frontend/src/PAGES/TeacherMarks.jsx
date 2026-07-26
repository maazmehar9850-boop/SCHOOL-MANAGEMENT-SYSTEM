import { useEffect, useState } from "react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import toast from "react-hot-toast";

function TeacherMarks() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const teacher = localStorage.getItem("name") || "Teacher";

  const parseCsv = (csvText) => {
    const rows = csvText.trim().split(/\r?\n/);
    const headers = rows.shift().split(",").map((h) => h.trim());
    return rows.map((row) => {
      const values = row.split(",").map((value) => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || "";
        return obj;
      }, {});
    });
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = parseCsv(e.target.result);
      setGrades(csvData.map((item, index) => ({
        _id: item._id || `upload-${index}`,
        studentName: item.studentName || item.StudentName || item.Name || "",
        course: item.course || item.Course || "",
        subject: item.subject || item.Subject || "",
        score: Number(item.score || item.Score || 0),
      })));
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await API.get("/marks");
      setGrades(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateScore = (id, value) => {
    setGrades((items) =>
      items.map((item) =>
        item._id === id ? { ...item, score: Number(value) || 0 } : item
      )
    );
  };

  const saveGrades = async () => {
    try {
      await Promise.all(
        grades.map(async (item) => {
          const payload = {
            studentName: item.studentName,
            course: item.course,
            subject: item.subject,
            score: item.score,
            teacher,
          };
          if (item._id && !String(item._id).startsWith("upload-")) {
            await API.put(`/marks/${item._id}`, payload);
          } else {
            await API.post("/marks", payload);
          }
        })
      );
      toast.success("Marks saved successfully");
      fetchGrades();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save marks");
    }
  };

  const printGrades = () => {
    const html = `
      <html>
        <head>
          <title>Marks Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #0f172a; color: white; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Marks Report</h1>
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Subject</th><th>Score</th></tr>
            </thead>
            <tbody>
              ${grades.map((item) => `<tr><td>${item.studentName}</td><td>${item.course}</td><td>${item.subject}</td><td>${item.score}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const averageScore = grades.length ? Math.round(grades.reduce((sum, item) => sum + item.score, 0) / grades.length) : 0;

  return (
    <PageLayout role="teacher" variant="teacher" title="Marks" subtitle="Publish exam results and print reports">
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Marks</h1>
                    <p className="mt-2 text-slate-600">Publish exam results and print the final report for your class.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-3xl bg-sky-600 px-4 py-3 text-white shadow-lg">Teacher: {teacher}</span>
                    <button onClick={printGrades} className="rounded-3xl bg-slate-950 px-5 py-3 text-white hover:bg-slate-800">Print</button>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100">
                    Upload Marks CSV
                    <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
                  </label>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Upload a CSV with columns: <strong>studentName, course, subject, score</strong>. This will populate marks for save and print.
                  </p>
                </div>
              </div>

              <div className="glass-panel space-y-4 rounded-3xl p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Scoreboard</h2>
                    <p className="text-slate-600">Update scores live and publish final results.</p>
                  </div>
                  <div className="rounded-3xl bg-emerald-100 px-4 py-3 text-emerald-700">Avg Score: {averageScore}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-indigo-950/90 text-white">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading marks...</td></tr>
                      ) : grades.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No results found.</td></tr>
                      ) : (
                        grades.map((student) => (
                          <tr key={student._id} className="border-b border-white/40 last:border-b-0 hover:bg-white/50 transition">
                            <td className="px-6 py-4 font-medium text-slate-700">{student.studentName}</td>
                            <td className="px-6 py-4">{student.course}</td>
                            <td className="px-6 py-4">{student.subject}</td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={student.score}
                                onChange={(e) => updateScore(student._id, e.target.value)}
                                className="w-24 rounded-3xl border px-3 py-2"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button onClick={saveGrades} className="rounded-3xl bg-sky-600 px-5 py-3 text-white hover:bg-sky-700">Save All</button>
                </div>
              </div>
            </div>
    </PageLayout>
  );
}

export default TeacherMarks;
