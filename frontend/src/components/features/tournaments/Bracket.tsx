"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Crest } from "@/components/common/Crest";
import { LiveDot } from "@/components/common/LiveDot";
import { Spoiler } from "@/components/common/Spoiler";
import { cn } from "@/lib/utils";
import type { Bracket as BracketT, Match, Standing, Tournament } from "@/types/ggwp";

type OnOpen = (m: Match) => void;

function SmallMatch({
  m,
  onOpen,
  highlight,
}: {
  m: Match;
  onOpen?: OnOpen;
  highlight?: boolean;
}) {
  const live = m.status === "live";
  const upcoming = m.status === "upcoming" || !m.teamA;
  const aWin = m.status === "done" && m.scoreA > m.scoreB;
  const bWin = m.status === "done" && m.scoreB > m.scoreA;
  return (
    <button
      className={cn(
        "flex w-full flex-col gap-[5px] rounded-[11px] border border-line bg-surface-2 px-3 py-2.5 text-left transition enabled:cursor-pointer enabled:hover:-translate-y-px enabled:hover:border-blue enabled:hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)]",
        live && "border-red/50 shadow-[0_0_0_1px_rgba(255,70,85,0.18)]",
        highlight && "shadow-[0_0_22px_rgba(255,70,85,0.16)]",
      )}
      onClick={() => m.teamA && onOpen?.(m)}
      disabled={!m.teamA}
    >
      <div className={cn("grid grid-cols-[22px_1fr_auto] items-center gap-[9px]", aWin && "[&_.bscore]:text-red", bWin && "opacity-45")}>
        <Crest team={m.teamA} size={22} />
        <span className="text-[13px] font-semibold">{m.teamA ? m.teamA.tag : "TBD"}</span>
        <Spoiler className="bscore min-w-[18px] text-center font-score text-[20px]">
          {upcoming ? "–" : m.scoreA}
        </Spoiler>
      </div>
      <div className={cn("grid grid-cols-[22px_1fr_auto] items-center gap-[9px]", bWin && "[&_.bscore]:text-red", aWin && "opacity-45")}>
        <Crest team={m.teamB} size={22} />
        <span className="text-[13px] font-semibold">{m.teamB ? m.teamB.tag : "TBD"}</span>
        <Spoiler className="bscore min-w-[18px] text-center font-score text-[20px]">
          {upcoming ? "–" : m.scoreB}
        </Spoiler>
      </div>
      <div className="mt-0.5 flex items-center justify-between border-t border-line pt-1">
        {live ? (
          <LiveDot />
        ) : (
          <span className="font-mono-ggwp text-[9.5px] text-ink-3">{m.time}</span>
        )}
        {m.champion && (
          <span className="font-mono-ggwp text-[9px] tracking-[0.06em] text-[#ffd166]">★ CHAMP</span>
        )}
      </div>
    </button>
  );
}

interface Line {
  k: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function Bracket({
  bracket,
  featuredId,
  onOpen,
}: {
  bracket: BracketT;
  featuredId?: string;
  onOpen?: OnOpen;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<Line[]>([]);

  const compute = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wb = wrap.getBoundingClientRect();
    const segs: Line[] = [];
    const rounds = bracket.rounds;
    for (let ri = 1; ri < rounds.length; ri++) {
      const cur = rounds[ri].matches;
      const prev = rounds[ri - 1].matches;
      const ratio = prev.length / cur.length; // typically 2
      cur.forEach((_, j) => {
        const childEl = cellRefs.current[`${ri}-${j}`];
        if (!childEl) return;
        const cb = childEl.getBoundingClientRect();
        const childX = cb.left - wb.left;
        const childY = cb.top - wb.top + cb.height / 2;
        const parents: { x: number; y: number }[] = [];
        for (let k = 0; k < ratio; k++) {
          const pi = Math.floor(j * ratio) + k;
          const pEl = cellRefs.current[`${ri - 1}-${pi}`];
          if (pEl) {
            const pb = pEl.getBoundingClientRect();
            parents.push({ x: pb.right - wb.left, y: pb.top - wb.top + pb.height / 2 });
          }
        }
        if (!parents.length) return;
        const midX = (parents[0].x + childX) / 2;
        const ys = parents.map((p) => p.y);
        segs.push({ k: `v${ri}${j}`, x1: midX, y1: Math.min(...ys), x2: midX, y2: Math.max(...ys) });
        segs.push({ k: `c${ri}${j}`, x1: midX, y1: childY, x2: childX, y2: childY });
        parents.forEach((p, pi2) =>
          segs.push({ k: `p${ri}${j}${pi2}`, x1: p.x, y1: p.y, x2: midX, y2: p.y }),
        );
      });
    }
    setLines(segs);
  }, [bracket]);

  useLayoutEffect(() => {
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [compute]);

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="relative flex min-h-[310px] min-w-[640px] gap-12" ref={wrapRef}>
        <svg className="pointer-events-none absolute inset-0 z-0 overflow-visible" width="100%" height="100%">
          {lines.map((l) => (
            <line
              key={l.k}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className="stroke-blue/40 [stroke-width:1.5]"
            />
          ))}
        </svg>
        {bracket.rounds.map((r, ri) => (
          <div className="relative z-[1] flex min-w-[172px] flex-1 flex-col" key={ri}>
            <div className="mb-3 text-center font-mono-ggwp text-[10px] uppercase tracking-[0.16em] text-ink-3">
              {r.name}
            </div>
            <div className="flex flex-1 flex-col justify-around">
              {r.matches.map((m, j) => (
                <div
                  className="flex flex-1 items-center"
                  key={m.id}
                  ref={(el) => {
                    cellRefs.current[`${ri}-${j}`] = el;
                  }}
                >
                  <SmallMatch m={m} onOpen={onOpen} highlight={m.id === featuredId} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Standings({ rows }: { rows: Standing[] }) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[34px_1fr_70px_70px_56px_60px] items-center gap-2 border-b border-line px-3 py-2.5 font-mono-ggwp text-[9.5px] uppercase tracking-[0.1em] text-ink-3">
        <span className="text-center">#</span>
        <span>Team</span>
        <span>W–L</span>
        <span>Maps</span>
        <span>Diff</span>
        <span>Streak</span>
      </div>
      {rows.map((r, i) => {
        const diff = r.mw - r.ml;
        const qual = i < 2;
        return (
          <div
            className={cn(
              "grid grid-cols-[34px_1fr_70px_70px_56px_60px] items-center gap-2 rounded-[9px] px-3 py-2.5 transition hover:bg-white/[0.03]",
              qual && "shadow-[inset_3px_0_0_var(--blue)]",
            )}
            key={r.team.id}
          >
            <span className="text-center font-score text-[18px] text-ink-2">{i + 1}</span>
            <span className="flex min-w-0 items-center gap-[11px]">
              <Crest team={r.team} size={26} />
              <b className="text-[13.5px] font-semibold">{r.team.name}</b>
            </span>
            <Spoiler className="font-score text-[17px]">
              {r.w}–{r.l}
            </Spoiler>
            <Spoiler>
              {r.mw}–{r.ml}
            </Spoiler>
            <Spoiler className={cn(diff > 0 && "text-[#4ade80]", diff < 0 && "text-red")}>
              {diff > 0 ? "+" : ""}
              {diff}
            </Spoiler>
            <Spoiler className="font-mono-ggwp text-[11px]">{r.streak}</Spoiler>
          </div>
        );
      })}
      <div className="flex items-center gap-2 px-3 pb-0.5 pt-[11px] font-mono-ggwp text-[10px] text-ink-3">
        <span className="h-[9px] w-[9px] rounded-[2px] bg-blue" /> Qualifies for playoffs
      </div>
    </div>
  );
}

function MatchListView({ matches, onOpen }: { matches: Match[]; onOpen?: OnOpen }) {
  return (
    <div className="flex flex-col gap-[7px]">
      {matches.map((m) => {
        const live = m.status === "live";
        const up = m.status === "upcoming";
        const aWin = m.status === "done" && m.scoreA > m.scoreB;
        return (
          <button
            className={cn(
              "grid grid-cols-[120px_1fr_50px] items-center gap-3 rounded-[11px] border border-line bg-surface-2 px-3.5 py-3 text-left transition enabled:cursor-pointer enabled:hover:border-blue",
              live && "border-red/40",
            )}
            key={m.id}
            onClick={() => m.teamA && onOpen?.(m)}
            disabled={!m.teamA}
          >
            <div>
              {live ? (
                <LiveDot />
              ) : (
                <span className="font-mono-ggwp text-[10.5px] text-ink-2">{m.time}</span>
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
              <span
                className={cn(
                  "flex items-center gap-2.5 [&_b]:text-[14px] [&_b]:font-semibold",
                  aWin && "[&_b]:text-white",
                  m.status === "done" && !aWin && "opacity-45",
                )}
              >
                <Crest team={m.teamA} size={24} />
                <b>{m.teamA ? m.teamA.name : "TBD"}</b>
              </span>
              <Spoiler className="font-score text-[20px]">
                {up ? "–" : m.scoreA}
                <i className="not-italic">:</i>
                {up ? "–" : m.scoreB}
              </Spoiler>
              <span
                className={cn(
                  "flex items-center justify-end gap-2.5 [&_b]:text-[14px] [&_b]:font-semibold",
                  m.status === "done" && !aWin && "[&_b]:text-white",
                  aWin && "opacity-45",
                )}
              >
                <b>{m.teamB ? m.teamB.name : "TBD"}</b>
                <Crest team={m.teamB} size={24} />
              </span>
            </div>
            <div className="font-mono-ggwp text-ink-2">BO{m.bestOf}</div>
          </button>
        );
      })}
    </div>
  );
}

export function ExpandedTournament({ t, onOpen }: { t: Tournament; onOpen?: OnOpen }) {
  const views: [string, string][] = [];
  if (t.bracket) views.push(["bracket", "Bracket"]);
  if (t.standings) views.push(["standings", "Standings"]);
  const flatMatches =
    t.matchList ||
    (t.bracket ? t.bracket.rounds.flatMap((r) => r.matches).filter((m) => m.teamA) : null);
  if (flatMatches && flatMatches.length) views.push(["matches", "Match list"]);
  const [view, setView] = useState(views[0] ? views[0][0] : "bracket");

  return (
    <div className="p-[18px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex gap-[3px] rounded-[10px] border border-line bg-white/[0.04] p-[3px]">
          {views.map(([k, label]) => (
            <button
              key={k}
              className={cn(
                "rounded-[7px] px-3.5 py-1.5 font-mono-ggwp text-[11px] font-semibold transition",
                view === k ? "bg-red text-white" : "text-ink-2",
              )}
              onClick={() => setView(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 whitespace-nowrap font-mono-ggwp text-[10.5px] text-ink-3">
          <span>{t.bracket ? t.bracket.type : "Group Stage · Round Robin"}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-ink-3" />
          <span>{t.prize} prize pool</span>
        </div>
      </div>

      {view === "bracket" && t.bracket && (
        <Bracket bracket={t.bracket} featuredId={t.featured} onOpen={onOpen} />
      )}
      {view === "standings" && t.standings && <Standings rows={t.standings} />}
      {view === "matches" && flatMatches && <MatchListView matches={flatMatches} onOpen={onOpen} />}
    </div>
  );
}
