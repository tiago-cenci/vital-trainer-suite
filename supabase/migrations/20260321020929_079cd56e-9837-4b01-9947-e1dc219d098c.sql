
-- Enum for field types
CREATE TYPE public.anamnese_tipo_campo AS ENUM ('text', 'number', 'date', 'select', 'textarea', 'boolean');

-- Template fields configured by personal trainer
CREATE TABLE public.anamnese_campos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  tipo anamnese_tipo_campo NOT NULL DEFAULT 'text',
  opcoes jsonb DEFAULT NULL,
  obrigatorio boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.anamnese_campos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnese_campos_owner_crud" ON public.anamnese_campos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Student answers
CREATE TABLE public.anamnese_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  campo_id uuid NOT NULL REFERENCES public.anamnese_campos(id) ON DELETE CASCADE,
  valor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, campo_id)
);

ALTER TABLE public.anamnese_respostas ENABLE ROW LEVEL SECURITY;

-- Personal can CRUD answers for their students
CREATE POLICY "anamnese_respostas_personal" ON public.anamnese_respostas
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = anamnese_respostas.aluno_id AND a.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = anamnese_respostas.aluno_id AND a.user_id = auth.uid()
  ));

-- Student can read and update their own answers
CREATE POLICY "anamnese_respostas_aluno_select" ON public.anamnese_respostas
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = anamnese_respostas.aluno_id AND a.aluno_user_id = auth.uid()
  ));

CREATE POLICY "anamnese_respostas_aluno_update" ON public.anamnese_respostas
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = anamnese_respostas.aluno_id AND a.aluno_user_id = auth.uid()
  ));

CREATE POLICY "anamnese_respostas_aluno_insert" ON public.anamnese_respostas
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id = anamnese_respostas.aluno_id AND a.aluno_user_id = auth.uid()
  ));

-- Student can also read the campo definitions (to render the form)
CREATE POLICY "anamnese_campos_aluno_select" ON public.anamnese_campos
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.user_id = anamnese_campos.user_id AND a.aluno_user_id = auth.uid()
  ));

-- Trigger to update updated_at on respostas
CREATE TRIGGER set_anamnese_respostas_updated_at
  BEFORE UPDATE ON public.anamnese_respostas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
