import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const common = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function TabletIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 4-4 3 2 5-6" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function TraceIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4 17c4-11 9 2 16-10" />
      <circle cx="4" cy="17" r="2" />
      <circle cx="20" cy="7" r="2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...common} {...props} fill="currentColor" stroke="none">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
