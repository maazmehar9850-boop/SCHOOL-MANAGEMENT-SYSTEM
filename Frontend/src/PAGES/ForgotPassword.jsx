import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import API from "../api";
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { BrandMark } from "../components/BrandLogo";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);

  const checkStatus = async () => {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    try {
      const res = await API.get("/password-reset/status", { params: { email } });
      setStatusInfo(res.data);
    } catch {
      toast.error("Could not check status");
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/password-reset/request", { email, reason });
      setSubmitted(true);
      toast.success("Request sent to admin for approval");
      await checkStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background variant="login">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <GlassCard className="w-full max-w-md p-8" hover={false}>
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
              <KeyRound size={26} />
            </div>
            <BrandMark size={40} className="mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-slate-900">Reset password</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              For teachers and students only. Submit a request — your school admin
              must approve it before you can set a new password.
            </p>
          </motion.div>

          {!submitted ? (
            <form onSubmit={submitRequest} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  School email <span className="text-rose-500">*</span>
                </span>
                <div className="input-field-wrap">
                  <Mail className="input-icon-left" size={18} strokeWidth={2} aria-hidden />
                  <input
                    type="email"
                    className="input-glass"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Reason (optional)
                </span>
                <div className="input-field-wrap">
                  <MessageSquareText
                    className="input-icon-left top-5 -translate-y-0"
                    size={18}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <textarea
                    className="input-glass min-h-24 !pl-10"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Forgot password, locked out, etc."
                  />
                </div>
              </label>

              <GradientButton type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting…" : "Send request to admin"}
              </GradientButton>
            </form>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-start gap-2">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Request submitted</p>
                  <p className="mt-1">
                    An admin will review your request. After approval, open the reset
                    password page and continue with your school email.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-slate-200/80 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Check request status
            </p>
            <GradientButton variant="secondary" className="w-full" onClick={checkStatus}>
              Check status
            </GradientButton>
            {statusInfo ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                <p className="font-semibold capitalize">{statusInfo.status}</p>
                {statusInfo.message ? <p className="mt-1">{statusInfo.message}</p> : null}
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already approved?{" "}
            <Link to="/reset-password" className="font-semibold text-indigo-600 hover:underline">
              Set new password
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </Background>
  );
}

export default ForgotPassword;
