import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Award,
  Library,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import ActionCard from "../components/ActionCard";
import DashboardPanel from "../components/DashboardPanel";
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

  const statCards = [
    {
      to: "/student-attendance",
      title: "Attendance",
      value: `${stats?.attendancePercent ?? 0}%`,
      icon: CalendarCheck,
      accent: "from-emerald-500 to-teal-600",
      hint: "Your presence across courses",
    },
    {
      to: "/assignments",
      title: "Assignments",
      value: stats?.assignments ?? 0,
      icon: ClipboardList,
      accent: "from-sky-500 to-blue-600",
      hint: "Tasks from your teachers",
    },
    {
      to: "/student-subjects",
      title: "Courses",
      value: stats?.enrolledCourses ?? 0,
      icon: BookOpen,
      accent: "from-amber-500 to-orange-500",
      hint: "Subjects you are enrolled in",
    },
    {
      to: "/student-results",
      title: "Average grade",
      value: `${stats?.marksAverage ?? 0} / ${stats?.grade ?? "—"}`,
      icon: Award,
      accent: "from-indigo-500 to-violet-600",
      hint: "Marks and performance summary",
    },
  ];

  return (
    <PageLayout
      role="student"
      variant="student"
      title={`Welcome, ${name}`}
      subtitle="Track attendance, assignments, results, and learning resources"
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
            accent="from-amber-500 to-orange-500"
          />
          <ActionCard
            to="/student-results"
            icon={FileText}
            title="My results"
            description="Check marks, scores, and feedback"
            accent="from-indigo-500 to-violet-600"
            delay={0.04}
          />
          <ActionCard
            to="/student-attendance"
            icon={CalendarCheck}
            title="Attendance"
            description="See records marked by teachers"
            accent="from-emerald-500 to-teal-600"
            delay={0.08}
          />
          <ActionCard
            to="/resources"
            icon={Library}
            title="Resources"
            description="Syllabus, date sheets, grades & PDF export"
            accent="from-sky-500 to-blue-600"
            delay={0.12}
          />
        </div>
      </DashboardPanel>
    </PageLayout>
  );
}

export default StudentHome;
