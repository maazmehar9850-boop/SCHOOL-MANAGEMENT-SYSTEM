import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Award,
  Library,
  FileText,
  Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import ActionCard from "../components/ActionCard";
import DashboardPanel from "../components/DashboardPanel";
import { StatSkeleton } from "../components/Skeleton";
import { StudentDashboardCharts } from "../components/DashboardCharts";
import { cachedFetch, getCached } from "../utils/apiCache";

function StudentHome() {
  const cacheKey = "dashboard:stats:student";
  const [stats, setStats] = useState(() => getCached(cacheKey));
  const [loading, setLoading] = useState(!getCached(cacheKey));
  const name = localStorage.getItem("name") || "Student";

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await cachedFetch(cacheKey, async () => {
          const res = await API.get("/dashboard/stats");
          return res.data;
        }, 20000);
        if (!ignore) setStats(data);
      } catch {
        if (!ignore) toast.error("Failed to load student stats");
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
      to: "/student-attendance",
      title: "Attendance",
      value: `${stats?.attendancePercent ?? 0}%`,
      icon: CalendarCheck,
      accent: "from-emerald-400 to-teal-500",
      glow: "rgba(52, 211, 153, 0.4)",
      hint: "Your presence across courses",
    },
    {
      to: "/assignments",
      title: "Assignments",
      value: stats?.assignments ?? 0,
      icon: ClipboardList,
      accent: "from-cyan-400 to-blue-500",
      glow: "rgba(34, 211, 238, 0.4)",
      hint: "Tasks from your teachers",
    },
    {
      to: "/student-subjects",
      title: "Courses",
      value: stats?.enrolledCourses ?? 0,
      icon: BookOpen,
      accent: "from-amber-400 to-orange-500",
      glow: "rgba(251, 191, 36, 0.4)",
      hint: "Subjects you are enrolled in",
    },
    {
      to: "/student-results",
      title: "Average grade",
      value: `${stats?.marksAverage ?? 0} / ${stats?.grade ?? "—"}`,
      icon: Award,
      accent: "from-violet-400 to-fuchsia-500",
      glow: "rgba(168, 85, 247, 0.4)",
      hint: "Marks and performance summary",
    },
  ];

  return (
    <PageLayout
      role="student"
      variant="student"
      title={`Welcome, ${name}`}
      subtitle="Your Aspira College attendance, assignments, results, and resources"
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

      {!loading ? <StudentDashboardCharts stats={stats} /> : null}

      <DashboardPanel
        title="Learning hub"
        subtitle="Jump to your subjects, results, attendance, and downloadable resources."
        delay={0.08}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            to="/student-subjects"
            icon={BookOpen}
            title="My subjects"
            description="View enrolled courses and teachers"
            accent="from-amber-400 to-orange-500"
          />
          <ActionCard
            to="/student-results"
            icon={FileText}
            title="My results"
            description="Check marks, scores, and feedback"
            accent="from-violet-400 to-fuchsia-500"
            delay={0.04}
          />
          <ActionCard
            to="/student-attendance"
            icon={CalendarCheck}
            title="Attendance"
            description="See records marked by teachers"
            accent="from-emerald-400 to-teal-500"
            delay={0.08}
          />
          <ActionCard
            to="/student-fees"
            icon={Banknote}
            title="My fees"
            description="View pending and paid fees, download receipts"
            accent="from-cyan-400 to-teal-500"
            delay={0.1}
          />
          <ActionCard
            to="/resources"
            icon={Library}
            title="Resources"
            description="Syllabus, date sheets, grades & PDF export"
            accent="from-sky-400 to-blue-500"
            delay={0.12}
          />
        </div>
      </DashboardPanel>
    </PageLayout>
  );
}

export default StudentHome;
