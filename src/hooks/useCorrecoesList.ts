import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Exec = Tables<'sessoes_exercicios_execucoes'>;
type Correcao = Tables<'correcoes'>;
type SEx = Tables<'sessoes_exercicios'>;
type Exercicio = Tables<'exercicios'>;
type TreinoExec = Tables<'treinos_execucoes'>;
type Aluno = Tables<'alunos'>;

export interface CorrecoesFilters {
  search?: string;           // aluno ou exercício
  onlyComVideo?: boolean;
  status?: 'SEM_CORRECAO' | 'RASCUNHO' | 'ENVIADA';
  alunoId?: string;
  from?: string;             // ISO
  to?: string;               // ISO
  limit?: number;
}

export interface CorrecaoRow {
  execId: string;
  data: string | null;
  temVideo: boolean;
  videoPath: string | null;
  alunoNome: string;
  exercicioNome: string;
  statusCorrecao: 'SEM_CORRECAO' | 'RASCUNHO' | 'ENVIADA';
}

export function useCorrecoesList(filters: CorrecoesFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['correcoes:list', user?.id, filters],
    enabled: !!user,
    queryFn: async (): Promise<CorrecaoRow[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      // 1) Buscar execuções base
      let q = supabase
        .from('sessoes_exercicios_execucoes')
        .select('id, created_at, started_at, video_path, sessoes_exercicios_id, treino_execucao_id, ordem')
        .order('created_at', { ascending: false })
        .limit(filters.limit ?? 100);

      if (filters.from) q = q.gte('created_at', filters.from);
      if (filters.to) q = q.lte('created_at', filters.to);

      const { data: execs, error: e1 } = await q;
      if (e1) throw e1;
      const execsData = (execs ?? []) as Exec[];

      if (execsData.length === 0) return [];

      // 2) Buscar relacionamentos (em lote)
      const sessoesIds = Array.from(new Set(execsData.map(x => x.sessoes_exercicios_id)));
      const treinoExecIds = Array.from(new Set(execsData.map(x => x.treino_execucao_id)));
      const execIds = execsData.map(x => x.id);

      const [{ data: sessoes, error: e2 }, { data: treinosExec, error: e3 }] = await Promise.all([
        supabase.from('sessoes_exercicios').select('id, exercicio_id').in('id', sessoesIds),
        supabase.from('treinos_execucoes').select('id, aluno_id').in('id', treinoExecIds),
      ]);
      if (e2) throw e2;
      if (e3) throw e3;

      const exercicioIds = Array.from(new Set((sessoes ?? []).map(s => s.exercicio_id).filter(Boolean) as string[]));
      const alunoIds = Array.from(new Set((treinosExec ?? []).map(t => t.aluno_id)));

      const [{ data: exercicios, error: e4 }, { data: alunos, error: e5 }] = await Promise.all([
        supabase.from('exercicios').select('id, nome').in('id', exercicioIds),
        supabase.from('alunos').select('id, nome').in('id', alunoIds),
      ]);
      if (e4) throw e4;
      if (e5) throw e5;

      // 3) Última correção por execução
      const { data: correcoes, error: e6 } = await supabase
        .from('correcoes')
        .select('id, status, sessoes_exercicios_execucoes_id, created_at')
        .in('sessoes_exercicios_execucoes_id', execIds)
        .order('created_at', { ascending: false });
      if (e6) throw e6;

      // 4) Mapas auxiliares
      const mapSessao = new Map((sessoes as SEx[]).map(s => [s.id, s]));
      const mapExercicio = new Map((exercicios as Exercicio[]).map(e => [e.id, e.nome]));
      const mapTreinoExec = new Map((treinosExec as TreinoExec[]).map(t => [t.id, t.aluno_id]));
      const mapAluno = new Map((alunos as Aluno[]).map(a => [a.id, a.nome]));
      const mapUltimaCorrecao = new Map<string, Correcao>();
      (correcoes ?? []).forEach(c => {
        const key = c.sessoes_exercicios_execucoes_id;
        if (!mapUltimaCorrecao.has(key)) mapUltimaCorrecao.set(key, c as Correcao);
      });

      // 5) Montar linhas
      let rows: CorrecaoRow[] = execsData.map(ex => {
        const sessao = mapSessao.get(ex.sessoes_exercicios_id as string);
        const exercicioNome = sessao ? (mapExercicio.get(sessao.exercicio_id as string) ?? 'Exercício') : 'Exercício';
        const alunoId = mapTreinoExec.get(ex.treino_execucao_id as string);
        const alunoNome = alunoId ? (mapAluno.get(alunoId) ?? 'Aluno') : 'Aluno';
        const ult = mapUltimaCorrecao.get(ex.id);
        const status: CorrecaoRow['statusCorrecao'] = ult ? (ult.status as any) : 'SEM_CORRECAO';

        return {
          execId: ex.id,
          data: ex.started_at ?? ex.created_at ?? null,
          temVideo: !!ex.video_path,
          videoPath: ex.video_path,
          alunoNome,
          exercicioNome,
          statusCorrecao: status,
        };
      });

      // 6) Filtros
      if (filters.onlyComVideo) rows = rows.filter(r => r.temVideo);
      if (filters.status) rows = rows.filter(r => r.statusCorrecao === filters.status);
      if (filters.alunoId) {
        // Reaproveitar treino_execucoes -> aluno_id
        const allowExecIds = new Set(
          (treinosExec as TreinoExec[]).filter(t => t.aluno_id === filters.alunoId).flatMap(t =>
            execsData.filter(e => e.treino_execucao_id === t.id).map(e => e.id),
          ),
        );
        rows = rows.filter(r => allowExecIds.has(r.execId));
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        rows = rows.filter(r =>
          `${r.alunoNome} ${r.exercicioNome}`.toLowerCase().includes(s),
        );
      }

      return rows;
    },
  });
}
