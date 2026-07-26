import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

function DataTable({
  columns = [],
  data = [],
  searchKeys = [],
  pageSize = 8,
  emptyMessage = "No records found",
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const getValue = (row, key) => {
    if (!key.includes(".")) return row[key];
    return key.split(".").reduce((acc, part) => acc?.[part], row);
  };

  const filtered = useMemo(() => {
    let rows = [...data];

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((key) => String(getValue(row, key) ?? "").toLowerCase().includes(q))
      );
    }

    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, query, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search records..."
          className="input-glass !rounded-xl pl-10 text-sm"
        />
      </div>

      <div className="pro-table-wrap overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3.5">
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1.5 transition hover:text-[#3b5bdb]"
                    >
                      {col.label}
                      <ArrowUpDown size={13} className="opacity-50" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="border-t border-slate-200/50 transition hover:bg-white/60"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-slate-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/50 bg-white/70 p-1.5 transition hover:bg-white disabled:opacity-35"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/50 bg-white/70 p-1.5 transition hover:bg-white disabled:opacity-35"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
