// 内容过滤：只挡硬违规（链接 / 邮箱 / 色情 / 仇恨 / 刷屏）。
// 情绪词（sad, lonely, depressed, miss...）一律放行——那是这个站存在的意义。

const BLOCKED_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /https?:\/\/|www\./i, reason: "Links aren't allowed in entries." },
  {
    re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
    reason: "Email addresses aren't allowed in entries.",
  },
];

const BLOCKED_WORDS = [
  "porn",
  "porno",
  "nsfw",
  "nude",
  "nudes",
  "hentai",
  "orgasm",
  "masturbat",
  "dick",
  "pussy",
  "cock",
  "boobs",
  "tits",
  "anal",
  "cumshot",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "kys",
  "rape",
  "raped",
  "rapist",
  "child porn",
  "loli",
  "shota",
  "pedo",
  "pedophile",
];

/** 返回拒绝原因；放行返回 null。 */
export function moderate(text: string | null): string | null {
  if (!text) return null;

  for (const p of BLOCKED_PATTERNS) {
    if (p.re.test(text)) return p.reason;
  }

  const low = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(low)) {
      return "This entry can't be published as written.";
    }
  }

  if (/(.)\1{9,}/.test(text)) {
    return "Please don't repeat characters like that.";
  }

  return null;
}
