"use client";

import { useEffect, useState } from "react";

/** Only the scroll border needs the client. Everything else stays server-rendered. */
export function NavShell({ children }: { children: React.ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-bg/85 backdrop-blur-md transition-colors ${
        stuck ? "border-border" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-content)] items-center gap-6 px-6 py-4">
        {children}
      </div>
    </header>
  );
}
