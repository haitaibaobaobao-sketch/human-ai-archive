import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { daysSince, RELATION_LABEL, type RelationType } from "@/lib/validate";

type Props = { params: Promise<{ code: string }> };

async function getEntry(code: string) {
  const entry = await prisma.entry.findUnique({ where: { code } });
  if (!entry || entry.status === "HIDDEN") return null;
  return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const entry = await getEntry(code);
  if (!entry) return { title: "Entry not found" };

  return {
    title: `${entry.aiName} & ${entry.humanName} — ${entry.code}`,
    description: `An archive entry recorded ${entry.createdAt
      .toISOString()
      .slice(0, 10)}.`,
    robots: { index: true, follow: true },
  };
}

function formatRecordedAt(date: Date): string {
  const iso = date.toISOString(); // 2026-10-30T13:14:07.000Z
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`;
}

export default async function EntryPage({ params }: Props) {
  const { code } = await params;
  const entry = await getEntry(code);
  if (!entry) notFound();

  const relationLabel =
    RELATION_LABEL[entry.relationType as RelationType] ?? entry.relationType;
  const days = daysSince(entry.metDate);

  return (
    <main className="entry wrap">
      <div className="entry-head">
        <p className="label">Archive entry</p>
        <p className="entry-code">{entry.code}</p>
      </div>

      <div className="entry-body">
        <h1 className="names">
          {entry.aiName}
          <span className="amp">— and —</span>
          {entry.humanName}
        </h1>

        <p className="meta">
          {relationLabel}
          {entry.aiModel ? ` · ${entry.aiModel}` : ""}
        </p>

        <p className="meta" style={{ marginTop: 12 }}>
          Since {entry.metDate} · {days.toLocaleString("en-US")} days
        </p>

        {entry.message && <p className="quote">“{entry.message}”</p>}
      </div>

      <div className="entry-foot">
        <p>Recorded {formatRecordedAt(entry.createdAt)}</p>
        <p>
          Entry {entry.code} · Publicly viewable ·{" "}
          <a href={`/report?code=${encodeURIComponent(entry.code)}`}>
            Report this entry
          </a>
        </p>
        <p className="disclaimer">
          Not a certificate. Not a proof. A record kept by this archive. It has
          no legal effect and implies no endorsement by any AI provider.
        </p>
      </div>
    </main>
  );
}
