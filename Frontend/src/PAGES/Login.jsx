import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Lock, Mail, Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";
import API from "../api";
import { beginAuthenticatedSession } from "../utils/auth";
import { resetAuthRedirectState } from "../utils/notify";
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { BrandMark } from "../components/BrandLogo";

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [form, setForm] = useState({ email: "", Password: "" });

  useEffect(() => {
    resetAuthRedirectState();
  }, []);

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
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("userId", user._id);
      beginAuthenticatedSession();

      toast.success(`Welcome back, ${user.name || "user"}!`);
      resetAuthRedirectState();

      window.setTimeout(() => {
        if (user.role === "admin") navigate("/admin-dashboard");
        else if (user.role === "teacher") navigate("/teacher-dashboard");
        else if (user.role === "student") navigate("/student-home");
        else toast.error("Invalid user role");
      }, 450);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background variant="login">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        {/* Ambient floating orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[8%] top-[18%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-[12%] right-[10%] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -14, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease }}
          className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_40px_100px_rgba(0,0,0,0.35)] md:grid-cols-2"
        >
          {/* Left brand panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1e3a8a]/90 via-[#1e40af]/75 to-[#0e7490]/85 p-10 text-white md:flex md:flex-col md:justify-between">
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute -right-16 top-1/3 h-48 w-48 rounded-full border border-white/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              aria-hidden
              className="absolute -right-8 top-1/3 h-32 w-32 rounded-full border border-cyan-300/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="relative"
            >
              <motion.div
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur"
                animate={{ boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 24px rgba(34,211,238,0.25)", "0 0 0 rgba(255,255,255,0)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles size={13} />
                </motion.span>
                Education OS
              </motion.div>
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
                <span className="mb-3 inline-flex">
                  <BrandMark size={48} className="shadow-lg shadow-cyan-500/30" />
                </span>
                <span className="mt-3 block">SchoolMS</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
                A calm, modern workspace for admins, teachers, and students —
                attendance, results, and courses in one place.
              </p>

              <div className="mt-8 space-y-3">
                {["Role-based dashboards", "Live attendance & marks", "Secure JWT access"].map(
                  (text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.12, duration: 0.5, ease }}
                      className="flex items-center gap-2.5 text-sm text-white/75"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                      {text}
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative text-xs text-white/50"
            >
              Secure JWT · Role-based access
            </motion.p>
          </div>

          {/* Form panel */}
          <GlassCard className="rounded-none border-0 p-8 md:p-10" hover={false}>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mb-8"
            >
              <motion.div variants={item}>
                <Link
                  to="/"
                  className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                >
                  <ArrowLeft size={14} />
                  Back to home
                </Link>
              </motion.div>

              <motion.div
                variants={item}
                className="flex flex-col items-start"
              >
                <motion.div
                  className="mb-4 md:hidden"
                  whileHover={{ scale: 1.06, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                >
                  <BrandMark size={48} className="shadow-lg shadow-cyan-500/25" />
                </motion.div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
                <p className="mt-1.5 text-sm text-slate-500">Sign in to continue to your workspace</p>
              </motion.div>
            </motion.div>

            <motion.form
              onSubmit={loginUser}
              className="space-y-5"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.label variants={item} className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Email
                </span>
                <motion.div
                  className="input-field-wrap"
                  animate={
                    focused === "email"
                      ? { scale: 1.01 }
                      : { scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <Mail className="input-icon-left" size={18} strokeWidth={2} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="input-glass"
                    placeholder="you@school.com"
                    autoComplete="email"
                    required
                  />
                </motion.div>
              </motion.label>

              <motion.label variants={item} className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Password
                </span>
                <motion.div
                  className="input-field-wrap has-toggle"
                  animate={
                    focused === "password"
                      ? { scale: 1.01 }
                      : { scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <Lock className="input-icon-left" size={18} strokeWidth={2} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="Password"
                    value={form.Password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className="input-glass"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle password-toggle--accent"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                </motion.div>
              </motion.label>

              <motion.div variants={item} className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <GradientButton type="submit" className="mt-1 w-full !py-3" disabled={loading}>
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="inline-flex items-center gap-2"
                        >
                          <motion.span
                            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Signing in...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                        >
                          Sign in
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </GradientButton>
                </motion.div>
              </motion.div>
            </motion.form>
          </GlassCard>
        </motion.div>
      </div>
    </Background>
  );
}

export default Login;
