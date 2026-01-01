-- VERIFICACIÓN DEL ESTADO DE LA BASE DE DATOS PARA MANIJEADA
-- Ejecutar estas consultas para verificar que todo esté configurado correctamente

-- =============================================
-- 1. VERIFICAR TABLAS EXISTENTES
-- =============================================

SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 2. VERIFICAR COLUMNAS DE GAMES
-- =============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'games' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 3. VERIFICAR VALORES PERMITIDOS EN GAME_TYPE
-- =============================================

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname LIKE '%game_type%'
AND conrelid = 'public.games'::regclass;

-- =============================================
-- 4. VERIFICAR JUEGOS EXISTENTES
-- =============================================

SELECT id, join_code, status, game_type, host_id, created_at
FROM public.games
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 5. VERIFICAR POLÍTICAS RLS
-- =============================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 6. VERIFICAR REALTIME CONFIGURATION
-- =============================================

SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- =============================================
-- 7. VERIFICAR FUNCIONES DISPONIBLES
-- =============================================

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%cleanup%' OR routine_name LIKE '%session%'
ORDER BY routine_name;

-- =============================================
-- QUERIES DE DIAGNÓSTICO RÁPIDO
-- =============================================

-- Ver si MIMIC está en los tipos permitidos
-- SELECT unnest(enum_range(NULL::game_type_enum)) as allowed_types;

-- Ver juegos activos
-- SELECT COUNT(*) as active_games FROM public.games WHERE status IN ('LOBBY', 'IN_PROGRESS');

-- Ver sesiones recientes
-- SELECT game_id, action_type, created_at FROM public.sessions ORDER BY created_at DESC LIMIT 5;
