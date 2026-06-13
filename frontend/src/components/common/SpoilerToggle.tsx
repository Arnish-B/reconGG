"use client";

import { Switch } from "@/components/ui/switch";
import { useSpoiler } from "./SpoilerContext";

// Toggle is "on" (blue) when spoilers are *shown* (hide === false).
export function SpoilerToggle() {
  const { hide, setHide } = useSpoiler();
  return (
    <button
      className="flex items-center gap-2 px-1 py-1.5"
      onClick={() => setHide(!hide)}
      title="Toggle spoilers"
    >
      <Switch checked={!hide} className="pointer-events-none data-[state=checked]:bg-blue/70" />
      <span className="whitespace-nowrap font-mono-ggwp text-[9.5px] font-semibold tracking-[0.08em] text-ink-2">
        {hide ? "SPOILERS OFF" : "SPOILERS ON"}
      </span>
    </button>
  );
}
