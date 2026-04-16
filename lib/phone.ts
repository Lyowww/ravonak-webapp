/** Normalize user input to +998XXXXXXXXX (UZ mobile). */
export function normalizeUzPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("998")) return `+${d}`;
  if (d.length === 9) return `+998${d}`;
  return null;
}

/** Format partial user input as a UZ phone draft. */
export function formatUzPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 12);
  const rest = digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
  if (!rest) return "";
  if (rest.length <= 2) return `+998 ${rest}`;
  if (rest.length <= 5) {
    return `+998 ${rest.slice(0, 2)} ${rest.slice(2)}`;
  }
  if (rest.length <= 7) {
    return `+998 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  }
  return `+998 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
}

/** Loose check: enough digits for a UZ mobile before sending SMS. */
export function isLikelyUzMobileInput(input: string): boolean {
  return normalizeUzPhone(input) != null;
}

/** Display E.164 as spaced groups for inputs. */
export function formatUzPhoneDisplay(e164: string): string {
  const n = e164.replace(/\D/g, "");
  const rest = n.startsWith("998") ? n.slice(3) : n;
  if (rest.length <= 2) return `+998 ${rest}`;
  if (rest.length <= 5)
    return `+998 ${rest.slice(0, 2)} ${rest.slice(2)}`;
  if (rest.length <= 7)
    return `+998 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  return `+998 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
}
