"use client";

import { forwardRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Region, Tier } from "@/types/ggwp";

export interface Filters {
  tier: Tier[];
  region: Region[];
  type: "any" | "vct";
  status: "any" | "live" | "upcoming" | "done";
  sort: "date" | "tier" | "prize" | "name";
}

export const DEFAULT_FILTERS: Filters = {
  tier: [],
  region: [],
  type: "any",
  status: "any",
  sort: "date",
};

export interface FilterHandlers {
  toggle: (key: "tier" | "region", val: string) => void;
  set: <K extends keyof Filters>(key: K, val: Filters[K]) => void;
  reset: () => void;
}

const REGION_LABELS: Record<Region, string> = {
  AMER: "Americas",
  EMEA: "EMEA",
  PAC: "Pacific",
  CN: "China",
  INTL: "International",
};
const STATUS_LABELS: Record<Filters["status"], string> = {
  any: "Any status",
  live: "Live now",
  upcoming: "Upcoming",
  done: "Completed",
};
const SORT_LABELS: Record<Filters["sort"], string> = {
  date: "Date",
  tier: "Tier",
  prize: "Prize pool",
  name: "Name",
};

const Trigger = forwardRef<
  HTMLButtonElement,
  { label: string; summary: string; active: boolean } & React.ComponentProps<"button">
>(function Trigger({ label, summary, active, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-[10px] border border-line bg-white/[0.03] px-3 py-2 transition hover:border-line-2 hover:bg-white/[0.05] data-[popup-open]:border-blue data-[popup-open]:shadow-[0_0_0_3px_rgba(77,141,255,0.12)]",
        active && "border-red/45 bg-red/[0.09]",
        className,
      )}
      {...rest}
    >
      <span className="font-mono-ggwp text-[9px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <span className={cn("whitespace-nowrap text-[12.5px] font-semibold", active ? "text-white" : "text-ink")}>
        {summary}
      </span>
      <span className="h-0 w-0 border-l-4 border-r-4 border-t-[5px] border-l-transparent border-r-transparent border-t-ink-3" />
    </button>
  );
});

function Opt({
  active,
  multi,
  onClick,
  children,
  dot,
}: {
  active: boolean;
  multi?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[13px] font-medium transition hover:bg-white/[0.05] hover:text-ink",
        active ? "text-white" : "text-ink-2",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "relative flex-none border-[1.5px] border-ink-3",
          multi ? "h-4 w-4 rounded-[5px]" : "h-4 w-4 rounded-full",
          active && "border-red bg-red",
        )}
      >
        {active && (
          <span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold text-white">
            {multi ? "✓" : ""}
          </span>
        )}
        {active && !multi && (
          <span className="absolute inset-0 m-auto h-[7px] w-[7px] rounded-full bg-white" />
        )}
      </span>
      <span className="flex-1">{children}</span>
      {dot}
    </button>
  );
}

const popClass =
  "z-[60] flex w-auto min-w-[200px] flex-col gap-0.5 rounded-xl border border-line-2 bg-[rgba(14,17,23,0.98)] p-1.5 text-popover-foreground shadow-[0_22px_50px_rgba(0,0,0,0.6)] ring-0 backdrop-blur-[22px]";

export function FilterBar({
  f,
  on,
  counts,
}: {
  f: Filters;
  on: FilterHandlers;
  counts: { live: number };
}) {
  const tiers: Tier[] = ["S", "A", "B"];
  const regions: Region[] = ["AMER", "EMEA", "PAC", "CN", "INTL"];

  const tierSummary = !f.tier.length
    ? "Any"
    : f.tier.length <= 2
      ? f.tier.join(", ")
      : `${f.tier.length} selected`;
  const regionSummary = !f.region.length
    ? "Any"
    : f.region.length === 1
      ? REGION_LABELS[f.region[0]]
      : `${f.region.length} selected`;

  const anyActive =
    f.tier.length > 0 || f.region.length > 0 || f.type !== "any" || f.status !== "any";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-[9px] rounded-ggwp border border-line bg-surface px-3 py-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Trigger label="Tier" summary={tierSummary} active={f.tier.length > 0} />}
        />
        <DropdownMenuContent align="start" className={popClass}>
          {tiers.map((t) => (
            <Opt key={t} multi active={f.tier.includes(t)} onClick={() => on.toggle("tier", t)}>
              Tier {t}
            </Opt>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Trigger label="Region" summary={regionSummary} active={f.region.length > 0} />}
        />
        <DropdownMenuContent align="start" className={popClass}>
          {regions.map((r) => (
            <Opt key={r} multi active={f.region.includes(r)} onClick={() => on.toggle("region", r)}>
              {REGION_LABELS[r]}
            </Opt>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Trigger
              label="Type"
              summary={f.type === "vct" ? "VCT only" : "Any"}
              active={f.type === "vct"}
            />
          }
        />
        <DropdownMenuContent align="start" className={popClass}>
          <Opt active={f.type === "any"} onClick={() => on.set("type", "any")}>
            All events
          </Opt>
          <Opt active={f.type === "vct"} onClick={() => on.set("type", "vct")}>
            VCT only
          </Opt>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Trigger label="Status" summary={STATUS_LABELS[f.status]} active={f.status !== "any"} />
          }
        />
        <DropdownMenuContent align="start" className={popClass}>
          {(["any", "live", "upcoming", "done"] as const).map((s) => (
            <Opt
              key={s}
              active={f.status === s}
              onClick={() => on.set("status", s)}
              dot={
                s === "live" && counts.live ? (
                  <span className="rounded-[10px] bg-red px-1.5 py-px font-mono-ggwp text-[9px] font-bold text-white">
                    {counts.live}
                  </span>
                ) : null
              }
            >
              {STATUS_LABELS[s]}
            </Opt>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {anyActive && (
        <button
          className="px-1 py-2 font-mono-ggwp text-[11px] text-ink-2 underline underline-offset-[3px] transition hover:text-red"
          onClick={on.reset}
        >
          Reset
        </button>
      )}

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Trigger label="Sort" summary={SORT_LABELS[f.sort]} active={f.sort !== "date"} />}
        />
        <DropdownMenuContent align="end" className={popClass}>
          {(Object.keys(SORT_LABELS) as Filters["sort"][]).map((s) => (
            <Opt key={s} active={f.sort === s} onClick={() => on.set("sort", s)}>
              {SORT_LABELS[s]}
            </Opt>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
