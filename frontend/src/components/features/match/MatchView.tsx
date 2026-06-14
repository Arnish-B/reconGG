"use client";

import { useRouter } from "next/navigation";
import { AdRail } from "@/components/common/AdRail";
import { Crest } from "@/components/common/Crest";
import { LiveDot } from "@/components/common/LiveDot";
import { Spoiler } from "@/components/common/Spoiler";
import { Tag } from "@/components/common/Tag";
import { MatchNav } from "@/components/layouts/Nav";
import { cn } from "@/lib/utils";
import type { MapResult, Match } from "@/types/ggwp";

function MapCard({
  mp,
  i,
  teamA,
  teamB,
}: {
  mp: MapResult;
  i: number;
  teamA: Match["teamA"];
  teamB: Match["teamB"];
}) {
  const aWin = mp.winner === "A";
  return (
    <div className="rounded-[13px] border border-line bg-surface p-[15px] transition hover:border-line-2">
      <div className="font-mono-ggwp text-[9px] tracking-[0.14em] text-ink-3">MAP {i + 1}</div>
      <div className="my-[3px] mb-[13px] font-disp text-[25px] font-semibold uppercase tracking-[0.02em]">
        {mp.map}
      </div>
      <div className="mb-3 flex items-center justify-center gap-3">
        <div className={cn("flex items-center gap-2", aWin ? "[&_.mc]:text-blue" : "opacity-45")}>
          <Crest team={teamA} size={28} side="blue" />
          <Spoiler className="mc font-score text-[32px]">{mp.ra}</Spoiler>
        </div>
        <span className="text-ink-3">–</span>
        <div className={cn("flex items-center gap-2", !aWin ? "[&_.mc]:text-red" : "opacity-45")}>
          <Spoiler className="mc font-score text-[32px]">{mp.rb}</Spoiler>
          <Crest team={teamB} size={28} side="red" />
        </div>
      </div>
      <div className="flex h-[5px] gap-0.5 overflow-hidden rounded-[3px]">
        <span className="bg-blue" style={{ flex: mp.ra }} />
        <span className="bg-red" style={{ flex: mp.rb }} />
      </div>
    </div>
  );
}

const VETO_MAPS = ["Ascent", "Bind", "Haven", "Split", "Lotus", "Sunset", "Icebox"];

export function MatchView({ m }: { m: Match }) {
  const router = useRouter();
  const live = m.status === "live";
  const up = m.status === "upcoming" || !m.maps;
  const aWin = m.status === "done" && m.scoreA > m.scoreB;
  const teamA = m.teamA;
  const teamB = m.teamB;

  const mapsWonA = m.maps ? m.maps.filter((x) => x.winner === "A").length : 0;
  const mapsWonB = m.maps ? m.maps.filter((x) => x.winner === "B").length : 0;
  const h2hRows: [string, number, number][] = [
    ["Maps won", mapsWonA, mapsWonB],
    ["Avg rounds", 11, 9],
    ["Pistol rounds", 5, 4],
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-6 pb-[90px]">
      <MatchNav
        breadcrumb={`${m.tournamentName} · Best of ${m.bestOf}`}
        onHome={() => router.push("/")}
      />

      <div className="grid grid-cols-1 items-start gap-6 min-[981px]:grid-cols-[1fr_276px]">
        <div className="min-w-0">
          {/* Versus banner */}
          <div className="relative mb-6 grid min-h-[260px] grid-cols-[1fr_auto_1fr] items-center gap-6 overflow-hidden rounded-[18px] border border-line px-[5%] py-[38px] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0">
              <span className="absolute inset-y-0 left-0 right-1/2 bg-[linear-gradient(110deg,rgba(77,141,255,0.3),rgba(77,141,255,0.02))]" />
              <span className="absolute inset-y-0 left-1/2 right-0 bg-[linear-gradient(250deg,rgba(255,70,85,0.3),rgba(255,70,85,0.02))]" />
              <span className="absolute -bottom-[12%] -top-[12%] left-1/2 w-0.5 -translate-x-1/2 rotate-[11deg] bg-[linear-gradient(var(--blue),var(--red))] shadow-[0_0_26px_rgba(255,255,255,0.25)]" />
            </div>

            <div className="relative z-[2] flex flex-col items-center gap-3">
              <Crest team={teamA} size={150} side="blue" />
              <div className="text-center font-disp text-[38px] font-semibold uppercase leading-[0.95] tracking-[0.01em]">
                {teamA?.name}
              </div>
              <div className="font-mono-ggwp text-[10px] tracking-[0.1em] text-ink-2">
                {teamA?.region} · BLUE SIDE
              </div>
            </div>

            <div className="relative z-[2] flex flex-col items-center gap-2.5">
              <div className="h-[18px]">
                {live ? (
                  <LiveDot />
                ) : up ? (
                  <Tag tone="blue">UPCOMING</Tag>
                ) : (
                  <Tag tone="ghost">FINAL</Tag>
                )}
              </div>
              <div className="flex items-center gap-3.5">
                <Spoiler
                  className={cn(
                    "min-w-[54px] font-score text-[80px] leading-[0.78]",
                    aWin ? "text-white" : "text-ink-2",
                  )}
                >
                  {up ? "0" : m.scoreA}
                </Spoiler>
                <span className="font-score text-[50px] text-ink-3">:</span>
                <Spoiler
                  className={cn(
                    "min-w-[54px] font-score text-[80px] leading-[0.78]",
                    m.status === "done" && !aWin ? "text-white" : "text-ink-2",
                  )}
                >
                  {up ? "0" : m.scoreB}
                </Spoiler>
              </div>
              <div className="font-mono-ggwp text-[11px] text-ink-2">{m.time}</div>
            </div>

            <div className="relative z-[2] flex flex-col items-center gap-3">
              <Crest team={teamB} size={150} side="red" />
              <div className="text-center font-disp text-[38px] font-semibold uppercase leading-[0.95] tracking-[0.01em]">
                {teamB?.name}
              </div>
              <div className="font-mono-ggwp text-[10px] tracking-[0.1em] text-ink-2">
                {teamB?.region} · RED SIDE
              </div>
            </div>
          </div>

          {/* Maps */}
          {m.maps ? (
            <>
              <div className="mx-0.5 mb-3.5 mt-2 flex items-baseline justify-between">
                <span className="font-mono-ggwp text-[11px] tracking-[0.18em] text-ink-2">
                  MAP BREAKDOWN
                </span>
                <i className="font-mono-ggwp text-[10px] not-italic text-ink-3">
                  {m.maps.length} maps played
                </i>
              </div>
              <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[13px]">
                {m.maps.map((mp, i) => (
                  <MapCard key={i} mp={mp} i={i} teamA={teamA} teamB={teamB} />
                ))}
              </div>
            </>
          ) : (
            <div className="mb-7">
              <div className="mx-0.5 mb-3.5 mt-2 flex items-baseline justify-between">
                <span className="font-mono-ggwp text-[11px] tracking-[0.18em] text-ink-2">
                  {live ? "SERIES IN PROGRESS" : "MAP VETO & PICKS"}
                </span>
              </div>
              <div className="rounded-[13px] border border-line bg-surface p-5">
                <p className="mb-3.5 text-[13.5px] text-ink-2">
                  {live
                    ? "Maps update live as the series plays out."
                    : "Veto begins shortly before the match. Picks & bans will appear here."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {VETO_MAPS.map((mp) => (
                    <span
                      key={mp}
                      className="rounded-lg border border-line bg-white/[0.04] px-3 py-1.5 font-mono-ggwp text-[11px] text-ink-2"
                    >
                      {mp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Head to head strip */}
          <div className="mx-0.5 mb-3.5 mt-2 flex items-baseline justify-between">
            <span className="font-mono-ggwp text-[11px] tracking-[0.18em] text-ink-2">
              HEAD TO HEAD
            </span>
          </div>
          <div className="grid grid-cols-[80px_1fr_80px] items-center gap-[18px] rounded-[14px] border border-line bg-surface p-[22px]">
            <div className="flex flex-col items-center gap-1">
              <span className="font-score text-[46px] leading-[0.8] text-blue">
                {up ? "—" : aWin ? "W" : "L"}
              </span>
              <span className="font-mono-ggwp text-[11px] text-ink-2">{teamA?.tag}</span>
            </div>
            <div className="flex flex-col gap-4">
              {h2hRows.map(([lbl, a, b]) => {
                const tot = a + b || 1;
                return (
                  <div
                    key={lbl}
                    className="relative grid grid-cols-[34px_1fr_34px] items-center gap-2.5 pt-3.5"
                  >
                    <Spoiler className="justify-end text-right font-score text-[20px] text-blue">
                      {a}
                    </Spoiler>
                    <div className="flex h-2 overflow-hidden rounded-[5px] bg-white/[0.05]">
                      <span className="bg-blue" style={{ width: `${(a / tot) * 100}%` }} />
                      <span className="bg-red" style={{ width: `${(b / tot) * 100}%` }} />
                    </div>
                    <Spoiler className="font-score text-[20px] text-red">{b}</Spoiler>
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 font-mono-ggwp text-[9px] uppercase tracking-[0.1em] text-ink-3">
                      {lbl}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-score text-[46px] leading-[0.8] text-red">
                {up ? "—" : !aWin ? "W" : "L"}
              </span>
              <span className="font-mono-ggwp text-[11px] text-ink-2">{teamB?.tag}</span>
            </div>
          </div>
        </div>

        <AdRail tall />
      </div>
    </div>
  );
}
