"use client";

import { useState } from "react";
import { Crest } from "@/components/common/Crest";
import { LiveDot } from "@/components/common/LiveDot";
import { teamColors } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { calendar } from "@/lib/data";
import type { Match } from "@/types/ggwp";

function CalDay({
  d,
  matches,
  active,
  isToday,
  isPast,
  onEnter,
  onOpen,
}: {
  d: number;
  matches: Match[];
  active: boolean;
  isToday: boolean;
  isPast: boolean;
  onEnter: () => void;
  onOpen: (m: Match) => void;
}) {
  const live = matches.some((m) => m.status === "live");
  return (
    <div
      className={cn(
        "group/day relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface px-3 py-[11px] transition-[background,border-color,box-shadow] duration-300 hover:border-line-2",
        isPast && "opacity-[0.62]",
        !matches.length && "bg-white/[0.012]",
        isToday && "border-blue/45 shadow-[inset_0_0_0_1px_rgba(77,141,255,0.25)]",
        live && "border-red/40",
        active &&
          "z-[2] border-red/45 bg-surface-2 opacity-100 shadow-[0_22px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,70,85,0.18)]",
      )}
      onMouseEnter={onEnter}
      onClick={onEnter}
    >
      <div className={cn("flex items-center justify-between gap-1.5", active && "opacity-0")}>
        <span
          className={cn(
            "font-disp text-[20px] font-semibold leading-none tracking-[0.02em] text-ink",
            isPast && "text-ink-2",
            isToday && "text-blue",
            active && "text-[26px]",
          )}
        >
          {String(d).padStart(2, "0")}
        </span>
        {matches.length > 0 &&
          (live ? (
            <LiveDot />
          ) : (
            <span className="rounded-[20px] bg-white/[0.07] px-[7px] py-0.5 font-mono-ggwp text-[10px] font-bold text-ink-2">
              {matches.length}
            </span>
          ))}
      </div>

      {/* compact preview (fades out when active) */}
      {matches.length > 0 && (
        <div
          className={cn(
            "mt-[9px] flex flex-col gap-1 transition-opacity duration-300",
            active && "pointer-events-none opacity-0",
          )}
        >
          {matches.slice(0, 3).map((m, i) => (
            <span
              key={i}
              className={cn(
                "flex items-center gap-[5px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-white/[0.04] px-1.5 py-[3px] font-mono-ggwp text-[10px] font-semibold text-ink-2",
                m.status === "live" && "bg-red/10 text-red-dim",
              )}
            >
              <i
                className="h-1.5 w-1.5 flex-none rounded-[2px]"
                style={{ background: teamColors(m.teamA).base }}
              />
              {m.teamA?.tag}
              <em className="mx-px not-italic text-ink-3">·</em>
              {m.teamB?.tag}
            </span>
          ))}
          {matches.length > 3 && (
            <span className="pl-0.5 font-mono-ggwp text-[9.5px] text-ink-3">
              +{matches.length - 3}
            </span>
          )}
        </div>
      )}

      {/* full detail (fades in when active) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col px-3.5 py-[13px] opacity-0 transition-opacity delay-[0.05s] duration-300",
          active ? "pointer-events-auto opacity-100" : "pointer-events-none",
        )}
      >
        <div className="mb-2.5 flex items-baseline justify-between gap-2 border-b border-line pb-[9px]">
          <span className="whitespace-nowrap font-disp text-[22px] font-semibold tracking-[0.03em]">
            JUN {d}
          </span>
          <span className="whitespace-nowrap text-right font-mono-ggwp text-[10px] uppercase tracking-[0.06em] text-ink-3">
            {matches.length ? `${matches.length} match${matches.length !== 1 ? "es" : ""}` : "No matches"}
          </span>
        </div>
        <div className="-mx-1 flex flex-1 flex-col gap-[7px] overflow-y-auto overflow-x-hidden px-1">
          {matches.map((m) => (
            <button
              key={m.id}
              className={cn(
                "flex flex-col gap-1.5 rounded-[10px] border border-line bg-white/[0.03] px-2.5 py-[9px] text-left transition hover:translate-x-0.5 hover:border-blue hover:bg-blue/[0.07]",
                m.status === "live" && "border-red/35",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(m);
              }}
            >
              <span className="flex font-mono-ggwp text-[9.5px] tracking-[0.06em] text-ink-2">
                {m.status === "live" ? <LiveDot /> : m.clock}
              </span>
              <span className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
                <span className="flex min-w-0 items-center gap-[7px] overflow-hidden">
                  <Crest team={m.teamA} size={20} />
                  <b className="font-disp text-[15px] font-semibold">{m.teamA?.tag}</b>
                </span>
                <i className="font-mono-ggwp text-[9px] not-italic text-ink-3">vs</i>
                <span className="flex min-w-0 items-center justify-end gap-[7px] overflow-hidden">
                  <b className="font-disp text-[15px] font-semibold">{m.teamB?.tag}</b>
                  <Crest team={m.teamB} size={20} />
                </span>
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono-ggwp text-[9px] tracking-[0.04em] text-ink-3">
                {m.tournamentName}
              </span>
            </button>
          ))}
          {!matches.length && (
            <div className="px-0.5 py-2 font-mono-ggwp text-[11px] text-ink-3">
              Rest day — no scheduled matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarView({ onOpenMatch }: { onOpenMatch: (m: Match) => void }) {
  const { year, month, today, days, monthName } = calendar;

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-start
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = cells.length / 7;

  const todayIndex = lead + (today - 1);
  const [hover, setHover] = useState(todayIndex);
  const reset = () => setHover(todayIndex);

  const hoverCol = hover % 7;
  const hoverRow = Math.floor(hover / 7);
  const GROW = 2.3;
  const colTemplate = Array.from({ length: 7 }, (_, c) => (c === hoverCol ? GROW : 1) + "fr").join(" ");
  const rowTemplate = Array.from({ length: rows }, (_, r) => (r === hoverRow ? GROW : 1) + "fr").join(" ");

  const allMatches = Object.values(days).flat();
  const liveCount = allMatches.filter((m) => m.status === "live").length;
  const matchTotal = allMatches.length;
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <button
            className="grid h-[34px] w-[34px] cursor-not-allowed place-items-center rounded-[10px] border border-line bg-white/[0.04] text-[18px] leading-none text-ink-2 opacity-40"
            disabled
            title="Single month in this preview"
          >
            ‹
          </button>
          <h2 className="m-0 font-disp text-[40px] font-semibold uppercase leading-none tracking-[0.02em]">
            {monthName} <span className="text-ink-3">{year}</span>
          </h2>
          <button
            className="grid h-[34px] w-[34px] cursor-not-allowed place-items-center rounded-[10px] border border-line bg-white/[0.04] text-[18px] leading-none text-ink-2 opacity-40"
            disabled
            title="Single month in this preview"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-[7px] whitespace-nowrap font-mono-ggwp text-[12px] text-ink-2">
            <b className="font-score text-[18px] font-normal text-ink">{matchTotal}</b> matches
          </span>
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-[7px] whitespace-nowrap font-mono-ggwp text-[12px] text-red">
              <LiveDot /> {liveCount} live now
            </span>
          )}
          <span className="whitespace-nowrap font-mono-ggwp text-[11px] text-ink-3">
            hover a day to expand
          </span>
        </div>
      </div>

      <div
        className="mb-[9px] grid gap-[9px] transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
        style={{ gridTemplateColumns: colTemplate }}
      >
        {weekdays.map((w, i) => (
          <span
            key={w}
            className={cn(
              "text-center font-mono-ggwp text-[10px] uppercase tracking-[0.16em] text-ink-3 transition-colors",
              i === hoverCol && "text-red",
              i >= 5 && "opacity-70",
            )}
          >
            {w}
          </span>
        ))}
      </div>

      <div
        className="grid h-[min(64vh,620px)] gap-[9px] transition-[grid-template-columns,grid-template-rows] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
        style={{ gridTemplateColumns: colTemplate, gridTemplateRows: rowTemplate }}
        onMouseLeave={reset}
      >
        {cells.map((d, idx) => {
          if (d == null)
            return (
              <div
                key={idx}
                className="rounded-2xl border border-dashed border-white/[0.04] bg-transparent"
                onMouseEnter={reset}
              />
            );
          return (
            <CalDay
              key={idx}
              d={d}
              matches={days[d] || []}
              active={idx === hover}
              isToday={d === today}
              isPast={d < today}
              onEnter={() => setHover(idx)}
              onOpen={onOpenMatch}
            />
          );
        })}
      </div>
    </div>
  );
}
