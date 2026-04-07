export function formatSum(n: number): string {
  return n.toLocaleString("ru-RU").replace(/\u00a0/g, " ");
}
