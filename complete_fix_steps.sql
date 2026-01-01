-- =============================================
-- SOLUCIÓN COMPLETA: SINCRONIZACIÓN DE JUGADORES
-- =============================================
-- Pasos para solucionar que los otros jugadores no reciban
-- notificaciones cuando el anfitrión inicia el juego
-- =============================================

-- PASO 1: CREAR LA PUBLICACIÓN DE REALTIME
-- =============================================

-- Crear la publicación si no existe
CREATE PUBLICATION supabase_realtime FOR TABLE public.games, public.players, public.sessions;

-- Verificar que se creó
SELECT pubname, puballtables FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Debe mostrar: supabase_realtime | false

-- =============================================
-- PASO 2: VERIFICAR TABLAS INCLUIDAS
-- =============================================

-- Ver qué tablas están incluidas
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Debe mostrar: games, players, sessions

-- =============================================
-- PASO 3: CORREGIR FUNCIÓN GET_ACTIVE_SESSIONS
-- =============================================

-- Recrear la función con el tipo correcto
CREATE OR REPLACE FUNCTION public.get_active_sessions()
RETURNS TABLE (
    game_id UUID,
    last_activity TIMESTAMP WITH TIME ZONE,
    player_count INTEGER,
    status TEXT,
    game_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        GREATEST(g.created_at, MAX(s.created_at)) as last_activity,
        COUNT(p.id)::INTEGER as player_count,  -- CAST a INTEGER
        g.status,
        g.game_type
    FROM public.games g
    LEFT JOIN public.players p ON g.id = p.game_id
    LEFT JOIN public.sessions s ON g.id = s.game_id
    WHERE g.status IN ('LOBBY', 'IN_PROGRESS')
    GROUP BY g.id, g.created_at, g.status, g.game_type
    ORDER BY last_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PASO 4: VERIFICAR POLÍTICAS RLS
-- =============================================

-- Asegurar que las políticas permitan lectura
DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

-- =============================================
-- PASO 5: PRUEBA DE FUNCIONAMIENTO
-- =============================================

-- Crear juego de prueba
INSERT INTO public.games (join_code, game_type, status, host_id)
VALUES ('SYNC_TEST_001', 'ROULETTE', 'LOBBY', NULL)
RETURNING id, join_code, game_type, status;

-- Agregar un jugador de prueba
-- INSERT INTO public.players (game_id, display_name) VALUES ('[ID_DEL_JUEGO]', 'Test Player');

-- Cambiar status a IN_PROGRESS (esto debería activar realtime)
-- UPDATE public.games SET status = 'IN_PROGRESS' WHERE join_code = 'SYNC_TEST_001';

-- Verificar que cambió
-- SELECT id, join_code, status, game_type FROM public.games WHERE join_code = 'SYNC_TEST_001';

-- Limpiar prueba
-- DELETE FROM public.games WHERE join_code = 'SYNC_TEST_001';

-- =============================================
-- PASO 6: VERIFICACIÓN FINAL
-- =============================================

-- Ejecutar función de sesiones activas
SELECT * FROM public.get_active_sessions();

-- Ejecutar limpieza automática
SELECT * FROM public.cleanup_old_sessions();

-- Ver estado de sesiones
SELECT * FROM public.session_monitor LIMIT 5;

-- =============================================
-- PASO 7: SI SIGUE SIN FUNCIONAR
-- =============================================

-- Forzar recreación completa del realtime
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Verificar permisos
-- GRANT SELECT ON public.games TO anon, authenticated;
-- GRANT SELECT ON public.players TO anon, authenticated;
-- GRANT SELECT ON public.sessions TO anon, authenticated;

-- =============================================
-- MONITOREO CONTINUO
-- =============================================

-- Para verificar que funciona, ejecuta periódicamente:
-- SELECT COUNT(*) as active_games FROM public.games WHERE status = 'IN_PROGRESS';

-- Si hay juegos atascados, limpiarlos:
-- UPDATE public.games SET status = 'FINISHED' WHERE created_at < NOW() - INTERVAL '1 hour' AND status = 'LOBBY';
