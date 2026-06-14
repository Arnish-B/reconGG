"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdRail } from "@/components/common/AdRail";
import { CalendarView } from "@/components/features/calendar/CalendarView";
import { Hero } from "@/components/features/hero/Hero";
import {
  DEFAULT_FILTERS,
  FilterBar,
  type FilterHandlers,
  type Filters,
} from "@/components/features/tournaments/FilterBar";
import { TournamentRow } from "@/components/features/tournaments/TournamentRow";
import { Nav, type Tab } from "@/components/layouts/Nav";
import { featured, tournaments } from "@/lib/data";
import type { Match } from "@/types/ggwp";

const tierRank: Record<string, number> = { S: 0, A: 1, B: 2 };
const statusRank: Record<string, number> = { live: 0, upcoming: 1, done: 2 };

export default function Home() {
  const router = useRouter();
  const all = tournaments;

  const [view, setView] = useState<"list" | "calendar">("list");
  const [f, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [openId, setOpenId] = useState<string | null>(all[0].id);

  const openMatch = (m: Match) => router.push(`/match/${m.id}`);

  const on: FilterHandlers = {
    toggle: (key, val) =>
      setFilters((p) => {
        const arr = p[key] as string[];
        return {
          ...p,
          [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
        };
      }),
    set: (key, val) => setFilters((p) => ({ ...p, [key]: val })),
    reset: () => setFilters((p) => ({ ...DEFAULT_FILTERS, sort: p.sort })),
  };

  const onTab = (k: Tab) => {
    if (k === "calendar") {
      setView("calendar");
      return;
    }
    setView("list");
    on.set("status", k === "history" ? "done" : k === "upcoming" ? "upcoming" : "any");
  };

  const activeTab: Tab =
    view === "calendar"
      ? "calendar"
      : f.status === "done"
        ? "history"
        : f.status === "upcoming"
          ? "upcoming"
          : "home";

  const counts = { live: all.filter((t) => t.status === "live").length };

  let list = all.filter((t) => {
    if (f.status !== "any" && t.status !== f.status) return false;
    if (f.tier.length && !f.tier.includes(t.tier)) return false;
    if (f.region.length && !f.region.includes(t.region)) return false;
    if (f.type === "vct" && !t.isVCT) return false;
    return true;
  });
  list = [...list].sort((a, b) => {
    if (f.sort === "tier") return tierRank[a.tier] - tierRank[b.tier] || a.name.localeCompare(b.name);
    if (f.sort === "name") return a.name.localeCompare(b.name);
    if (f.sort === "prize")
      return (
        parseInt(b.prize.replace(/\D/g, ""), 10) - parseInt(a.prize.replace(/\D/g, ""), 10)
      );
    return (
      statusRank[a.status] - statusRank[b.status] ||
      (a.bracket ? 0 : 1) - (b.bracket ? 0 : 1) ||
      +new Date(a.start) - +new Date(b.start)
    );
  });

  return (
    <div className="mx-auto max-w-[1300px] px-6 pb-[90px]">
      <Nav activeTab={activeTab} onTab={onTab} onLogo={() => setView("list")} />
      {view === "calendar" ? (
        <CalendarView onOpenMatch={openMatch} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 min-[981px]:grid-cols-[1fr_276px]">
          <div className="min-w-0">
            <Hero m={featured} variant="arena" onOpen={openMatch} />
            <FilterBar f={f} on={on} counts={counts} />
            <div className="flex items-baseline justify-between px-1 pb-3">
              <span className="whitespace-nowrap font-disp text-[15px] font-semibold uppercase tracking-[0.02em] text-ink-2">
                {list.length} tournament{list.length !== 1 ? "s" : ""}
              </span>
              <span className="whitespace-nowrap font-mono-ggwp text-[10px] text-ink-3">
                click a row to expand the bracket
              </span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {list.map((t) => (
                <TournamentRow
                  key={t.id}
                  t={t}
                  open={openId === t.id}
                  onToggle={() => setOpenId(openId === t.id ? null : t.id)}
                  onOpenMatch={openMatch}
                />
              ))}
              {!list.length && (
                <div className="rounded-ggwp border border-line bg-surface px-4 py-10 text-center font-mono-ggwp text-[12px] text-ink-3">
                  No tournaments match these filters.
                </div>
              )}
            </div>
          </div>
          <AdRail />
        </div>
      )}
    </div>
  );
}
