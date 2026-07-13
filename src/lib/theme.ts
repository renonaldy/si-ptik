export type Theme = "light" | "dark";

const KEY = "ptik_theme";

export function loadTheme(): Theme {
  return (localStorage.getItem(KEY) as Theme) || "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = loadTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
