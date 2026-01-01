-- ACTUALIZACIÓN DE BASE DE DATOS PARA JUEGO DE MÍMICA
-- Ejecutar estas consultas en Supabase SQL Editor para agregar soporte al juego de Mímica

-- 1. Agregar columna game_type a la tabla games (si no existe)
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'ROULETTE' CHECK (game_type IN ('ROULETTE', 'CARDS', 'IMPOSTOR', 'MIMIC'));

-- 2. Permitir NULL en host_id para invitados
ALTER TABLE public.games
ALTER COLUMN host_id DROP NOT NULL;

-- 3. Agregar constraint de foreign key (opcional, pero recomendado)
-- Nota: Esta línea puede fallar si ya hay datos inconsistentes
-- ALTER TABLE public.games ADD CONSTRAINT fk_games_host_id FOREIGN KEY (host_id) REFERENCES public.users(id);

-- 4. Actualizar políticas RLS para permitir host_id NULL
DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE USING (auth.uid() = host_id OR host_id IS NULL);

-- 5. Habilitar realtime para la nueva columna (si es necesario)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.games; -- Ya debería estar habilitado

-- VERIFICACIÓN: Ejecutar esta consulta para ver que todo esté correcto
-- SELECT id, host_id, game_type, status, settings FROM public.games LIMIT 5;
