import React, { createContext, useContext, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;

  // This is the key: baseline must exist even if nothing wraps you
  baseline: boolean;
  setBaseline: (v: boolean) => void;
};

// ✅ NEVER NULL DEFAULT — prevents "Cannot destructure baseline ... is null"
const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  setMode: () => {},
  toggle: () => {},

  baseline: true,
  setBaseline: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [baseline, setBaseline] = useState<boolean>(true);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      setMode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      baseline,
      setBaseline,
    };
  }, [mode, baseline]);

  // Optional: apply a class to body so your CSS can react
  React.useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}