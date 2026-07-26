import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { GraduationCap, Lock, Mail, User } from "lucide-react";
import API from "../api";
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import FormField from "../components/FormField";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    Password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/signup", form);
      const user = res.data.User;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name || user.email);
      localStorage.setItem("userId", user._id);

      toast.success("Account created successfully!");

      if (user.role === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background variant="login">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <GlassCard className="w-full max-w-md p-8" hover={false}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 flex flex-col items-center text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-400 text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create account
            </h1>
            <p className="mt-2 text-slate-600">Join SchoolMS as a student or teacher</p>
          </motion.div>

          <form onSubmit={registerUser} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-[2.65rem] h-4 w-4 text-slate-400" />
              <FormField
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-[2.65rem] h-4 w-4 text-slate-400" />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@school.com"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-[2.65rem] h-4 w-4 text-slate-400" />
              <FormField
                label="Password"
                name="Password"
                type="password"
                value={form.Password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="pl-10"
              />
            </div>

            <FormField
              label="Role"
              name="role"
              as="select"
              value={form.role}
              onChange={handleChange}
              required
              options={[
                { value: "student", label: "Student" },
                { value: "teacher", label: "Teacher" },
              ]}
            />

            <GradientButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Get Started"}
            </GradientButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Login
            </Link>
          </p>
        </GlassCard>
      </div>
    </Background>
  );
}

export default Register;
