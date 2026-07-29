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
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import ActionCard from "../components/ActionCard";
import DashboardPanel from "../components/DashboardPanel";
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
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      to: "/students",
      title: "Students",
      value: stats?.students ?? 0,
      icon: Users,
      accent: "from-sky-500 to-blue-600",
      hint: "Learners enrolled across the school",
    },
    {
      to: "/teachers",
      title: "Teachers",
      value: stats?.teachers ?? 0,
      icon: GraduationCap,
      accent: "from-emerald-500 to-teal-600",
      hint: "Active teaching staff",
    },
    {
      to: "/courses",
      title: "Courses",
      value: stats?.courses ?? 0,
      icon: BookOpen,
      accent: "from-indigo-500 to-violet-600",
      hint: "Subjects and class offerings",
    },
    {
      to: "/enrollments",
      title: "Enrollments",
      value: stats?.enrollments ?? 0,
      icon: Link2,
      accent: "from-cyan-500 to-indigo-500",
      hint: "Student–course connections",
    },
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Admin Dashboard"
      subtitle="Live overview of school operations and academic records"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => (
            <Link key={card.to} to={card.to} className="block h-full">
              <StatCard {...card} delay={index * 0.05} interactive />
            </Link>
          ))}
        </section>
      )}

      <DashboardPanel
        title="Quick actions"
        subtitle="Manage teachers, courses, enrollments, and academic resources from one place."
        delay={0.08}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            to="/add-teacher"
            icon={UserPlus}
            title="Add teacher"
            description="Register a new subject teacher"
            accent="from-emerald-500 to-teal-600"
          />
          <ActionCard
            to="/add-course"
            icon={BookOpen}
            title="Add course"
            description="Create a class and assign a teacher"
            accent="from-indigo-500 to-violet-600"
            delay={0.04}
          />
          <ActionCard
            to="/students"
            icon={Users}
            title="View students"
            description="Browse all learners in the system"
            accent="from-sky-500 to-blue-600"
            delay={0.08}
          />
          <ActionCard
            to="/enrollments"
            icon={Link2}
            title="Enrollments"
            description="Manage student course enrollments"
            accent="from-cyan-500 to-indigo-500"
            delay={0.12}
          />
          <ActionCard
            to="/password-resets"
            icon={KeyRound}
            title="Password resets"
            description="Approve teacher & student reset requests"
            accent="from-rose-500 to-pink-600"
            delay={0.2}
          />
          <ActionCard
            to="/assignments"
            icon={ClipboardList}
            title="Assignments"
            description="Review school-wide assignment activity"
            accent="from-amber-500 to-orange-500"
            delay={0.16}
          />
          <ActionCard
            to="/teacher-tools"
            icon={Library}
            title="Syllabus & dates"
            description="Manage syllabus and exam schedules"
            accent="from-rose-500 to-pink-600"
            delay={0.2}
          />
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="System status"
        subtitle="Platform health and record availability"
        delay={0.12}
        action={
          <Link to="/admin-attendance">
            <GradientButton variant="secondary">Open records</GradientButton>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="admin-status-card admin-status-card--health rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Health
                </p>
                <p className="font-display text-lg font-bold text-emerald-900">
                  {stats?.systemHealth || "Operational"}
                </p>
              </div>
            </div>
          </div>
          <div className="admin-status-card rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Attendance & marks
            </p>
            <p className="mt-1 text-sm text-slate-600">
              View, print, and export records from the admin sidebar.
            </p>
          </div>
          <div className="admin-status-card rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student management
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Students are added by subject teachers for their allotted courses.
            </p>
          </div>
        </div>
      </DashboardPanel>
    </PageLayout>
  );
}

export default AdminDashboard;
