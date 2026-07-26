function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  as = "input",
  options = [],
  rows = 3,
  className = "",
  ...props
}) {
  const shared = {
    id: name,
    name,
    value: value ?? "",
    onChange,
    required,
    className: `input-glass ${className}`,
    placeholder,
    ...props,
  };

  return (
    <label className="block space-y-2" htmlFor={name}>
      {label && (
        <span className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
      )}
      {as === "textarea" ? (
        <textarea {...shared} rows={rows} />
      ) : as === "select" ? (
        <select {...shared}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...shared} type={type} />
      )}
    </label>
  );
}

export default FormField;
