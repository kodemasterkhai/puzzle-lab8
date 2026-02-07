import { useMemo, useState } from "react";
import "../index.css";

type Entry = {
  name: string;
  timeMs: number;
  moves: number;
  dateISO: string;
};

type Store = {
  chess: Entry[];
  jigsaw: Entry[];
};

const STORAGE_KEY = "puzzlelab_leaderboard_v1";

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { chess: [], jigsaw: [] };
    const parsed = JSON.parse(raw) as Store;
    return {
      chess: Array.isArray(parsed.chess) ? parsed.chess : [],
      jigsaw: Array.isArray(parsed.jigsaw) ? parsed.jigsaw : [],
    };
  } catch {
    return { chess: [], jigsaw: [] };
  }
}

function clearStore() {
  localStorage.removeItem(STORAGE_KEY);
}

function fmtTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function sortEntries(entries: Entry[]) {
  return entries
    .slice()
    .sort((a, b) => (a.timeMs !== b.timeMs ? a.timeMs - b.timeMs : a.moves - b.moves))
    .slice(0, 50);
}

function Row({ e, i }: { e: Entry; i: number }) {
  return (
    <tr>
      <td>{i + 1}</td>
      <td>{e.name}</td>
      <td>{fmtTime(e.timeMs)}</td>
      <td>{e.moves}</td>
      <td>{new Date(e.dateISO).toLocaleString()}</td>
    </tr>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState<"chess" | "jigsaw">("chess");
  const [tick, setTick] = useState(0);

  const store = useMemo(() => loadStore(), [tick]);
  const entries = tab === "chess" ? sortEntries(store.chess) : sortEntries(store.jigsaw);

  return (
    <div className="container">
      <div className="heroCard">
        <h1 className="heroTitle">Leaderboard</h1>
        <p className="heroSub">
          Best runs by <b>time</b> first, then <b>moves</b>. Stored locally on your device for now.
        </p>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div className="actions">
            <button className="btn" onClick={() => setTab("chess")} disabled={tab === "chess"}>
              Chess
            </button>
            <button className="btn" onClick={() => setTab("jigsaw")} disabled={tab === "jigsaw"}>
              Jigsaw
            </button>
          </div>

          <div className="actions">
            <button
              className="btn btnGhost"
              onClick={() => {
                clearStore();
                setTick((t) => t + 1);
              }}
            >
              Clear local scores
            </button>
          </div>
        </div>

        <div className="notice">
          <div className="noticeTitle">Note</div>
          <div className="noticeSmall">
            Leaderboard is local for now (no server). Next upgrade is cloud leaderboard.
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.8 }}>
                <th style={{ padding: "10px 6px" }}>#</th>
                <th style={{ padding: "10px 6px" }}>Name</th>
                <th style={{ padding: "10px 6px" }}>Time</th>
                <th style={{ padding: "10px 6px" }}>Moves</th>
                <th style={{ padding: "10px 6px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td style={{ padding: 12, opacity: 0.7 }} colSpan={5}>
                    No scores yet. Finish a puzzle and submit your name.
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => <Row key={`${e.name}-${e.dateISO}-${i}`} e={e} i={i} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}