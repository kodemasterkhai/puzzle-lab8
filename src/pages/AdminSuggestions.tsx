import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Suggestion = {
  id: string;
  created_at: string;
  name: string | null;
  message: string;
  page: string | null;
};

export default function AdminSuggestions() {
  // Change this to something only you know (and don’t post it publicly)
  const ADMIN_PASS = "khaiadmin";

  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const savedOk = useMemo(() => {
    try {
      return localStorage.getItem("pl8_admin_ok") === "1";
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (savedOk) setAuthed(true);
  }, [savedOk]);

  useEffect(() => {
    if (authed) fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function fetchSuggestions() {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("suggestions")
      .select("id, created_at, name, message, page")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setSuggestions((data as Suggestion[]) || []);
    setLoading(false);
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass.trim() === ADMIN_PASS) {
      setAuthed(true);
      try {
        localStorage.setItem("pl8_admin_ok", "1");
      } catch {}
      setPass("");
    } else {
      setErr("Wrong password 😭");
    }
  }

  function logout() {
    setAuthed(false);
    setSuggestions([]);
    setErr(null);
    try {
      localStorage.removeItem("pl8_admin_ok");
    } catch {}
  }

  if (!authed) {
    return (
      <div style={{ padding: 20, maxWidth: 560 }}>
        <h1>Admin 🔒</h1>
        <p style={{ opacity: 0.75, lineHeight: 1.6 }}>
          This page is locked. If you’re not me… nice try 😭
        </p>

        <form onSubmit={login} style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Admin password"
            type="password"
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.22)",
              color: "rgba(255,255,255,0.92)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              width: "fit-content",
              padding: "11px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(139,92,246,0.18)",
              color: "rgba(255,255,255,0.92)",
              cursor: "pointer",
            }}
          >
            Unlock 🚪
          </button>

          {err && <div style={{ opacity: 0.95 }}>{err}</div>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Suggestions 💡</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchSuggestions}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.92)",
              cursor: "pointer",
            }}
          >
            Refresh 🔄
          </button>

          <button
            onClick={logout}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,80,80,0.16)",
              color: "rgba(255,255,255,0.92)",
              cursor: "pointer",
            }}
          >
            Lock 🔒
          </button>
        </div>
      </div>

      <p style={{ opacity: 0.7, marginTop: 10 }}>
        Total: <b>{suggestions.length}</b>
      </p>

      {loading && <div style={{ opacity: 0.8 }}>Loading…</div>}
      {err && <div style={{ opacity: 0.95 }}>{err}</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {suggestions.map((s) => (
          <div
            key={s.id}
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.65 }}>
              {new Date(s.created_at).toLocaleString()}
              {s.page ? ` • ${s.page}` : ""}
            </div>

            <div style={{ marginTop: 6 }}>
              <b>{s.name || "Anonymous"}</b>
            </div>

            <div style={{ marginTop: 8, lineHeight: 1.55 }}>{s.message}</div>
          </div>
        ))}

        {!loading && suggestions.length === 0 && (
          <div style={{ opacity: 0.8 }}>No suggestions yet.</div>
        )}
      </div>
    </div>
  );
}