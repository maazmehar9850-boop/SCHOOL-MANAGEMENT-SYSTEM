import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import PasswordStrengthHint from "./PasswordStrengthHint";

function PasswordField({
  label = "Password",
  name = "Password",
  value = "",
  onChange,
  placeholder = "Enter password",
  required = false,
  minLength = 8,
  showStrength = false,
  showLockIcon = true,
  className = "",
  autoComplete = "current-password",
  id,
}) {
  const [visible, setVisible] = useState(false);
  const fieldId = id || name;

  return (
    <label className={`block space-y-2 ${className}`} htmlFor={fieldId}>
      {label ? (
        <span className="text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </span>
      ) : null}

      <div className="input-field-wrap has-toggle">
        {showLockIcon ? (
          <Lock className="input-icon-left" size={18} strokeWidth={2} aria-hidden />
        ) : null}
        <input
          id={fieldId}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`input-glass ${showLockIcon ? "" : "!pl-4"}`}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle password-toggle--accent"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} strokeWidth={2.2} /> : <Eye size={18} strokeWidth={2.2} />}
        </button>
      </div>

      {showStrength ? <PasswordStrengthHint password={value} /> : null}
    </label>
  );
}

export default PasswordField;
