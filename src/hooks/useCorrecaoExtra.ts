import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch exercise name for a given execucao
 */
export function useExercicioFromExec(execId?: string | null) {
  return useQuery({
    queryKey: ['exercicio:from-exec', execId],
    enabled: !!execId,
    queryFn: async () => {
      const { data: exec } = await supabase
        .from('sessoes_exercicios_execucoes')
        .select('sessoes_exercicios_id')
        .eq('id', execId!)
        .single();
      if (!exec) return null;

      const { data: se } = await supabase
        .from('sessoes_exercicios')
        .select('exercicio_id')
        .eq('id', exec.sessoes_exercicios_id)
        .single();
      if (!se?.exercicio_id) return null;

      const { data: exercicio } = await supabase
        .from('exercicios')
        .select('id, nome')
        .eq('id', se.exercicio_id)
        .single();

      return exercicio ?? null;
    },
  });
}

/**
 * Average rating for a specific exercise + student combination
 */
export function useMediaNotaExercicio(execId?: string | null) {
  return useQuery({
    queryKey: ['correcao:media-nota', execId],
    enabled: !!execId,
    queryFn: async (): Promise<number | null> => {
      if (!execId) return null;

      // Get exercicio_id and aluno_id from the exec
      const { data: exec } = await supabase
        .from('sessoes_exercicios_execucoes')
        .select('sessoes_exercicios_id, treino_execucao_id')
        .eq('id', execId)
        .single();
      if (!exec) return null;

      const [{ data: se }, { data: te }] = await Promise.all([
        supabase.from('sessoes_exercicios').select('exercicio_id').eq('id', exec.sessoes_exercicios_id).single(),
        supabase.from('treinos_execucoes').select('aluno_id').eq('id', exec.treino_execucao_id).single(),
      ]);
      if (!se?.exercicio_id || !te?.aluno_id) return null;

      // Get all execs for this exercise + student
      const { data: allTe } = await supabase
        .from('treinos_execucoes')
        .select('id')
        .eq('aluno_id', te.aluno_id);
      if (!allTe?.length) return null;

      const { data: allSe } = await supabase
        .from('sessoes_exercicios')
        .select('id')
        .eq('exercicio_id', se.exercicio_id);
      if (!allSe?.length) return null;

      const teIds = allTe.map(t => t.id);
      const seIds = allSe.map(s => s.id);

      const { data: execs } = await supabase
        .from('sessoes_exercicios_execucoes')
        .select('id')
        .in('treino_execucao_id', teIds)
        .in('sessoes_exercicios_id', seIds);
      if (!execs?.length) return null;

      const execIds = execs.map(e => e.id);

      // Get all corrections with ratings
      const { data: correcoes } = await supabase
        .from('correcoes')
        .select('pontuacao_opcional')
        .in('sessoes_exercicios_execucoes_id', execIds)
        .eq('status', 'ENVIADA')
        .not('pontuacao_opcional', 'is', null);

      if (!correcoes?.length) return null;

      const sum = correcoes.reduce((acc, c) => acc + (c.pontuacao_opcional ?? 0), 0);
      return sum / correcoes.length;
    },
  });
}

/**
 * Weekly evolution data for a student: average score per week across all exercises
 */
export function useEvolucaoAluno(alunoId?: string) {
  return useQuery({
    queryKey: ['evolucao:aluno', alunoId],
    enabled: !!alunoId,
    queryFn: async () => {
      if (!alunoId) return [];

      // Get all treinos_execucoes for this student
      const { data: tes } = await supabase
        .from('treinos_execucoes')
        .select('id')
        .eq('aluno_id', alunoId);
      if (!tes?.length) return [];

      const teIds = tes.map(t => t.id);

      // Get all execs
      const { data: execs } = await supabase
        .from('sessoes_exercicios_execucoes')
        .select('id, started_at, created_at')
        .in('treino_execucao_id', teIds)
        .order('started_at', { ascending: true });
      if (!execs?.length) return [];

      const execIds = execs.map(e => e.id);

      // Get all sent corrections with ratings
      const { data: correcoes } = await supabase
        .from('correcoes')
        .select('sessoes_exercicios_execucoes_id, pontuacao_opcional, created_at')
        .in('sessoes_exercicios_execucoes_id', execIds)
        .eq('status', 'ENVIADA')
        .not('pontuacao_opcional', 'is', null);
      if (!correcoes?.length) return [];

      // Map exec id to date
      const execDateMap = new Map(execs.map(e => [e.id, e.started_at ?? e.created_at]));

      // Group by ISO week
      const weeklyScores: Record<string, number[]> = {};
      for (const c of correcoes) {
        const dateStr = execDateMap.get(c.sessoes_exercicios_execucoes_id);
        if (!dateStr) continue;
        const d = new Date(dateStr);
        // Get Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        const weekKey = monday.toISOString().slice(0, 10);

        if (!weeklyScores[weekKey]) weeklyScores[weekKey] = [];
        weeklyScores[weekKey].push(c.pontuacao_opcional!);
      }

      return Object.entries(weeklyScores)
        .map(([semana, scores]) => ({
          semana,
          media: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
          total: scores.length,
        }))
        .sort((a, b) => a.semana.localeCompare(b.semana));
    },
  });
}
