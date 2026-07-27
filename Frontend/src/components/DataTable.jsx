import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import SearchField from "./SearchField";

function DataTable({
  columns = [],
  data = [],
  searchKeys = [],
  pageSize = 8,
  emptyMessage = "No records found",
  searchPlaceholder = "Search by name, email, or keyword…",
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const resolvedKeys = useMemo(() => {
    if (searchKeys.length) return searchKeys;
    return columns.filter((c) => c.sortable !== false && !c.render).map((c) => c.key);
  }, [searchKeys, columns]);

  const getValue = (row, key) => {
    if (!key.includes(".")) return row[key];
    return key.split(".").reduce((acc, part) => acc?.[part], row);
  };

  const filtered = useMemo(() => {
    let rows = [...data];

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        resolvedKeys.some((key) =>
          String(getValue(row, key) ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    if (sortKey) {
      rows.sort((a, b) => {
        const av = getValue(a, sortKey) ?? "";
        const bv = getValue(b, sortKey) ?? "";
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, query, resolvedKeys, sortKey, sortDir]);

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
      <SearchField
        value={query}
        onChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
        placeholder={searchPlaceholder}
      />

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
                      {col.render ? col.render(row) : getValue(row, col.key)}
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
          {query.trim() ? ` for “${query.trim()}”` : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/50 bg-white/70 p-1.5 transition hover:bg-white disabled:opacity-35"
            aria-label="Previous page"
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
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
