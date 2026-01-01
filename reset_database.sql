-- =============================================
-- RESET COMPLETO DE BASE DE DATOS - MANIJEADA
-- =============================================
-- ATENCIÓN: Este script BORRA TODOS los datos
-- Ejecutar solo si quieres reiniciar completamente la BD
-- Después ejecuta complete_database.sql

-- =============================================
-- 1. DESACTIVAR REALTIME (si existe)
-- =============================================

-- Esto puede fallar si no existe, pero está bien
DROP PUBLICATION IF EXISTS supabase_realtime;

-- =============================================
-- 2. ELIMINAR POLÍTICAS RLS
-- =============================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
DROP POLICY IF EXISTS "Anyone can create a game" ON public.games;
DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
DROP POLICY IF EXISTS "Hosts can delete their games" ON public.games;

DROP POLICY IF EXISTS "Players are viewable by everyone" ON public.players;
DROP POLICY IF EXISTS "Anyone can join a game" ON public.players;
DROP POLICY IF EXISTS "Anyone can update player stats" ON public.players;

DROP POLICY IF EXISTS "Sessions are viewable by everyone" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can insert session actions" ON public.sessions;

DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "Only admins can manage achievements" ON public.achievements;

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock their own achievements" ON public.user_achievements;

DROP POLICY IF EXISTS "Stats are viewable by everyone" ON public.stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.stats;

-- =============================================
-- 3. DESACTIVAR RLS EN TODAS LAS TABLAS
-- =============================================

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stats DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. ELIMINAR TRIGGERS Y FUNCIONES
-- =============================================

DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.cleanup_old_games();

-- =============================================
-- 5. ELIMINAR ÍNDICES (excepto los primarios)
-- =============================================

DROP INDEX IF EXISTS idx_games_join_code;
DROP INDEX IF EXISTS idx_games_status;
DROP INDEX IF EXISTS idx_games_game_type;
DROP INDEX IF EXISTS idx_games_host_id;
DROP INDEX IF EXISTS idx_games_created_at;

DROP INDEX IF EXISTS idx_players_game_id;
DROP INDEX IF EXISTS idx_players_user_id;

DROP INDEX IF EXISTS idx_sessions_game_id;
DROP INDEX IF EXISTS idx_sessions_created_at;

DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_achievements_unlocked_at;

-- =============================================
-- 6. ELIMINAR TABLAS (en orden de dependencias)
-- =============================================

DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.stats CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =============================================
-- 7. ELIMINAR EXTENSION (opcional)
-- =============================================

-- No eliminamos la extensión uuid-ossp porque otros proyectos podrían usarla
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Después de ejecutar este script, verifica que todo esté limpio:
-- SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';

-- =============================================
-- SIGUIENTE PASO
-- =============================================
-- Después de ejecutar este script, ejecuta complete_database.sql
-- para crear toda la estructura desde cero.

-- =============================================
-- FIN DEL SCRIPT DE RESET
-- =============================================
