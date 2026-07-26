import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { GraduationCap, Lock, Mail, Sparkles, Eye, EyeOff } from "lucide-react";
import API from "../api";
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", Password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/login", form);
      const user = res.data.User;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name || user.email);
      localStorage.setItem("userId", user._id);

      toast.success(`Welcome back, ${user.name || "user"}!`);

      if (user.role === "admin") navigate("/admin-dashboard");
      else if (user.role === "teacher") navigate("/teacher-dashboard");
      else if (user.role === "student") navigate("/student-home");
      else toast.error("Invalid user role");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background variant="login">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_40px_100px_rgba(0,0,0,0.35)] md:grid-cols-2"
        >
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1e3a8a]/90 via-[#1e40af]/75 to-[#0e7490]/85 p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles size={13} />
                Education OS
              </div>
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
                SchoolMS
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
                A calm, modern workspace for admins, teachers, and students —
                attendance, results, and courses in one place.
              </p>
            </div>
            <p className="relative text-xs text-white/50">Secure JWT · Role-based access</p>
          </div>

          <GlassCard className="rounded-none border-0 p-8 md:p-10" hover={false}>
            <div className="mb-8 flex flex-col items-start">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b5bdb] to-[#22b8cf] text-white shadow-lg md:hidden">
                <GraduationCap size={24} />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-1.5 text-sm text-slate-500">Sign in to continue to your workspace</p>
            </div>

            <form onSubmit={loginUser} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Email
                </span>
                <div className="input-field-wrap">
                  <Mail className="input-icon-left" size={18} strokeWidth={2} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-glass"
                    placeholder="you@school.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Password
                </span>
                <div className="input-field-wrap has-toggle">
                  <Lock className="input-icon-left" size={18} strokeWidth={2} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="Password"
                    value={form.Password}
                    onChange={handleChange}
                    className="input-glass"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </label>

              <GradientButton type="submit" className="mt-1 w-full !py-3" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </GradientButton>
            </form>

            <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5 text-[11px] leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-700">Demo access</p>
              <p className="mt-1">admin@gmail.com · teacher@gmail.com · student@gmail.com</p>
              <p>Password: 123456</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </Background>
  );
}

export default Login;
