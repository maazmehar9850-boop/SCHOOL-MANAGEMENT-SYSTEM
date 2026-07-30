import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Banknote, CheckCircle2, Clock3, Receipt, RefreshCw } from "lucide-react";
import API from "../api";
import PageLayout from "../components/PageLayout";
import PageContentCard from "../components/PageContentCard";
import InfoBanner from "../components/InfoBanner";
import DataTable from "../components/DataTable";
import { TableSkeleton } from "../components/Skeleton";
import GradientButton from "../components/GradientButton";
import Modal from "../components/Modal";
import SaveAsPdfButton from "../components/SaveAsPdfButton";
import { saveAsPdf, tableHtml } from "../utils/saveAsPdf";

const STATUS_TONE = {
  pending: "bg-amber-100 text-amber-800",
  partial: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
};

function formatMoney(n) {
  return `Rs ${(Number(n) || 0).toLocaleString()}`;
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

function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [receiptFee, setReceiptFee] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/fees/mine");
      setFees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        toast.error("Fees API not found. Ask admin to update the server.");
      } else {
        toast.error(err.response?.data?.message || "Failed to load your fees");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return fees;
    return fees.filter((f) => f.status === filter);
  }, [fees, filter]);

  const summary = useMemo(() => {
    const pending = fees.filter((f) => f.status === "pending").length;
    const partial = fees.filter((f) => f.status === "partial").length;
    const paid = fees.filter((f) => f.status === "paid").length;
    const totalDue = fees.reduce((s, f) => s + (Number(f.amountDue) || 0), 0);
    const totalPaid = fees.reduce((s, f) => s + (Number(f.amountPaid) || 0), 0);
    return {
      pending,
      partial,
      paid,
      totalDue,
      totalPaid,
      totalBalance: Math.max(0, totalDue - totalPaid),
    };
  }, [fees]);

  const columns = [
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
      label: "Receipt",
      sortable: false,
      render: (row) =>
        row.receiptNumber || row.status === "paid" || row.status === "partial" ? (
          <button
            type="button"
            onClick={() => setReceiptFee(row)}
            className="rounded-lg bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800 hover:bg-teal-200"
          >
            View
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <PageLayout
      role="student"
      variant="student"
      title="My Fees"
      subtitle="Fees assigned by admin — pending, paid, and receipts"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock3 size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-900">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-4">
          <div className="flex items-center gap-2 text-sky-800">
            <Banknote size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Partial</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-900">{summary.partial}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Paid</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{summary.paid}</p>
        </div>
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/80 p-4">
          <div className="flex items-center gap-2 text-teal-800">
            <Receipt size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Balance</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-teal-900">
            {formatMoney(summary.totalBalance)}
          </p>
          <p className="mt-1 text-xs text-teal-700">Paid {formatMoney(summary.totalPaid)}</p>
        </div>
      </div>

      <PageContentCard
        title="Fee statements"
        subtitle="Only fees assigned to your account by the school admin"
        action={
          <GradientButton variant="secondary" onClick={load}>
            <RefreshCw size={16} />
            Refresh
          </GradientButton>
        }
      >
        <InfoBanner>
          Pending fees must be paid at the office. After admin collects payment, your receipt
          appears here and you can save it as PDF.
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
          <TableSkeleton rows={5} label="Loading fees..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            searchKeys={["title", "term", "receiptNumber", "status"]}
            searchPlaceholder="Search fee title, term, receipt…"
            emptyMessage="No fees assigned yet. When admin assigns a fee, it will show here."
          />
        )}
      </PageContentCard>

      <Modal
        open={Boolean(receiptFee)}
        onClose={() => setReceiptFee(null)}
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
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{receiptFee.title}</h3>
                  <p className="text-sm text-slate-600">{receiptFee.term || "—"}</p>
                </div>
                <StatusBadge status={receiptFee.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">Amount due</p>
                  <p className="font-semibold text-slate-800">{formatMoney(receiptFee.amountDue)}</p>
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
                  <p className="font-semibold text-slate-800">{formatDate(receiptFee.paidAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <GradientButton variant="secondary" onClick={() => setReceiptFee(null)}>
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

export default StudentFees;
