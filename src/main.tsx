import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

window.addEventListener("error", (e) => {
  document.body.innerHTML =
    `<pre style="padding:16px;font-family:ui-monospace,Menlo,monospace;color:white;background:#0b1020;">
Runtime Error:
${String(e.message || e.error || e)}
</pre>`;
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);