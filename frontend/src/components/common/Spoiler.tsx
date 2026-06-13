"use client";

import { useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { useSpoiler } from "./SpoilerContext";

export function Spoiler({
  children,
  className,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const { hide } = useSpoiler();
  const [revealed, setRevealed] = useState(false);
  const El: ElementType = as ?? "span";

  if (!hide) {
    return (
      <El className={cn("inline-flex items-center justify-center", className)}>{children}</El>
    );
  }

  return (
    <El
      className={cn(
        "relative inline-flex items-center justify-center",
        revealed
          ? "animate-reveal"
          : "cursor-pointer select-none rounded-[5px] bg-white/[0.04] !text-transparent blur-[7px] [&_*]:!text-transparent",
        className,
      )}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        setRevealed(true);
      }}
      title={revealed ? "" : "Click to reveal score"}
    >
      {children}
      {!revealed && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center whitespace-nowrap font-mono-ggwp text-[7px] uppercase tracking-[0.12em] text-ink-3 blur-0">
          reveal
        </span>
      )}
    </El>
  );
}
