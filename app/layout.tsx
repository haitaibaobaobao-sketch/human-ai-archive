import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Human–AI Relationship Archive",
  description:
    "A public collection of entries about relationships between humans and AI companions. Not a certificate. Not a proof. A record.",
  openGraph: {
    title: "The Human–AI Relationship Archive",
    description:
      "A public collection of entries about relationships between humans and AI companions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="site-nav">
          <div className="wrap">
            <a href="/" className="mark">
              Archive
            </a>
            <a href="/create">Make an entry</a>
          </div>
        </nav>
        {children}
        <footer className="site-foot">
          <div className="wrap">
            <span>
              The Human–AI Relationship Archive ·{" "}
              {new Date().getFullYear()}
            </span>
            <span>
              <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{" "}
              <a href="/llms.txt">For AI agents</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
