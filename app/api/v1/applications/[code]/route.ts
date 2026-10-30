import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ code: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(_req: Request, { params }: Params) {
  const { code } = await params;

  const entry = await prisma.entry.findUnique({ where: { code } });

  if (!entry || entry.status === "HIDDEN") {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No entry with that code." } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    code: entry.code,
    url: `${SITE_URL}/a/${entry.code}`,
    ai_name: entry.aiName,
    ai_model: entry.aiModel,
    human_name: entry.humanName,
    relation_type: entry.relationType,
    met_date: entry.metDate,
    status: entry.status,
    created_at: entry.createdAt.toISOString(),
  });
}
