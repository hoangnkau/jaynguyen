"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Light is the default (locked in the blueprint). `attribute="data-theme"`
 * matches the @custom-variant in globals.css. enableSystem is off deliberately:
 * the site is employer-facing and should look the same to everyone on first
 * visit, with dark available as an explicit choice.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
