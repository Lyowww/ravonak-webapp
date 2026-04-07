/** Normalize user input to +998XXXXXXXXX (UZ mobile). */
export function normalizeUzPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("998")) return `+${d}`;
  if (d.length === 9) return `+998${d}`;
  return null;
}
