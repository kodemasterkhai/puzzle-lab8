import NavBar from "../components/NavBar";

export default function Leaderboard() {
  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", padding: 24, color: "white" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>🏆 Leaderboard</h1>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            🚧 Coming soon… (name + time + moves)
          </div>
        </div>
      </div>
    </>
  );
}