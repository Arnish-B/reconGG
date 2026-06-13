"use client";

import { Tag, TierBadge, RegionTag } from "@/components/common/Tag";
import { LiveDot } from "@/components/common/LiveDot";
import { fmt } from "@/lib/fmt";
import { cn } from "@/lib/utils";
import type { Match, Tournament } from "@/types/ggwp";
import { ExpandedTournament } from "./Bracket";

function statusInfo(t: Tournament) {
  if (t.status === "live") return { bar: "bg-red shadow-[0_0_14px_var(--redglow)]", chip: "", label: "LIVE" };
  if (t.status === "upcoming")
    return { bar: "bg-blue", chip: "bg-blue/[0.14] text-blue-dim", label: "UPCOMING" };
  return { bar: "bg-white/[0.12]", chip: "bg-white/[0.05] text-ink-3", label: "COMPLETED" };
}

export function TournamentRow({
  t,
  open,
  onToggle,
  onOpenMatch,
}: {
  t: Tournament;
  open: boolean;
  onToggle: () => void;
  onOpenMatch: (m: Match) => void;
}) {
  const s = statusInfo(t);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-ggwp border border-line bg-surface transition hover:border-line-2",
        open && "border-red/[0.32] shadow-[0_16px_44px_rgba(0,0,0,0.4)]",
      )}
    >
      <button
        className="grid w-full grid-cols-[3px_22px_88px_1fr_auto_auto_auto_auto] items-center gap-[15px] py-[var(--row-pad)] pr-[18px] text-left [--row-pad:15px]"
        onClick={onToggle}
      >
        <span className={cn("h-full w-[3px] self-stretch", s.bar)} />
        <span
          className={cn(
            "text-center font-mono-ggwp text-[17px] transition",
            open ? "text-red" : "text-ink-3",
          )}
        >
          {open ? "–" : "+"}
        </span>
        <span className="flex">
          {t.status === "live" ? (
            <LiveDot />
          ) : (
            <span
              className={cn(
                "whitespace-nowrap rounded-[5px] px-[7px] py-[3px] font-mono-ggwp text-[9px] font-bold tracking-[0.08em]",
                s.chip,
              )}
            >
              {s.label}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <b className="text-[15.5px] font-semibold tracking-[-0.01em]">{t.name}</b>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-ink-3">
            {t.blurb}
          </span>
        </span>
        <span className="flex gap-[5px]">
          <TierBadge tier={t.tier} />
          <RegionTag region={t.region} />
          {t.isVCT && <Tag tone="redline">VCT</Tag>}
        </span>
        <span className="whitespace-nowrap font-mono-ggwp text-[11px] text-ink-2">
          {fmt.dateRange(t.start, t.end)}
        </span>
        <span className="min-w-[78px] text-right font-score text-[21px] tracking-[0.02em] text-ink">
          {t.prize}
        </span>
        <span
          className="whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 font-mono-ggwp text-[11px] text-ink-2 transition hover:border-blue hover:text-ink"
          onClick={(e) => e.stopPropagation()}
          title="Add to calendar (coming soon)"
        >
          ＋ Cal
        </span>
      </button>
      {open && (
        <div className="border-t border-line bg-[rgba(5,6,9,0.5)]">
          <ExpandedTournament t={t} onOpen={onOpenMatch} />
        </div>
      )}
    </div>
  );
}
