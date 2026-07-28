import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import GradientButton from "./GradientButton";
import { logout as signOut } from "../utils/auth";

function ModernNavbar({ role, title, subtitle }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";

  const defaults = {
    admin: {
      title: "Admin Dashboard",
      subtitle: "Manage students, teachers, and courses",
    },
    teacher: {
      title: "Teacher Dashboard",
      subtitle: "Attendance, marks, and your classes",
    },
    student: {
      title: "Student Dashboard",
      subtitle: "Track attendance, results, and subjects",
    },
  };

  const meta = defaults[role] || {};

  const logout = () => signOut(navigate);

  return (
    <header className="glass-nav sticky top-0 z-20 mx-3 mt-3 rounded-[1.25rem] px-5 py-3.5 md:mx-5 md:mt-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 pl-10 md:pl-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3b5bdb]">
            {name}
          </p>
          <h1 className="font-display mt-0.5 truncate text-xl font-bold text-slate-900 md:text-2xl">
            {title || meta.title}
          </h1>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {subtitle || meta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            className="hidden rounded-xl border border-white/50 bg-white/55 p-2.5 text-slate-500 transition hover:bg-white/90 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3b5bdb] to-[#22b8cf] text-xs font-bold text-white shadow-md transition hover:scale-105 sm:flex"
            title="Open profile"
            aria-label="Open profile"
          >
            {name.charAt(0).toUpperCase()}
          </button>
          <GradientButton variant="secondary" onClick={logout} className="!py-2 !px-4">
            <LogOut size={15} />
            Logout
          </GradientButton>
        </div>
      </div>
    </header>
  );
}

export default ModernNavbar;
