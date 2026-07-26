import { useState, useEffect } from "react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import toast from "react-hot-toast";

function TeacherTools() {
  const [tab, setTab] = useState("syllabus");

  // Syllabus form
  const [syllabus, setSyllabus] = useState({ title: "", course: "", content: "" });

  // Datesheet form
  const [datesheet, setDatesheet] = useState({ title: "", course: "", entries: [] });
  const [entry, setEntry] = useState({ subject: "", date: "", time: "" });

  // Paper form
  const [paper, setPaper] = useState({ title: "", course: "", questions: [] });
  const [question, setQuestion] = useState({ q: "", marks: "" });

  const submitSyllabus = async (e) => {
    e.preventDefault();
    try {
      await API.post('/syllabus', syllabus);
      toast.success('Syllabus saved');
      setSyllabus({ title: '', course: '', content: '' });
      fetchResources();
    } catch (err) { toast.error('Save failed'); }
  };

  const addEntry = () => {
    if (!entry.subject) return;
    setDatesheet(s => ({ ...s, entries: [...s.entries, entry] }));
    setEntry({ subject: '', date: '', time: '' });
  };

  const submitDatesheet = async (e) => {
    e.preventDefault();
    try {
      await API.post('/datesheet', datesheet);
      toast.success('Datesheet saved');
      setDatesheet({ title: '', course: '', entries: [] });
      fetchResources();
    } catch (err) { toast.error('Save failed'); }
  };

  const addQuestion = () => {
    if (!question.q) return;
    setPaper(p => ({ ...p, questions: [...p.questions, { q: question.q, marks: Number(question.marks) || 0 }] }));
    setQuestion({ q: '', marks: '' });
  };

  const [syllabi, setSyllabi] = useState([]);
  const [datesheets, setDatesheets] = useState([]);
  const [papers, setPapers] = useState([]);

  const submitPaper = async (e) => {
    e.preventDefault();
    try {
      await API.post('/paper', paper);
      toast.success('Paper saved');
      setPaper({ title: '', course: '', questions: [] });
      fetchResources();
    } catch (err) { toast.error('Save failed'); }
  };

  const printItem = (title, html) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h1{color:#0f172a;}table{width:100%;border-collapse:collapse;margin-top:18px;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}th{background:#0f172a;color:#fff;}tr:nth-child(even){background:#f8fafc;}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  };

  const fetchResources = async () => {
    try {
      const [s, d, p] = await Promise.all([API.get('/syllabus'), API.get('/datesheet'), API.get('/paper')]);
      setSyllabi(s.data);
      setDatesheets(d.data);
      setPapers(p.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <PageLayout role="teacher" variant="teacher" title="Teacher Tools" subtitle="Create syllabus, datesheets, and papers">
            <div className="space-y-6">
              <div className="mb-2 flex flex-wrap gap-3">
                <button onClick={() => setTab('syllabus')} className={`rounded-2xl px-4 py-2 ${tab==='syllabus'?'bg-indigo-600 text-white':'glass-panel'}`}>Syllabus</button>
                <button onClick={() => setTab('datesheet')} className={`rounded-2xl px-4 py-2 ${tab==='datesheet'?'bg-indigo-600 text-white':'glass-panel'}`}>Datesheet</button>
                <button onClick={() => setTab('paper')} className={`rounded-2xl px-4 py-2 ${tab==='paper'?'bg-indigo-600 text-white':'glass-panel'}`}>Paper</button>
              </div>

              {tab === 'syllabus' && (
                <form onSubmit={submitSyllabus} className="glass-panel space-y-4 rounded-3xl p-6">
                  <h2 className="text-xl font-semibold">Create Syllabus</h2>
                  <input placeholder="Title" value={syllabus.title} onChange={(e)=>setSyllabus(s=>({...s,title:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />
                  <input placeholder="Course" value={syllabus.course} onChange={(e)=>setSyllabus(s=>({...s,course:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />
                  <textarea placeholder="Content" value={syllabus.content} onChange={(e)=>setSyllabus(s=>({...s,content:e.target.value}))} className="w-full rounded-2xl border px-4 py-3 h-40" />
                  <button type="submit" className="inline-flex justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white">Save Syllabus</button>
                </form>
              )}

              {tab === 'datesheet' && (
                <div className="glass-panel space-y-4 rounded-3xl p-6">
                  <h2 className="text-xl font-semibold">Create Datesheet</h2>
                  <input placeholder="Title" value={datesheet.title} onChange={(e)=>setDatesheet(s=>({...s,title:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />
                  <input placeholder="Course" value={datesheet.course} onChange={(e)=>setDatesheet(s=>({...s,course:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />

                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input placeholder="Subject" value={entry.subject} onChange={(e)=>setEntry({...entry,subject:e.target.value})} className="rounded-3xl border px-3 py-2 flex-1" />
                      <input placeholder="Date" value={entry.date} onChange={(e)=>setEntry({...entry,date:e.target.value})} className="rounded-3xl border px-3 py-2 w-36" />
                      <input placeholder="Time" value={entry.time} onChange={(e)=>setEntry({...entry,time:e.target.value})} className="rounded-3xl border px-3 py-2 w-36" />
                      <button type="button" onClick={addEntry} className="px-3 py-2 bg-sky-600 text-white rounded">Add</button>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {datesheet.entries.map((en, i)=>(
                        <li key={i} className="p-2 border rounded">{en.subject} — {en.date} {en.time}</li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      <button onClick={submitDatesheet} className="inline-flex justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white">Save Datesheet</button>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'paper' && (
                <div className="glass-panel space-y-4 rounded-3xl p-6">
                  <h2 className="text-xl font-semibold">Create Paper</h2>
                  <input placeholder="Title" value={paper.title} onChange={(e)=>setPaper(p=>({...p,title:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />
                  <input placeholder="Course" value={paper.course} onChange={(e)=>setPaper(p=>({...p,course:e.target.value}))} className="w-full rounded-3xl border px-4 py-3" required />

                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input placeholder="Question" value={question.q} onChange={(e)=>setQuestion(q=>({...q,q:e.target.value}))} className="rounded-3xl border px-3 py-2 flex-1" />
                      <input placeholder="Marks" value={question.marks} onChange={(e)=>setQuestion(q=>({...q,marks:e.target.value}))} className="rounded-3xl border px-3 py-2 w-24" />
                      <button type="button" onClick={addQuestion} className="px-3 py-2 bg-sky-600 text-white rounded">Add</button>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {paper.questions.map((qq, i)=>(
                        <li key={i} className="p-2 border rounded">{qq.q} — {qq.marks} marks</li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      <button onClick={submitPaper} className="inline-flex justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white">Save Paper</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-panel rounded-3xl p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Saved resources</h2>
                    <p className="text-slate-600">View and print your created syllabus, datesheets, and papers.</p>
                  </div>
                  <button onClick={fetchResources} className="rounded-3xl bg-sky-600 px-5 py-3 text-white shadow-lg hover:bg-sky-700">Refresh</button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-white/50 bg-white/50 p-4">
                    <h3 className="font-semibold text-slate-900">Syllabus</h3>
                    <p className="text-sm text-slate-600 mt-2">{syllabi.length} saved items</p>
                    <button onClick={() => printItem('Syllabus List', `<h1>Syllabus</h1><ul>${syllabi.map(item=>`<li><strong>${item.title}</strong> (${item.course})</li>`).join('')}</ul>`)} className="mt-4 inline-flex rounded-3xl bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800">Print List</button>
                  </div>

                  <div className="rounded-3xl border border-white/50 bg-white/50 p-4">
                    <h3 className="font-semibold text-slate-900">Datesheets</h3>
                    <p className="text-sm text-slate-600 mt-2">{datesheets.length} saved items</p>
                    <button onClick={() => printItem('Datesheet List', `<h1>Datesheets</h1><ul>${datesheets.map(item=>`<li><strong>${item.title}</strong> (${item.course})</li>`).join('')}</ul>`)} className="mt-4 inline-flex rounded-3xl bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800">Print List</button>
                  </div>

                  <div className="rounded-3xl border border-white/50 bg-white/50 p-4">
                    <h3 className="font-semibold text-slate-900">Papers</h3>
                    <p className="text-sm text-slate-600 mt-2">{papers.length} saved items</p>
                    <button onClick={() => printItem('Paper List', `<h1>Papers</h1><ul>${papers.map(item=>`<li><strong>${item.title}</strong> (${item.course})</li>`).join('')}</ul>`)} className="mt-4 inline-flex rounded-3xl bg-slate-950 px-4 py-2 text-sm text-white hover:bg-slate-800">Print List</button>
                  </div>
                </div>
              </div>

            </div>
    </PageLayout>
  );
}

export default TeacherTools;

