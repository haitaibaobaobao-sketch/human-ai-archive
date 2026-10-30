export default function NotFound() {
  return (
    <main className="entry wrap" style={{ textAlign: "center" }}>
      <p className="eyebrow">No such entry</p>
      <h1 style={{ fontSize: 32 }}>This record doesn&apos;t exist.</h1>
      <p className="quiet">
        It may have been deleted, or the code may be wrong.
      </p>
      <div className="btn-row">
        <a className="btn" href="/create">
          Make an entry
        </a>
      </div>
    </main>
  );
}
