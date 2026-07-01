/**
 * Shared field validation — used by BOTH the client forms (inline errors) and
 * the server actions (final gate), so the two can never drift apart.
 * Every helper returns undefined when valid, or a human-friendly message.
 */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function emailError(raw: string): string | undefined {
  const v = raw.trim();
  if (!v) return "Email is required.";
  if (/\.\./.test(v) || !EMAIL_RE.test(v)) {
    return "That email doesn't look right — check for typos (e.g. name@example.com).";
  }
  return undefined;
}

/** US/NANP phone: 10 digits (optional leading 1), area code can't start 0/1. */
export function phoneError(raw: string): string | undefined {
  const v = raw.trim();
  if (!v) return "Phone number is required.";
  let digits = v.replace(/[\s().+-]/g, "");
  if (!/^\d+$/.test(digits)) return "Phone numbers can only contain digits, spaces and ( ) + -.";
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) {
    return `A US phone number has 10 digits — you entered ${digits.length}.`;
  }
  if (digits[0] === "0" || digits[0] === "1") return "That area code isn't valid.";
  return undefined;
}

export function nameError(raw: string, label = "Name"): string | undefined {
  const v = raw.trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} looks too short.`;
  if (!/^[\p{L}][\p{L}' .-]*$/u.test(v)) {
    return `${label} can only contain letters, spaces, hyphens and apostrophes.`;
  }
  return undefined;
}

/**
 * ABA routing number: exactly 9 digits AND the ABA check-digit equation must
 * hold — 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) ≡ 0 (mod 10). Catches missing,
 * extra and mistyped digits before a payout bounces.
 */
export function routingError(raw: string): string | undefined {
  const v = raw.replace(/[\s-]/g, "");
  if (!v) return "Routing number is required.";
  if (!/^\d+$/.test(v)) return "Routing numbers are digits only.";
  if (v.length !== 9) return `A routing number is exactly 9 digits — you entered ${v.length}.`;
  const d = [...v].map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  if (sum % 10 !== 0) return "That routing number fails the bank check-digit test — one digit is off.";
  // First two digits identify the Federal Reserve district (00–12, 21–32 for
  // thrifts, 61–72 electronic). 13–20, 33–60, 73+ are never issued.
  const p = Number(v.slice(0, 2));
  const okPrefix = p <= 12 || (p >= 21 && p <= 32) || (p >= 61 && p <= 72) || p === 80;
  if (!okPrefix) return "That routing number fails the bank check-digit test — one digit is off.";
  return undefined;
}

/** US bank account numbers are 4–17 digits. */
export function accountNumberError(raw: string): string | undefined {
  const v = raw.replace(/[\s-]/g, "");
  if (!v) return "Account number is required.";
  if (!/^\d+$/.test(v)) return "Account numbers are digits only.";
  if (v.length < 4 || v.length > 17) {
    return `Account numbers are 4–17 digits — you entered ${v.length}.`;
  }
  return undefined;
}

export function zipError(raw: string): string | undefined {
  const v = raw.trim();
  if (!v) return "ZIP code is required.";
  if (!/^\d{5}(-\d{4})?$/.test(v)) return "Enter a 5-digit ZIP (or ZIP+4, e.g. 94105-1234).";
  return undefined;
}

export function requiredError(raw: string, label: string, min = 2): string | undefined {
  const v = raw.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} looks too short.`;
  return undefined;
}

/** Convenience: true when every message in the map is undefined. */
export function allValid(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every((e) => !e);
}
