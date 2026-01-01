-- =============================================
-- MANIJEADA - BASE DE DATOS COMPLETA
-- =============================================
-- Este archivo contiene toda la estructura de la base de datos
-- Incluye soporte completo para todos los juegos: Roulette, Cards, Impostor, Mimic
-- Fecha: Diciembre 2025
-- Versión: 1.0.0

-- =============================================
-- 1. EXTENSIONES Y CONFIGURACIÓN
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. TABLA DE USUARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    total_shots INTEGER DEFAULT 0,
    shame_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. TABLA DE JUEGOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.users(id), -- NULL para invitados
    join_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'IN_PROGRESS', 'FINISHED')),
    game_type TEXT DEFAULT 'ROULETTE' CHECK (game_type IN ('ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC')),
    mode TEXT DEFAULT 'NORMAL',
    current_turn_player_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{
        "chaos_level": 5,
        "legendary_enabled": true,
        "categories": ["SOCIAL", "ALCOHOL", "CAOS"]
    }'::jsonb
);

-- =============================================
-- 4. TABLA DE JUGADORES
-- =============================================

CREATE TABLE IF NOT EXISTS public.players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    user_id UUID, -- NULL para invitados locales
    display_name TEXT NOT NULL,
    shots_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_guest BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, user_id)
);

-- =============================================
-- 5. TABLA DE SESIONES/ACCIONES
-- =============================================

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_description TEXT,
    was_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. TABLA DE LOGROS
-- =============================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rarity TEXT DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'RARE', 'LEGENDARY')),
    icon TEXT
);

-- =============================================
-- 7. TABLA DE LOGROS DE USUARIO
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- =============================================
-- 8. TABLA DE ESTADÍSTICAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.stats (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    games_played INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    total_shots_taken INTEGER DEFAULT 0
);

-- =============================================
-- 9. ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_games_join_code ON public.games(join_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_game_type ON public.games(game_type);
CREATE INDEX IF NOT EXISTS idx_games_host_id ON public.games(host_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);

CREATE INDEX IF NOT EXISTS idx_players_game_id ON public.players(game_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_game_id ON public.sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);

-- =============================================
-- 10. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para GAMES
CREATE POLICY "Games are viewable by everyone" ON public.games
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create a game" ON public.games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update their games" ON public.games
    FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "Hosts can delete their games" ON public.games
    FOR DELETE USING (auth.uid() = host_id OR host_id IS NULL);

-- Políticas para PLAYERS
CREATE POLICY "Players are viewable by everyone" ON public.players
    FOR SELECT USING (true);

CREATE POLICY "Anyone can join a game" ON public.players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update player stats" ON public.players
    FOR UPDATE USING (true);

-- Políticas para SESSIONS
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert session actions" ON public.sessions
    FOR INSERT WITH CHECK (true);

-- Políticas para ACHIEVEMENTS
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage achievements" ON public.achievements
    FOR ALL USING (false); -- Deshabilitado por ahora

-- Políticas para USER_ACHIEVEMENTS
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can unlock their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para STATS
CREATE POLICY "Stats are viewable by everyone" ON public.stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own stats" ON public.stats
    FOR ALL USING (auth.uid()::text = user_id::text);

-- =============================================
-- 11. DATOS INICIALES (ACHIEVEMENTS)
-- =============================================

-- Logros básicos del juego
INSERT INTO public.achievements (id, name, description, rarity, icon) VALUES
    ('first_game', 'Primer Paso', 'Juega tu primera partida', 'COMMON', '🎮'),
    ('social_butterfly', 'Mariposa Social', 'Completa 10 desafíos sociales', 'COMMON', '🦋'),
    ('legendary_master', 'Maestro Legendario', 'Activa 5 cartas legendarias', 'RARE', '👑'),
    ('shot_master', 'Maestro de Shots', 'Toma 50 shots en total', 'RARE', '🥃'),
    ('party_animal', 'Animal de Fiesta', 'Juega 25 partidas', 'LEGENDARY', '🎉'),
    ('mimic_star', 'Estrella de Mímica', 'Gana 10 rondas de mímica', 'RARE', '🎭'),
    ('impostor_winner', 'Impostor Maestro', 'Gana 5 partidas como impostor', 'LEGENDARY', '🕵️‍♂️'),
    ('card_shark', 'Tiburón de Cartas', 'Gana 10 duelos de cartas', 'RARE', '🃏')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 12. FUNCIONES ÚTILES
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at en users
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función para limpiar partidas viejas (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_old_games()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.games
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status = 'FINISHED';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 13. CONFIGURACIÓN DE REALTIME
-- =============================================

-- Habilitar realtime para las tablas principales
-- Nota: Ejecutar estas líneas una por una si fallan juntas
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- =============================================
-- 14. PERMISOS ADICIONALES
-- =============================================

-- Otorgar permisos necesarios (si es necesario)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- 15. COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE public.users IS 'Perfiles de usuarios registrados';
COMMENT ON TABLE public.games IS 'Partidas activas y finalizadas';
COMMENT ON TABLE public.players IS 'Participantes de cada partida';
COMMENT ON TABLE public.sessions IS 'Historial de acciones en tiempo real';
COMMENT ON TABLE public.achievements IS 'Logros disponibles en el juego';
COMMENT ON TABLE public.user_achievements IS 'Logros desbloqueados por usuarios';
COMMENT ON TABLE public.stats IS 'Estadísticas globales de usuarios';

COMMENT ON COLUMN public.games.game_type IS 'Tipo de juego: ROULETTE, CARDS, IMPOSTOR, MIMIC';
COMMENT ON COLUMN public.games.host_id IS 'ID del anfitrión (NULL para invitados)';
COMMENT ON COLUMN public.players.is_guest IS 'Si el jugador es un invitado local';

-- =============================================
-- 16. OPTIMIZACIONES DE RENDIMIENTO
-- =============================================

-- Configuración de autovacuum para tablas activas
ALTER TABLE public.games SET (autovacuum_vacuum_scale_factor = 0.02);
ALTER TABLE public.players SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE public.sessions SET (autovacuum_vacuum_scale_factor = 0.1);

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================

-- Consultas para verificar que todo esté correcto:
-- SELECT COUNT(*) as users_count FROM public.users;
-- SELECT COUNT(*) as games_count FROM public.games;
-- SELECT game_type, COUNT(*) as count_by_type FROM public.games GROUP BY game_type;
-- SELECT COUNT(*) as achievements_count FROM public.achievements;

-- =============================================
-- FIN DEL ARCHIVO
-- =============================================
-- Para aplicar: Ejecutar todo este archivo en Supabase SQL Editor
-- O ejecutar sección por sección si hay problemas de permisos
