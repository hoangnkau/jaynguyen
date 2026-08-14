"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "./icons";

/**
 * No `mounted` state and no effect: both icons are always in the DOM and the
 * dark variant decides which one is visible. That avoids a hydration mismatch,
 * avoids a cascading render, and means the control never flashes or shifts.
 * The label is written to be accurate in either state.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle between light and dark theme"
      className="grid size-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-fg hover:text-fg"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
