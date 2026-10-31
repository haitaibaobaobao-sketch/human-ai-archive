import crypto from "crypto";

/**
 * 管理钥匙：创建记录时生成一次，只返回给提交者，数据库里只存哈希。
 * 拿它 + 编号就能删除自己的记录（本站没有账号系统，这是唯一的身份凭证）。
 */
export function generateManageToken(): string {
  return crypto.randomBytes(16).toString("hex"); // 32 位十六进制
}

export function hashManageToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyManageToken(token: string, storedHash: string | null): boolean {
  if (!token || !storedHash) return false;
  const a = Buffer.from(hashManageToken(token));
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
