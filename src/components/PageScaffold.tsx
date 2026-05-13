type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  phase: string;
};

export default function PageScaffold({ icon, title, subtitle, phase }: Props) {
  return (
    <div
      className="container narrow fade-in center"
      style={{ paddingTop: 80, paddingBottom: 80 }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h1 className="page-title" style={{ fontSize: 32 }}>
        {title}
      </h1>
      {subtitle && (
        <div
          className="serif"
          style={{ color: "var(--ink-2)", marginTop: 6 }}
        >
          {subtitle}
        </div>
      )}
      <div className="divider-dot" />
      <div
        className="card-flat"
        style={{
          display: "inline-block",
          padding: "16px 28px",
          background: "var(--paper-2)",
          border: "1px dashed var(--line)",
        }}
      >
        <span className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          {phase}에서 만나요
        </span>
      </div>
    </div>
  );
}
