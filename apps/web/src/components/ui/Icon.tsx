import type { SVGProps } from "react";

/** Minimal stroke icon set (24px grid, 1.75 stroke). Decorative by default (aria-hidden). */
const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20.5" r="1.25" /><circle cx="17.5" cy="20.5" r="1.25" /></>,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 3.7 4 7.1 4c2 0 3.6 1.1 4.9 2.9C13.3 5.1 14.9 4 16.9 4c3.4 0 5.5 3.2 4.3 6.6C19.5 15.4 12 20 12 20Z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  compare: <path d="M8 4v16M16 4v16M4 8h8M12 16h8" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /><path d="M10 11v5.5M14 11v5.5" /></>,
  truck: <><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3.5 3.5v3h-7.5" /><circle cx="6.5" cy="17.5" r="1.75" /><circle cx="17" cy="17.5" r="1.75" /></>,
  store: <><path d="M4 9.5V20h16V9.5M3 9.5 5 4h14l2 5.5a2.6 2.6 0 0 1-4.5 1.6A2.7 2.7 0 0 1 12 11a2.7 2.7 0 0 1-4.5.1A2.6 2.6 0 0 1 3 9.5Z" /><path d="M9.5 20v-5h5v5" /></>,
  shield: <><path d="M12 3 5 6v5.5c0 4.3 3 8 7 9.5 4-1.5 7-5.2 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5.5A1.5 1.5 0 0 1 4 17.5V14ZM20 14h-3v5h1.5a1.5 1.5 0 0 0 1.5-1.5V14Z" /><path d="M17 19c0 1.5-2 2-5 2" /></>,
  phone: <path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.1A1.5 1.5 0 0 1 5 3.5Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  mapPin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10" r="2.4" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  sort: <path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8.5 20h7M12 16v4" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M4 4l16 16M10.6 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.4M6.5 7.6C4 9.3 2.5 12 2.5 12S6 18.5 12 18.5c1.7 0 3.2-.5 4.5-1.2" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  package: <><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M4 7l8 4 8-4M12 11v10M8 5l8 4" /></>,
  alert: <><path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4.5M12 17.2v.3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.2" /></>,
  logout: <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  tag: <><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z" /><circle cx="8" cy="8" r="1.5" /></>,
  bolt: <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />,
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18" /><path d="M8 8h3M8 12h3M8 16h3" /></>,
  drill: <><path d="M3 6.5h11.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H11l-1.5 6.5a1.5 1.5 0 0 1-1.5 1.2H6.5a1 1 0 0 1-1-1.2L7 11.5H3Z" /><path d="M16.5 8h2.5M19 7v2.4h2.5" /></>,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  telegram: <path d="m21 4.5-3 15.2c-.2 1-1 1.3-1.8.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L5.9 13.7l-4.5-1.4c-1-.3-1-1 .2-1.5l17.7-6.8c.8-.3 1.6.2 1.7.5Z" />,
  vk: <path d="M3 7h3.3c.2 0 .4.1.5.4.7 1.9 2 4.3 3 4.7V7.6c0-.3.2-.6.6-.6H14c.3 0 .5.2.5.5v3.6c.9-.2 2.4-2.4 3.1-3.9a.6.6 0 0 1 .6-.3h3c.4 0 .6.4.5.7-.5 1.6-2.7 4.2-2.7 4.2s2.2 2.1 2.9 3.6c.2.4-.1.8-.5.8h-3.2a.9.9 0 0 1-.7-.3c-.6-.8-1.5-2-2.4-2.3v2c0 .3-.3.6-.6.6h-1.3C8.6 16.2 4.3 12 3 7.6c-.1-.3.1-.6.4-.6Z" />,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.3 6.7v.1" /></>,
} as const;

export type IconName = keyof typeof paths;

const filled = new Set<IconName>(["telegram", "vk"]);

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Provide for meaningful standalone icons; omitted → aria-hidden. */
  label?: string;
  fill?: string;
}

export function Icon({ name, label, className, fill, strokeWidth = 1.75, ...rest }: IconProps) {
  const isFilled = filled.has(name);
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={fill ?? (isFilled ? "currentColor" : "none")}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-5"}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
