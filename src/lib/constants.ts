export const DEFAULT_BUY_IN = 20;

export const REGULAR_PLAYERS = [
  "Santiago",
  "Mariano",
  "Crod",
  "Joaco",
  "Moyano",
  "Nick G.",
  "Nieva",
  "Martin",
] as const;

export const LOCATIONS = [
  "Chez Crod",
  "Chez Daros",
  "Chez Nieva",
  "Chez Mariano",
] as const;

export function formatCurrency(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}€${amount.toFixed(2)}`;
}

export function formatCurrencyShort(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  if (Math.abs(amount) >= 1000) {
    return `${sign}€${(amount / 1000).toFixed(1)}k`;
  }
  return `${sign}€${amount.toFixed(0)}`;
}
