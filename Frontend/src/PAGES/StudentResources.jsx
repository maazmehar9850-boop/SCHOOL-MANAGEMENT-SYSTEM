import { useEffect, useState } from "react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import toast from "react-hot-toast";

function StudentResources() {
  const [syllabi, setSyllabi] = useState([]);
  const [datesheets, setDatesheets] = useState([]);
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [s, d, p] = await Promise.all([
        API.get("/syllabus"),
        API.get("/datesheet"),
        API.get("/paper"),
      ]);
      setSyllabi(s.data);
      setDatesheets(d.data);
      setPapers(p.data);
    } catch {
      toast.error("Failed to load resources");
    }
  };

  const printItem = (title, html) => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${title}</title></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <PageLayout
      role="student"
      variant="courses"
      title="Resources"
      subtitle="Syllabus, datesheets, and exam papers"
    >
      <GlassCard className="p-6" hover={false}>
        <h3 className="mb-4 text-lg font-semibold">Syllabi</h3>
        <ul className="space-y-3">
          {syllabi.map((s) => (
            <li key={s._id} className="flex items-start justify-between rounded-2xl border border-white/50 bg-white/50 p-3">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-slate-600">
                  {s.course} — by {s.teacher}
                </div>
              </div>
              <button
                onClick={() => printItem(s.title, `<h1>${s.title}</h1><pre>${s.content}</pre>`)}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                Print
              </button>
            </li>
          ))}
          {syllabi.length === 0 && <p className="text-slate-500">No syllabi yet.</p>}
        </ul>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        <h3 className="mb-4 text-lg font-semibold">Datesheets</h3>
        {datesheets.map((d) => (
          <div key={d._id} className="mb-4 rounded-2xl border border-white/50 bg-white/50 p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{d.title}</div>
                <div className="text-sm text-slate-600">
                  {d.course} — by {d.teacher}
                </div>
              </div>
              <button
                onClick={() =>
                  printItem(
                    d.title,
                    `<h1>${d.title}</h1><ul>${(d.entries || [])
                      .map((e) => `<li>${e.subject} - ${e.date} ${e.time}</li>`)
                      .join("")}</ul>`
                  )
                }
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                Print
              </button>
            </div>
          </div>
        ))}
        {datesheets.length === 0 && <p className="text-slate-500">No datesheets yet.</p>}
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        <h3 className="mb-4 text-lg font-semibold">Papers</h3>
        {papers.map((p) => (
          <div key={p._id} className="mb-4 rounded-2xl border border-white/50 bg-white/50 p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-slate-600">
                  {p.course} — by {p.teacher}
                </div>
              </div>
              <button
                onClick={() =>
                  printItem(
                    p.title,
                    `<h1>${p.title}</h1><ol>${(p.questions || [])
                      .map((q) => `<li>${q.q} — ${q.marks} marks</li>`)
                      .join("")}</ol>`
                  )
                }
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white"
              >
                Print
              </button>
            </div>
          </div>
        ))}
        {papers.length === 0 && <p className="text-slate-500">No papers yet.</p>}
      </GlassCard>
    </PageLayout>
  );
}

export default StudentResources;
