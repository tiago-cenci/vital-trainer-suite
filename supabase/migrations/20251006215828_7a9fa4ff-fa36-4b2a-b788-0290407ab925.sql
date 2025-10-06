-- Criar enum para tipo de prescrição
CREATE TYPE prescricao_tipo_enum AS ENUM ('DETALHADA', 'PERIODIZACAO');

-- Alterar coluna prescricao_tipo da tabela sessoes_exercicios
-- Primeiro remover a coluna antiga
ALTER TABLE public.sessoes_exercicios DROP COLUMN IF EXISTS prescricao_tipo;

-- Adicionar a coluna com o novo tipo
ALTER TABLE public.sessoes_exercicios 
ADD COLUMN prescricao_tipo prescricao_tipo_enum NOT NULL DEFAULT 'DETALHADA';