import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  Link2,
  UserPlus,
  ClipboardList,
  Library,
  Activity,
  KeyRound,
  Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import ActionCard from "../components/ActionCard";
import DashboardPanel from "../components/DashboardPanel";
import GradientButton from "../components/GradientButton";
import { StatSkeleton } from "../components/Skeleton";
import { AdminDashboardCharts } from "../components/DashboardCharts";
import { cachedFetch, getCached } from "../utils/apiCache";

function AdminDashboard() {
  const cacheKey = "dashboard:stats:admin";
  const [stats, setStats] = useState(() => getCached(cacheKey));
  const [loading, setLoading] = useState(!getCached(cacheKey));

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await cachedFetch(
          cacheKey,
          async () => {
            const res = await API.get("/dashboard/stats");
            return res.data;
          },
          20000
        );
        if (!ignore) setStats(data);
      } catch {
        if (!ignore) toast.error("Failed to load dashboard stats");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const statCards = [
    {
      to: "/students",
      title: "Students",
      value: stats?.students ?? 0,
      icon: Users,
      accent: "from-cyan-400 to-blue-500",
      glow: "rgba(34, 211, 238, 0.4)",
      hint: "Learners enrolled at Aspira College",
    },
    {
      to: "/teachers",
      title: "Teachers",
      value: stats?.teachers ?? 0,
      icon: GraduationCap,
      accent: "from-emerald-400 to-teal-500",
      glow: "rgba(52, 211, 153, 0.4)",
      hint: "Active teaching staff",
    },
    {
      to: "/courses",
      title: "Courses",
      value: stats?.courses ?? 0,
      icon: BookOpen,
      accent: "from-violet-400 to-fuchsia-500",
      glow: "rgba(168, 85, 247, 0.4)",
      hint: "Subjects and class offerings",
    },
    {
      to: "/enrollments",
      title: "Enrollments",
      value: stats?.enrollments ?? 0,
      icon: Link2,
      accent: "from-sky-400 to-indigo-500",
      glow: "rgba(56, 189, 248, 0.4)",
      hint: "Student–course connections",
    },
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Admin Dashboard"
      subtitle="Aspira College campus operations and academic overview"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <Link key={card.to} to={card.to} className="block h-full">
              <StatCard {...card} interactive />
            </Link>
          ))}
        </section>
      )}

      {!loading ? <AdminDashboardCharts stats={stats} /> : null}

      <DashboardPanel
        title="Quick actions"
        subtitle="Manage teachers, courses, enrollments, and academic resources from one place."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            to="/add-teacher"
            icon={UserPlus}
            title="Add teacher"
            description="Register a new subject teacher"
            accent="from-emerald-400 to-teal-500"
          />
          <ActionCard
            to="/add-course"
            icon={BookOpen}
            title="Add course"
            description="Create a class and assign a teacher"
            accent="from-violet-400 to-fuchsia-500"
          />
          <ActionCard
            to="/students"
            icon={Users}
            title="View students"
            description="Browse all learners in the system"
            accent="from-cyan-400 to-blue-500"
          />
          <ActionCard
            to="/fees"
            icon={Banknote}
            title="Student fees"
            description="Collect fees, view pending/paid, download receipts"
            accent="from-sky-400 to-indigo-500"
          />
          <ActionCard
            to="/enrollments"
            icon={Link2}
            title="Enrollments"
            description="Manage student course enrollments"
            accent="from-blue-400 to-indigo-500"
          />
          <ActionCard
            to="/password-resets"
            icon={KeyRound}
            title="Password resets"
            description="Approve teacher & student reset requests"
            accent="from-rose-400 to-pink-500"
          />
          <ActionCard
            to="/assignments"
            icon={ClipboardList}
            title="Assignments"
            description="Review school-wide assignment activity"
            accent="from-amber-400 to-orange-500"
          />
          <ActionCard
            to="/teacher-tools"
            icon={Library}
            title="Syllabus & dates"
            description="Manage syllabus and exam schedules"
            accent="from-fuchsia-400 to-pink-500"
          />
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Campus status"
        subtitle="Aspira College records and daily operations"
        action={
          <Link to="/admin-attendance">
            <GradientButton variant="secondary">Open records</GradientButton>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="admin-status-card admin-status-card--health rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                style={{ boxShadow: "0 0 18px rgba(52, 211, 153, 0.45)" }}
              >
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Health
                </p>
                <p className="font-display text-lg font-bold text-white">
                  {stats?.systemHealth || "Operational"}
                </p>
              </div>
            </div>
          </div>
          <div className="admin-status-card rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attendance & marks
            </p>
            <p className="mt-1 text-sm text-slate-400">
              View, print, and export records from the admin sidebar.
            </p>
          </div>
          <div className="admin-status-card rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Student management
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Students are added by subject teachers for their allotted courses.
            </p>
          </div>
        </div>
      </DashboardPanel>
    </PageLayout>
  );
}

export default AdminDashboard;
