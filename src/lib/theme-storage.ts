/** Khóa localStorage + script inline — tránh lệch giữa SSR và client. */
export const THEME_STORAGE_KEY = "truongson-theme";

export type ThemeMode = "light" | "dark";

/** Chạy trong <head> trước paint để tránh nháy theme (mặc định: light). */
export function getThemeBlockingScript(): string {
  const k = JSON.stringify(THEME_STORAGE_KEY);
  return `!function(){try{var k=${k},t=localStorage.getItem(k);if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}catch(e){}}();`;
}
