export function LiveDot({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono-ggwp text-[10px] font-bold tracking-[0.12em] text-red">
      <svg className="overflow-visible" viewBox="0 0 20 20" width="11" height="11">
        <circle cx="10" cy="10" r="4" className="fill-red" />
        <circle cx="10" cy="10" r="4" className="animate-livering fill-none stroke-red [stroke-width:2]" />
      </svg>
      {label}
    </span>
  );
}
