export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  emoji: string;
  color: string;
  deadline?: string | null;
  is_shared?: boolean;
  share_token?: string | null;
  user_id?: string;
};

export type Transaction = {
  id: string;
  goal_id: string;
  amount: number;
  kind: "deposit" | "withdrawal";
  note: string | null;
  created_at: string;
};

export const GOAL_GRADIENTS = [
  "from-sky-500/30 to-blue-700/30",
  "from-teal-500/30 to-cyan-700/30",
  "from-emerald-500/30 to-teal-700/30",
  "from-indigo-500/30 to-blue-700/30",
  "from-violet-500/30 to-purple-700/30",
  "from-rose-500/30 to-pink-700/30",
  "from-amber-500/30 to-orange-700/30",
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ILS: "₪",
  JPY: "¥",
};

export function formatCurrency(n: number, currency = "USD"): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? "$";
  const value = Math.round(Number(n) || 0).toLocaleString();
  return `${sym}${value}`;
}
