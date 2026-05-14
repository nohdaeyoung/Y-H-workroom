export default function GlobalLoading() {
  return (
    <div
      className="container narrow fade-in"
      style={{
        maxWidth: 720,
        padding: "60px 0",
        textAlign: "center",
        color: "var(--ink-3)",
      }}
    >
      <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
        loading
      </div>
      <div className="serif" style={{ marginTop: 8, fontSize: 16 }}>
        잠깐만요…
      </div>
    </div>
  );
}
