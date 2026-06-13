// Static theGGWP dataset (ported from the prototype's data.jsx).
import type {
  Team,
  Match,
  MapResult,
  Tournament,
  CalendarData,
  Region,
  MatchStatus,
} from "@/types/ggwp";

// --- Teams (real VCT org names; crests are monogram placeholders) ---
export const teams: Record<string, Team> = {
  SEN: { id: "SEN", name: "Sentinels", tag: "SEN", region: "AMER", hue: 12 },
  NRG: { id: "NRG", name: "NRG", tag: "NRG", region: "AMER", hue: 220 },
  LOUD: { id: "LOUD", name: "LOUD", tag: "LLL", region: "AMER", hue: 130 },
  G2: { id: "G2", name: "G2 Esports", tag: "G2", region: "AMER", hue: 0, light: true },
  EG: { id: "EG", name: "Evil Geniuses", tag: "EG", region: "AMER", hue: 250 },
  C9: { id: "C9", name: "Cloud9", tag: "C9", region: "AMER", hue: 200 },

  FNC: { id: "FNC", name: "Fnatic", tag: "FNC", region: "EMEA", hue: 28 },
  TH: { id: "TH", name: "Team Heretics", tag: "TH", region: "EMEA", hue: 8 },
  KC: { id: "KC", name: "Karmine Corp", tag: "KC", region: "EMEA", hue: 205 },
  NAVI: { id: "NAVI", name: "Natus Vincere", tag: "NAVI", region: "EMEA", hue: 50 },
  VIT: { id: "VIT", name: "Team Vitality", tag: "VIT", region: "EMEA", hue: 48 },
  FUT: { id: "FUT", name: "FUT Esports", tag: "FUT", region: "EMEA", hue: 18 },

  PRX: { id: "PRX", name: "Paper Rex", tag: "PRX", region: "PAC", hue: 330 },
  DRX: { id: "DRX", name: "DRX", tag: "DRX", region: "PAC", hue: 215 },
  GENG: { id: "GENG", name: "Gen.G", tag: "GENG", region: "PAC", hue: 350 },
  T1: { id: "T1", name: "T1", tag: "T1", region: "PAC", hue: 0, light: true },
  RRQ: { id: "RRQ", name: "Rex Regum Qeon", tag: "RRQ", region: "PAC", hue: 38 },
  TS: { id: "TS", name: "Team Secret", tag: "TS", region: "PAC", hue: 0, light: true },

  EDG: { id: "EDG", name: "EDward Gaming", tag: "EDG", region: "CN", hue: 0 },
  BLG: { id: "BLG", name: "Bilibili Gaming", tag: "BLG", region: "CN", hue: 195 },
  TE: { id: "TE", name: "Trace Esports", tag: "TE", region: "CN", hue: 145 },
  XLG: { id: "XLG", name: "XLG Esports", tag: "XLG", region: "CN", hue: 25 },
};

const T = teams;

export const regions: Record<Region, string> = {
  AMER: "Americas",
  EMEA: "EMEA",
  PAC: "Pacific",
  CN: "China",
  INTL: "International",
};

// helper for a completed BO3/BO5 match
const M = (
  id: string,
  a: Team | null,
  b: Team | null,
  sa: number,
  sb: number,
  status: MatchStatus,
  time: string,
  opts: Partial<Match> = {},
): Match => ({ id, teamA: a, teamB: b, scoreA: sa, scoreB: sb, status, time, ...opts });

// --- Map pool for match detail ---
const MAPS = ["Ascent", "Bind", "Haven", "Split", "Lotus", "Sunset", "Icebox", "Abyss"];

function makeMaps(seed: number, sa: number, sb: number): MapResult[] {
  // build map scores consistent-ish with series result
  const n = sa + sb;
  const out: MapResult[] = [];
  let aw = sa,
    bw = sb;
  for (let i = 0; i < n; i++) {
    const aWins = aw > 0 && (bw === 0 || (i % 2 === 0 ? aw >= bw : aw > bw));
    const ra = aWins ? 13 : 4 + ((seed + i) % 9);
    const rb = aWins ? 4 + ((seed + i * 3) % 9) : 13;
    out.push({ map: MAPS[(seed + i) % MAPS.length], ra, rb, winner: aWins ? "A" : "B" });
    if (aWins) aw--;
    else bw--;
  }
  return out;
}

// ============ TOURNAMENTS ============
export const tournaments: Tournament[] = [
  {
    id: "champs-paris",
    name: "Champions 2026 — Paris",
    short: "Champions Paris",
    tier: "S",
    region: "INTL",
    isVCT: true,
    status: "live",
    start: "2026-08-01",
    end: "2026-08-24",
    prize: "$1,000,000",
    location: "Paris, FR",
    teamsCount: 16,
    stage: "Playoffs · Day 6",
    live: 2,
    blurb: "The crown. 16 teams, one trophy.",
    bracket: {
      type: "Single Elimination · Playoffs",
      rounds: [
        {
          name: "Quarterfinals",
          matches: [
            M("cp-q1", T.SEN, T.FNC, 2, 1, "done", "Aug 18"),
            M("cp-q2", T.PRX, T.EDG, 0, 2, "done", "Aug 18"),
            M("cp-q3", T.GENG, T.TH, 2, 0, "done", "Aug 19"),
            M("cp-q4", T.NRG, T.DRX, 1, 2, "done", "Aug 19"),
          ],
        },
        {
          name: "Semifinals",
          matches: [
            M("cp-s1", T.SEN, T.EDG, 1, 1, "live", "Now · LIVE"),
            M("cp-s2", T.GENG, T.DRX, 0, 0, "upcoming", "Aug 23 · 18:00"),
          ],
        },
        {
          name: "Grand Final",
          matches: [M("cp-f1", null, null, 0, 0, "upcoming", "Aug 24 · 17:00")],
        },
      ],
    },
    standings: null,
    featured: "cp-s1",
  },
  {
    id: "masters-tokyo",
    name: "Masters Tokyo 2026",
    short: "Masters Tokyo",
    tier: "S",
    region: "INTL",
    isVCT: true,
    status: "upcoming",
    start: "2026-06-12",
    end: "2026-06-29",
    prize: "$500,000",
    location: "Tokyo, JP",
    teamsCount: 12,
    stage: "Group Stage starts soon",
    blurb: "First international clash of the season.",
    bracket: {
      type: "Single Elimination · Playoffs",
      rounds: [
        {
          name: "Quarterfinals",
          matches: [
            M("mt-q1", T.SEN, T.KC, 0, 0, "upcoming", "Jun 24 · 16:00"),
            M("mt-q2", T.PRX, T.BLG, 0, 0, "upcoming", "Jun 24 · 19:00"),
            M("mt-q3", T.FNC, T.GENG, 0, 0, "upcoming", "Jun 25 · 16:00"),
            M("mt-q4", T.NRG, T.T1, 0, 0, "upcoming", "Jun 25 · 19:00"),
          ],
        },
        {
          name: "Semifinals",
          matches: [
            M("mt-s1", null, null, 0, 0, "upcoming", "Jun 28"),
            M("mt-s2", null, null, 0, 0, "upcoming", "Jun 28"),
          ],
        },
        {
          name: "Grand Final",
          matches: [M("mt-f1", null, null, 0, 0, "upcoming", "Jun 29 · 17:00")],
        },
      ],
    },
    standings: null,
  },
  {
    id: "vct-amer-s2",
    name: "VCT Americas — Stage 2",
    short: "Americas Stage 2",
    tier: "S",
    region: "AMER",
    isVCT: true,
    status: "live",
    start: "2026-05-30",
    end: "2026-07-13",
    prize: "$250,000",
    location: "Los Angeles, US",
    teamsCount: 11,
    stage: "Regular Season · Week 4",
    live: 1,
    blurb: "Road to Champions through the Americas.",
    bracket: null,
    standings: [
      { team: T.SEN, w: 4, l: 0, mw: 8, ml: 1, streak: "W4" },
      { team: T.NRG, w: 3, l: 1, mw: 7, ml: 3, streak: "W2" },
      { team: T.LOUD, w: 3, l: 1, mw: 6, ml: 4, streak: "L1" },
      { team: T.G2, w: 2, l: 2, mw: 5, ml: 5, streak: "W1" },
      { team: T.EG, w: 1, l: 3, mw: 3, ml: 6, streak: "L2" },
      { team: T.C9, w: 0, l: 4, mw: 1, ml: 8, streak: "L4" },
    ],
    matchList: [
      M("am-1", T.SEN, T.EG, 2, 0, "done", "Jun 8"),
      M("am-2", T.NRG, T.LOUD, 2, 1, "done", "Jun 8"),
      M("am-3", T.G2, T.C9, 2, 0, "done", "Jun 7"),
      M("am-4", T.SEN, T.NRG, 0, 0, "live", "Now · LIVE"),
      M("am-5", T.LOUD, T.G2, 0, 0, "upcoming", "Jun 14 · 14:00"),
      M("am-6", T.EG, T.C9, 0, 0, "upcoming", "Jun 14 · 17:00"),
    ],
  },
  {
    id: "vct-emea-s2",
    name: "VCT EMEA — Stage 2",
    short: "EMEA Stage 2",
    tier: "S",
    region: "EMEA",
    isVCT: true,
    status: "live",
    start: "2026-05-31",
    end: "2026-07-14",
    prize: "$250,000",
    location: "Berlin, DE",
    teamsCount: 12,
    stage: "Regular Season · Week 4",
    live: 1,
    blurb: "Europe's finest fight for seeding.",
    bracket: null,
    standings: [
      { team: T.FNC, w: 4, l: 0, mw: 8, ml: 2, streak: "W4" },
      { team: T.TH, w: 3, l: 1, mw: 7, ml: 3, streak: "W1" },
      { team: T.KC, w: 3, l: 1, mw: 6, ml: 3, streak: "W3" },
      { team: T.VIT, w: 2, l: 2, mw: 5, ml: 5, streak: "L1" },
      { team: T.NAVI, w: 1, l: 3, mw: 4, ml: 6, streak: "L2" },
      { team: T.FUT, w: 0, l: 4, mw: 2, ml: 8, streak: "L4" },
    ],
    matchList: [
      M("em-1", T.FNC, T.FUT, 2, 0, "done", "Jun 8"),
      M("em-2", T.TH, T.NAVI, 2, 1, "done", "Jun 8"),
      M("em-3", T.KC, T.VIT, 2, 1, "done", "Jun 7"),
      M("em-4", T.FNC, T.TH, 0, 0, "live", "Now · LIVE"),
      M("em-5", T.KC, T.NAVI, 0, 0, "upcoming", "Jun 14 · 15:00"),
      M("em-6", T.VIT, T.FUT, 0, 0, "upcoming", "Jun 14 · 18:00"),
    ],
  },
  {
    id: "vct-pac-s2",
    name: "VCT Pacific — Stage 2",
    short: "Pacific Stage 2",
    tier: "S",
    region: "PAC",
    isVCT: true,
    status: "upcoming",
    start: "2026-06-13",
    end: "2026-07-20",
    prize: "$250,000",
    location: "Seoul, KR",
    teamsCount: 12,
    stage: "Kickoff in 4 days",
    blurb: "Pacific powerhouses return.",
    bracket: null,
    standings: [
      { team: T.PRX, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
      { team: T.GENG, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
      { team: T.DRX, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
      { team: T.T1, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
      { team: T.RRQ, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
      { team: T.TS, w: 0, l: 0, mw: 0, ml: 0, streak: "—" },
    ],
    matchList: [
      M("pa-1", T.PRX, T.TS, 0, 0, "upcoming", "Jun 13 · 14:00"),
      M("pa-2", T.GENG, T.RRQ, 0, 0, "upcoming", "Jun 13 · 17:00"),
      M("pa-3", T.DRX, T.T1, 0, 0, "upcoming", "Jun 14 · 14:00"),
    ],
  },
  {
    id: "vct-cn-s2",
    name: "VCT China — Stage 2",
    short: "China Stage 2",
    tier: "S",
    region: "CN",
    isVCT: true,
    status: "live",
    start: "2026-05-29",
    end: "2026-07-12",
    prize: "$250,000",
    location: "Shanghai, CN",
    teamsCount: 12,
    stage: "Regular Season · Week 5",
    live: 1,
    blurb: "The deepest region keeps climbing.",
    bracket: null,
    standings: [
      { team: T.EDG, w: 5, l: 0, mw: 10, ml: 2, streak: "W5" },
      { team: T.BLG, w: 3, l: 2, mw: 7, ml: 5, streak: "W1" },
      { team: T.TE, w: 3, l: 2, mw: 6, ml: 5, streak: "L1" },
      { team: T.XLG, w: 1, l: 4, mw: 3, ml: 9, streak: "L3" },
    ],
    matchList: [
      M("cn-1", T.EDG, T.XLG, 2, 0, "done", "Jun 8"),
      M("cn-2", T.BLG, T.TE, 2, 1, "done", "Jun 8"),
      M("cn-3", T.EDG, T.BLG, 0, 0, "live", "Now · LIVE"),
      M("cn-4", T.TE, T.XLG, 0, 0, "upcoming", "Jun 14 · 13:00"),
    ],
  },
  {
    id: "kickoff-amer",
    name: "VCT Americas — Kickoff",
    short: "Americas Kickoff",
    tier: "S",
    region: "AMER",
    isVCT: true,
    status: "done",
    start: "2026-02-01",
    end: "2026-02-23",
    prize: "$200,000",
    location: "Los Angeles, US",
    teamsCount: 11,
    stage: "Completed · Won by Sentinels",
    blurb: "Season opener. Tokyo seeding on the line.",
    bracket: {
      type: "Single Elimination · Playoffs",
      rounds: [
        {
          name: "Quarterfinals",
          matches: [
            M("ka-q1", T.SEN, T.C9, 2, 0, "done", "Feb 18"),
            M("ka-q2", T.NRG, T.EG, 2, 1, "done", "Feb 18"),
            M("ka-q3", T.LOUD, T.G2, 1, 2, "done", "Feb 19"),
            M("ka-q4", T.SEN, T.NRG, 0, 0, "skip", "—"),
          ],
        },
        {
          name: "Semifinals",
          matches: [
            M("ka-s1", T.SEN, T.NRG, 2, 1, "done", "Feb 21"),
            M("ka-s2", T.G2, T.LOUD, 2, 0, "done", "Feb 21"),
          ],
        },
        {
          name: "Grand Final",
          matches: [M("ka-f1", T.SEN, T.G2, 3, 1, "done", "Feb 23", { champion: true })],
        },
      ],
    },
    standings: null,
  },
  {
    id: "kickoff-emea",
    name: "VCT EMEA — Kickoff",
    short: "EMEA Kickoff",
    tier: "S",
    region: "EMEA",
    isVCT: true,
    status: "done",
    start: "2026-02-02",
    end: "2026-02-24",
    prize: "$200,000",
    location: "Berlin, DE",
    teamsCount: 12,
    stage: "Completed · Won by Fnatic",
    blurb: "Fnatic reasserts the throne.",
    bracket: {
      type: "Single Elimination · Playoffs",
      rounds: [
        {
          name: "Quarterfinals",
          matches: [
            M("ke-q1", T.FNC, T.NAVI, 2, 0, "done", "Feb 18"),
            M("ke-q2", T.TH, T.FUT, 2, 1, "done", "Feb 18"),
            M("ke-q3", T.KC, T.VIT, 2, 1, "done", "Feb 19"),
            M("ke-q4", T.FNC, T.TH, 0, 0, "skip", "—"),
          ],
        },
        {
          name: "Semifinals",
          matches: [
            M("ke-s1", T.FNC, T.KC, 2, 0, "done", "Feb 21"),
            M("ke-s2", T.TH, T.VIT, 2, 1, "done", "Feb 21"),
          ],
        },
        {
          name: "Grand Final",
          matches: [M("ke-f1", T.FNC, T.TH, 3, 2, "done", "Feb 24", { champion: true })],
        },
      ],
    },
    standings: null,
  },
  {
    id: "redbull-home",
    name: "Red Bull Home Ground #5",
    short: "Home Ground #5",
    tier: "A",
    region: "INTL",
    isVCT: false,
    status: "done",
    start: "2026-03-14",
    end: "2026-03-16",
    prize: "$100,000",
    location: "London, UK",
    teamsCount: 8,
    stage: "Completed · Won by Paper Rex",
    blurb: "The premier off-season invitational.",
    bracket: {
      type: "Single Elimination",
      rounds: [
        {
          name: "Quarterfinals",
          matches: [
            M("rb-q1", T.PRX, T.TH, 2, 0, "done", "Mar 14"),
            M("rb-q2", T.FNC, T.DRX, 1, 2, "done", "Mar 14"),
            M("rb-q3", T.SEN, T.GENG, 2, 1, "done", "Mar 15"),
            M("rb-q4", T.NRG, T.T1, 0, 2, "done", "Mar 15"),
          ],
        },
        {
          name: "Semifinals",
          matches: [
            M("rb-s1", T.PRX, T.DRX, 2, 1, "done", "Mar 16"),
            M("rb-s2", T.SEN, T.T1, 2, 0, "done", "Mar 16"),
          ],
        },
        {
          name: "Grand Final",
          matches: [M("rb-f1", T.PRX, T.SEN, 3, 2, "done", "Mar 16", { champion: true })],
        },
      ],
    },
    standings: null,
  },
  {
    id: "challengers-na",
    name: "Challengers NA — Split 2",
    short: "Challengers NA",
    tier: "B",
    region: "AMER",
    isVCT: false,
    status: "upcoming",
    start: "2026-06-20",
    end: "2026-07-05",
    prize: "$50,000",
    location: "Online",
    teamsCount: 12,
    stage: "Open bracket soon",
    blurb: "Tier-2 talent on the rise.",
    bracket: null,
    standings: null,
    matchList: [M("ch-1", T.EG, T.C9, 0, 0, "upcoming", "Jun 20 · 12:00")],
  },
];

// attach generated map data to every match that has a result
tournaments.forEach((t, ti) => {
  const allMatches: Match[] = [];
  if (t.bracket) t.bracket.rounds.forEach((r) => allMatches.push(...r.matches));
  if (t.matchList) allMatches.push(...t.matchList);
  allMatches.forEach((m, mi) => {
    m.tournamentId = t.id;
    m.tournamentName = t.short;
    m.bestOf = m.scoreA + m.scoreB >= 3 || m.champion ? (m.champion ? 5 : 3) : 3;
    if (m.status === "done" && m.teamA && m.teamB) {
      m.maps = makeMaps(ti * 7 + mi, m.scoreA, m.scoreB);
    }
  });
});

// featured match for the hero (live semifinal at Champions)
export const featured: Match = tournaments[0].bracket!.rounds[1].matches[0];

// Flatten every match (bracket + match list) for id lookup — replaces app.jsx's inline flatMap.
export function getMatchById(id: string): Match | undefined {
  for (const t of tournaments) {
    const all: Match[] = [
      ...(t.bracket ? t.bracket.rounds.flatMap((r) => r.matches) : []),
      ...(t.matchList ?? []),
    ];
    const found = all.find((m) => m.id === id);
    if (found) return found;
  }
  // calendar matches
  for (const day of Object.values(calendar.days)) {
    const found = day.find((m) => m.id === id);
    if (found) return found;
  }
  return undefined;
}

// ============ CALENDAR (June 2026) ============
// today = Jun 12 2026. day < 12 -> done, == 12 -> live, > 12 -> upcoming.
const CAL_YEAR = 2026,
  CAL_MONTH = 5; // 0-indexed: 5 = June
const TODAY = 12;
let cid = 0;
// [day, teamA, teamB, time, event, region, tier]
type SchedRow = [number, Team, Team, string, string, Region, "S" | "A" | "B"];
const sched: SchedRow[] = [
  [3, T.SEN, T.C9, "16:00", "Americas Stage 2", "AMER", "S"],
  [3, T.FNC, T.FUT, "18:00", "EMEA Stage 2", "EMEA", "S"],
  [4, T.EDG, T.XLG, "13:00", "China Stage 2", "CN", "S"],
  [5, T.NRG, T.LOUD, "14:00", "Americas Stage 2", "AMER", "S"],
  [5, T.TH, T.NAVI, "17:00", "EMEA Stage 2", "EMEA", "S"],
  [6, T.G2, T.EG, "15:00", "Americas Stage 2", "AMER", "S"],
  [7, T.KC, T.VIT, "16:00", "EMEA Stage 2", "EMEA", "S"],
  [7, T.BLG, T.TE, "13:00", "China Stage 2", "CN", "S"],
  [8, T.SEN, T.EG, "14:00", "Americas Stage 2", "AMER", "S"],
  [8, T.FNC, T.FUT, "17:00", "EMEA Stage 2", "EMEA", "S"],
  [8, T.EDG, T.BLG, "12:00", "China Stage 2", "CN", "S"],
  [10, T.LOUD, T.C9, "15:00", "Americas Stage 2", "AMER", "S"],
  [11, T.NAVI, T.FUT, "17:00", "EMEA Stage 2", "EMEA", "S"],
  [11, T.PRX, T.TS, "11:00", "Pacific Kickoff", "PAC", "S"],
  [12, T.SEN, T.NRG, "14:00", "Americas Stage 2", "AMER", "S"],
  [12, T.FNC, T.TH, "18:00", "EMEA Stage 2", "EMEA", "S"],
  [12, T.EDG, T.BLG, "12:00", "China Stage 2", "CN", "S"],
  [13, T.PRX, T.TS, "14:00", "Pacific Stage 2", "PAC", "S"],
  [13, T.GENG, T.RRQ, "17:00", "Pacific Stage 2", "PAC", "S"],
  [14, T.DRX, T.T1, "14:00", "Pacific Stage 2", "PAC", "S"],
  [14, T.LOUD, T.G2, "16:00", "Americas Stage 2", "AMER", "S"],
  [14, T.KC, T.NAVI, "18:00", "EMEA Stage 2", "EMEA", "S"],
  [16, T.EG, T.C9, "15:00", "Americas Stage 2", "AMER", "S"],
  [17, T.VIT, T.FUT, "17:00", "EMEA Stage 2", "EMEA", "S"],
  [18, T.SEN, T.LOUD, "14:00", "Americas Stage 2", "AMER", "S"],
  [18, T.TE, T.XLG, "12:00", "China Stage 2", "CN", "S"],
  [20, T.EG, T.C9, "12:00", "Challengers NA", "AMER", "B"],
  [20, T.PRX, T.GENG, "14:00", "Pacific Stage 2", "PAC", "S"],
  [21, T.T1, T.RRQ, "13:00", "Pacific Stage 2", "PAC", "S"],
  [22, T.FNC, T.KC, "17:00", "EMEA Stage 2", "EMEA", "S"],
  [23, T.SEN, T.NRG, "14:00", "Americas Stage 2", "AMER", "S"],
  [24, T.SEN, T.KC, "16:00", "Masters Tokyo", "INTL", "S"],
  [24, T.PRX, T.BLG, "19:00", "Masters Tokyo", "INTL", "S"],
  [25, T.FNC, T.GENG, "16:00", "Masters Tokyo", "INTL", "S"],
  [25, T.NRG, T.T1, "19:00", "Masters Tokyo", "INTL", "S"],
  [27, T.DRX, T.EDG, "17:00", "Masters Tokyo", "INTL", "S"],
  [28, T.SEN, T.PRX, "16:00", "Masters Tokyo", "INTL", "S"],
  [28, T.FNC, T.GENG, "19:00", "Masters Tokyo", "INTL", "S"],
  [29, T.SEN, T.FNC, "17:00", "Masters Tokyo · Final", "INTL", "S"],
];
const calDays: Record<number, Match[]> = {};
sched.forEach(([d, a, b, time, event, region, tier], i) => {
  const status: MatchStatus = d < TODAY ? "done" : d === TODAY ? "live" : "upcoming";
  let sa = 0,
    sb = 0;
  if (status === "done") {
    const x = (i * 7) % 5;
    sa = x < 3 ? 2 : x % 2;
    sb = sa === 2 ? x % 2 : 2;
  }
  const m: Match = {
    id: `cal-${cid++}`,
    teamA: a,
    teamB: b,
    scoreA: sa,
    scoreB: sb,
    status,
    time: `Jun ${d} · ${time}`,
    clock: time,
    tournamentName: event,
    region,
    tier,
    bestOf: event.includes("Final") ? 5 : 3,
  };
  if (status === "done") m.maps = makeMaps(d + i, sa, sb);
  (calDays[d] = calDays[d] || []).push(m);
});

export const calendar: CalendarData = {
  year: CAL_YEAR,
  month: CAL_MONTH,
  today: TODAY,
  days: calDays,
  monthName: new Date(CAL_YEAR, CAL_MONTH, 1).toLocaleDateString("en-US", { month: "long" }),
};
