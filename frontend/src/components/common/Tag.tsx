import { cn } from "@/lib/utils";
import type { Region, Tier } from "@/types/ggwp";

export type TagTone = "muted" | "ghost" | "red" | "blue" | "redline";

const toneClasses: Record<TagTone, string> = {
  muted: "bg-white/[0.05] text-ink-2",
  ghost: "bg-transparent text-ink-2 border border-line-2",
  red: "bg-red/[0.13] text-red-dim border border-red/30",
  blue: "bg-blue/[0.14] text-blue-dim border border-blue/[0.34]",
  redline: "bg-transparent text-red border border-red/40",
};

export function Tag({
  children,
  tone = "muted",
  className,
  style,
}: {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-[5px] px-[7px] py-[3px] font-mono-ggwp text-[10px] font-semibold uppercase leading-none tracking-[0.1em]",
        toneClasses[tone],
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  const tone: TagTone = tier === "S" ? "red" : tier === "A" ? "blue" : "muted";
  return <Tag tone={tone}>T{tier}</Tag>;
}

export function RegionTag({ region }: { region: Region }) {
  return <Tag tone="ghost">{region === "INTL" ? "INT'L" : region}</Tag>;
}
