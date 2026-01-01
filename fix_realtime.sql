-- =============================================
-- SOLUCIÓN COMPLETA PARA EL PROBLEMA DE REALTIME
-- =============================================

-- El error indica que la publicación supabase_realtime NO EXISTE
-- Necesitamos crearla desde cero

-- =============================================
-- PASO 1: CREAR LA PUBLICACIÓN DE REALTIME
-- =============================================

-- Crear la publicación si no existe
CREATE PUBLICATION supabase_realtime FOR TABLE public.games, public.players, public.sessions;

-- Si ya existe pero está corrupta, recrearla
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime FOR TABLE public.games, public.players, public.sessions;

-- =============================================
-- PASO 2: VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- =============================================

-- Verificar que la publicación existe
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Debe mostrar 1 fila

-- =============================================
-- PASO 3: VERIFICAR TABLAS INCLUIDAS
-- =============================================

-- Verificar qué tablas están en la publicación
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Debe mostrar: games, players, sessions

-- =============================================
-- PASO 4: PRUEBA DE FUNCIONAMIENTO
-- =============================================

-- Crear un juego de prueba
INSERT INTO public.games (join_code, game_type, status, host_id)
VALUES ('TEST456', 'ROULETTE', 'LOBBY', NULL)
RETURNING id, join_code, game_type, status;

-- Actualizar el status (esto debería activar realtime)
UPDATE public.games
SET status = 'IN_PROGRESS'
WHERE join_code = 'TEST456';

-- Verificar que cambió
SELECT id, join_code, status, game_type
FROM public.games
WHERE join_code = 'TEST456';

-- Limpiar la prueba
DELETE FROM public.games WHERE join_code = 'TEST456';

-- =============================================
-- PASO 5: VERIFICACIÓN FINAL
-- =============================================

-- Si todo funciona, deberías poder ejecutar:
SELECT * FROM public.get_active_sessions();
SELECT * FROM public.cleanup_old_sessions();

-- =============================================
-- SOLUCIÓN DE EMERGENCIA SI NO FUNCIONA
-- =============================================

-- Si hay problemas de permisos, intenta con:
-- GRANT ALL ON public.games TO anon, authenticated;
-- GRANT ALL ON public.players TO anon, authenticated;
-- GRANT ALL ON public.sessions TO anon, authenticated;

-- Verificar permisos
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants
-- WHERE table_name IN ('games', 'players', 'sessions') AND grantee IN ('anon', 'authenticated');
