-- TABLA DE USUARIOS (Perfiles públicos)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    total_shots INTEGER DEFAULT 0,
    shame_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLA DE JUEGOS (Salas de espera y activas)
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID REFERENCES public.users(id), -- NULL para invitados, UUID real para usuarios registrados
    join_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'IN_PROGRESS', 'FINISHED')),
    game_type TEXT DEFAULT 'ROULETTE' CHECK (game_type IN ('ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC')),
    mode TEXT DEFAULT 'NORMAL', -- PREVIA, PICANTE, MAYOR_MENOR, PIRAMIDE, SIETE_LOCO, etc.
    current_turn_player_id UUID,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLA DE JUGADORES (Participantes de cada sala)
CREATE TABLE IF NOT EXISTS public.players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    user_id UUID, -- NULL para invitados locales
    display_name TEXT NOT NULL,
    shots_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_guest BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(game_id, user_id)
);

-- TABLA DE SESIONES/ACCIONES (Historial de turnos y sincronización en tiempo real)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- GUESS_RESULT, REVEAL_PYRAMID, SIETE_LOCO_DRAW, NEXT_TURN, etc.
    action_description TEXT, -- JSON stringificado con los datos de la acción
    was_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLA DE LOGROS
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rarity TEXT DEFAULT 'COMMON',
    icon TEXT
);

-- TABLA DE LOGROS DE USUARIO
CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- TABLA DE ESTADÍSTICAS
CREATE TABLE IF NOT EXISTS public.stats (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    games_played INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    total_shots_taken INTEGER DEFAULT 0
);

-- HABILITAR REALTIME (Importante para que la app funcione)
-- Ejecutar estas líneas una por una en el SQL Editor de Supabase si fallan juntas
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- POLÍTICAS RLS (Seguridad básica)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can create a game" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can join a game" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update player stats" ON public.players FOR UPDATE USING (true);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert session actions" ON public.sessions FOR INSERT WITH CHECK (true);


