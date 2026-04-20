-- Faixa de descanso por série (modo manual)
ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS descanso_min integer,
  ADD COLUMN IF NOT EXISTS descanso_max integer;

-- Observação livre por exercício na sessão
ALTER TABLE public.sessoes_exercicios
  ADD COLUMN IF NOT EXISTS observacoes text;