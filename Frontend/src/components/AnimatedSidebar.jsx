import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  ClipboardList,
  FileText,
  User,
  CalendarCheck,
  Library,
  LogOut,
  Wrench,
  Menu,
  X,
  Link2,
  KeyRound,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./BrandLogo";
import { logout as signOut } from "../utils/auth";

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[13px] font-medium tracking-tight transition-colors duration-150 ${
    isActive
      ? "bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(14,165,233,0.82))] text-white shadow-[0_14px_32px_rgba(37,99,235,0.28)] ring-1 ring-white/10"
      : "text-slate-300 hover:bg-white/[0.06] hover:text-white hover:ring-1 hover:ring-white/8"
  }`;

function AnimatedSidebar({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => signOut(navigate);

  const adminLinks = [
    { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/teachers", label: "Teachers", icon: GraduationCap },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/fees", label: "Fees", icon: Banknote },
    { to: "/enrollments", label: "Enrollments", icon: Link2 },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/teacher-tools", label: "Syllabus & Dates", icon: Library },
    { to: "/admin-attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/admin-marks", label: "Marks / Results", icon: ClipboardList },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/add-teacher", label: "Add Teacher", icon: UserPlus },
    { to: "/add-course", label: "Add Course", icon: BookOpen },
    { to: "/password-resets", label: "Password Resets", icon: KeyRound },
    { to: "/profile", label: "My Profile", icon: User },
  ];

  const teacherLinks = [
    { to: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/my-students", label: "My Students", icon: Users },
    { to: "/add-student", label: "Add Student", icon: UserPlus },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/marks", label: "Marks", icon: ClipboardList },
    { to: "/assignments", label: "Assignments", icon: FileText },
    { to: "/teacher-tools", label: "Teacher Tools", icon: Wrench },
    { to: "/resources", label: "Resources", icon: Library },
    { to: "/profile", label: "My Profile", icon: User },
  ];

  const studentLinks = [
    { to: "/student-home", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/student-fees", label: "My Fees", icon: Banknote },
    { to: "/student-attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/student-results", label: "Results", icon: FileText },
    { to: "/student-subjects", label: "Subjects", icon: BookOpen },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/resources", label: "Resources", icon: Library },
  ];

  const links =
    role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const Nav = (
    <aside className="app-sidebar glass-panel-dark relative flex h-full w-[17.5rem] flex-col overflow-hidden px-4 py-6 text-white md:m-3 md:h-[calc(100vh-1.5rem)] md:rounded-[1.6rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.22),transparent_72%)]" />
      <div className="mb-7 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <BrandMark size={40} className="shrink-0 shadow-lg shadow-cyan-500/20" />
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-white">SchoolMS</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/80">
              {role} workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
            <Icon size={17} strokeWidth={2} className="opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-[13px] font-medium text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-xl border border-white/15 bg-slate-950/60 p-2 text-white md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden shrink-0 md:block">{Nav}</div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/65"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full p-2">
            <button
              type="button"
              className="absolute right-4 top-5 z-10 rounded-lg bg-white/10 p-1.5"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
            {Nav}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AnimatedSidebar;
