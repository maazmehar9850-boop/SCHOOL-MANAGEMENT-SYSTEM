import { getPasswordChecks, passwordStrengthScore } from "../utils/passwordPolicy";

function PasswordStrengthHint({ password = "", show = true }) {
  if (!show || !password) return null;

  const checks = getPasswordChecks(password);
  const score = passwordStrengthScore(password);
  const tone =
    score <= 2 ? "text-rose-600" : score <= 4 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
      <p className={`text-xs font-semibold ${tone}`}>
        Password strength: {score}/{checks.length}
      </p>
      <ul className="mt-2 space-y-1">
        {checks.map((rule) => (
          <li
            key={rule.id}
            className={`text-xs ${rule.passed ? "text-emerald-700" : "text-slate-500"}`}
          >
            {rule.passed ? "✓" : "○"} {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrengthHint;
