import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { TableSkeleton } from "../components/Skeleton";
import PasswordField from "../components/PasswordField";
import PasswordStrengthHint from "../components/PasswordStrengthHint";
import { validatePasswordStrength } from "../utils/passwordPolicy";
import { logout } from "../utils/auth";

const ROLE_CONFIG = {
  admin: {
    subtitle: "Manage your admin account details and security",
    fields: [
      { key: "name", label: "Full name", type: "text", required: true },
      { key: "email", label: "Email address", type: "email", required: true },
      { key: "phone", label: "Phone number", type: "tel" },
      { key: "bio", label: "Bio / notes", type: "textarea", full: true },
    ],
  },
  teacher: {
    subtitle: "Update your teaching profile, contact info, and password",
    fields: [
      { key: "name", label: "Full name", type: "text", required: true },
      { key: "email", label: "Email address", type: "email", required: true },
      { key: "subject", label: "Subject", type: "text" },
      { key: "experience", label: "Experience", type: "text" },
      { key: "phone", label: "Phone number", type: "tel" },
      { key: "bio", label: "Bio", type: "textarea", full: true },
    ],
  },
  student: {
    subtitle: "View and update your student account details",
    fields: [
      { key: "name", label: "Full name", type: "text", required: true },
      { key: "email", label: "Email address", type: "email", required: true },
      { key: "phone", label: "Phone number", type: "tel" },
      { key: "bio", label: "Bio", type: "textarea", full: true },
    ],
  },
};

function Profile() {
  const role = localStorage.getItem("role") || "student";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const [profile, setProfile] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const initials = useMemo(() => {
    const name = profile.name || "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/me");
        setProfile(res.data.User || {});
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetEdit = () => {
    setEditing(false);
    setPassword("");
    setConfirmPassword("");
  };

  const saveProfile = async () => {
    if (!profile.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profile.email?.trim()) {
      toast.error("Email is required");
      return;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {};
      config.fields.forEach(({ key }) => {
        if (profile[key] !== undefined) payload[key] = profile[key];
      });
      if (password) payload.Password = password;

      const res = await API.put("/me", payload);

      if (password) {
        toast.success("Password updated. Please sign in again.");
        await logout(null, { silent: true });
        return;
      }

      setProfile(res.data.User);
      localStorage.setItem("name", res.data.User.name);
      localStorage.setItem("email", res.data.User.email);
      resetEdit();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = profile[field.key] ?? "";

    if (!editing) {
      return (
        <p className="rounded-2xl bg-white/60 px-4 py-3 font-medium text-slate-900">
          {value || "—"}
        </p>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          className="input-glass min-h-28"
          value={value}
          onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
        />
      );
    }

    return (
      <input
        className="input-glass"
        type={field.type || "text"}
        value={value}
        required={field.required}
        onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
      />
    );
  };

  return (
    <PageLayout role={role} variant="profile" title="My Profile" subtitle={config.subtitle}>
      {loading ? (
        <TableSkeleton rows={6} label="Loading profile..." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <GlassCard className="p-6 text-center" hover={false}>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#3b5bdb] to-[#22b8cf] text-3xl font-bold text-white shadow-lg shadow-cyan-500/25">
              {initials}
            </div>
            <h2 className="font-display mt-4 text-xl font-bold text-slate-900">
              {profile.name || "User"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
              {role}
            </span>

            <div className="mt-6 space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-indigo-500" />
                <span className="truncate">{profile.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-indigo-500" />
                <span>{profile.phone || "No phone added"}</span>
              </div>
              {role === "teacher" && profile.subject ? (
                <div className="flex items-center gap-2">
                  <User size={15} className="text-indigo-500" />
                  <span>{profile.subject}</span>
                </div>
              ) : null}
            </div>
          </GlassCard>

          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hover={false}>
              <div className="mb-6 flex items-center gap-2">
                <User size={18} className="text-indigo-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">Account details</h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {config.fields.map((field) => (
                  <label
                    key={field.key}
                    className={`block space-y-2 ${field.full ? "md:col-span-2" : ""}`}
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required ? <span className="text-rose-500"> *</span> : null}
                    </span>
                    {renderField(field)}
                  </label>
                ))}
              </div>
            </GlassCard>

            {editing ? (
              <GlassCard className="p-6 md:p-8" hover={false}>
                <div className="mb-6 flex items-center gap-2">
                  <Shield size={18} className="text-indigo-600" />
                  <h3 className="font-display text-lg font-bold text-slate-900">Change password</h3>
                </div>
                <p className="mb-4 text-sm text-slate-500">
                  Leave both fields blank to keep your current password.
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  <PasswordField
                    label="New password"
                    name="newPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Confirm password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
                <PasswordStrengthHint password={password} />
              </GlassCard>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {!editing ? (
                <GradientButton onClick={() => setEditing(true)}>Edit profile</GradientButton>
              ) : (
                <>
                  <GradientButton onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </GradientButton>
                  <GradientButton
                    variant="secondary"
                    onClick={() => {
                      resetEdit();
                      API.get("/me")
                        .then((res) => setProfile(res.data.User || {}))
                        .catch(() => toast.error("Could not reload profile"));
                    }}
                  >
                    Cancel
                  </GradientButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Profile;
