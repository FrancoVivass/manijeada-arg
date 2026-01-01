-- =============================================
-- DIAGNÓSTICO DEL PROBLEMA DE REALTIME
-- Los otros jugadores no reciben notificación cuando el anfitrión inicia el juego
-- =============================================

-- 1. VERIFICAR CONFIGURACIÓN DE REALTIME
SELECT
    pubname as publication_name,
    puballtables as all_tables,
    pubinsert, pubupdate, pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Debe mostrar 1 fila con puballtables = false

-- 2. VERIFICAR TABLAS HABILITADAS PARA REALTIME
SELECT
    pubname,
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Debe incluir: games, players, sessions

-- 3. VERIFICAR QUE LA TABLA GAMES ESTÉ EN REALTIME
SELECT COUNT(*) as games_in_realtime
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'games';

-- Debe ser 1

-- 4. VERIFICAR POLÍTICAS RLS (pueden bloquear realtime)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'games'
ORDER BY policyname;

-- Las políticas deben permitir SELECT para todos

-- 5. VERIFICAR JUEGOS RECIENTES Y SUS ESTADOS
SELECT
    id,
    join_code,
    status,
    game_type,
    host_id,
    created_at,
    CASE
        WHEN created_at > NOW() - INTERVAL '1 minute' THEN 'Muy reciente'
        WHEN created_at > NOW() - INTERVAL '5 minutes' THEN 'Reciente'
        WHEN created_at > NOW() - INTERVAL '1 hour' THEN 'Hace una hora'
        ELSE 'Antiguo'
    END as age_category
FROM public.games
ORDER BY created_at DESC
LIMIT 10;

-- 6. VERIFICAR SESIONES RECIENTES (actividad del juego)
SELECT
    s.game_id,
    g.join_code,
    g.game_type,
    s.action_type,
    s.created_at,
    CASE
        WHEN s.created_at > NOW() - INTERVAL '1 minute' THEN 'Muy reciente'
        WHEN s.created_at > NOW() - INTERVAL '5 minutes' THEN 'Reciente'
        ELSE 'Antigua'
    END as age_category
FROM public.sessions s
LEFT JOIN public.games g ON s.game_id = g.id
ORDER BY s.created_at DESC
LIMIT 20;

-- =============================================
-- QUERIES PARA PRUEBA MANUAL
-- =============================================

-- Crear un juego de prueba
-- INSERT INTO public.games (join_code, game_type, status, host_id) VALUES ('TEST001', 'ROULETTE', 'LOBBY', NULL) RETURNING id;

-- Actualizar el status (simular inicio del juego)
-- UPDATE public.games SET status = 'IN_PROGRESS' WHERE join_code = 'TEST001';

-- Verificar que cambió
-- SELECT id, join_code, status FROM public.games WHERE join_code = 'TEST001';

-- Limpiar prueba
-- DELETE FROM public.games WHERE join_code = 'TEST001';

-- =============================================
-- SOLUCIONES SI FALLA
-- =============================================

-- Si no hay realtime configurado:
/*
-- Habilitar realtime para las tablas necesarias
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Verificar configuración
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
*/

-- Si las políticas RLS bloquean:
/*
-- Asegurar que todos puedan leer los juegos
DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
*/

-- Si hay problemas con la conexión:
/*
-- Reiniciar la publicación de realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.games, public.players, public.sessions;
*/
