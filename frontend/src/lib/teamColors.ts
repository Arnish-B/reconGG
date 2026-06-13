import type { Team } from "@/types/ggwp";

export interface TeamColors {
  base: string;
  grad: string;
  text: string;
  glow: string;
}

export function teamColors(team: Team | null): TeamColors {
  if (!team)
    return {
      base: "#3a4150",
      grad: "linear-gradient(160deg,#1b202b,#11151d)",
      text: "#8a93a6",
      glow: "rgba(120,130,150,0)",
    };
  const h = team.hue;
  return {
    base: `hsl(${h} 60% 50%)`,
    grad: `linear-gradient(155deg, hsl(${h} 66% 54%), hsl(${h} 58% 32%))`,
    text: team.light ? "#0a0c10" : "#ffffff",
    glow: `hsl(${h} 70% 50% / .35)`,
  };
}
