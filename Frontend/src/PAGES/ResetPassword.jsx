import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import API from "../api";
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import PasswordField from "../components/PasswordField";
import { validatePasswordStrength } from "../utils/passwordPolicy";
import { BrandMark } from "../components/BrandLogo";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useDocumentTitle("Reset Password");

  const submitReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    try {
      await API.post("/password-reset/complete", {
        email: email.trim(),
        Password: password,
        confirmPassword,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Could not reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background variant="login">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <GlassCard className="w-full max-w-md p-8" hover={false}>
          <Link
            to="/forgot-password"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={14} />
            Back to request
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <BrandMark size={40} className="mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-slate-900">Set new password</h1>
            <p className="mt-2 text-sm text-slate-600">
              After admin approval, enter your college email and set a new password.
            </p>
          </motion.div>

          <form onSubmit={submitReset} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                College email <span className="text-rose-500">*</span>
              </span>
              <div className="input-field-wrap">
                <Mail className="input-icon-left" size={18} strokeWidth={2} aria-hidden />
                <input
                  type="email"
                  className="input-glass"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@aspiracollege.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <PasswordField
              label="New password"
              name="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              showStrength
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />

            <GradientButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Reset password"}
            </GradientButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No approval yet?{" "}
            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:underline">
              Request reset
            </Link>
          </p>
        </GlassCard>
      </div>
    </Background>
  );
}

export default ResetPassword;
