import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

function StudentProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/me");
        setProfile(res.data.User);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
      };
      if (password) payload.Password = password;
      const res = await API.put("/me", payload);
      setProfile(res.data.User);
      localStorage.setItem("name", res.data.User.name);
      setPassword("");
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <PageLayout
      role="student"
      variant="profile"
      title="My Profile"
      subtitle="View and update your student details"
    >
      {loading ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : (
        <GlassCard className="p-6 md:p-8" hover={false}>
          <div className="grid gap-6 md:grid-cols-2">
            {["name", "email", "phone"].map((field) => (
              <label key={field} className="block space-y-2">
                <span className="text-sm font-medium capitalize text-slate-600">{field}</span>
                {editing ? (
                  <input
                    className="input-glass"
                    name={field}
                    value={profile[field] || ""}
                    onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                  />
                ) : (
                  <p className="rounded-2xl bg-white/60 px-4 py-3 font-semibold text-slate-900">
                    {profile[field] || "—"}
                  </p>
                )}
              </label>
            ))}
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-600">Bio</span>
              {editing ? (
                <textarea
                  className="input-glass min-h-28"
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              ) : (
                <p className="rounded-2xl bg-white/60 px-4 py-3 text-slate-700">
                  {profile.bio || "No bio yet."}
                </p>
              )}
            </label>
            {editing && (
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-600">New password</span>
                <input
                  type="password"
                  className="input-glass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </label>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <GradientButton onClick={() => setEditing((v) => !v)} variant="secondary">
              {editing ? "Cancel" : "Edit profile"}
            </GradientButton>
            {editing && <GradientButton onClick={save}>Save changes</GradientButton>}
          </div>
        </GlassCard>
      )}
    </PageLayout>
  );
}

export default StudentProfile;
