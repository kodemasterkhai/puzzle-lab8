import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error; info?: React.ErrorInfo };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // also logs in console
    console.error("App crashed:", error, info);
    this.setState({ info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: "100vh", padding: 20, fontFamily: "system-ui", color: "white" }}>
        <h1 style={{ marginTop: 0 }}>App crashed ✅ (this is good)</h1>
        <p style={{ opacity: 0.85 }}>
          Your app was blank purple because a component threw an error. Paste the error text below to me.
        </p>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <b>Error:</b>
          {"\n"}
          {String(this.state.error?.message || this.state.error || "Unknown error")}
          {"\n\n"}
          <b>Stack:</b>
          {"\n"}
          {String(this.state.error?.stack || "No stack")}
        </div>

        <p style={{ marginTop: 14, opacity: 0.85 }}>
          Also open DevTools Console and screenshot the first red error.
        </p>
      </div>
    );
  }
}