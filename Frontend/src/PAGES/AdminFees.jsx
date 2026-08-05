import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Receipt,
} from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import InfoBanner from "../components/InfoBanner";
import DataTable from "../components/DataTable";
import { TableSkeleton } from "../components/Skeleton";
import GradientButton from "../components/GradientButton";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

const STATUS_TONE = {
  pending: "bg-amber-100 text-amber-800",
  partial: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
};

const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Online", label: "Online" },
  { value: "Cheque", label: "Cheque" },
  { value: "Other", label: "Other" },
];

function formatMoney(n) {
  const num = Number(n) || 0;
  return `Rs ${num.toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[status] || STATUS_TONE.pending}`}
    >
      {status}
    </span>
  );
}

function buildReceiptHtml(fee) {
  const rows = [
    ["Receipt No.", fee.receiptNumber || "—"],
    ["Student", fee.studentName || "—"],
    ["Email", fee.studentEmail || "—"],
    ["Fee title", fee.title || "—"],
    ["Term / Period", fee.term || "—"],
    ["Amount due", formatMoney(fee.amountDue)],
    ["Amount paid", formatMoney(fee.amountPaid)],
    ["Balance", formatMoney(fee.balance ?? Math.max(0, fee.amountDue - fee.amountPaid))],
    ["Status", String(fee.status || "").toUpperCase()],
    ["Payment method", fee.paymentMethod || "—"],
    ["Due date", formatDate(fee.dueDate)],
    ["Paid on", formatDate(fee.paidAt)],
    ["Collected by", fee.recordedByName || "Admin"],
    ["Notes", fee.notes || "—"],
  ];

  return `
    <div class="receipt-amount">
      <div class="label">Amount received</div>
      <div class="value">${formatMoney(fee.amountPaid)}</div>
    </div>
    ${tableHtml(
      ["Particulars", "Details"],
      rows.map(([k, v]) => [k, v])
    )}
  `;
}

async function downloadReceiptPdf(fee) {
  await saveAsPdf(`Fee Receipt — ${fee.studentName}`, buildReceiptHtml(fee), {
    type: "receipt",
    subtitle: fee.title || "Fee payment receipt",
    filename: `fee-receipt-${fee.receiptNumber || fee._id}.pdf`,
    meta: {
      Receipt: fee.receiptNumber || "—",
      Student: fee.studentName || "—",
      Status: String(fee.status || "").toUpperCase(),
    },
  });
}

const emptyAssign = {
  studentId: "",
  title: "",
  term: "",
  amountDue: "",
  dueDate: "",
  notes: "",
  assignAll: false,
};

const emptyCollect = {
  amountPaid: "",
  paymentMethod: "Cash",
  notes: "",
  markFullyPaid: true,
};

function AdminFees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssign);

  const [collectOpen, setCollectOpen] = useState(false);
  const [collectTarget, setCollectTarget] = useState(null);
  const [collectForm, setCollectForm] = useState(emptyCollect);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptFee, setReceiptFee] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? {} : { status: filter };
      const [feesRes, summaryRes] = await Promise.all([
        API.get("/fees", { params }),
        API.get("/fees/summary"),
      ]);
      setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 404) {
        toast.error("Fees API not found. Use local backend (localhost:3030) or deploy latest backend.");
      } else {
        toast.error(msg || "Failed to load fees");
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await API.get("/students");
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch {
        /* ignore — assign modal will show empty list */
      }
    };
    loadStudents();
  }, []);

  const studentOptions = useMemo(
    () => [
      { value: "", label: "Select student…" },
      ...students.map((s) => ({
        value: s._id,
        label: `${s.name}${s.email ? ` (${s.email})` : ""}`,
      })),
    ],
    [students]
  );

  const openAssign = () => {
    setAssignForm(emptyAssign);
    setAssignOpen(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.title || !assignForm.amountDue) {
      toast.error("Title and amount are required");
      return;
    }
    if (!assignForm.assignAll && !assignForm.studentId) {
      toast.error("Select a student or choose assign to all");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: assignForm.title.trim(),
        term: assignForm.term.trim(),
        amountDue: Number(assignForm.amountDue),
        dueDate: assignForm.dueDate || undefined,
        notes: assignForm.notes.trim(),
      };

      if (assignForm.assignAll) {
        const res = await API.post("/fees/assign-all", payload);
        toast.success(res.data?.message || "Assigned to all students");
      } else {
        await API.post("/fees", { ...payload, studentId: assignForm.studentId });
        toast.success("Fee assigned");
      }
      setAssignOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not assign fee");
    } finally {
      setBusy(false);
    }
  };

  const openCollect = (fee) => {
    setCollectTarget(fee);
    setCollectForm({
      ...emptyCollect,
      amountPaid: String(fee.amountDue ?? ""),
      notes: fee.notes || "",
      markFullyPaid: true,
    });
    setCollectOpen(true);
  };

  const submitCollect = async (e) => {
    e.preventDefault();
    if (!collectTarget) return;
    setBusy(true);
    try {
      const body = {
        paymentMethod: collectForm.paymentMethod,
        notes: collectForm.notes.trim(),
      };
      if (collectForm.markFullyPaid) {
        body.markFullyPaid = true;
      } else {
        body.amountPaid = Number(collectForm.amountPaid);
      }

      const res = await API.post(`/fees/${collectTarget._id}/collect`, body);
      toast.success(res.data?.message || "Payment recorded");
      setCollectOpen(false);
      const updated = res.data?.fee;
      if (updated && (updated.status === "paid" || updated.status === "partial")) {
        setReceiptFee(updated);
        setReceiptOpen(true);
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Collection failed");
    } finally {
      setBusy(false);
    }
  };

  const openReceipt = (fee) => {
    setReceiptFee(fee);
    setReceiptOpen(true);
  };

  const removeFee = async (fee) => {
    if (!window.confirm(`Delete fee “${fee.title}” for ${fee.studentName}?`)) return;
    setBusy(true);
    try {
      await API.delete(`/fees/${fee._id}`);
      toast.success("Fee deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const exportListPdf = async () => {
    if (!fees.length) {
      toast.error("No fee records to export");
      return;
    }
    const rows = fees.map((f) => [
      f.studentName,
      f.title,
      f.term || "—",
      formatMoney(f.amountDue),
      formatMoney(f.amountPaid),
      formatMoney(f.balance ?? Math.max(0, f.amountDue - f.amountPaid)),
      String(f.status || "").toUpperCase(),
      f.receiptNumber || "—",
    ]);
    await saveAsPdf("Fees Register", tableHtml(
      ["Student", "Title", "Term", "Due", "Paid", "Balance", "Status", "Receipt"],
      rows
    ), {
      type: "receipt",
      subtitle: `Filter: ${filter}`,
      filename: `fees-${filter}-${Date.now()}.pdf`,
      meta: {
        Records: String(fees.length),
        "Total due": formatMoney(summary?.totalDue),
        "Total paid": formatMoney(summary?.totalPaid),
      },
    });
  };

  const columns = [
    {
      key: "studentName",
      label: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.studentName}</p>
          <p className="text-xs text-slate-500">{row.studentEmail || "—"}</p>
        </div>
      ),
    },
    {
      key: "title",
      label: "Fee",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.title}</p>
          <p className="text-xs text-slate-500">{row.term || "—"}</p>
        </div>
      ),
    },
    {
      key: "amountDue",
      label: "Due",
      render: (row) => formatMoney(row.amountDue),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (row) => formatMoney(row.amountPaid),
    },
    {
      key: "balance",
      label: "Balance",
      render: (row) =>
        formatMoney(row.balance ?? Math.max(0, Number(row.amountDue) - Number(row.amountPaid))),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "dueDate",
      label: "Due date",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== "paid" ? (
            <button
              type="button"
              onClick={() => openCollect(row)}
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
            >
              Collect
            </button>
          ) : null}
          {row.receiptNumber || row.status === "paid" || row.status === "partial" ? (
            <button
              type="button"
              onClick={() => openReceipt(row)}
              className="rounded-lg bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800 hover:bg-teal-200"
            >
              Receipt
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => removeFee(row)}
            className="rounded-lg bg-rose-50 px-2 py-1 text-rose-600 hover:bg-rose-100"
            aria-label="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      role="admin"
      variant="admin"
      title="Student Fees"
      subtitle="Assign fees, collect payments, view pending/paid records, and download receipts"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock3 size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-900">{summary?.pending ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-4">
          <div className="flex items-center gap-2 text-sky-800">
            <Banknote size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Partial</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-900">{summary?.partial ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Paid</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{summary?.paid ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/80 p-4">
          <div className="flex items-center gap-2 text-teal-800">
            <Receipt size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Collected</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-teal-900">
            {formatMoney(summary?.totalPaid ?? 0)}
          </p>
          <p className="mt-1 text-xs text-teal-700">
            Balance {formatMoney(summary?.totalBalance ?? 0)}
          </p>
        </div>
      </div>

      <PageContentCard
        title="Fees register"
        subtitle="Pending and paid student fees across the campus"
        action={
          <div className="flex flex-wrap gap-2">
            <GradientButton variant="secondary" onClick={load}>
              <RefreshCw size={16} />
              Refresh
            </GradientButton>
            <SaveAsPdfButton onClick={exportListPdf} />
            <GradientButton onClick={openAssign}>
              <Plus size={16} />
              Assign fee
            </GradientButton>
          </div>
        }
      >
        <InfoBanner>
          Assign a fee to one student or all students, then use <strong>Collect</strong> to
          record payment. Paid/partial fees get a receipt you can save as PDF.
        </InfoBanner>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "partial", label: "Partial" },
            { value: "paid", label: "Paid" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === item.value
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <TableSkeleton rows={6} label="Loading fees..." />
        ) : (
          <DataTable
            columns={columns}
            data={fees}
            searchKeys={["studentName", "studentEmail", "title", "term", "receiptNumber", "status"]}
            searchPlaceholder="Search student, fee title, receipt…"
            emptyMessage="No fee records yet. Assign a fee to get started."
          />
        )}
      </PageContentCard>

      {/* Assign modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign fee" size="md">
        <form onSubmit={submitAssign} className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={assignForm.assignAll}
              onChange={(e) =>
                setAssignForm((f) => ({ ...f, assignAll: e.target.checked, studentId: "" }))
              }
              className="rounded border-slate-300"
            />
            <Users size={15} className="text-teal-600" />
            Assign to all students
          </label>

          {!assignForm.assignAll ? (
            <FormField
              label="Student"
              name="studentId"
              as="select"
              required
              value={assignForm.studentId}
              onChange={(e) => setAssignForm((f) => ({ ...f, studentId: e.target.value }))}
              options={studentOptions}
            />
          ) : null}

          <FormField
            label="Fee title"
            name="title"
            required
            placeholder="e.g. January tuition / Admission fee"
            value={assignForm.title}
            onChange={(e) => setAssignForm((f) => ({ ...f, title: e.target.value }))}
          />
          <FormField
            label="Term / Period"
            name="term"
            placeholder="e.g. 2025-26 Term 1"
            value={assignForm.term}
            onChange={(e) => setAssignForm((f) => ({ ...f, term: e.target.value }))}
          />
          <FormField
            label="Amount due (Rs)"
            name="amountDue"
            type="number"
            min="0"
            step="1"
            required
            value={assignForm.amountDue}
            onChange={(e) => setAssignForm((f) => ({ ...f, amountDue: e.target.value }))}
          />
          <FormField
            label="Due date"
            name="dueDate"
            type="date"
            value={assignForm.dueDate}
            onChange={(e) => setAssignForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <FormField
            label="Notes"
            name="notes"
            as="textarea"
            rows={2}
            value={assignForm.notes}
            onChange={(e) => setAssignForm((f) => ({ ...f, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <GradientButton type="button" variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </GradientButton>
            <GradientButton type="submit" disabled={busy}>
              {busy ? "Saving…" : "Assign"}
            </GradientButton>
          </div>
        </form>
      </Modal>

      {/* Collect modal */}
      <Modal
        open={collectOpen}
        onClose={() => setCollectOpen(false)}
        title={collectTarget ? `Collect — ${collectTarget.studentName}` : "Collect fee"}
        size="md"
      >
        {collectTarget ? (
          <form onSubmit={submitCollect} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{collectTarget.title}</p>
              <p className="mt-1">
                Due {formatMoney(collectTarget.amountDue)} · Already paid{" "}
                {formatMoney(collectTarget.amountPaid)}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={collectForm.markFullyPaid}
                onChange={(e) =>
                  setCollectForm((f) => ({
                    ...f,
                    markFullyPaid: e.target.checked,
                    amountPaid: e.target.checked
                      ? String(collectTarget.amountDue)
                      : f.amountPaid,
                  }))
                }
                className="rounded border-slate-300"
              />
              Mark fully paid
            </label>

            {!collectForm.markFullyPaid ? (
              <FormField
                label="Amount paid (Rs)"
                name="amountPaid"
                type="number"
                min="0"
                step="1"
                required
                value={collectForm.amountPaid}
                onChange={(e) => setCollectForm((f) => ({ ...f, amountPaid: e.target.value }))}
              />
            ) : null}

            <FormField
              label="Payment method"
              name="paymentMethod"
              as="select"
              value={collectForm.paymentMethod}
              onChange={(e) => setCollectForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              options={PAYMENT_METHODS}
            />
            <FormField
              label="Notes"
              name="collectNotes"
              as="textarea"
              rows={2}
              value={collectForm.notes}
              onChange={(e) => setCollectForm((f) => ({ ...f, notes: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-2">
              <GradientButton
                type="button"
                variant="secondary"
                onClick={() => setCollectOpen(false)}
              >
                Cancel
              </GradientButton>
              <GradientButton type="submit" disabled={busy}>
                {busy ? "Saving…" : "Record payment"}
              </GradientButton>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Receipt modal */}
      <Modal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Fee receipt"
        size="lg"
      >
        {receiptFee ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Receipt {receiptFee.receiptNumber || "—"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {receiptFee.studentName}
                  </h3>
                  <p className="text-sm text-slate-600">{receiptFee.studentEmail}</p>
                </div>
                <StatusBadge status={receiptFee.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">Fee</p>
                  <p className="font-semibold text-slate-800">{receiptFee.title}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Term</p>
                  <p className="font-semibold text-slate-800">{receiptFee.term || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Amount due</p>
                  <p className="font-semibold text-slate-800">
                    {formatMoney(receiptFee.amountDue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Amount paid</p>
                  <p className="text-lg font-bold text-teal-800">
                    {formatMoney(receiptFee.amountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Method</p>
                  <p className="font-semibold text-slate-800">
                    {receiptFee.paymentMethod || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Paid on</p>
                  <p className="font-semibold text-slate-800">
                    {formatDate(receiptFee.paidAt)}
                  </p>
                </div>
              </div>
              {receiptFee.notes ? (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Notes:</span> {receiptFee.notes}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <GradientButton variant="secondary" onClick={() => setReceiptOpen(false)}>
                Close
              </GradientButton>
              <SaveAsPdfButton onClick={() => downloadReceiptPdf(receiptFee)}>
                Save as PDF
              </SaveAsPdfButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageLayout>
  );
}

export default AdminFees;
