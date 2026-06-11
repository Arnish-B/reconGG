# VLR.gg API Specification

> **Base URL:** `https://api.vlr.gg/v1`
> **Content-Type:** `application/json`
> **Authentication:** API key via `X-API-Key` header

---

## Common Types

| Type | Description |
|------|-------------|
| `Region` | `"na"`, `"eu"`, `"apac"`, `"kr"`, `"cn"`, `"sa"`, `"oce"`, `"mn"` |
| `Tier` | `"s"`, `"a"`, `"b"`, `"c"`, `"d"`, `"unranked"` |
| `MatchFormat` | `"BO1"`, `"BO3"`, `"BO5"` |
| `BracketStage` | `"group_stage"`, `"quarterfinal"`, `"semifinal"`, `"final"`, `"grand_final"` |
| `WinType` | `"all_kill"`, `"defuse"`, `"detonate"`, `"timeout"` |
| `Platform` | `"twitch"`, `"youtube"`, `"kick"`, `"afreeca"` |

---

## 1. List Tournaments

Retrieve tournaments with optional filters.

**`GET /tournaments`**

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | `Region` | No | Filter by region |
| `tier` | `Tier` | No | Filter by competitive tier |
| `vct` | `boolean` | No | Only VCT-sanctioned events |
| `live` | `boolean` | No | Currently in progress |
| `upcoming` | `boolean` | No | Scheduled but not started |
| `finished` | `boolean` | No | Completed events |

### Response `200 OK`

```json
{
    "tournaments": [
        {
            "id": "t123",
            "name": "Valorant Masters Tokyo 2025",
            "date": "2025-08-15T00:00:00Z",
            "region": "intl",
            "tier": "s",
            "vct": true,
            "live": false,
            "upcoming": false,
            "finished": true,
            "matches": [
                {
                    "matchId": "m456",
                    "teams": [
                        {
                            "name": "Sentinels",
                            "logo": "https://vlr.gg/img/teams/sentinels.png",
                            "score": 2,
                            "region": "na",
                            "winner": true
                        },
                        {
                            "name": "Fnatic",
                            "logo": "https://vlr.gg/img/teams/fnatic.png",
                            "score": 1,
                            "region": "eu",
                            "winner": false
                        }
                    ],
                    "date": "2025-08-16T18:00:00Z",
                    "matchFormat": "BO3",
                    "live": false,
                    "bracket": "grand_final",
                    "week": 3,
                    "mapPicks": [
                        {
                            "team": "Sentinels",
                            "action": "ban",
                            "map": "Bind"
                        },
                        {
                            "team": "Fnatic",
                            "action": "pick",
                            "map": "Ascent"
                        }
                    ],
                    "streams": [
                        {
                            "platform": "twitch",
                            "logo": "https://vlr.gg/img/platforms/twitch.png",
                            "url": "https://twitch.tv/valorant"
                        }
                    ]
                }
            ],
            "lastRefreshed": "2025-08-17T02:00:00Z"
        }
    ]
}
```

---

## 2. Get Tournament

**`GET /tournaments/{tournamentId}`**

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tournamentId` | `string` | Tournament identifier |

### Response `200 OK`

Same structure as a single tournament object from the list endpoint (excluding the wrapping array).

---

## 3. List Matches in Tournament

**`GET /tournaments/{tournamentId}/matches`**

### Query Parameters

Same filter parameters as endpoint 1.

### Response `200 OK`

```json
{
    "matches": [
        {
            "matchId": "m456",
            "teams": [
                {
                    "name": "Sentinels",
                    "logo": "https://vlr.gg/img/teams/sentinels.png",
                    "score": 2,
                    "region": "na",
                    "winner": true
                },
                {
                    "name": "Fnatic",
                    "logo": "https://vlr.gg/img/teams/fnatic.png",
                    "score": 1,
                    "region": "eu",
                    "winner": false
                }
            ],
            "date": "2025-08-16T18:00:00Z",
            "matchFormat": "BO3",
            "live": false,
            "bracket": "grand_final",
            "week": 3,
            "mapPicks": [
                {
                    "team": "Sentinels",
                    "action": "ban",
                    "map": "Bind"
                }
            ],
            "streams": [
                {
                    "platform": "twitch",
                    "logo": "https://vlr.gg/img/platforms/twitch.png",
                    "url": "https://twitch.tv/valorant"
                }
            ]
        }
    ]
}
```

---

## 4. Get Match Detail

**`GET /tournaments/{tournamentId}/matches/{matchId}`**

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tournamentId` | `string` | Tournament identifier |
| `matchId` | `string` | Match identifier |

### Response `200 OK`

```json
{
    "match": {
        "matchId": "m456",
        "teams": [
            {
                "name": "Sentinels",
                "logo": "https://vlr.gg/img/teams/sentinels.png",
                "score": 2,
                "region": "na",
                "winner": true,
                "players": [
                    {
                        "name": "TenZ",
                        "nationality": "ca",
                        "team": "Sentinels"
                    }
                ]
            },
            {
                "name": "Fnatic",
                "logo": "https://vlr.gg/img/teams/fnatic.png",
                "score": 1,
                "region": "eu",
                "winner": false,
                "players": [
                    {
                        "name": "Derke",
                        "nationality": "fi",
                        "team": "Fnatic"
                    }
                ]
            }
        ],
        "date": "2025-08-16T18:00:00Z",
        "matchFormat": "BO3",
        "live": false,
        "bracket": "grand_final",
        "week": 3,
        "mapPicks": [
            {
                "team": "Sentinels",
                "action": "ban",
                "map": "Bind"
            }
        ],
        "streams": [
            {
                "platform": "twitch",
                "logo": "https://vlr.gg/img/platforms/twitch.png",
                "url": "https://twitch.tv/valorant"
            }
        ],
        "games": [
            {
                "map": "Ascent",
                "gameId": "g789",
                "attackFirstTeam": "Sentinels",
                "totalTime": 2800,
                "rounds": [
                    {
                        "roundNumber": 1,
                        "attackTeam": "Sentinels",
                        "winType": "defuse",
                        "winningTeam": "Sentinels"
                    }
                ],
                "team1WinRounds": [
                    {
                        "roundNumber": 1,
                        "winType": "defuse"
                    }
                ],
                "team2WinRounds": [
                    {
                        "roundNumber": 2,
                        "winType": "all_kill"
                    }
                ],
                "players": [
                    {
                        "name": "TenZ",
                        "nationality": "ca",
                        "team": "Sentinels",
                        "stats": {
                            "agent": "Jett",
                            "rounds": 24,
                            "acs": 285,
                            "kills": 28,
                            "deaths": 15,
                            "assists": 6,
                            "kast": 79.2,
                            "adr": 168.5,
                            "headshotPct": 32.1,
                            "firstKills": 5,
                            "firstDeaths": 3
                        }
                    }
                ]
            }
        ]
    }
}
```

---

## 5. Get Game Detail

**`GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}`**

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tournamentId` | `string` | Tournament identifier |
| `matchId` | `string` | Match identifier |
| `gameId` | `string` | Game (map) identifier |

### Response `200 OK`

```json
{
    "game": {
        "map": "Ascent",
        "gameId": "g789",
        "attackFirstTeam": "Sentinels",
        "totalTime": 2800,
        "team1WinRounds": [
            {
                "roundNumber": 1,
                "winType": "defuse"
            }
        ],
        "team2WinRounds": [
            {
                "roundNumber": 2,
                "winType": "all_kill"
            }
        ],
        "rounds": [
            {
                "roundNumber": 1,
                "attackTeam": "Sentinels",
                "winType": "defuse",
                "winningTeam": "Sentinels",
                "players": [
                    {
                        "name": "TenZ",
                        "nationality": "ca",
                        "team": "Sentinels",
                        "stats": {
                            "agent": "Jett",
                            "defused": false,
                            "spikePlanted": false,
                            "rounds": 1,
                            "acs": 285,
                            "kills": 3,
                            "deaths": 0,
                            "assists": 1,
                            "kast": 100.0,
                            "adr": 178.2,
                            "headshotPct": 45.0,
                            "firstKills": 1,
                            "firstDeaths": 0
                        }
                    }
                ]
            }
        ]
    }
}
```

---

## 6. Get Round Detail

**`GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}/rounds/{roundNumber}`**

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tournamentId` | `string` | Tournament identifier |
| `matchId` | `string` | Match identifier |
| `gameId` | `string` | Game (map) identifier |
| `roundNumber` | `integer` | Round number (1-indexed) |

### Response `200 OK`

```json
{
    "round": {
        "roundNumber": 1,
        "attackTeam": "Sentinels",
        "winType": "defuse",
        "winningTeam": "Sentinels",
        "players": [
            {
                "name": "TenZ",
                "nationality": "ca",
                "team": "Sentinels",
                "stats": {
                    "agent": "Jett",
                    "defused": false,
                    "spikePlanted": true,
                    "rounds": 1,
                    "acs": 285,
                    "kills": 3,
                    "deaths": 0,
                    "assists": 1,
                    "kast": 100.0,
                    "adr": 178.2,
                    "headshotPct": 45.0,
                    "firstKills": 1,
                    "firstDeaths": 0
                }
            }
        ]
    }
}
```

---

## Error Responses

### `400 Bad Request`

```json
{
    "error": "bad_request",
    "message": "Invalid filter parameter: 'region' must be one of: na, eu, apac, kr, cn, sa, oce, mn"
}
```

### `401 Unauthorized`

```json
{
    "error": "unauthorized",
    "message": "Missing or invalid API key"
}
```

### `404 Not Found`

```json
{
    "error": "not_found",
    "message": "Tournament 't999' not found"
}
```

### `429 Too Many Requests`

```json
{
    "error": "rate_limited",
    "message": "Rate limit exceeded. Retry after 60 seconds"
}
```

---

## Enums Reference

### Region

| Value | Description |
|-------|-------------|
| `"intl"` | International / Global |
| `"na"` | North America |
| `"eu"` | Europe |
| `"apac"` | Asia Pacific |
| `"kr"` | Korea |
| `"cn"` | China |
| `"sa"` | South Asia |
| `"oce"` | Oceania |
| `"mn"` | MENA |

### Tier

| Value | Description |
|-------|-------------|
| `"s"` | S-Tier (Masters, Champions) |
| `"a"` | A-Tier (International Leagues) |
| `"b"` | B-Tier (Challengers) |
| `"c"` | C-Tier (Game Changers, smaller events) |
| `"d"` | D-Tier (Open qualifiers, community cups) |
| `"unranked"` | Unranked |

### WinType

| Value | Description |
|-------|-------------|
| `"all_kill"` | Team eliminated all opponents |
| `"defuse"` | Defused the spike |
| `"detonate"` | Spike detonated |
| `"timeout"` | Won by timeout / overtime |

---

## Rate Limiting

- **100 requests per minute** per API key
- Response headers include `X-RateLimit-Remaining` and `X-RateLimit-Reset`
