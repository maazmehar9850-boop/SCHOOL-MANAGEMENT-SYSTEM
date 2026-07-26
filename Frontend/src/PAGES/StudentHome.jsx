import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, BookOpen, ClipboardList, Award } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import { StatSkeleton } from "../components/Skeleton";

function StudentHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem("name") || "Student";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch {
        toast.error("Failed to load student stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageLayout
      role="student"
      variant="student"
      title={`Welcome, ${name}`}
      subtitle="Your learning progress at a glance"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Attendance"
            value={`${stats?.attendancePercent ?? 0}%`}
            icon={CalendarCheck}
            accent="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Assignments"
            value={stats?.assignments ?? 0}
            icon={ClipboardList}
            accent="from-sky-500 to-blue-600"
            delay={0.05}
          />
          <StatCard
            title="Courses"
            value={stats?.enrolledCourses ?? 0}
            icon={BookOpen}
            accent="from-amber-500 to-orange-500"
            delay={0.1}
          />
          <StatCard
            title="Avg / Grade"
            value={`${stats?.marksAverage ?? 0} / ${stats?.grade ?? "—"}`}
            icon={Award}
            accent="from-indigo-500 to-violet-600"
            delay={0.15}
          />
        </section>
      )}

      <GlassCard className="p-6 md:p-8" hover={false}>
        <h2 className="text-xl font-bold text-slate-900">Quick overview</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link to="/student-subjects" className="rounded-2xl border border-white/50 bg-white/50 p-4 hover:bg-white/80">
            <h3 className="font-semibold text-slate-900">My subjects</h3>
            <p className="mt-1 text-sm text-slate-600">View enrolled courses</p>
          </Link>
          <Link to="/student-results" className="rounded-2xl border border-white/50 bg-white/50 p-4 hover:bg-white/80">
            <h3 className="font-semibold text-slate-900">My results</h3>
            <p className="mt-1 text-sm text-slate-600">Check grades and scores</p>
          </Link>
          <Link to="/student-attendance" className="rounded-2xl border border-white/50 bg-white/50 p-4 hover:bg-white/80">
            <h3 className="font-semibold text-slate-900">Attendance</h3>
            <p className="mt-1 text-sm text-slate-600">See daily records</p>
          </Link>
        </div>
      </GlassCard>
    </PageLayout>
  );
}

export default StudentHome;
