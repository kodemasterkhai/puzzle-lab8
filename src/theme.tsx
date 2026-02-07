import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeName = "Amethyst" | "Cyan" | "Sunset" | "Emerald" | "Mono";

type ThemeVars = {
  "--accent": string;
  "--accentSoft": string;
  "--hintFrom": string;
  "--hintTo": string;
};

const THEMES: Record<ThemeName, ThemeVars> = {
  Amethyst: {
    "--accent": "rgba(180, 160, 255, 0.95)",
    "--accentSoft": "rgba(180, 160, 255, 0.16)",
    "--hintFrom": "rgba(180, 160, 255, 0.95)",
    "--hintTo": "rgba(120, 255, 190, 0.95)",
  },
  Cyan: {
    "--accent": "rgba(80, 200, 255, 0.95)",
    "--accentSoft": "rgba(80, 200, 255, 0.16)",
    "--hintFrom": "rgba(80, 200, 255, 0.95)",
    "--hintTo": "rgba(255, 220, 120, 0.95)",
  },
  Sunset: {
    "--accent": "rgba(255, 140, 120, 0.95)",
    "--accentSoft": "rgba(255, 140, 120, 0.16)",
    "--hintFrom": "rgba(255, 140, 120, 0.95)",
    "--hintTo": "rgba(180, 160, 255, 0.95)",
  },
  Emerald: {
    "--accent": "rgba(120, 255, 190, 0.95)",
    "--accentSoft": "rgba(120, 255, 190, 0.16)",
    "--hintFrom": "rgba(120, 255, 190, 0.95)",
    "--hintTo": "rgba(80, 200, 255, 0.95)",
  },
  Mono: {
    "--accent": "rgba(255, 255, 255, 0.92)",
    "--accentSoft": "rgba(255, 255, 255, 0.10)",
    "--hintFrom": "rgba(255, 255, 255, 0.92)",
    "--hintTo": "rgba(255, 255, 255, 0.92)",
  },
};

type ThemeCtx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: ThemeName[];
};

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "puzzlelab_theme_v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    return saved && saved in THEMES ? saved : "Amethyst";
  });

  const themes = useMemo(() => Object.keys(THEMES) as ThemeName[], []);

  function setTheme(t: ThemeName) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  useEffect(() => {
    const vars = THEMES[theme];
    const root = document.documentElement;
    (Object.keys(vars) as Array<keyof ThemeVars>).forEach((k) => {
      root.style.setProperty(k, vars[k]);
    });
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, themes }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}