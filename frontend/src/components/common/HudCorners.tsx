// Animated broadcast HUD frame corners (draw in on load).
export function HudCorners() {
  const base = "hud-draw fill-none opacity-50 [stroke-width:0.5]";
  return (
    <svg
      className="pointer-events-none absolute inset-3 z-[3] h-[calc(100%-24px)] w-[calc(100%-24px)]"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path className={`${base} stroke-red`} d="M2,16 L2,2 L16,2" />
      <path className={`${base} stroke-blue`} style={{ animationDelay: "0.12s" }} d="M84,2 L98,2 L98,16" />
      <path className={`${base} stroke-blue`} style={{ animationDelay: "0.24s" }} d="M2,84 L2,98 L16,98" />
      <path className={`${base} stroke-red`} style={{ animationDelay: "0.36s" }} d="M84,98 L98,98 L98,84" />
    </svg>
  );
}
