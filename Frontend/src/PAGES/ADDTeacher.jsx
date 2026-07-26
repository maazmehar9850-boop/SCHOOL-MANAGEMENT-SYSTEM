import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import PageLayout from "../components/PageLayout";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";

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
          {["name", "email", "Password", "subject", "experience"].map((field) => (
            <label key={field} className="block space-y-2">
              <span className="text-sm font-medium capitalize text-slate-600">{field}</span>
              <input
                type={field === "Password" ? "password" : field === "email" ? "email" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="input-glass"
                required={["name", "email", "Password"].includes(field)}
              />
            </label>
          ))}
          <GradientButton type="submit" className="w-full">
            Add teacher
          </GradientButton>
        </form>
      </GlassCard>
    </PageLayout>
  );
}

export default AddTeacher;
