import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useState } from "react";

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight transition-all ${
    isActive
      ? "bg-gradient-to-r from-[#3b5bdb]/95 to-[#22b8cf]/85 text-white shadow-[0_10px_24px_rgba(59,91,219,0.28)]"
      : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
  }`;

function AnimatedSidebar({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const adminLinks = [
    { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/teachers", label: "Teachers", icon: GraduationCap },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/enrollments", label: "Enrollments", icon: Link2 },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/add-student", label: "Add Student", icon: UserPlus },
    { to: "/add-teacher", label: "Add Teacher", icon: UserPlus },
    { to: "/add-course", label: "Add Course", icon: BookOpen },
  ];

  const teacherLinks = [
    { to: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/my-students", label: "My Students", icon: Users },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/marks", label: "Marks", icon: ClipboardList },
    { to: "/assignments", label: "Assignments", icon: FileText },
    { to: "/teacher-tools", label: "Teacher Tools", icon: Wrench },
    { to: "/resources", label: "Resources", icon: Library },
    { to: "/teacher-profile", label: "My Profile", icon: User },
  ];

  const studentLinks = [
    { to: "/student-home", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student-profile", label: "My Profile", icon: User },
    { to: "/student-attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/student-results", label: "Results", icon: FileText },
    { to: "/student-subjects", label: "Subjects", icon: BookOpen },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/resources", label: "Resources", icon: Library },
  ];

  const links =
    role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const Nav = (
    <aside className="glass-panel-dark flex h-full w-[17.5rem] flex-col px-4 py-6 text-white md:m-3 md:h-[calc(100vh-1.5rem)] md:rounded-[1.35rem]">
      <div className="mb-7 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b5bdb] to-[#22b8cf] text-sm font-bold shadow-lg shadow-cyan-500/20">
            SM
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">SchoolMS</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
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
        className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-rose-300/90 transition hover:bg-rose-500/15 hover:text-rose-200"
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
        className="fixed left-4 top-4 z-40 rounded-xl border border-white/15 bg-slate-950/60 p-2 text-white backdrop-blur-md md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden shrink-0 md:block">{Nav}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full p-2"
            >
              <button
                type="button"
                className="absolute right-4 top-5 z-10 rounded-lg bg-white/10 p-1.5"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
              {Nav}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnimatedSidebar;
