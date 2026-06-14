import { cn } from "@/lib/utils";

// Concentric targeting rings + sweep (SVG, animated).
export function RadarRings({ className }: { className?: string }) {
  return (
    <svg className={cn(className)} viewBox="0 0 240 240">
      <defs>
        <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--red)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--red)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="40" className="fill-none stroke-white/[0.09] [stroke-width:1]" />
      <circle cx="120" cy="120" r="72" className="fill-none stroke-white/[0.09] [stroke-width:1]" />
      <circle
        cx="120"
        cy="120"
        r="104"
        className="fill-none stroke-red/20 [stroke-dasharray:3_7] [stroke-width:1]"
      />
      <line x1="120" y1="16" x2="120" y2="224" className="stroke-white/[0.05] [stroke-width:1]" />
      <line x1="16" y1="120" x2="224" y2="120" className="stroke-white/[0.05] [stroke-width:1]" />
      <g className="animate-sweep">
        <path d="M120,120 L120,8 A112,112 0 0 1 220,120 Z" fill="url(#sweepGrad)" />
      </g>
    </svg>
  );
}
