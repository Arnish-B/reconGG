# Quick Start Guide - Henrik API Integration

## Prerequisites
- Java 21 or higher
- Maven (or use included Maven wrapper)

## Build and Run

### 1. Compile the Project
```bash
cd /home/hashcat/Desktop/reconGG/theggwp-orchestrator-service
./mvnw clean compile
```

### 2. Run the Application
```bash
./mvnw spring-boot:run
```

The application will:
- Start on port 8080 (default)
- Initialize the SQLite database (`theggwp.db`)
- Create all Henrik tables
- Start scheduled jobs:
  - Tournament fetching every 5 minutes
  - Match detail fetching every 10 minutes

## Wait for Initial Data

The first data fetch will happen within:
- 5 minutes for tournaments
- 10 minutes for match details

Or you can trigger them manually via the smoke endpoint (if implemented).

## Test the API

### Basic Endpoints

```bash
# Health check
curl http://localhost:8080/health

# List all tournaments
curl http://localhost:8080/tournaments | jq

# Get live tournaments
curl "http://localhost:8080/tournaments?live=true" | jq

# Get VCT tournaments
curl "http://localhost:8080/tournaments?vct=true" | jq

# Filter by region
curl "http://localhost:8080/tournaments?region=na" | jq

# Filter by tier
curl "http://localhost:8080/tournaments?tier=s" | jq
```

### Specific Data Access

Once you have tournament data, use the IDs to access nested data:

```bash
# Get specific tournament (replace {tournamentId})
curl http://localhost:8080/tournaments/{tournamentId} | jq

# Get matches in tournament
curl http://localhost:8080/tournaments/{tournamentId}/matches | jq

# Get match details
curl http://localhost:8080/tournaments/{tournamentId}/matches/{matchId} | jq

# Get game details
curl http://localhost:8080/tournaments/{tournamentId}/matches/{matchId}/games/{gameId} | jq

# Get round details
curl http://localhost:8080/tournaments/{tournamentId}/matches/{matchId}/games/{gameId}/rounds/1 | jq
```

## Configuration

All configuration is in `src/main/resources/application.properties`:

### Change Fetch Intervals
```properties
# Fetch tournaments every 5 minutes (300000 ms)
henrik.poll-interval-ms=300000

# Fetch match details every 10 minutes (600000 ms)
henrik.match-detail-poll-interval-ms=600000
```

### Change Rate Limits
```properties
# Tournament job: 10 requests per minute
ratelimit.limits.henrik-tournaments.permits=10
ratelimit.limits.henrik-tournaments.period-ms=60000

# Match detail job: 30 requests per minute
ratelimit.limits.henrik-match-details.permits=30
ratelimit.limits.henrik-match-details.period-ms=60000
```

### Change API Token
```properties
henrik.token=YOUR_HENRIK_API_TOKEN
```

## Checking Logs

The application logs important information:

```bash
# Watch the logs in real-time
./mvnw spring-boot:run | grep -E "(henrik|Henrik|tournament|match)"
```

Look for:
- `[job:henrik-tournaments] triggered` - Tournament job running
- `Fetching tournaments from Henrik API` - API call started
- `Successfully fetched tournaments` - Data received
- `[job:henrik-match-details] triggered` - Match detail job running

## Database Access

The data is stored in SQLite database `theggwp.db`:

```bash
# Install SQLite (if not already installed)
sudo apt install sqlite3

# Access the database
sqlite3 theggwp.db

# Check tournament data
SELECT tournament_id, name, region, tier FROM henrik_tournaments;

# Check match data
SELECT match_id, tournament_id, team1_name, team2_name FROM henrik_matches;

# Check game data
SELECT game_id, match_id, map FROM henrik_games;

# Check round data
SELECT round_id, game_id, round_number, winning_team FROM henrik_rounds;

# Exit SQLite
.quit
```

## Troubleshooting

### No Data After Starting

**Wait 5-10 minutes** for the first scheduled fetch, or:

1. Check if the application started successfully
2. Check logs for errors
3. Verify Henrik API token is valid
4. Check network connectivity to api.henrikdev.xyz

### API Returns Empty Results

1. Wait for initial data fetch (5-10 minutes)
2. Check database has data:
   ```bash
   sqlite3 theggwp.db "SELECT COUNT(*) FROM henrik_tournaments;"
   ```
3. Check logs for fetch errors

### Build Fails

1. Ensure Java 21 is installed:
   ```bash
   java -version
   ```
2. Clean and rebuild:
   ```bash
   ./mvnw clean compile
   ```

### Port Already in Use

Change the port in `application.properties`:
```properties
server.port=8081
```

## Example Response Formats

### Tournament List Response
```json
{
  "tournaments": [
    {
      "tournament_id": "123",
      "name": "VCT Masters",
      "region": "intl",
      "tier": "s",
      "vct": true,
      "live": false,
      "upcoming": true,
      "finished": false,
      "date": "2025-08-15T00:00:00Z"
    }
  ]
}
```

### Match Detail Response
```json
{
  "match": {
    "matchId": "456",
    "tournament_id": "123",
    "teams": [...],
    "date": "2025-08-16T18:00:00Z",
    "matchFormat": "BO3",
    "games": [
      {
        "gameId": "789",
        "map": "Ascent",
        "rounds": [...]
      }
    ]
  }
}
```

## Integration with UI

The UI should fetch data from these endpoints:

1. **Tournament List**: `GET /tournaments`
2. **Tournament Details**: `GET /tournaments/{id}`
3. **Match List**: `GET /tournaments/{id}/matches`
4. **Match Details**: `GET /tournaments/{id}/matches/{mid}`
5. **Game Details**: `GET /tournaments/{id}/matches/{mid}/games/{gid}`
6. **Round Details**: `GET /tournaments/{id}/matches/{mid}/games/{gid}/rounds/{rnum}`

All endpoints return JSON and support CORS (configure if needed).

## Production Considerations

### Before Deploying

1. Change the API token to a production token
2. Adjust rate limits based on API tier
3. Configure appropriate fetch intervals
4. Set up database backups
5. Configure logging appropriately
6. Set up monitoring and alerts

### Scaling

- The SQLite database is suitable for moderate loads
- For high traffic, consider migrating to PostgreSQL/MySQL
- Add caching layer (Redis) for frequently accessed data
- Consider read replicas for the database

## Support

For issues or questions:
1. Check HENRIK_INTEGRATION.md for detailed documentation
2. Check IMPLEMENTATION_SUMMARY.md for implementation details
3. Review application logs
4. Verify Henrik API status at api.henrikdev.xyz
