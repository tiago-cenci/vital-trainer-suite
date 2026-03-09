
-- Drop all existing dashboard views
DROP VIEW IF EXISTS public.vw_mrr CASCADE;
DROP VIEW IF EXISTS public.vw_active_subscriptions CASCADE;
DROP VIEW IF EXISTS public.vw_alunos_ativos CASCADE;
DROP VIEW IF EXISTS public.vw_correcoes_sla CASCADE;
DROP VIEW IF EXISTS public.vw_correcoes_status CASCADE;
DROP VIEW IF EXISTS public.vw_execucao_kpis CASCADE;
DROP VIEW IF EXISTS public.vw_execucoes_semana CASCADE;
DROP VIEW IF EXISTS public.vw_media_usage CASCADE;
DROP VIEW IF EXISTS public.vw_top_exercicios CASCADE;

-- vw_active_subscriptions: filter by personal's alunos
CREATE VIEW public.vw_active_subscriptions
WITH (security_invoker=on) AS
SELECT ass.id, ass.aluno_id, ass.valor, ass.data_inicio, ass.data_vencimento
FROM assinaturas ass
JOIN alunos a ON a.id = ass.aluno_id
WHERE a.user_id = auth.uid()
  AND CURRENT_DATE >= ass.data_inicio
  AND CURRENT_DATE <= ass.data_vencimento;

-- vw_mrr: based on filtered active subscriptions
CREATE VIEW public.vw_mrr
WITH (security_invoker=on) AS
SELECT
  COALESCE(sum(valor), 0) AS mrr,
  COALESCE(avg(valor), 0) AS arpu,
  count(DISTINCT aluno_id) AS alunos_com_assinatura
FROM vw_active_subscriptions;

-- vw_alunos_ativos: filter by personal's alunos
CREATE VIEW public.vw_alunos_ativos
WITH (security_invoker=on) AS
SELECT DISTINCT a.id AS aluno_id
FROM alunos a
LEFT JOIN treinos t ON t.aluno_id = a.id AND t.ativo = true
LEFT JOIN treinos_execucoes te ON te.aluno_id = a.id AND te.started_at >= (now() - interval '30 days')
WHERE a.user_id = auth.uid()
  AND (t.id IS NOT NULL OR te.id IS NOT NULL);

-- vw_correcoes_sla: filter by personal's correcoes
CREATE VIEW public.vw_correcoes_sla
WITH (security_invoker=on) AS
WITH base AS (
  SELECT c.id, c.created_at AS correcao_criada, se.started_at AS exec_started
  FROM correcoes c
  JOIN sessoes_exercicios_execucoes se ON se.id = c.sessoes_exercicios_execucoes_id
  WHERE c.personal_user_id = auth.uid()
)
SELECT avg(EXTRACT(epoch FROM (correcao_criada - exec_started))) AS sla_medio_seg
FROM base;

-- vw_correcoes_status: filter by personal
CREATE VIEW public.vw_correcoes_status
WITH (security_invoker=on) AS
SELECT status::text, count(*) AS qtd
FROM correcoes
WHERE personal_user_id = auth.uid()
GROUP BY status::text;

-- vw_execucao_kpis: filter by personal's alunos
CREATE VIEW public.vw_execucao_kpis
WITH (security_invoker=on) AS
SELECT
  count(*) FILTER (WHERE te.status IS NOT NULL) AS iniciadas,
  count(*) FILTER (WHERE te.ended_at IS NOT NULL) AS concluidas,
  round(100.0 * count(*) FILTER (WHERE te.ended_at IS NOT NULL)::numeric / NULLIF(count(*), 0)::numeric, 1) AS adesao_pct,
  avg(EXTRACT(epoch FROM (te.ended_at - te.started_at))) AS duracao_media_seg
FROM treinos_execucoes te
JOIN alunos a ON a.id = te.aluno_id
WHERE a.user_id = auth.uid()
  AND te.started_at >= (now() - interval '30 days');

-- vw_execucoes_semana: filter by personal's alunos
CREATE VIEW public.vw_execucoes_semana
WITH (security_invoker=on) AS
SELECT
  to_char(date_trunc('week', te.started_at), 'YYYY-"W"IW') AS semana,
  date_trunc('week', te.started_at)::date AS semana_dt,
  count(*) AS execucoes
FROM treinos_execucoes te
JOIN alunos a ON a.id = te.aluno_id
WHERE a.user_id = auth.uid()
  AND te.started_at >= (now() - interval '56 days')
GROUP BY 1, 2
ORDER BY 2;

-- vw_media_usage: filter by owner
CREATE VIEW public.vw_media_usage
WITH (security_invoker=on) AS
SELECT provider,
  COALESCE(sum(size_bytes), 0) AS bytes_total,
  round(COALESCE(sum(size_bytes), 0) / 1024.0 / 1024.0 / 1024.0, 3) AS gb_total,
  avg(duration_sec) AS avg_duracao_seg
FROM media_files
WHERE owner_user_id = auth.uid() AND deleted_at IS NULL
GROUP BY provider;

-- vw_top_exercicios: filter by personal's alunos
CREATE VIEW public.vw_top_exercicios
WITH (security_invoker=on) AS
SELECT e.id, e.nome, count(sex.id) AS execucoes
FROM sessoes_exercicios_execucoes sex
JOIN sessoes_exercicios se ON se.id = sex.sessoes_exercicios_id
JOIN exercicios e ON e.id = se.exercicio_id
JOIN treinos_execucoes te ON te.id = sex.treino_execucao_id
JOIN alunos a ON a.id = te.aluno_id
WHERE a.user_id = auth.uid()
  AND sex.started_at >= (now() - interval '30 days')
GROUP BY e.id, e.nome
ORDER BY count(sex.id) DESC
LIMIT 10;
