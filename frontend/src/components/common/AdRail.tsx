import { cn } from "@/lib/utils";

export function AdRail({ tall }: { tall?: boolean }) {
  return (
    <aside className="sticky top-[90px] hidden flex-col gap-[9px] min-[981px]:flex">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-ggwp border border-dashed border-red/[0.28] [background:repeating-linear-gradient(135deg,rgba(255,70,85,0.04)_0_14px,transparent_14px_28px)]",
          tall ? "h-[560px]" : "h-[420px]",
        )}
      >
        <span className="font-score text-[30px] tracking-[0.1em] text-red-dim/60">AD</span>
        <span className="whitespace-nowrap font-mono-ggwp text-[10px] text-ink-3">
          next big thing · VCT
        </span>
      </div>
      <div className="font-mono-ggwp text-[10px] text-ink-3">Sponsored</div>
    </aside>
  );
}
