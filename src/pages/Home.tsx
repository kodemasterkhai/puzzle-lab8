import "./home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="homeCard">
        <h1>Puzzle Lab</h1>
        <p>Hello 👋 This is an ongoing project — enjoy the show ✨</p>

        <div className="suggestionsCard">
          <h2>Got an improvement idea? 💡</h2>
          <input placeholder="Name (optional)" />
          <textarea placeholder="Your suggestion..." rows={4}></textarea>
          <button>Send suggestion 🚀</button>
        </div>
      </div>
    </div>
  );
}