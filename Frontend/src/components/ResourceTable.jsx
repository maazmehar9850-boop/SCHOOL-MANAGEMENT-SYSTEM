import { useMemo, useState, Fragment } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from "lucide-react";
import SearchField from "./SearchField";
import { TableSkeleton } from "./Skeleton";
import MobileDataCards, { getTableValue } from "./MobileDataCards";

/**
 * Professional glass table with search, filter, sort, pagination, expand.
 */
function ResourceTable({
  columns = [],
  data = [],
  searchKeys = [],
  pageSize = 8,
  emptyMessage = "No records found",
  emptyHint = "Create a new record to get started.",
  searchPlaceholder = "Search…",
  filters = [],
  toolbar = null,
  loading = false,
  defaultSortKey = null,
  defaultSortDir = "asc",
  rowClassName,
  expandable = false,
  renderExpanded,
  getRowId = (row, idx) => row._id || row.id || idx,
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filters.map((f) => [f.key, ""]))
  );
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const resolvedKeys = useMemo(() => {
    if (searchKeys.length) return searchKeys;
    return columns.filter((c) => c.sortable !== false && !c.render).map((c) => c.key);
  }, [searchKeys, columns]);

  const filtered = useMemo(() => {
    let rows = [...data];

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        resolvedKeys.some((key) =>
          String(getTableValue(row, key) ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    filters.forEach((f) => {
      const val = filterValues[f.key];
      if (!val) return;
      rows = rows.filter((row) => String(getTableValue(row, f.key) ?? "") === String(val));
    });

    if (sortKey) {
      rows.sort((a, b) => {
        const av = getTableValue(a, sortKey) ?? "";
        const bv = getTableValue(b, sortKey) ?? "";
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, query, resolvedKeys, sortKey, sortDir, filters, filterValues]);

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

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={13} className="opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp size={13} className="text-[#3b5bdb]" />
    ) : (
      <ArrowDown size={13} className="text-[#3b5bdb]" />
    );
  };

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full max-w-md"
          />
          {filters.map((f) => (
            <select
              key={f.key}
              value={filterValues[f.key] || ""}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                setPage(1);
              }}
              className="input-glass !h-11 !w-full max-w-[200px] !rounded-2xl !px-3 text-sm sm:!w-auto"
              aria-label={f.label}
            >
              <option value="">{f.label}</option>
              {f.options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))}
            </select>
          ))}
        </div>
        {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
      </div>

      <MobileDataCards
        columns={columns}
        rows={pageRows}
        emptyMessage={emptyMessage}
        getRowId={getRowId}
      />

      <div className="pro-table-wrap hidden md:block">
        <table className="pro-table min-w-full text-left text-sm">
          <thead className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            <tr>
              {expandable ? <th className="w-10 px-3 py-3.5" /> : null}
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1.5 transition hover:text-[#3b5bdb]"
                    >
                      {col.label}
                      <SortIcon colKey={col.key} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (expandable ? 1 : 0)}
                  className="px-4 py-14 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Inbox size={22} />
                    </span>
                    <p className="font-medium text-slate-700">{emptyMessage}</p>
                    <p className="text-sm">{emptyHint}</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => {
                const id = getRowId(row, idx);
                const isOpen = expandedId === id;
                const extraClass = typeof rowClassName === "function" ? rowClassName(row) : "";
                return (
                  <Fragment key={id}>
                    <tr
                      className={`border-t border-slate-200/50 transition hover:bg-white/70 ${extraClass}`}
                    >
                      {expandable ? (
                        <td className="px-3 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isOpen ? null : id)}
                            className="rounded-lg border border-slate-200/80 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "−" : "+"}
                          </button>
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3.5 text-slate-700 ${col.tdClassName || ""}`}>
                          {col.render ? col.render(row) : getTableValue(row, col.key)}
                        </td>
                      ))}
                    </tr>
                    {expandable && isOpen && renderExpanded ? (
                      <tr className="border-t border-slate-100 bg-slate-50/70">
                        <td colSpan={columns.length + 1} className="px-5 py-4">
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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

export default ResourceTable;
