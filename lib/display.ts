/** Localized labels from API / product copy (Miro naming). */
export function displayChapterTitle(name: string): string {
  const n = name.trim();
  if (/dairy\s*counter/i.test(n)) {
    return n.replace(/counter/gi, "row");
  }
  if (/сырн/i.test(n) && /лавк/i.test(n)) {
    return n.replace(/Сырная лавка/gi, "Сырный ряд");
  }
  return n;
}
