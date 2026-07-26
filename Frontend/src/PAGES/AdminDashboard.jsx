import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, BookOpen, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { StatSkeleton } from "../components/Skeleton";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Admin Dashboard"
      subtitle="Live overview of your school operations"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/students">
            <StatCard
              title="Students"
              value={stats?.students ?? 0}
              icon={Users}
              accent="from-sky-500 to-blue-600"
            />
          </Link>
          <Link to="/teachers">
            <StatCard
              title="Teachers"
              value={stats?.teachers ?? 0}
              icon={GraduationCap}
              accent="from-emerald-500 to-teal-600"
              delay={0.05}
            />
          </Link>
          <Link to="/courses">
            <StatCard
              title="Courses"
              value={stats?.courses ?? 0}
              icon={BookOpen}
              accent="from-indigo-500 to-violet-600"
              delay={0.1}
            />
          </Link>
          <Link to="/enrollments">
            <StatCard
              title="Enrollments"
              value={stats?.enrollments ?? 0}
              icon={Link2}
              accent="from-cyan-500 to-indigo-500"
              delay={0.15}
            />
          </Link>
        </section>
      )}

      <GlassCard className="p-6 md:p-8" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quick actions</h2>
            <p className="mt-1 text-slate-600">Create users, courses, and enrollments.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/add-student">
              <GradientButton>Add student</GradientButton>
            </Link>
            <Link to="/add-teacher">
              <GradientButton variant="secondary">Add teacher</GradientButton>
            </Link>
            <Link to="/add-course">
              <GradientButton variant="secondary">Add course</GradientButton>
            </Link>
            <Link to="/enrollments">
              <GradientButton variant="secondary">Enrollments</GradientButton>
            </Link>
            <Link to="/assignments">
              <GradientButton variant="secondary">Assignments</GradientButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hover={false} delay={0.1}>
        <h2 className="text-xl font-bold text-slate-900">System status</h2>
        <p className="mt-2 text-slate-600">
          Health: <span className="font-semibold text-emerald-600">{stats?.systemHealth || "—"}</span>
        </p>
      </GlassCard>
    </PageLayout>
  );
}

export default AdminDashboard;
