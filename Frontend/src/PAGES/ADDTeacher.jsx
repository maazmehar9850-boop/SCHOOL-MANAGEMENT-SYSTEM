import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import PasswordField from "../components/PasswordField";
import { validatePasswordStrength } from "../utils/passwordPolicy";

const FIELDS = [
  { key: "name", label: "Full name", type: "text", required: true, placeholder: "Teacher full name" },
  { key: "email", label: "Email address", type: "email", required: true, placeholder: "teacher@aspiracollege.com" },
  { key: "subject", label: "Subject", type: "text", placeholder: "e.g. Mathematics" },
  { key: "experience", label: "Experience", type: "text", placeholder: "e.g. 5 years" },
];

function AddTeacher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    Password: "",
    role: "teacher",
    subject: "",
    experience: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTeacher = async (e) => {
    e.preventDefault();
    const passwordError = validatePasswordStrength(form.Password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    try {
      await API.post("/register", form);
      toast.success("Teacher added successfully");
      navigate("/teachers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  return (
    <PageLayout role="admin" variant="admin" title="Add Teacher" subtitle="Create a teacher account">
      <GlassCard className="mx-auto max-w-2xl p-6 md:p-8" hover={false}>
        <form onSubmit={addTeacher} className="space-y-4">
          {FIELDS.map(({ key, label, type, required, placeholder }) => (
            <label key={key} className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                {label}
                {required ? <span className="text-rose-500"> *</span> : null}
              </span>
              <input
                type={type}
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="input-glass"
                required={required}
                placeholder={placeholder}
              />
            </label>
          ))}

          <PasswordField
            label="Password"
            name="Password"
            value={form.Password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            showStrength
            autoComplete="new-password"
          />

          <GradientButton type="submit" className="w-full">
            Add teacher
          </GradientButton>
        </form>
      </GlassCard>
    </PageLayout>
  );
}

export default AddTeacher;
