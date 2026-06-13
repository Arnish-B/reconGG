import { teamColors } from "@/lib/teamColors";
import type { Team } from "@/types/ggwp";

export function Crest({
  team,
  size = 56,
  side,
}: {
  team: Team | null;
  size?: number;
  side?: "blue" | "red";
}) {
  const c = teamColors(team);
  const fontSize = Math.max(10, size * (team && team.tag.length > 3 ? 0.25 : 0.34));
  const sideColor = side === "blue" ? "var(--blue)" : side === "red" ? "var(--red)" : null;
  const boxShadow = side
    ? `0 0 0 1.5px ${sideColor}, 0 10px 26px ${team ? c.glow : "transparent"}`
    : team
      ? `inset 0 0 0 1px rgba(255,255,255,.14)`
      : `inset 0 0 0 1px rgba(255,255,255,.07)`;

  return (
    <div
      className="relative inline-grid flex-none place-items-center"
      style={{ width: size, height: size }}
    >
      <div
        className="relative grid h-full w-full place-items-center overflow-hidden rounded-[28%] after:absolute after:inset-0 after:bg-[linear-gradient(155deg,rgba(255,255,255,0.22),transparent_46%)]"
        style={{ background: c.grad, boxShadow }}
      >
        <span
          className="z-[1] font-disp font-bold leading-none"
          style={{ fontSize, color: team ? c.text : "var(--ink-3)" }}
        >
          {team ? team.tag : "TBD"}
        </span>
      </div>
    </div>
  );
}
