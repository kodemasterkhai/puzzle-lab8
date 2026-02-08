export default function Home() {
  return (
    <div className="page">
      <div className="shell">
        <div className="glassCard">
          <h1 className="h1">Puzzle Lab</h1>
          <p className="muted">
            Daily chess puzzles, a London sliding puzzle, and more coming.
          </p>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontWeight: 950 }}>Built by @8khaidao</div>
              <div className="muted" style={{ marginTop: 6 }}>
                This is a project in progress — I’m improving it every day.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}