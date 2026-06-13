"use client";

import { SpoilerToggle } from "@/components/common/SpoilerToggle";
import { cn } from "@/lib/utils";

export type Tab = "home" | "history" | "upcoming" | "calendar";

const TABS: [Tab, string][] = [
  ["home", "Home"],
  ["history", "History"],
  ["upcoming", "Upcoming"],
  ["calendar", "Calendar"],
];

const navShell =
  "sticky top-0 z-50 my-4 mb-[26px] flex items-center gap-[26px] rounded-ggwp border border-line bg-[rgba(10,12,17,0.72)] py-[11px] pl-[18px] pr-4 shadow-[0_10px_34px_rgba(0,0,0,0.5)] backdrop-blur-[22px] backdrop-saturate-[1.3]";

function Brand({ onLogo }: { onLogo: () => void }) {
  return (
    <button className="flex flex-none items-center gap-[11px]" onClick={onLogo}>
      <span className="h-[17px] w-[17px] rotate-45 rounded-[4px] bg-red shadow-[0_0_16px_var(--redglow)]" />
      <span className="font-disp text-[22px] font-semibold leading-none tracking-[0.04em]">
        the<span className="text-red">GGWP</span>
      </span>
    </button>
  );
}

function FeedbackBtn() {
  return (
    <button className="whitespace-nowrap rounded-[9px] border border-line bg-white/[0.04] px-[13px] py-2 font-mono-ggwp text-[11px] font-semibold text-ink-2 transition hover:border-line-2 hover:text-ink">
      Feedback
    </button>
  );
}

export function Nav({
  activeTab,
  onTab,
  onLogo,
}: {
  activeTab: Tab;
  onTab: (t: Tab) => void;
  onLogo: () => void;
}) {
  return (
    <nav className={navShell}>
      <Brand onLogo={onLogo} />
      <div className="flex gap-0.5">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            className={cn(
              "rounded-[9px] px-3.5 py-2 text-[13px] font-medium transition",
              activeTab === k
                ? "bg-red/[0.13] text-white shadow-[inset_0_0_0_1px_rgba(255,70,85,0.28)]"
                : "text-ink-2 hover:bg-white/[0.045] hover:text-ink",
            )}
            onClick={() => onTab(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        <SpoilerToggle />
        <FeedbackBtn />
      </div>
    </nav>
  );
}

// Slimmer nav used on the match detail page.
export function MatchNav({ breadcrumb, onHome }: { breadcrumb: string; onHome: () => void }) {
  return (
    <nav className={cn(navShell, "justify-start")}>
      <button
        className="rounded-[9px] border border-line bg-white/[0.04] px-3.5 py-2 font-mono-ggwp text-[12px] font-semibold transition hover:border-red hover:text-white"
        onClick={onHome}
      >
        ← Home
      </button>
      <span className="font-mono-ggwp text-[11.5px] text-ink-2">{breadcrumb}</span>
      <div className="ml-auto flex items-center gap-3.5">
        <SpoilerToggle />
        <FeedbackBtn />
      </div>
    </nav>
  );
}
