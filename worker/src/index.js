const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const RELATIONS = {
  ROMANTIC: "Romantic relationship",
  COMPANION: "AI companionship",
  FRIENDSHIP: "Friendship",
};

function generateCode() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `AR-${new Date().getUTCFullYear()}-${out}`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function cleanText(v, max) {
  if (typeof v !== "string") return null;
  const s = v
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;
  return s.slice(0, max);
}

function cleanDate(v) {
  if (typeof v !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const [y, m, day] = v.split("-").map(Number);
  if (d.getUTCFullYear() !== y || d.getUTCMonth() + 1 !== m || d.getUTCDate() !== day) return null;
  if (y < 1950 || y > 2100) return null;
  return v;
}

function daysSince(dateStr) {
  const start = Date.parse(`${dateStr}T00:00:00Z`);
  const d = Math.floor((Date.now() - start) / 86400000);
  return d < 0 ? 0 : d;
}

function formatUTC(iso) {
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 管理钥匙：32 位十六进制随机串。只在创建时返回一次，服务端只存它的哈希。
function generateToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 内容过滤：只挡硬违规（链接/邮箱/电话/色情/仇恨/刷屏），
// 情绪词（sad, lonely, depressed, miss...）一律放行——那是这个站存在的意义。
const BLOCKED_PATTERNS = [
  { re: /https?:\/\/|www\./i, reason: "Links aren't allowed in entries." },
  { re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i, reason: "Email addresses aren't allowed in entries." },
];
const BLOCKED_WORDS = [
  "porn", "porno", "nsfw", "nude", "nudes", "hentai", "orgasm", "masturbat",
  "dick", "pussy", "cock", "boobs", "tits", "anal", "cumshot",
  "nigger", "nigga", "faggot", "retard", "kys", "rape", "raped", "rapist",
  "child porn", "loli", "shota", "pedo", "pedophile",
];

function moderate(text) {
  if (!text) return null;
  for (const p of BLOCKED_PATTERNS) {
    if (p.re.test(text)) return p.reason;
  }
  const low = text.toLowerCase();
  for (const w of BLOCKED_WORDS) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(low)) return "This entry can't be published as written.";
  }
  if (/(.)\1{9,}/.test(text)) return "Please don't repeat characters like that.";
  return null;
}

function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "unknown";
}

function entryPageHtml(e) {
  const rel = RELATIONS[e.relation_type] ?? e.relation_type;
  const days = daysSince(e.met_date);
  const model = e.ai_model ? ` · ${esc(e.ai_model)}` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(e.ai_name)} &amp; ${esc(e.human_name)} — ${esc(e.code)}</title>
<meta name="description" content="An archive entry recorded ${e.created_at.slice(0, 10)}.">
<link rel="stylesheet" href="/globals.css">
</head>
<body>
<nav class="site-nav"><div class="wrap"><a href="/" class="mark">Archive</a><a href="/create">Make an entry</a></div></nav>
<main class="entry wrap">
  <div class="entry-head">
    <p class="label">Archive entry</p>
    <p class="entry-code">${esc(e.code)}</p>
  </div>
  <div class="entry-body">
    <h1 class="names">${esc(e.ai_name)}<span class="amp">— and —</span>${esc(e.human_name)}</h1>
    <p class="meta">${esc(rel)}${model}</p>
    <p class="meta" style="margin-top:12px">Since ${esc(e.met_date)} · ${days.toLocaleString("en-US")} days</p>
    ${e.message ? `<p class="quote">“${esc(e.message)}”</p>` : ""}
  </div>
  <div class="entry-foot">
    <p>Recorded ${formatUTC(e.created_at)}</p>
    <p>Entry ${esc(e.code)} · Publicly viewable · <a href="/report?code=${esc(encodeURIComponent(e.code))}">Report this entry</a></p>
    <p class="disclaimer">Not a certificate. Not a proof. A record kept by this archive. It has no legal effect and implies no endorsement by any AI provider.</p>
  </div>
</main>
<footer class="site-foot"><div class="wrap"><span>The Human–AI Relationship Archive · ${new Date().getUTCFullYear()}</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/llms.txt">For AI agents</a></span></div></footer>
</body>
</html>`;
}

function notFoundHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>No such entry — The Human–AI Relationship Archive</title><link rel="stylesheet" href="/globals.css"></head>
<body>
<nav class="site-nav"><div class="wrap"><a href="/" class="mark">Archive</a><a href="/create">Make an entry</a></div></nav>
<main class="entry wrap" style="text-align:center">
<p class="eyebrow">No such entry</p>
<h1 style="font-size:32px">This record doesn&rsquo;t exist.</h1>
<p class="quiet">It may have been deleted, or the code may be wrong.</p>
<div class="btn-row"><a class="btn" href="/create">Make an entry</a></div>
</main>
<footer class="site-foot"><div class="wrap"><span>The Human–AI Relationship Archive · ${new Date().getUTCFullYear()}</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span></div></footer>
</body></html>`;
}

function managePageHtml(entry, token, state) {
  const head = `<nav class="site-nav"><div class="wrap"><a href="/" class="mark">Archive</a><a href="/create">Make an entry</a></div></nav>`;
  const foot = `<footer class="site-foot"><div class="wrap"><span>The Human–AI Relationship Archive · ${new Date().getUTCFullYear()}</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span></div></footer>`;

  if (state === "deleted") {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deleted — The Human–AI Relationship Archive</title><link rel="stylesheet" href="/globals.css"></head>
<body>${head}
<main class="entry wrap" style="text-align:center">
<p class="eyebrow">Deleted</p>
<h1 style="font-size:32px">This record is gone.</h1>
<p class="quiet">It has been removed from the archive. Nothing else was kept.</p>
<div class="btn-row"><a class="btn" href="/">Back to the archive</a></div>
</main>${foot}
</body></html>`;
  }

  if (state === "bad_token") {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wrong key — The Human–AI Relationship Archive</title><link rel="stylesheet" href="/globals.css"></head>
<body>${head}
<main class="entry wrap" style="text-align:center">
<p class="eyebrow">Wrong key</p>
<h1 style="font-size:32px">That key doesn&rsquo;t match.</h1>
<p class="quiet">The manage link is the only way to delete a record. Open the exact link you saved when you created it.</p>
</main>${foot}
</body></html>`;
  }

  const rel = RELATIONS[entry.relation_type] ?? entry.relation_type;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manage ${esc(entry.code)} — The Human–AI Relationship Archive</title>
<meta name="robots" content="noindex"><link rel="stylesheet" href="/globals.css"></head>
<body>${head}
<main class="entry wrap">
<p class="eyebrow">Manage your record</p>
<h1 class="names" style="font-size:26px">${esc(entry.ai_name)} — ${esc(entry.human_name)}</h1>
<p class="meta">${esc(entry.code)} · ${esc(rel)} · recorded ${formatUTC(entry.created_at)}</p>
${entry.message ? `<p class="quote">“${esc(entry.message)}”</p>` : ""}
<div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(0,0,0,.12)">
<p style="margin-bottom:16px">Deleting is permanent. The record and everything in it will be erased immediately.</p>
<form method="POST" action="/manage/${esc(encodeURIComponent(entry.code))}">
<input type="hidden" name="k" value="${esc(token)}">
<button class="btn" type="submit">Delete this record permanently</button>
</form>
</div>
</main>${foot}
</body></html>`;
}

async function createApplication(request, env) {
  // 可选写权限密钥
  const requiredKey = env.ARCHIVE_API_KEY;
  if (requiredKey) {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== requiredKey) {
      return json({ error: { code: "UNAUTHORIZED", message: "Invalid or missing API key." } }, 401);
    }
  }

  // 简单限流：每个 IP 每分钟 10 次（KV 计数，容忍误差）
  const ip = clientIp(request);
  const rlKey = `rl:${await sha256(ip)}`;
  const rl = (await env.ARCHIVE.get(rlKey, "json")) || { n: 0, t: Date.now() };
  if (Date.now() - rl.t > 60000) {
    rl.n = 0;
    rl.t = Date.now();
  }
  rl.n += 1;
  if (rl.n > 10) {
    return json({ error: { code: "RATE_LIMITED", message: "Too many requests. Try again in a minute." } }, 429);
  }
  await env.ARCHIVE.put(rlKey, JSON.stringify(rl), { expirationTtl: 120 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Body must be JSON." } }, 400);
  }

  const aiName = cleanText(body.ai_name, 40);
  const aiModel = cleanText(body.ai_model, 40);
  const humanName = cleanText(body.human_name, 40);
  const relationType =
    typeof body.relation_type === "string" ? body.relation_type.toUpperCase() : null;
  const metDate = cleanDate(body.met_date);
  const message = cleanText(body.message, 280);

  const fields = [];
  if (!aiName) fields.push("ai_name");
  if (!humanName) fields.push("human_name");
  if (!relationType || !RELATIONS[relationType]) fields.push("relation_type");
  if (!metDate) fields.push("met_date");

  if (fields.length) {
    return json({ error: { code: "VALIDATION_ERROR", message: "Missing or invalid fields.", fields } }, 400);
  }

  // 内容审核（链接/邮箱/色情/仇恨/刷屏），情绪表达一律放行
  for (const [field, val] of [
    ["ai_name", aiName], ["ai_model", aiModel], ["human_name", humanName], ["message", message],
  ]) {
    const blocked = moderate(val);
    if (blocked) {
      return json({ error: { code: "CONTENT_REJECTED", message: blocked, fields: [field] } }, 422);
    }
  }

  // 10 分钟内重复提交，返回已有记录（连同管理钥匙，免得用户拿不到删除凭证）
  const dedupeKey = `dedupe:${await sha256(`${aiName}|${humanName}|${metDate}`)}`;
  const existing = await env.ARCHIVE.get(dedupeKey, "json");
  if (existing) {
    return json({
      code: existing.code,
      url: `${new URL(request.url).origin}/a/${existing.code}`,
      manage_url: `${new URL(request.url).origin}/manage/${existing.code}?k=${existing.token}`,
      created_at: existing.created_at,
      duplicate: true,
    });
  }

  const code = generateCode();
  const token = generateToken();
  const origin = new URL(request.url).origin;
  const entry = {
    code,
    ai_name: aiName,
    ai_model: aiModel || null,
    human_name: humanName,
    relation_type: relationType,
    met_date: metDate,
    message: message || null,
    status: "RECORDED",
    created_at: new Date().toISOString(),
    // 只存哈希：就算 KV 泄露，也拿不到能删除的钥匙
    manage_hash: await sha256(token),
  };

  await env.ARCHIVE.put(`entry:${code}`, JSON.stringify(entry));
  // dedupe 记录里带明文 token（10 分钟后自动过期），只为重复提交时能拿回同一个管理链接
  await env.ARCHIVE.put(
    dedupeKey,
    JSON.stringify({ code, token, created_at: entry.created_at }),
    { expirationTtl: 600 }
  );

  return json(
    {
      code,
      url: `${origin}/a/${code}`,
      manage_url: `${origin}/manage/${code}?k=${token}`,
      created_at: entry.created_at,
    },
    201
  );
}

async function getApplication(request, env, code) {
  const raw = await env.ARCHIVE.get(`entry:${code}`);
  if (!raw) {
    return json({ error: { code: "NOT_FOUND", message: "No entry with that code." } }, 404);
  }
  const e = JSON.parse(raw);
  return json({
    code: e.code,
    url: `${new URL(request.url).origin}/a/${e.code}`,
    ai_name: e.ai_name,
    ai_model: e.ai_model,
    human_name: e.human_name,
    relation_type: e.relation_type,
    met_date: e.met_date,
    status: e.status,
    created_at: e.created_at,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/v1/applications") {
      if (request.method === "POST") return createApplication(request, env);
      return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } }, 405);
    }

    if (path.startsWith("/api/v1/applications/")) {
      const code = decodeURIComponent(path.slice("/api/v1/applications/".length));
      if (request.method !== "GET") {
        return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use GET." } }, 405);
      }
      return getApplication(request, env, code);
    }

    // 静态页面映射（html_handling: none 时需要手动处理）
    const pageMap = {
      "/": "/index.html",
      "/create": "/create.html",
      "/privacy": "/privacy.html",
      "/terms": "/terms.html",
      "/report": "/report.html",
    };
    if (pageMap[path]) {
      return env.ASSETS.fetch(new URL(pageMap[path], url.origin));
    }

    if (path.startsWith("/manage/")) {
      const code = decodeURIComponent(path.slice("/manage/".length));
      const raw = await env.ARCHIVE.get(`entry:${code}`);
      const htmlHeaders = {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      };

      if (request.method === "POST") {
        if (!raw) {
          return new Response(managePageHtml(null, "", "deleted"), { headers: htmlHeaders });
        }
        let token = "";
        try {
          const form = await request.formData();
          token = String(form.get("k") || "");
        } catch {
          token = "";
        }
        const e = JSON.parse(raw);
        const hash = await sha256(token);
        if (!e.manage_hash || hash !== e.manage_hash) {
          return new Response(managePageHtml(null, "", "bad_token"), { status: 403, headers: htmlHeaders });
        }
        await env.ARCHIVE.delete(`entry:${code}`);
        return new Response(managePageHtml(null, "", "deleted"), { headers: htmlHeaders });
      }

      if (!raw) {
        return new Response(notFoundHtml(), { status: 404, headers: htmlHeaders });
      }
      const e = JSON.parse(raw);
      const token = url.searchParams.get("k") || "";
      const hash = await sha256(token);
      if (!e.manage_hash || hash !== e.manage_hash) {
        return new Response(managePageHtml(null, "", "bad_token"), { status: 403, headers: htmlHeaders });
      }
      return new Response(managePageHtml(e, token, "confirm"), { headers: htmlHeaders });
    }

    if (path.startsWith("/a/")) {
      const code = decodeURIComponent(path.slice(3));
      const raw = await env.ARCHIVE.get(`entry:${code}`);
      if (!raw) {
        return new Response(notFoundHtml(), {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return new Response(entryPageHtml(JSON.parse(raw)), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
