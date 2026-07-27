import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  UserPlus,
  Wrench,
  Award,
  Library,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import ActionCard from "../components/ActionCard";
import DashboardPanel from "../components/DashboardPanel";
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

  const statCards = [
    {
      to: "/my-students",
      title: "Assigned students",
      value: stats?.assignedStudents ?? 0,
      icon: Users,
      accent: "from-sky-500 to-blue-600",
      hint: "Learners in your courses",
    },
    {
      to: "/attendance",
      title: "Attendance rate",
      value: `${stats?.attendanceRate ?? 0}%`,
      icon: CalendarCheck,
      accent: "from-emerald-500 to-teal-600",
      hint: "Present across your classes",
    },
    {
      to: "/assignments",
      title: "Assignments",
      value: stats?.assignments ?? 0,
      icon: BookOpen,
      accent: "from-amber-500 to-orange-500",
      hint: "Active class work",
    },
    {
      to: "/assignments",
      title: "Pending reviews",
      value: stats?.pendingSubmissions ?? 0,
      icon: ClipboardList,
      accent: "from-indigo-500 to-violet-600",
      hint: "Submissions awaiting grading",
    },
  ];

  return (
    <PageLayout
      role="teacher"
      variant="teacher"
      title={`Welcome, ${name}`}
      subtitle="Your classes, attendance, marks, and teaching tools in one workspace"
    >
      {loading ? (
        <StatSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => (
            <Link key={`${card.to}-${card.title}`} to={card.to} className="block h-full">
              <StatCard {...card} delay={index * 0.05} interactive />
            </Link>
          ))}
        </section>
      )}

      <DashboardPanel
        title="Teaching shortcuts"
        subtitle="Daily tasks for your allotted subjects — attendance, marks, and resources."
        delay={0.08}
        action={
          <Link to="/teacher-tools">
            <GradientButton variant="secondary" className="!gap-2">
              <Wrench size={16} />
              Teacher tools
            </GradientButton>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            to="/attendance"
            icon={CalendarCheck}
            title="Mark attendance"
            description="Record present or absent for enrolled students"
            accent="from-emerald-500 to-teal-600"
          />
          <ActionCard
            to="/marks"
            icon={Award}
            title="Enter marks"
            description="Save scores for your allotted subject only"
            accent="from-indigo-500 to-violet-600"
            delay={0.04}
          />
          <ActionCard
            to="/assignments"
            icon={ClipboardList}
            title="Assignments"
            description="Create work and review submissions"
            accent="from-amber-500 to-orange-500"
            delay={0.08}
          />
          <ActionCard
            to="/my-students"
            icon={Users}
            title="My students"
            description="View learners enrolled in your courses"
            accent="from-sky-500 to-blue-600"
            delay={0.12}
          />
          <ActionCard
            to="/add-student"
            icon={UserPlus}
            title="Add student"
            description="Enroll a learner in your subject"
            accent="from-cyan-500 to-indigo-500"
            delay={0.16}
          />
          <ActionCard
            to="/resources"
            icon={Library}
            title="Resources"
            description="Syllabus, date sheets, attendance & grades"
            accent="from-rose-500 to-pink-600"
            delay={0.2}
          />
        </div>
      </DashboardPanel>
    </PageLayout>
  );
}

export default TeacherDashboard;
