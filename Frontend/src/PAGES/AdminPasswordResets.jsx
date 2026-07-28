import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, KeyRound, RefreshCw, X } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import GradientButton from "../components/GradientButton";
import Skeleton from "../components/Skeleton";

const STATUS_TONE = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  completed: "bg-slate-100 text-slate-700",
};

function AdminPasswordResets() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/password-reset/requests", {
        params: { status: filter },
      });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load reset requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await API.post(`/password-reset/requests/${id}/approve`);
      toast.success("Approved — user can now reset password from the app");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    const adminNote = window.prompt("Optional note for the user:");
    if (adminNote === null) return;
    setBusyId(id);
    try {
      await API.post(`/password-reset/requests/${id}/reject`, { adminNote });
      toast.success("Request rejected");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Password Reset Requests"
      subtitle="Review teacher and student reset requests before allowing a new password"
    >
      <PageContentCard
        title="Reset queue"
        subtitle="Approve a request so the user can reset directly in the app"
        action={
          <GradientButton variant="secondary" onClick={load}>
            <RefreshCw size={16} />
            Refresh
          </GradientButton>
        }
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {["pending", "approved", "rejected", "completed", "all"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
            <KeyRound className="mx-auto mb-3 opacity-40" size={32} />
            No {filter === "all" ? "" : filter} reset requests
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((row) => (
              <div
                key={row._id}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 md:p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{row.name || row.email}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[row.status] || STATUS_TONE.completed}`}
                      >
                        {row.status}
                      </span>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                        {row.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{row.email}</p>
                    {row.reason ? (
                      <p className="mt-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">Reason:</span> {row.reason}
                      </p>
                    ) : null}
                    {row.adminNote && row.status === "rejected" ? (
                      <p className="mt-2 text-sm text-rose-700">Note: {row.adminNote}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-400">
                      Requested {new Date(row.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {row.status === "pending" ? (
                    <div className="flex shrink-0 gap-2">
                      <GradientButton
                        className="!py-2 !px-4"
                        disabled={busyId === row._id}
                        onClick={() => approve(row._id)}
                      >
                        <Check size={15} />
                        Approve
                      </GradientButton>
                      <GradientButton
                        variant="secondary"
                        className="!py-2 !px-4"
                        disabled={busyId === row._id}
                        onClick={() => reject(row._id)}
                      >
                        <X size={15} />
                        Reject
                      </GradientButton>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContentCard>
    </PageLayout>
  );
}

export default AdminPasswordResets;
