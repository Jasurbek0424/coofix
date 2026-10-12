import { cn } from "@/lib/cn";
import { t } from "@/i18n";

const ARMS = [
  { d: "M22.8,43.2 L34.5,24.3 L56.8,32.3", c: "#fff" },
  { d: "M42.3,23.1 L64.5,23.8 L68.8,47", c: "#171a1b" },
  { d: "M69.5,29.9 L80,49.5 L62,64.8", c: "#fff" },
  { d: "M77.2,56.8 L65.5,75.7 L43.2,67.7", c: "#171a1b" },
  { d: "M57.7,76.9 L35.5,76.2 L31.2,53", c: "#fff" },
  { d: "M30.5,70.1 L20,50.5 L38,35.2", c: "#171a1b" },
];

/** COOFIX hex mark: orange hexagon with the six-chevron pinwheel. */
export function HexMark({ className, spin }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} aria-hidden="true" focusable="false">
      <polygon points="98,50 74,91.6 26,91.6 2,50 26,8.4 74,8.4" fill="#f05a00" />
      <g
        fill="none"
        strokeWidth="7.5"
        strokeLinejoin="miter"
        className={cn(spin && "origin-center transition-transform duration-700 ease-out group-hover:rotate-[60deg]")}
      >
        {ARMS.map((a) => (
          <g key={a.d}>
            <path d={a.d} stroke="#f05a00" strokeWidth="11" />
            <path d={a.d} stroke={a.c} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Lockup: mark + COOFIX wordmark + descriptor. Text uses the display face. */
export function Logo({ className, compact, inverted }: { className?: string; compact?: boolean; inverted?: boolean }) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <HexMark className="size-9 sm:size-10" spin />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.3rem] font-extrabold tracking-[-0.01em] sm:text-[1.45rem]", inverted ? "text-white" : "text-ink")}>
          C<span className="text-brand">OO</span>FIX
        </span>
        {!compact && (
          <span className={cn("mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.2em] sm:block", inverted ? "text-white/60" : "text-muted")}>
            {t("meta.descriptor")}
          </span>
        )}
      </span>
    </span>
  );
}
