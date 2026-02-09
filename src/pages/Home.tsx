import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />

      <div style={{ minHeight: "100vh", padding: 24, color: "white" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: 28,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.07)",
          }}
        >
          <h1 style={{ fontSize: 30, marginTop: 0 }}>Puzzle Lab 8</h1>
          <p style={{ opacity: 0.85 }}>
            Built by <b>@8khaidao</b> — improving every single day.
          </p>
        </div>
      </div>
    </>
  );
}