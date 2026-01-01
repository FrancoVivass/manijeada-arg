-- CHEQUEO RÁPIDO: ¿ESTÁ MIMIC CONFIGURADO CORRECTAMENTE?

-- 1. ¿La columna game_type existe y permite MIMIC?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'games'
AND table_schema = 'public'
AND column_name = 'game_type';

-- Debe mostrar: game_type | character varying | YES

-- 2. ¿MIMIC está en los valores permitidos?
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname LIKE '%game_type%'
AND conrelid = 'public.games'::regclass;

-- Debe incluir 'MIMIC' en la lista: ['ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC']

-- 3. ¿Hay juegos MIMIC existentes?
SELECT COUNT(*) as mimic_games_count
FROM public.games
WHERE game_type = 'MIMIC';

-- 4. ¿El realtime está configurado para games?
SELECT COUNT(*) as realtime_tables
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'games';

-- Debe ser 1 (sí está configurado)

-- 5. ¿Las políticas RLS permiten operaciones?
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'games'
AND policyname LIKE '%update%';

-- Debe mostrar políticas que permitan host_id IS NULL

-- =============================================
-- SI ALGUNA DE ESTAS FALLA, EJECUTA:
-- =============================================

-- Para agregar MIMIC al constraint:
/*
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_game_type_check;
ALTER TABLE public.games ADD CONSTRAINT games_game_type_check CHECK (game_type IN ('ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC'));
*/

-- Para permitir host_id NULL:
/*
ALTER TABLE public.games ALTER COLUMN host_id DROP NOT NULL;
*/

-- Para actualizar políticas RLS:
/*
DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);
*/

-- Para habilitar realtime:
/*
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
*/
