import { useEffect, useState } from "react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import toast from "react-hot-toast";

function TeacherAttendance() {
  const [attendance, setAttendance] = useState([]);
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
      setAttendance(csvData.map((item, index) => ({
        _id: item._id || `upload-${index}`,
        studentName: item.studentName || item.StudentName || item.Name || "",
        course: item.course || item.Course || "",
        date: item.date || item.Date || "",
        status: item.status || item.Status || "Present",
      })));
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (id) => {
    setAttendance((items) =>
      items.map((item) =>
        item._id === id
          ? { ...item, status: item.status === "Present" ? "Absent" : "Present" }
          : item
      )
    );
  };

  const saveAttendance = async () => {
    try {
      await Promise.all(
        attendance.map(async (item) => {
          const payload = {
            studentName: item.studentName,
            course: item.course,
            date: item.date,
            status: item.status,
            teacher,
          };
          if (item._id && !String(item._id).startsWith("upload-")) {
            await API.put(`/attendance/${item._id}`, payload);
          } else {
            await API.post("/attendance", payload);
          }
        })
      );
      toast.success("Attendance updated successfully");
      fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save attendance");
    }
  };

  const printAttendance = () => {
    const html = `
      <html>
        <head>
          <title>Attendance Report</title>
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
          <h1>Attendance Report</h1>
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${attendance.map((item) => `<tr><td>${item.studentName}</td><td>${item.course}</td><td>${item.date}</td><td>${item.status}</td></tr>`).join('')}
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

  return (
    <PageLayout role="teacher" variant="teacher" title="Attendance" subtitle="Record and print class attendance">
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Attendance</h1>
                    <p className="mt-2 text-slate-600">Record and print class attendance in one place.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-3xl bg-sky-600 px-4 py-3 text-white shadow-lg">Teacher: {teacher}</span>
                    <button onClick={printAttendance} className="rounded-3xl bg-slate-950 px-5 py-3 text-white hover:bg-slate-800">Print</button>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100">
                    Upload CSV
                    <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
                  </label>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Upload a CSV with columns: <strong>studentName, course, date, status</strong>. The sheet will populate the attendance table for save and print.
                  </p>
                </div>
              </div>

              <div className="glass-panel space-y-4 rounded-3xl p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Attendance Register</h2>
                  <button onClick={saveAttendance} className="rounded-3xl bg-sky-600 px-5 py-3 text-white hover:bg-sky-700">Save Changes</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-indigo-950/90 text-white">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading attendance...</td></tr>
                      ) : attendance.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No attendance records available.</td></tr>
                      ) : (
                        attendance.map((record) => (
                          <tr key={record._id} className="border-b border-white/40 last:border-b-0 hover:bg-white/50 transition">
                            <td className="px-6 py-4 font-medium text-slate-700">{record.studentName}</td>
                            <td className="px-6 py-4">{record.course}</td>
                            <td className="px-6 py-4">{record.date}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${record.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => toggleAttendance(record._id)} className="rounded-3xl bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800">Toggle</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
    </PageLayout>
  );
}

export default TeacherAttendance;
