// Domain types for the theGGWP dataset (ported from the prototype's data.jsx).

export type Region = "AMER" | "EMEA" | "PAC" | "CN" | "INTL";
export type Tier = "S" | "A" | "B";
export type MatchStatus = "live" | "upcoming" | "done" | "skip";

export interface Team {
  id: string;
  name: string;
  tag: string;
  region: Region;
  hue: number;
  light?: boolean;
}

export interface MapResult {
  map: string;
  ra: number;
  rb: number;
  winner: "A" | "B";
}

export interface Match {
  id: string;
  teamA: Team | null;
  teamB: Team | null;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  time: string;
  champion?: boolean;
  // attached during post-processing
  tournamentId?: string;
  tournamentName?: string;
  bestOf?: number;
  maps?: MapResult[];
  // calendar-only fields
  clock?: string;
  region?: Region;
  tier?: Tier;
}

export interface Round {
  name: string;
  matches: Match[];
}

export interface Bracket {
  type: string;
  rounds: Round[];
}

export interface Standing {
  team: Team;
  w: number;
  l: number;
  mw: number;
  ml: number;
  streak: string;
}

export interface Tournament {
  id: string;
  name: string;
  short: string;
  tier: Tier;
  region: Region;
  isVCT: boolean;
  status: Exclude<MatchStatus, "skip">;
  start: string;
  end: string;
  prize: string;
  location: string;
  teamsCount: number;
  stage: string;
  live?: number;
  blurb: string;
  bracket: Bracket | null;
  standings: Standing[] | null;
  matchList?: Match[];
  featured?: string;
}

export interface CalendarData {
  year: number;
  month: number;
  today: number;
  days: Record<number, Match[]>;
  monthName: string;
}

export interface GGWPData {
  teams: Record<string, Team>;
  regions: Record<Region, string>;
  tournaments: Tournament[];
  featured: Match;
  calendar: CalendarData;
}
