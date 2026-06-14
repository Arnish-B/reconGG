"use client";

import { Crest } from "@/components/common/Crest";
import { HudCorners } from "@/components/common/HudCorners";
import { LiveDot } from "@/components/common/LiveDot";
import { RadarRings } from "@/components/common/RadarRings";
import { Spoiler } from "@/components/common/Spoiler";
import { Tag } from "@/components/common/Tag";
import { TierBadge } from "@/components/common/Tag";
import { Arena3D } from "./Arena3D";
import type { Match } from "@/types/ggwp";

export type HeroVariant = "arena" | "split" | "spotlight" | "hud";

const heroShell =
  "relative overflow-hidden cursor-pointer rounded-[18px] border border-line shadow-[0_24px_60px_rgba(0,0,0,0.5)] transition-[border-color,box-shadow] duration-250 hover:border-line-2";

function HeroMeta({ m }: { m: Match }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TierBadge tier="S" />
      <Tag tone="ghost">{m.tournamentName}</Tag>
      {m.status === "live" ? <LiveDot label="LIVE NOW" /> : <Tag tone="blue">UP NEXT</Tag>}
    </div>
  );
}

function HeroTeam({ team, side }: { team: Match["teamA"]; side: "blue" | "red" }) {
  return (
    <div className="z-[2] flex flex-col items-center gap-3">
      <Crest team={team} size={120} side={side} />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-center font-disp text-[29px] font-semibold uppercase leading-[0.95] tracking-[0.01em]">
          {team ? team.name : "TBD"}
        </span>
        <span className="font-mono-ggwp text-[10px] tracking-[0.1em] text-ink-2">
          {team ? team.region : ""}
        </span>
      </div>
    </div>
  );
}

function HeroScore({ up, m }: { up: boolean; m: Match }) {
  return (
    <div className="flex items-center gap-4">
      <Spoiler className="min-w-[44px] font-score text-[62px] leading-[0.8]">
        {up ? "–" : m.scoreA}
      </Spoiler>
      <span className="font-score text-[20px] tracking-[0.1em] text-ink-3">VS</span>
      <Spoiler className="min-w-[44px] font-score text-[62px] leading-[0.8]">
        {up ? "–" : m.scoreB}
      </Spoiler>
    </div>
  );
}

export function Hero({
  m,
  variant = "arena",
  onOpen,
}: {
  m: Match;
  variant?: HeroVariant;
  onOpen: (m: Match) => void;
}) {
  const live = m.status === "live";
  const up = m.status !== "live";

  if (variant === "arena") {
    return (
      <header
        className={`${heroShell} group mb-5 min-h-[412px] bg-[radial-gradient(130%_130%_at_78%_30%,#0e1119,#06070a_76%)]`}
        onClick={() => onOpen(m)}
      >
        <Arena3D />
        <RadarRings className="pointer-events-none absolute left-[54%] top-1/2 z-[1] h-auto w-[min(50%,500px)] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(6,7,10,0.94)_0%,rgba(6,7,10,0.7)_36%,transparent_64%),linear-gradient(0deg,rgba(6,7,10,0.7),transparent_40%)]" />
        <HudCorners />
        <span className="pointer-events-none absolute -bottom-[6%] right-[4%] z-[1] select-none font-score text-[300px] leading-[0.8] tracking-[0.02em] text-white/[0.022]">
          VS
        </span>
        <div className="relative z-[4] flex min-h-[412px] items-center px-[clamp(28px,5vw,64px)]">
          <div className="flex max-w-[560px] flex-col gap-[22px]">
            <div className="flex items-center gap-3">
              {live ? <LiveDot label="LIVE NOW" /> : <Tag tone="blue">UP NEXT</Tag>}
              <span className="whitespace-nowrap font-mono-ggwp text-[11px] uppercase tracking-[0.16em] text-ink-2">
                {m.tournamentName} · Semifinal
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 py-1.5">
                <Crest team={m.teamA} size={60} side="blue" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-disp text-[38px] font-semibold uppercase leading-[0.96] tracking-[0.005em]">
                    {m.teamA?.name}
                  </span>
                  <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {m.teamA?.region} · Blue
                  </span>
                </div>
                <Spoiler className="min-w-[44px] text-center font-score text-[62px] leading-[0.8] text-blue">
                  {up ? "0" : m.scoreA}
                </Spoiler>
              </div>
              <div className="flex items-center gap-3.5 pl-[76px] before:h-px before:w-[30px] before:bg-[linear-gradient(90deg,transparent,var(--line-2))] after:h-px after:flex-1 after:bg-[linear-gradient(90deg,var(--line-2),transparent)]">
                <span className="font-score text-[18px] tracking-[0.14em] text-ink-3">VS</span>
              </div>
              <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 py-1.5">
                <Crest team={m.teamB} size={60} side="red" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-disp text-[38px] font-semibold uppercase leading-[0.96] tracking-[0.005em]">
                    {m.teamB?.name}
                  </span>
                  <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {m.teamB?.region} · Red
                  </span>
                </div>
                <Spoiler className="min-w-[44px] text-center font-score text-[62px] leading-[0.8] text-red">
                  {up ? "0" : m.scoreB}
                </Spoiler>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="whitespace-nowrap font-mono-ggwp text-[11px] tracking-[0.08em] text-ink-2">
                BEST OF {m.bestOf}
              </span>
              <span className="h-[3px] w-[3px] flex-none rounded-full bg-ink-3" />
              <span className="whitespace-nowrap font-mono-ggwp text-[11px] tracking-[0.08em] text-ink-2">
                {m.time}
              </span>
              <span className="ml-auto inline-flex items-center gap-[7px] whitespace-nowrap rounded-[10px] bg-red px-[18px] py-[11px] font-mono-ggwp text-[12px] font-semibold text-white shadow-[0_10px_26px_var(--redglow)] transition duration-200 group-hover:-translate-y-0.5">
                {live ? "Watch live" : "Match preview"}{" "}
                <span className="transition group-hover:translate-x-[3px]">→</span>
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "spotlight") {
    return (
      <header
        className={`${heroShell} mb-5 grid min-h-[330px] grid-cols-[1.1fr_0.9fr] bg-[linear-gradient(110deg,var(--surface),rgba(16,19,26,0.6))]`}
      >
        <div className="z-[2] flex flex-col justify-center gap-4 px-[38px] py-[34px]">
          <HeroMeta m={m} />
          <h1 className="m-0 font-disp text-[50px] font-semibold uppercase leading-[0.98] tracking-[0.005em]">
            {m.teamA?.name} <span className="text-red">vs</span> {m.teamB?.name}
          </h1>
          <p className="m-0 font-mono-ggwp text-[12px] text-ink-2">
            {m.time} · Best of {m.bestOf} · Semifinal
          </p>
          <HeroScore up={up} m={m} />
          <button
            className="mt-1 self-start rounded-[10px] bg-red px-5 py-3 font-mono-ggwp text-[12px] font-semibold text-white shadow-[0_8px_24px_var(--redglow)] transition hover:-translate-y-0.5"
            onClick={() => onOpen(m)}
          >
            {live ? "Watch the series" : "Match preview"} <span className="ml-1.5">→</span>
          </button>
        </div>
        <div className="relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,var(--blueglow),transparent_45%),radial-gradient(circle_at_75%_75%,var(--redglow),transparent_45%)]">
          <div className="absolute left-[6%] top-[8%]">
            <Crest team={m.teamA} size={150} side="blue" />
          </div>
          <div className="absolute bottom-[6%] right-[8%]">
            <Crest team={m.teamB} size={150} side="red" />
          </div>
        </div>
      </header>
    );
  }

  if (variant === "hud") {
    return (
      <header
        className={`${heroShell} mb-5 flex min-h-[340px] flex-col justify-between bg-[linear-gradient(180deg,rgba(13,15,21,0.9),rgba(7,8,11,0.95))] px-[30px] py-[22px]`}
        onClick={() => onOpen(m)}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(77,141,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(77,141,255,0.07)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_50%_50%,#000_30%,transparent_75%)]" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red/[0.18] shadow-[inset_0_0_80px_rgba(255,70,85,0.04)]" />
        <div className="z-[2] flex items-center justify-between">
          <HeroMeta m={m} />
          <span className="font-mono-ggwp text-[10px] tracking-[0.2em] text-red">REC ●</span>
        </div>
        <div className="z-[2] grid grid-cols-[1fr_auto_1fr] items-center">
          <HeroTeam team={m.teamA} side="blue" />
          <HeroScore up={up} m={m} />
          <HeroTeam team={m.teamB} side="red" />
        </div>
        <div className="z-[2] flex justify-center gap-[18px]">
          <span className="font-mono-ggwp text-[11px] tracking-[0.08em] text-ink-2">{m.time}</span>
          <span className="font-mono-ggwp text-[11px] tracking-[0.08em] text-ink-2">
            BO{m.bestOf}
          </span>
          <span className="font-mono-ggwp text-[11px] tracking-[0.08em] text-red">OPEN MATCH →</span>
        </div>
      </header>
    );
  }

  // split
  return (
    <header className={`${heroShell} mb-5 h-[340px]`} onClick={() => onOpen(m)}>
      <div className="absolute inset-0">
        <span className="absolute bottom-0 left-0 top-0 w-[62%] bg-[linear-gradient(120deg,rgba(77,141,255,0.3),rgba(77,141,255,0.03)_70%)] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)]" />
        <span className="absolute bottom-0 right-0 top-0 w-[62%] bg-[linear-gradient(240deg,rgba(255,70,85,0.3),rgba(255,70,85,0.03)_70%)] [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" />
        <span className="absolute -bottom-[10%] -top-[10%] left-1/2 w-0.5 -translate-x-1/2 rotate-12 bg-[linear-gradient(var(--blue),var(--red))] shadow-[0_0_24px_rgba(255,255,255,0.2)]" />
      </div>
      <div className="relative grid h-full grid-cols-[1fr_auto_1fr] items-center gap-5 bg-[rgba(7,8,11,0.32)] px-[6%]">
        <HeroTeam team={m.teamA} side="blue" />
        <div className="flex flex-col items-center gap-3">
          <HeroMeta m={m} />
          <HeroScore up={up} m={m} />
          <span className="font-mono-ggwp text-[12px] text-ink">{m.time}</span>
          <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.1em] text-ink-3">
            click to open match →
          </span>
        </div>
        <HeroTeam team={m.teamB} side="red" />
      </div>
    </header>
  );
}
