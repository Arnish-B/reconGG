# Henrik API Integration

This document describes the integration of Henrik API for fetching Valorant esports data.

## Overview

The integration follows the existing architecture patterns with:
- **Data Sources** for fetching from Henrik API
- **Repositories** for database persistence
- **Scheduled Jobs** for periodic data updates
- **Services** for business logic
- **Controllers** implementing the API-SPEC routes

## Architecture

### 1. Data Model (4 Primary Entities)

#### Tournament/Event
- Tournament details, dates, regions, tiers
- VCT status, live/upcoming/finished flags
- Related matches

#### Match
- Match details within tournaments
- Team information and scores
- Match format (BO1, BO3, BO5)
- Bracket stage and week information
- Related games

#### Game
- Individual maps within matches
- Game-specific information
- Related rounds

#### Round
- Round-by-round details
- Player statistics
- Win conditions and results

### 2. Database Schema

All Henrik data is stored in dedicated tables:
- `henrik_tournaments` - Tournament/event data
- `henrik_matches` - Match data with foreign key to tournaments
- `henrik_games` - Game/map data with foreign key to matches
- `henrik_rounds` - Round data with foreign keys to games and matches

Indexes are created for efficient querying:
- Tournament to matches relationship
- Match to games relationship
- Game to rounds relationship

### 3. Data Sources

Located in `src/main/java/com/theggwp/theggwp_orchestrator_service/source/henrik/`:

- **HenrikTournamentSource** - Fetches tournaments/events
- **HenrikMatchSource** - Fetches matches for a tournament
- **HenrikMatchDetailSource** - Fetches detailed match data with games and rounds

### 4. Scheduled Jobs

#### HenrikTournamentJob
- Runs every 5 minutes (configurable via `henrik.poll-interval-ms`)
- Fetches all tournaments and embedded match data
- Stores in database with deduplication

#### HenrikMatchDetailJob
- Runs every 10 minutes (configurable via `henrik.match-detail-poll-interval-ms`)
- Fetches detailed match information for recent matches
- Extracts and stores games and rounds

### 5. API Endpoints

All endpoints follow the API-SPEC.md specification:

```
GET /tournaments
  Query params: region, tier, vct, live, upcoming, finished
  Returns: List of tournaments

GET /tournaments/{tournamentId}
  Returns: Single tournament details

GET /tournaments/{tournamentId}/matches
  Query params: bracket, week
  Returns: List of matches in tournament

GET /tournaments/{tournamentId}/matches/{matchId}
  Returns: Match details with embedded games

GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}
  Returns: Game details with embedded rounds

GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}/rounds/{roundNumber}
  Returns: Round details with player stats

GET /matches/live
  Returns: All currently live matches
```

## Configuration

Add to `application.properties`:

```properties
# Henrik API Configuration
henrik.base-url=https://api.henrikdev.xyz
henrik.token=HDEV-e7212a62-9a36-4012-96dd-baada0f9f844
henrik.events-path=/valorant/v2/esports/vlr/events
henrik.event-matches-path=/valorant/v2/esports/vlr/events/{event_id}/matches
henrik.match-details-path=/valorant/v2/esports/vlr/matches/{match_id}
henrik.request-timeout-ms=15000
henrik.poll-interval-ms=300000
henrik.match-detail-poll-interval-ms=600000

# Rate Limiting
ratelimit.limits.henrik-tournaments.permits=10
ratelimit.limits.henrik-tournaments.period-ms=60000
ratelimit.limits.henrik-match-details.permits=30
ratelimit.limits.henrik-match-details.period-ms=60000
```

## Rate Limiting

- **Tournament fetching**: 10 requests per minute
- **Match detail fetching**: 30 requests per minute

These limits respect Henrik API's rate limits while ensuring fresh data.

## Data Flow

1. **Tournament Job** runs periodically:
   - Fetches all tournaments from Henrik API
   - Parses tournament data and embedded matches
   - Stores in `henrik_tournaments` and `henrik_matches` tables

2. **Match Detail Job** runs periodically:
   - Queries database for recent matches (last 7 days)
   - Fetches detailed match data for each
   - Extracts and stores games in `henrik_games`
   - Extracts and stores rounds in `henrik_rounds`

3. **API Layer** serves data:
   - Controllers handle HTTP requests
   - Services apply business logic and filtering
   - Repositories query the database
   - JSON responses are enriched with related data

## Key Features

- **Automatic Data Refresh**: Scheduled jobs keep data current
- **Hierarchical Data**: Tournaments → Matches → Games → Rounds
- **Efficient Storage**: JSON stored with indexed metadata
- **Flexible Querying**: Multiple filter options on all endpoints
- **Rate Limit Compliant**: Respects API rate limits
- **Error Resilient**: Continues on individual failures

## Development

### Adding New Data Types

1. Create repository in `repository/` package
2. Update `schema.sql` with new table
3. Create service methods in `HenrikDataService`
4. Add controller endpoints in `ValorantController`

### Testing Endpoints

```bash
# List all tournaments
curl http://localhost:8080/tournaments

# Get specific tournament
curl http://localhost:8080/tournaments/{id}

# Get matches for tournament
curl http://localhost:8080/tournaments/{id}/matches

# Get match details
curl http://localhost:8080/tournaments/{tid}/matches/{mid}

# Get game details
curl http://localhost:8080/tournaments/{tid}/matches/{mid}/games/{gid}

# Get round details
curl http://localhost:8080/tournaments/{tid}/matches/{mid}/games/{gid}/rounds/1
```

## Dependencies

Added to `pom.xml`:
```xml
<dependency>
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
    <version>20240303</version>
</dependency>
```

## Future Enhancements

- Webhook support for real-time updates
- Caching layer for frequently accessed data
- Data analytics endpoints
- Player-specific statistics aggregation
- Team history tracking
