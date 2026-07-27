import { Search, X } from "lucide-react";

export default function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}) {
  return (
    <div className={`search-field ${className}`.trim()}>
      <Search size={18} className="search-field-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-field-input"
        aria-label="Search"
      />
      {value ? (
        <button
          type="button"
          className="search-field-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
