-- =============================================
-- LIMPIEZA AUTOMÁTICA DE SESIONES VIEJAS
-- =============================================
-- Función que cierra automáticamente las sesiones después de 4 horas
-- Se puede ejecutar manualmente o configurar como cron job

-- =============================================
-- 1. FUNCIÓN DE LIMPIEZA
-- =============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS TABLE (
    closed_games INTEGER,
    cleaned_sessions INTEGER,
    notified_users INTEGER
) AS $$
DECLARE
    cutoff_time TIMESTAMP WITH TIME ZONE;
    games_closed INTEGER := 0;
    sessions_cleaned INTEGER := 0;
    users_notified INTEGER := 0;
    temp_count INTEGER := 0;
    game_record RECORD;
    player_record RECORD;
BEGIN
    -- 4 horas atrás
    cutoff_time := NOW() - INTERVAL '4 hours';

    -- 1. Cerrar juegos que han estado en LOBBY por más de 4 horas
    UPDATE public.games
    SET status = 'FINISHED',
        settings = settings || '{"cleanup_reason": "timeout_4h_lobby"}'::jsonb
    WHERE status = 'LOBBY'
    AND created_at < cutoff_time;

    GET DIAGNOSTICS games_closed = ROW_COUNT;

    -- 2. Cerrar juegos IN_PROGRESS que no han tenido actividad en 4 horas
    -- (basado en la última actualización de la tabla sessions)
    UPDATE public.games
    SET status = 'FINISHED',
        settings = settings || '{"cleanup_reason": "timeout_4h_inactive"}'::jsonb
    WHERE status = 'IN_PROGRESS'
    AND id NOT IN (
        SELECT DISTINCT game_id
        FROM public.sessions
        WHERE created_at >= cutoff_time
    );

    -- Acumular el conteo de juegos cerrados
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    games_closed := games_closed + temp_count;

    -- 3. Limpiar sesiones antiguas (más de 24 horas)
    DELETE FROM public.sessions
    WHERE created_at < (NOW() - INTERVAL '24 hours');

    GET DIAGNOSTICS sessions_cleaned = ROW_COUNT;

    -- 4. Log de la limpieza (opcional)
    INSERT INTO public.sessions (
        game_id,
        player_id,
        action_type,
        action_description
    ) VALUES (
        NULL,
        NULL,
        'SYSTEM_CLEANUP',
        jsonb_build_object(
            'timestamp', NOW(),
            'games_closed', games_closed,
            'sessions_cleaned', sessions_cleaned,
            'cutoff_time', cutoff_time
        )::text
    );

    -- Retornar estadísticas
    RETURN QUERY SELECT games_closed, sessions_cleaned, users_notified;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. FUNCIÓN PARA VERIFICAR SESIONES ACTIVAS
-- =============================================

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
        COUNT(p.id)::INTEGER as player_count,
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
-- 3. VISTA PARA MONITOREAR SESIONES
-- =============================================

CREATE OR REPLACE VIEW public.session_monitor AS
SELECT
    g.id,
    g.join_code,
    g.status,
    g.game_type,
    g.created_at,
    COUNT(p.id) as player_count,
    MAX(s.created_at) as last_session_activity,
    CASE
        WHEN g.status = 'LOBBY' AND g.created_at < (NOW() - INTERVAL '4 hours') THEN 'EXPIRED_LOBBY'
        WHEN g.status = 'IN_PROGRESS' AND (
            SELECT MAX(s2.created_at) FROM public.sessions s2 WHERE s2.game_id = g.id
        ) < (NOW() - INTERVAL '4 hours') THEN 'EXPIRED_INACTIVE'
        ELSE 'ACTIVE'
    END as session_status
FROM public.games g
LEFT JOIN public.players p ON g.id = p.game_id
LEFT JOIN public.sessions s ON g.id = s.game_id
GROUP BY g.id, g.join_code, g.status, g.game_type, g.created_at;

-- =============================================
-- 4. TRIGGER PARA AUTO-LIMPIEZA (OPCIONAL)
-- =============================================

-- Crear una función que se ejecute automáticamente cada hora
-- Nota: Esto requiere configuración adicional en Supabase

-- =============================================
-- 5. EJEMPLOS DE USO
-- =============================================

-- Ver sesiones activas:
-- SELECT * FROM public.get_active_sessions();

-- Ejecutar limpieza manual:
-- SELECT * FROM public.cleanup_old_sessions();

-- Ver estado de todas las sesiones:
-- SELECT * FROM public.session_monitor;

-- =============================================
-- 6. CONFIGURACIÓN DE CRON JOB (SUPABASE)
-- =============================================

-- Para ejecutar automáticamente cada hora, puedes:
-- 1. Usar Supabase Edge Functions con un cron trigger
-- 2. Configurar un webhook externo
-- 3. Ejecutar manualmente desde tu aplicación

-- Ejemplo de Edge Function:
/*
export async function cleanupOldSessions() {
  const { data, error } = await supabase.rpc('cleanup_old_sessions');
  if (error) console.error('Cleanup error:', error);
  else console.log('Cleanup completed:', data);
}
*/

-- =============================================
-- FIN DEL ARCHIVO
-- =============================================
