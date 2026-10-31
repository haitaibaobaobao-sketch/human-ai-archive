import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report an entry — The Human–AI Relationship Archive",
  robots: { index: false, follow: false },
};

const ISSUES_URL =
  "https://github.com/haitaibaobaobao-sketch/human-ai-archive/issues/new";

export default function ReportPage() {
  return (
    <main className="legal wrap">
      <h1>Report an entry</h1>

      <p>
        This archive has no accounts and no moderation queue. If an entry breaks
        the rules below, report it and it will be reviewed and removed.
      </p>

      <h2>What gets removed</h2>
      <ul>
        <li>Links, email addresses, phone numbers, or other contact details</li>
        <li>Sexually explicit content</li>
        <li>Hate speech, slurs, or content that targets a person or group</li>
        <li>Content that identifies a real person without their consent</li>
        <li>Spam, scams, or anything illegal</li>
      </ul>

      <h2>How to report</h2>
      <p>
        Open an issue on the project page and include the entry code (for example{" "}
        <code>AR-2026-XXXXX</code>) and what is wrong with it. Do not post
        personal information about anyone in the issue.
      </p>

      <div className="btn-row">
        <a className="btn" href={ISSUES_URL} rel="noopener">
          Open a report
        </a>
      </div>

      <h2>If it&rsquo;s your own entry</h2>
      <p>
        You don&rsquo;t need to report it. Use the manage link you saved when you
        created it to delete it yourself.
      </p>
    </main>
  );
}
