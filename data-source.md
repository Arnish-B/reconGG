Data source mapping for API-SPEC (VLR.gg)

Summary
- Sources considered:
  1) Riot Games official Match API (GET_getMatch) — https://developer.riotgames.com/apis#val-match-v1/GET_getMatch
  2) Valorant-API competitive tiers endpoint — https://dash.valorant-api.com/endpoints/competitivetiers (also: https://valorant-api.com/v1/competitivetiers)
  3) Henrik Dev unofficial Valorant API — https://github.com/Henrik-3/unofficial-valorant-api (docs: https://docs.henrikdev.xyz and API base https://api.henrikdev.xyz)

Mapping (API-SPEC item → primary source(s) → notes / confidence)

Common Types & Enums
- Region → none of the three provide the exact VLR.gg "Region" enum consistently. Riot uses regional routing; Henrik may use region codes in some endpoints. Source: VLR.gg (own mapping). Confidence: Low
- Tier → Valorant-API (competitivetiers) (primary); Henrik (secondary) also exposes tier info/MMR tiers. Use dash.valorant-api.com or valorant-api.com for canonical tier IDs and icons. Confidence: High
- MatchFormat (BO1/BO3/BO5) → Not provided by Riot or the two public APIs (this is tournament metadata). Source: VLR.gg. Confidence: High
- BracketStage → Tournament metadata only (VLR.gg). Confidence: High
- WinType (all_kill / defuse / detonate / timeout) → Riot match/v1 round results provide raw round outcome (primary). Henrik wrapper exposes similar fields (secondary). Confidence: High
- Platform (twitch/youtube/...) → External streaming metadata; not in Riot/Henrik. Source: VLR.gg or external stream aggregator. Confidence: High

Endpoints / Response fields
- matchId, match date/time, rounds, per-round results, per-player raw stats (kills, deaths, assists, score, damage, spike events): Riot Match API (primary). Henrik wraps/normalizes many of these endpoints (secondary). Confidence: High
- players' agent selection, per-round kills/deaths: Riot Match API (primary). Confidence: High
- computed metrics (ACS, ADR, KAST, headshot % , firstKills/firstDeaths): NOT necessarily returned verbatim by Riot — ACS/ADR/KAST can be derived from Riot raw stats; Henrik or other wrappers may compute some of these. Source: compute from Riot or use Henrik if precomputed. Confidence: Medium
- teams (team name, score, winner boolean): Riot match data contains team membership and round-based winners; team branding/logos are NOT provided by Riot. Team logos / regional tags come from VLR.gg (or valorant-api.com for some assets). Confidence: Medium
- player nationality (country code) → Not in Riot match payload. May be present in third-party datasets (VLR.gg) or user profiles on other services. Henrik does not promise nationality. Source: VLR.gg (likely). Confidence: Low
- map picks / bans (team picks/bans): Riot round data includes map played but NOT tournament map-pick/bans metadata — map picks are tournament-level metadata (VLR.gg). Confidence: High
- streams (platform, url) → VLR.gg / tournament aggregator. Not in Riot/Henrik. Confidence: High
- tournaments list, tournament metadata, bracket stage, vct flag, week, lastRefreshed → VLR.gg only. Neither Riot nor the two public APIs supply tournament schedules/production metadata. Confidence: High

Rate limits & auth
- Riot: uses API keys and has its own rate limiting and rules (see Riot docs). Henrik has its own key/rate limits. Valorant-API/dash docs list tiers for competitive ranks, not API rate limits. The API-SPEC's 100 req/min is a VLR.gg policy (not directly taken from the three sources). Confidence: High

Suggested implementation approach
1. Use Riot Match API (GET match) as the canonical source for raw match, games, rounds and player-level raw stats.
   - Endpoint: GET /val/match/v1/matches/{matchId} (see Riot docs link above)
2. Use Valorant-API competitive tiers endpoint for canonical Tier enums and icons.
   - Endpoint (example): https://valorant-api.com/v1/competitivetiers
3. Use Henrik Dev unofficial API for convenience/wrappers where Riot access is restricted or to obtain precomputed values (if present) and additional assets. Always validate/compare fields with Riot raw data.
4. Source tournament-level metadata (format, bracket, streams, team logos, nationality, vct flag) from VLR.gg internal databases or external tournament feeds — these are not available from the three public sources.

Confidence legend: High = field is directly available from the source; Medium = available but may require transformation/augmentation; Low = not provided and must be obtained elsewhere (VLR.gg or third-party).

If desired, next step: produce a CSV/JSON mapping of every schema field (from API-SPEC) to a concrete API call + JSON path to extract it. Ask to proceed and whether to prefer official Riot data where available (recommended).