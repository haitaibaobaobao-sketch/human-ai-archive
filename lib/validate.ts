export const RELATION_TYPES = ["ROMANTIC", "COMPANION", "FRIENDSHIP"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const RELATION_LABEL: Record<RelationType, string> = {
  ROMANTIC: "Romantic relationship",
  COMPANION: "AI companionship",
  FRIENDSHIP: "Friendship",
};

/** 去掉控制字符、压空白、截断。返回 null 表示空。 */
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

/** 只接受 YYYY-MM-DD，且是合法日期 */
export function cleanDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getUTCFullYear() < 1950 || d.getUTCFullYear() > 2100) return null;
  // 防止 2026-02-31 这种
  const [y, m, day] = value.split("-").map(Number);
  if (d.getUTCMonth() + 1 !== m || d.getUTCDate() !== day) return null;
  return value;
}

export function cleanRelationType(value: unknown): RelationType | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return (RELATION_TYPES as readonly string[]).includes(upper)
    ? (upper as RelationType)
    : null;
}

/** 从相识日期算到今天的天数 */
export function daysSince(dateStr: string): number {
  const start = new Date(`${dateStr}T00:00:00Z`).getTime();
  const now = Date.now();
  const diff = Math.floor((now - start) / 86_400_000);
  return diff < 0 ? 0 : diff;
}
