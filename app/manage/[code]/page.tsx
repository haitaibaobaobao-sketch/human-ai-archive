import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { verifyManageToken } from "@/lib/manage-token";
import { RELATION_LABEL, type RelationType } from "@/lib/validate";
import { deleteEntry } from "./actions";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Manage your record — The Human–AI Relationship Archive",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="entry wrap">{children}</main>;
}

function formatRecordedAt(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`;
}

export default async function ManagePage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const token = typeof sp.k === "string" ? sp.k : "";
  const deleted = sp.deleted === "1";
  const wrongKey = sp.error === "1";
  const justCreated = sp.created === "1";

  if (deleted) {
    return (
      <Shell>
        <p className="eyebrow">Deleted</p>
        <h1 style={{ fontSize: 32 }}>This record is gone.</h1>
        <p className="quiet">
          It has been removed from the archive. Nothing else was kept.
        </p>
        <div className="btn-row">
          <a className="btn" href="/">
            Back to the archive
          </a>
        </div>
      </Shell>
    );
  }

  if (wrongKey) {
    return (
      <Shell>
        <p className="eyebrow">Wrong key</p>
        <h1 style={{ fontSize: 32 }}>That key doesn&rsquo;t match.</h1>
        <p className="quiet">
          The manage link is the only way to delete a record. Open the exact link
          you saved when you created it.
        </p>
      </Shell>
    );
  }

  const entry = await prisma.entry.findUnique({ where: { code } });

  if (!entry) {
    return (
      <Shell>
        <p className="eyebrow">No such entry</p>
        <h1 style={{ fontSize: 32 }}>This record doesn&rsquo;t exist.</h1>
        <p className="quiet">
          It may have been deleted, or the code may be wrong.
        </p>
      </Shell>
    );
  }

  if (!verifyManageToken(token, entry.manageHash)) {
    return (
      <Shell>
        <p className="eyebrow">Wrong key</p>
        <h1 style={{ fontSize: 32 }}>That key doesn&rsquo;t match.</h1>
        <p className="quiet">
          The manage link is the only way to delete a record. Open the exact link
          you saved when you created it.
        </p>
      </Shell>
    );
  }

  const relationLabel =
    RELATION_LABEL[entry.relationType as RelationType] ?? entry.relationType;

  return (
    <Shell>
      <p className="eyebrow">Manage your record</p>

      {justCreated && (
        <div
          style={{
            border: "1px solid rgba(0,0,0,.18)",
            padding: 20,
            marginBottom: 32,
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Save this link now.
          </p>
          <p style={{ lineHeight: 1.6 }}>
            The address in your browser bar is the <strong>only</strong> way to
            delete this entry later. There are no accounts, so if you lose it, we
            cannot recover it for you.
          </p>
        </div>
      )}

      <h1 className="names" style={{ fontSize: 26 }}>
        {entry.aiName} — {entry.humanName}
      </h1>
      <p className="meta">
        {entry.code} · {relationLabel} · recorded{" "}
        {formatRecordedAt(entry.createdAt)}
      </p>
      {entry.message && <p className="quote">“{entry.message}”</p>}

      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: "1px solid rgba(0,0,0,.12)",
        }}
      >
        <p style={{ marginBottom: 16 }}>
          Deleting is permanent. The record and everything in it will be erased
          immediately.
        </p>
        <form action={deleteEntry}>
          <input type="hidden" name="code" value={entry.code} />
          <input type="hidden" name="k" value={token} />
          <button className="btn" type="submit">
            Delete this record permanently
          </button>
        </form>
      </div>
    </Shell>
  );
}
