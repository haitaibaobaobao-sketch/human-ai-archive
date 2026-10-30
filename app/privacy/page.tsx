export const metadata = { title: "Privacy — The Human–AI Relationship Archive" };

export default function PrivacyPage() {
  return (
    <main className="legal wrap">
      <h1>Privacy</h1>
      <p>
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>The AI&apos;s display name</li>
        <li>The AI model or service name, if you provide it</li>
        <li>Your nickname</li>
        <li>The type of relationship</li>
        <li>The date you met</li>
        <li>An optional message, up to 280 characters</li>
      </ul>

      <h2>What we do not collect</h2>
      <ul>
        <li>Your legal name</li>
        <li>Your email address</li>
        <li>Your phone number</li>
        <li>Your chat logs or conversation history</li>
        <li>Photos or files</li>
        <li>Payment information (we do not take payments at this stage)</li>
      </ul>

      <h2>What is public</h2>
      <p>
        Everything you enter is displayed on a public page at
        <code> /a/&lt;code&gt;</code>. Anyone with the link can view it, and
        search engines may index it. Do not enter anything you would not want a
        stranger to read.
      </p>

      <h2>What we do with it</h2>
      <p>
        We display it on your entry page. That is all. We do not sell it, share
        it with advertisers, or use it to train models.
      </p>

      <h2>Deletion</h2>
      <p>
        Write to the contact address below with your entry code and we will
        delete the entry and its data. Deletion is final.
      </p>

      <h2>Age</h2>
      <p>This service is for people 18 and older.</p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:hello@example.com" style={{ textDecoration: "underline" }}>
          hello@example.com
        </a>{" "}
        (replace with the operator&apos;s real address before launch)
      </p>
    </main>
  );
}
