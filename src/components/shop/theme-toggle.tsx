"use client";

import { useTheme } from "@/components/providers/theme-provider";

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={12} cy={12} r={4} />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ShopThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground shadow-sm transition hover:bg-card hover:shadow-md active:scale-[0.97] dark:hover:bg-white/10"
    >
      <span
        className={`transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"} absolute`}
      >
        <IconSun className="text-amber-400" />
      </span>
      <span
        className={`transition-opacity duration-300 ${isDark ? "opacity-0" : "opacity-100"} absolute`}
      >
        <IconMoon className="text-[color:var(--primary)]" />
      </span>
    </button>
  );
}
