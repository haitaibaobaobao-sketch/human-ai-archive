import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCode } from "@/lib/code";
import { rateLimit } from "@/lib/rate-limit";
import {
  cleanText,
  cleanDate,
  cleanRelationType,
  RELATION_TYPES,
} from "@/lib/validate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "local";
}

function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Invalid or missing API key." } },
    { status: 401 }
  );
}

export async function POST(req: Request) {
  // 可选的写权限密钥：设置了环境变量才校验
  const requiredKey = process.env.ARCHIVE_API_KEY;
  if (requiredKey) {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== requiredKey) return unauthorized();
  }

  // 限流：每 IP 每分钟 10 次
  if (!rateLimit(`create:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Try again in a minute.",
        },
      },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Body must be JSON." } },
      { status: 400 }
    );
  }

  const aiName = cleanText(body.ai_name, 40);
  const humanName = cleanText(body.human_name, 40);
  const aiModel = cleanText(body.ai_model, 40);
  const relationType = cleanRelationType(body.relation_type);
  const metDate = cleanDate(body.met_date);
  const message = cleanText(body.message, 280);

  const missing: string[] = [];
  if (!aiName) missing.push("ai_name");
  if (!humanName) missing.push("human_name");
  if (!relationType) missing.push("relation_type (one of " + RELATION_TYPES.join(", ") + ")");
  if (!metDate) missing.push("met_date (YYYY-MM-DD)");

  if (missing.length) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing or invalid fields.",
          fields: missing,
        },
      },
      { status: 400 }
    );
  }

  // 十分钟内相同内容的重复提交，直接返回已有记录
  const recent = await prisma.entry.findFirst({
    where: {
      aiName: aiName!,
      humanName: humanName!,
      metDate: metDate!,
      createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    return NextResponse.json(
      {
        code: recent.code,
        url: `${SITE_URL}/a/${recent.code}`,
        created_at: recent.createdAt.toISOString(),
        duplicate: true,
      },
      { status: 200 }
    );
  }

  const code = generateCode();
  const entry = await prisma.entry.create({
    data: {
      code,
      aiName: aiName!,
      aiModel,
      humanName: humanName!,
      relationType: relationType!,
      metDate: metDate!,
      message,
    },
  });

  return NextResponse.json(
    {
      code: entry.code,
      url: `${SITE_URL}/a/${entry.code}`,
      created_at: entry.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
