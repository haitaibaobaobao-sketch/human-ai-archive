import crypto from "crypto";

// 去掉了 0/O/1/I/L 这些容易看错的字符
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** 生成档案编号，例如 AR-2026-K8X92 */
export function generateCode(): string {
  const year = new Date().getFullYear();
  const bytes = crypto.randomBytes(5);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `AR-${year}-${out}`;
}
