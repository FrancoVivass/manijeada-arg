-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_shots INTEGER DEFAULT 0,
  shame_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID, -- Allow NULL for guest hosts
  join_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'LOBBY',
  game_type TEXT DEFAULT 'ROULETTE' CHECK (game_type IN ('ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC')),
  mode TEXT DEFAULT 'NORMAL',
  current_turn_player_id UUID, -- We will link this after players table exists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{
    "chaos_level": 5,
    "legendary_enabled": true,
    "categories": ["SOCIAL", "ALCOHOL", "CAOS"]
  }'::JSONB
);

-- 4. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  shots_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_guest BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add Foreign Key to Games for current_turn
ALTER TABLE public.games 
DROP CONSTRAINT IF EXISTS fk_current_player;

ALTER TABLE public.games 
ADD CONSTRAINT fk_current_player 
FOREIGN KEY (current_turn_player_id) REFERENCES public.players(id) ON DELETE SET NULL;

-- 6. CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  intensity INTEGER DEFAULT 1,
  penalty_shots INTEGER DEFAULT 1,
  is_legendary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DRINKS TABLE
CREATE TABLE IF NOT EXISTS public.drinks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL,
  shots INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_description TEXT,
  was_completed BOOLEAN,
  penalty_applied INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL,
  reward_type TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. USER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL, -- Use ID string from frontend
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- 11. STATS TABLE
CREATE TABLE IF NOT EXISTS public.stats (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_games INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_challenges_failed INTEGER DEFAULT 0,
  max_shots_session INTEGER DEFAULT 0,
  legendary_challenges_count INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Simple Policies
DROP POLICY IF EXISTS "Public users can see all users" ON public.users;
CREATE POLICY "Public users can see all users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public games can be seen by everyone" ON public.games;
CREATE POLICY "Public games can be seen by everyone" ON public.games FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;
CREATE POLICY "Anyone can create games" ON public.games FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Host can update game" ON public.games;
CREATE POLICY "Host can update game" ON public.games FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

DROP POLICY IF EXISTS "Players can be seen by everyone" ON public.players;
CREATE POLICY "Players can be seen by everyone" ON public.players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can join games" ON public.players;
CREATE POLICY "Anyone can join games" ON public.players FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Players can be updated" ON public.players;
CREATE POLICY "Players can be updated" ON public.players FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Challenges are public" ON public.challenges;
CREATE POLICY "Challenges are public" ON public.challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Challenges can be inserted" ON public.challenges;
CREATE POLICY "Challenges can be inserted" ON public.challenges FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Sessions are public" ON public.sessions;
CREATE POLICY "Sessions are public" ON public.sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sessions can be inserted" ON public.sessions;
CREATE POLICY "Sessions can be inserted" ON public.sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Achievements are public" ON public.achievements;
CREATE POLICY "Achievements are public" ON public.achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "User achievements are public" ON public.user_achievements;
CREATE POLICY "User achievements are public" ON public.user_achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "User achievements can be inserted" ON public.user_achievements;
CREATE POLICY "User achievements can be inserted" ON public.user_achievements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Stats are public" ON public.stats;
CREATE POLICY "Stats are public" ON public.stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their stats" ON public.stats;
CREATE POLICY "Users can update their stats" ON public.stats FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Enable Realtime
-- Primero configuramos el replica identity para que envíe todos los datos en los updates
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.sessions REPLICA IDENTITY FULL;

-- Añadimos las tablas a la publicación de realtime de Supabase
-- Nota: Si estas tablas ya estaban añadidas, estas líneas pueden dar error, pero es normal.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'games'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  END IF;
END $$;
