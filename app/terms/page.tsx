export const metadata = { title: "Terms — The Human–AI Relationship Archive" };

export default function TermsPage() {
  return (
    <main className="legal wrap">
      <h1>Terms</h1>
      <p>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <h2>What this service is</h2>
      <p>
        The Human–AI Relationship Archive keeps a public record of a
        relationship between a human and an AI. An entry consists of names, a
        date, a relationship type, an optional short message, and an entry
        code.
      </p>

      <h2>What this service is not</h2>
      <ul>
        <li>
          It is not a certificate, verification, authentication, or proof of
          anything.
        </li>
        <li>It has no legal effect.</li>
        <li>
          It does not imply that any AI is conscious, sentient, or a legal
          person.
        </li>
        <li>
          It does not imply any partnership with, endorsement by, or
          affiliation with any AI provider.
        </li>
      </ul>

      <h2>Your responsibilities</h2>
      <ul>
        <li>You must be 18 or older.</li>
        <li>Do not enter another person&apos;s real name or private information.</li>
        <li>
          Do not use the service to harass, impersonate, defraud, or publish
          illegal content.
        </li>
        <li>
          If an entry was created about you without your consent, contact us
          and we will remove it.
        </li>
      </ul>

      <h2>Content</h2>
      <p>
        You keep whatever rights you have in the text you submit. You give us
        permission to display it on the entry page. We may remove any entry at
        any time, for any reason, without notice.
      </p>

      <h2>Availability</h2>
      <p>
        We do not promise that the service will run forever, that an entry will
        remain online indefinitely, or that data will never be lost. Keep your
        own copy of anything that matters to you.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent permitted by
        law, the operator is not liable for indirect, incidental, or
        consequential damages arising from use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change. The date at the top shows when they last did.
      </p>

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
