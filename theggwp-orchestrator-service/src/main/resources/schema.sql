CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT,
  json TEXT NOT NULL,
  fetched_at INTEGER
);

-- Henrik API data tables
CREATE TABLE IF NOT EXISTS henrik_tournaments (
  tournament_id TEXT PRIMARY KEY,
  name TEXT,
  date TEXT,
  region TEXT,
  tier TEXT,
  vct BOOLEAN,
  live BOOLEAN,
  upcoming BOOLEAN,
  finished BOOLEAN,
  json TEXT NOT NULL,
  fetched_at INTEGER,
  last_refreshed TEXT
);

CREATE TABLE IF NOT EXISTS henrik_matches (
  match_id TEXT PRIMARY KEY,
  tournament_id TEXT,
  date TEXT,
  match_format TEXT,
  live BOOLEAN,
  bracket TEXT,
  week INTEGER,
  team1_name TEXT,
  team1_score INTEGER,
  team1_winner BOOLEAN,
  team2_name TEXT,
  team2_score INTEGER,
  team2_winner BOOLEAN,
  json TEXT NOT NULL,
  fetched_at INTEGER,
  FOREIGN KEY (tournament_id) REFERENCES henrik_tournaments(tournament_id)
);

CREATE TABLE IF NOT EXISTS henrik_games (
  game_id TEXT PRIMARY KEY,
  match_id TEXT,
  map TEXT,
  attack_first_team TEXT,
  total_time INTEGER,
  json TEXT NOT NULL,
  fetched_at INTEGER,
  FOREIGN KEY (match_id) REFERENCES henrik_matches(match_id)
);

CREATE TABLE IF NOT EXISTS henrik_rounds (
  round_id TEXT PRIMARY KEY,
  game_id TEXT,
  match_id TEXT,
  round_number INTEGER,
  attack_team TEXT,
  win_type TEXT,
  winning_team TEXT,
  json TEXT NOT NULL,
  fetched_at INTEGER,
  FOREIGN KEY (game_id) REFERENCES henrik_games(game_id),
  FOREIGN KEY (match_id) REFERENCES henrik_matches(match_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON henrik_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_games_match ON henrik_games(match_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game ON henrik_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_match ON henrik_rounds(match_id);
