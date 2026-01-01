-- =============================================
-- DIAGNÓSTICO DE PROBLEMAS DE REALTIME
-- =============================================

-- 1. VERIFICAR QUE MIMIC ESTÉ EN LOS TIPOS PERMITIDOS
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname LIKE '%game_type%'
AND conrelid = 'public.games'::regclass;

-- Debería mostrar algo como: CHECK (game_type::text = ANY (ARRAY['ROULETTE'::text, 'CARDS'::text, 'IMPOSTOR'::text, 'MIMIC'::text]))

-- 2. VERIFICAR JUEGOS EXISTENTES CON MIMIC
SELECT id, join_code, status, game_type, host_id, created_at
FROM public.games
WHERE game_type = 'MIMIC'
ORDER BY created_at DESC
LIMIT 5;

-- 3. VERIFICAR QUE LA TABLA GAMES TENGA LA COLUMNA GAME_TYPE
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'games'
AND table_schema = 'public'
AND column_name = 'game_type';

-- Debería mostrar: game_type | character varying | 'ROULETTE'::character varying | YES

-- 4. PROBAR INSERTAR UN JUEGO MIMIC MANUALMENTE
-- (Comenta/descomenta estas líneas para probar)
/*
INSERT INTO public.games (join_code, game_type, status, host_id, settings)
VALUES ('TEST123', 'MIMIC', 'LOBBY', NULL, '{"mimicSettings": {"categories": ["hogar"], "maxPlayers": 6, "rounds": 3, "timeLimit": 60, "difficulty": "medium"}}'::jsonb)
RETURNING id, join_code, game_type, status;
*/

-- 5. VERIFICAR SESIONES RECIENTES
SELECT game_id, player_id, action_type, created_at
FROM public.sessions
ORDER BY created_at DESC
LIMIT 10;

-- 6. VERIFICAR POLÍTICAS RLS PARA GAMES
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'games'
ORDER BY policyname;

-- 7. VERIFICAR REALTIME PUBLICATION
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 8. VERIFICAR TABLAS EN REALTIME
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =============================================
-- QUERIES PARA DEBUGGING
-- =============================================

-- Ver juegos que cambiaron recientemente de status
-- SELECT id, status, game_type, updated_at FROM public.games WHERE updated_at > NOW() - INTERVAL '5 minutes';

-- Ver si hay juegos atascados en LOBBY
-- SELECT COUNT(*) as stuck_games FROM public.games WHERE status = 'LOBBY' AND created_at < NOW() - INTERVAL '1 hour';

-- Limpiar juegos de prueba (descomenta si necesitas)
-- DELETE FROM public.games WHERE join_code LIKE 'TEST%';
-- DELETE FROM public.players WHERE game_id NOT IN (SELECT id FROM public.games);
-- DELETE FROM public.sessions WHERE game_id NOT IN (SELECT id FROM public.games);
