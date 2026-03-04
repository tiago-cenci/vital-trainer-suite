CREATE POLICY "personal_delete_correcoes_midias" ON public.correcoes_midias
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM correcoes c
    WHERE c.id = correcoes_midias.correcao_id
      AND is_exec_do_meu_aluno(c.sessoes_exercicios_execucoes_id)
      AND c.personal_user_id = auth.uid()
  )
);