export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_MESSAGE =
  "At least 8 characters with uppercase, lowercase, number, and special character";

export const PASSWORD_RULES = [
  { id: "length", label: "8+ characters", test: (v) => v.length >= 8 },
  { id: "lower", label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "upper", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "Number", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function getPasswordChecks(password = "") {
  const value = String(password);
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(value),
  }));
}

export function validatePasswordStrength(password) {
  const value = String(password ?? "");
  const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
  if (!value) return "Password is required";
  if (failed) return PASSWORD_POLICY_MESSAGE;
  return null;
}

export function passwordStrengthScore(password = "") {
  const checks = getPasswordChecks(password);
  return checks.filter((c) => c.passed).length;
}
