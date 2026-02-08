import { useMemo, useState } from "react";

type LeaderEntry = {
  dayNumber: number;
  name: string;
  seconds: number;
  moves: number;
  solvedAtISO: string;
};

const LS_LEADERBOARD = "pl_daily_leaderboard_v1";

function readLeaderboard(): LeaderEntry[] {
  try {
    const raw = localStorage.getItem(LS_LEADERBOARD);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as LeaderEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(rows: LeaderEntry[]) {
  localStorage.setItem(LS_LEADERBOARD, JSON.stringify(rows));
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year: "2-digit", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Leaderboard() {
  const [mode, setMode] = useState<"best" | "recent">("best");
  const [confirmClear, setConfirmClear] = useState(false);

  const all = useMemo(() => readLeaderboard(), []);
  const rows = useMemo(() => {
    const arr = readLeaderboard();
    if (mode === "recent") {
      return arr
        .slice()
        .sort((a, b) => (a.solvedAtISO < b.solvedAtISO ? 1 : -1))
        .slice(0, 50);
    }
    return arr.slice().sort((a, b) => a.seconds - b.seconds || a.moves - b.moves).slice(0, 50);
  }, [mode, confirmClear]);

  const stats = useMemo(() => {
    const arr = readLeaderboard();
    const total = arr.length;
    const best = arr.length ? arr.slice().sort((a, b) => a.seconds - b.seconds || a.moves - b.moves)[0] : null;
    const you = (localStorage.getItem("pl_name_v1") || "").trim().toLowerCase();
    const yourBest = you
      ? arr
          .filter((e) => e.name.trim().toLowerCase() === you)
          .slice()
          .sort((a, b) => a.seconds - b.seconds || a.moves - b.moves)[0] ?? null
      : null;

    return { total, best, yourBest, you };
  }, [mode, confirmClear, all]);

  function clearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    writeLeaderboard([]);
    setConfirmClear(false);
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="glassCard">
          <h1 className="h1">Leaderboard</h1>
          <p className="muted">
            Best scores across all daily puzzles (stored locally on this device for now).
          </p>

          {/* stats */}
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 950 }}>Total runs: {stats.total}</div>
              <div style={{ fontWeight: 900, opacity: 0.9 }}>
                Fastest: {stats.best ? `${stats.best.seconds}s • ${stats.best.moves} moves (${stats.best.name})` : "—"}
              </div>
            </div>

            {stats.yourBest ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 950 }}>Your best</div>
                <div style={{ fontWeight: 900, opacity: 0.9 }}>
                  {stats.yourBest.seconds}s • {stats.yourBest.moves} moves (Day {stats.yourBest.dayNumber})
                </div>
              </div>
            ) : null}
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <div className="glassCard" style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <button onClick={() => setMode("best")} style={btn}>
                  Best 🏆
                </button>
                <button onClick={() => setMode("recent")} style={btn}>
                  Recent 🕒
                </button>
                <button onClick={clearAll} style={btn}>
                  {confirmClear ? "Click again to CLEAR" : "Clear (testing)"}
                </button>
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {rows.length === 0 ? (
                  <div className="muted" style={{ textAlign: "center" }}>
                    No scores yet. Solve today’s puzzle and submit your name 😈
                  </div>
                ) : (
                  rows.map((e, i) => (
                    <div
                      key={`${e.solvedAtISO}-${i}`}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.04)",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        #{i + 1} {e.name}{" "}
                        <span style={{ opacity: 0.55 }}>
                          • Day {e.dayNumber} • {formatDate(e.solvedAtISO)}
                        </span>
                      </div>
                      <div style={{ opacity: 0.9, fontWeight: 900 }}>
                        {e.seconds}s • {e.moves} moves
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="muted" style={{ marginTop: 12 }}>
                Next upgrade: Supabase online leaderboard so everyone shares one table.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 950,
  cursor: "pointer",
};