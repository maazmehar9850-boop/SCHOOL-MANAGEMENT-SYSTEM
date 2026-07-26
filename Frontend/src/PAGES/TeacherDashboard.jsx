import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarCheck, BookOpen, Layers } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { StatSkeleton } from "../components/Skeleton";

function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem("name") || "Teacher";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch {
        toast.error("Failed to load teacher stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title={`Welcome, ${name}`}
      subtitle="Your assigned classes and student activity"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned students"
            value={stats?.assignedStudents ?? 0}
            icon={Users}
            accent="from-sky-500 to-blue-600"
          />
          <StatCard
            title="Attendance %"
            value={`${stats?.attendanceRate ?? 0}%`}
            icon={CalendarCheck}
            accent="from-emerald-500 to-teal-600"
            delay={0.05}
          />
          <StatCard
            title="Subjects"
            value={stats?.subjects ?? 0}
            icon={BookOpen}
            accent="from-amber-500 to-orange-500"
            delay={0.1}
          />
          <StatCard
            title="Classes"
            value={stats?.classes ?? 0}
            icon={Layers}
            accent="from-indigo-500 to-violet-600"
            delay={0.15}
          />
        </section>
      )}

      <GlassCard className="p-6 md:p-8" hover={false}>
        <h2 className="text-xl font-bold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link to="/attendance" className="block">
            <div className="rounded-2xl border border-white/50 bg-white/50 p-4 transition hover:bg-white/80">
              <h3 className="font-semibold text-slate-900">Mark attendance</h3>
              <p className="mt-1 text-sm text-slate-600">Record present / absent</p>
            </div>
          </Link>
          <Link to="/marks" className="block">
            <div className="rounded-2xl border border-white/50 bg-white/50 p-4 transition hover:bg-white/80">
              <h3 className="font-semibold text-slate-900">Enter marks</h3>
              <p className="mt-1 text-sm text-slate-600">Update student scores</p>
            </div>
          </Link>
          <Link to="/my-students" className="block">
            <div className="rounded-2xl border border-white/50 bg-white/50 p-4 transition hover:bg-white/80">
              <h3 className="font-semibold text-slate-900">My students</h3>
              <p className="mt-1 text-sm text-slate-600">View assigned learners</p>
            </div>
          </Link>
        </div>
        <div className="mt-5">
          <Link to="/teacher-tools">
            <GradientButton variant="secondary">Open teacher tools</GradientButton>
          </Link>
        </div>
      </GlassCard>
    </PageLayout>
  );
}

export default TeacherDashboard;
