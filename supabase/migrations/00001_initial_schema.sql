-- Poker Ledger Schema

-- Events (poker retreats, multi-day tournaments)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_regular BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions (individual poker nights)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  buy_in_amount NUMERIC(10,2) NOT NULL DEFAULT 20.00,
  leader_name TEXT NOT NULL,
  banker_name TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Session player results
CREATE TABLE session_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  buy_ins_count INTEGER NOT NULL DEFAULT 1,
  end_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit_loss NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_verified BOOLEAN DEFAULT false,
  UNIQUE(session_id, player_id)
);

-- Session photos
CREATE TABLE session_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_date ON sessions(date DESC);
CREATE INDEX idx_sessions_event ON sessions(event_id);
CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_session_players_player ON session_players(player_id);
CREATE INDEX idx_session_photos_session ON session_photos(session_id);

-- RLS: Allow all via anon key (auth is at Next.js middleware level)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON session_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON session_photos FOR ALL USING (true) WITH CHECK (true);
