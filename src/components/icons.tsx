type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowRight({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.5} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Download({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function Sun({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function Moon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export const capabilityIcons = {
  hardware: ({ className }: IconProps) => (
    <svg {...base} className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  network: ({ className }: IconProps) => (
    <svg {...base} className={className}>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01M6 18h.01" />
    </svg>
  ),
  security: ({ className }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M12 2l8 4v6c0 5-3.4 8.9-8 10-4.6-1.1-8-5-8-10V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  finance: ({ className }: IconProps) => (
    <svg {...base} className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  ),
};
