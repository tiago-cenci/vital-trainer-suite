/**
 * useTreinos.tsx
 *
 * Persistência de treinos com:
 * - Séries individuais (reps_min/max + descanso_min/max)
 * - Observação por exercício
 * - data_inicio, data_vencimento, descricao_plano no treino
 * - Geração automática de treino_semanas via RPC quando há periodização + data_inicio
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import type { SessaoLocal } from '@/types/treino';
import { dbToExercicioLocal } from '@/types/treino';

type Treino = Tables<'treinos'>;
type Sessao = Tables<'sessoes'>;
type SessaoExercicio = Tables<'sessoes_exercicios'>;
type Serie = Tables<'series'>;
type Aluno = Tables<'alunos'>;
type Exercicio = Tables<'exercicios'>;
type Periodizacao = Tables<'periodizacoes'>;

export interface TreinoFilters {
  search?: string;
  aluno_id?: string;
  ativo?: boolean;
  usa_periodizacao?: boolean;
}

export interface TreinoCompleto extends Treino {
  alunos: Pick<Aluno, 'id' | 'nome' | 'user_id'>;
  periodizacoes?: Pick<Periodizacao, 'id' | 'nome'>;
  sessoes: (Sessao & {
    sessoes_exercicios: (SessaoExercicio & {
      exercicios: Pick<Exercicio, 'id' | 'nome' | 'grupos_musculares'>;
      series: Serie[];
    })[];
    sessoes_alongamentos?: any[];
  })[];
}

const TREINO_SELECT = `
  *,
  alunos (*),
  periodizacoes (id, nome),
  sessoes (
    *,
    sessoes_exercicios (
      *,
      exercicios (*),
      series (*)
    ),
    sessoes_alongamentos (
      *,
      alongamentos (*)
    )
  )
` as const;

// ─── Persistência de sessões ─────────────────────────────────────────────────

async function persistirSessoes(
  treinoId: string,
  sessoes: SessaoLocal[],
  sessaoIdsExistentes: Set<string> = new Set()
) {
  // 1. Apagar sessões removidas
  const keepIds = new Set(
    sessoes.filter((s) => !s.id.startsWith('temp_')).map((s) => s.id)
  );
  for (const existingId of sessaoIdsExistentes) {
    if (!keepIds.has(existingId)) {
      await supabase.from('sessoes_exercicios').delete().eq('sessao_id', existingId);
      await supabase.from('sessoes_alongamentos').delete().eq('sessao_id', existingId);
      await supabase.from('sessoes').delete().eq('id', existingId);
    }
  }

  // 2. Para cada sessão: insert/update + recriar exercícios e alongamentos
  for (const sessao of sessoes) {
    let sessaoId: string;

    if (sessao.id.startsWith('temp_')) {
      const { data, error } = await supabase
        .from('sessoes')
        .insert({ treino_id: treinoId, nome: sessao.nome, ordem: sessao.ordem })
        .select('id')
        .single();
      if (error) throw error;
      sessaoId = data.id;
    } else {
      await supabase
        .from('sessoes')
        .update({ nome: sessao.nome, ordem: sessao.ordem })
        .eq('id', sessao.id);
      sessaoId = sessao.id;
      await supabase.from('sessoes_exercicios').delete().eq('sessao_id', sessaoId);
      await supabase.from('sessoes_alongamentos').delete().eq('sessao_id', sessaoId);
    }

    // 3. Alongamentos
    if (sessao.alongamentos && sessao.alongamentos.length > 0) {
      const alongsData = sessao.alongamentos.map((a, i) => ({
        sessao_id: sessaoId,
        alongamento_id: a.alongamento_id,
        ordem: a.ordem ?? i + 1,
        observacoes: a.observacoes,
      }));
      const { error } = await supabase.from('sessoes_alongamentos').insert(alongsData);
      if (error) throw error;
    }

    // 4. Exercícios + séries
    for (const ex of sessao.exercicios) {
      const primeiraSerie = ex.series[0];
      const { data: seData, error: seError } = await supabase
        .from('sessoes_exercicios')
        .insert({
          sessao_id: sessaoId,
          exercicio_id: ex.exercicio_id,
          ordem: ex.ordem,
          prescricao_tipo: ex.prescricao_tipo,
          usar_periodizacao: ex.usar_periodizacao,
          observacoes: ex.observacoes,
          // Legado — mantido para compat
          series_qtd: ex.series.length || null,
          reps_min: primeiraSerie?.reps_min ?? null,
          reps_max: primeiraSerie?.reps_max ?? null,
          descanso_seg: primeiraSerie?.descanso_min ?? null,
        })
        .select('id')
        .single();
      if (seError) throw seError;

      if (ex.series.length > 0) {
        const seriesData = ex.series.map((s, i) => ({
          sessao_exercicio_id: seData.id,
          tipo: s.tipo,
          ordem: s.ordem ?? i + 1,
          reps_min: s.reps_min,
          reps_max: s.reps_max,
          descanso_min: s.descanso_min,
          descanso_max: s.descanso_max,
          // Legado: descanso_seg = média
          descanso_seg: Math.round((s.descanso_min + s.descanso_max) / 2),
        }));
        const { error } = await supabase.from('series').insert(seriesData);
        if (error) throw error;
      }
    }
  }
}

/** Gera as semanas (treino_semanas) via RPC quando aplicável */
async function gerarSemanasSeAplicavel(
  treinoId: string,
  data_inicio: string | null | undefined,
  periodizacao_id: string | null | undefined,
  forcarRecalculo: boolean = false
) {
  if (!data_inicio || !periodizacao_id) {
    // Sem condição para gerar grade — limpa qualquer grade existente
    if (forcarRecalculo) {
      await supabase.from('treino_semanas').delete().eq('treino_id', treinoId);
    }
    return;
  }
  if (forcarRecalculo) {
    await supabase.from('treino_semanas').delete().eq('treino_id', treinoId);
  }
  await supabase.rpc('gerar_semanas_treino', {
    p_treino_id: treinoId,
    p_data_inicio: data_inicio,
  });
}

// ─── Hook principal ──────────────────────────────────────────────────────────

interface SaveTreinoPayload {
  nome: string;
  aluno_id: string;
  sessoes_semanais: number;
  periodizacao_id?: string | null;
  usar_periodizacao: boolean;
  data_inicio?: string | null;
  data_vencimento?: string | null;
  descricao_plano?: string | null;
  sessoes: SessaoLocal[];
  /** Quando true (edição), recalcula a grade de semanas do zero */
  recalcularSemanas?: boolean;
}

export function useTreinos(filters: TreinoFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['treinos', user?.id, filters],
    queryFn: async (): Promise<TreinoCompleto[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      let q = supabase
        .from('treinos')
        .select(TREINO_SELECT)
        .eq('alunos.user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.search) q = q.ilike('nome', `%${filters.search}%`);
      if (filters.aluno_id) q = q.eq('aluno_id', filters.aluno_id);
      if (filters.ativo !== undefined) q = q.eq('ativo', filters.ativo);
      if (filters.usa_periodizacao !== undefined) {
        filters.usa_periodizacao
          ? (q = q.not('periodizacao_id', 'is', null))
          : (q = q.is('periodizacao_id', null));
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((t: any) => ({ ...t, sessoes: t.sessoes ?? [] }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: SaveTreinoPayload) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: treino, error } = await supabase
        .from('treinos')
        .insert({
          nome: data.nome,
          aluno_id: data.aluno_id,
          sessoes_semanais: data.sessoes_semanais,
          periodizacao_id: data.periodizacao_id ?? null,
          data_inicio: data.data_inicio ?? null,
          data_vencimento: data.data_vencimento ?? null,
          descricao_plano: data.descricao_plano ?? null,
          ativo: false,
        })
        .select('id')
        .single();
      if (error) throw error;

      await persistirSessoes(treino.id, data.sessoes);
      await gerarSemanasSeAplicavel(treino.id, data.data_inicio, data.periodizacao_id, true);
      return treino;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      queryClient.invalidateQueries({ queryKey: ['treino-semanas'] });
      toast({ title: 'Treino criado com sucesso!' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao criar treino', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SaveTreinoPayload & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      await supabase
        .from('treinos')
        .update({
          nome: data.nome,
          aluno_id: data.aluno_id,
          sessoes_semanais: data.sessoes_semanais,
          periodizacao_id: data.periodizacao_id ?? null,
          data_inicio: data.data_inicio ?? null,
          data_vencimento: data.data_vencimento ?? null,
          descricao_plano: data.descricao_plano ?? null,
        })
        .eq('id', data.id);

      const { data: existing } = await supabase
        .from('sessoes')
        .select('id')
        .eq('treino_id', data.id);
      const existingIds = new Set((existing ?? []).map((s) => s.id));

      await persistirSessoes(data.id, data.sessoes, existingIds);
      await gerarSemanasSeAplicavel(
        data.id,
        data.data_inicio,
        data.periodizacao_id,
        data.recalcularSemanas ?? false
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      queryClient.invalidateQueries({ queryKey: ['treino-semanas'] });
      toast({ title: 'Treino atualizado com sucesso!' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao atualizar treino', description: e.message, variant: 'destructive' }),
  });

  const ativarMutation = useMutation({
    mutationFn: async (data: { id: string; aluno_id: string }) => {
      await supabase.from('treinos').update({ ativo: false }).eq('aluno_id', data.aluno_id);
      await supabase.from('treinos').update({ ativo: true }).eq('id', data.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino ativado!' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao ativar treino', description: e.message, variant: 'destructive' }),
  });

  const desativarMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('treinos').update({ ativo: false }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino desativado.' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('treinos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino excluído.' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' }),
  });

  const duplicarMutation = useMutation({
    mutationFn: async (treino: TreinoCompleto) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: novo, error } = await supabase
        .from('treinos')
        .insert({
          nome: `${treino.nome} (Cópia)`,
          aluno_id: treino.aluno_id,
          sessoes_semanais: treino.sessoes_semanais,
          periodizacao_id: treino.periodizacao_id ?? null,
          data_inicio: treino.data_inicio ?? null,
          data_vencimento: treino.data_vencimento ?? null,
          descricao_plano: treino.descricao_plano ?? null,
          ativo: false,
        })
        .select('id')
        .single();
      if (error) throw error;

      const sessoesLocal: SessaoLocal[] = (treino.sessoes ?? []).map((s: any) => ({
        id: `temp_${Math.random().toString(36).slice(2)}`,
        nome: s.nome,
        ordem: s.ordem,
        exercicios: (s.sessoes_exercicios ?? [])
          .map((se: any) =>
            dbToExercicioLocal({
              ...se,
              exercicio_id: se.exercicio_id ?? '',
              series: (se.series as any[]) ?? [],
            })
          )
          .map((ex) => ({
            ...ex,
            id: `temp_${Math.random().toString(36).slice(2)}`,
            series: ex.series.map((sr) => ({
              ...sr,
              id: `temp_${Math.random().toString(36).slice(2)}`,
            })),
          })),
        alongamentos: (s.sessoes_alongamentos ?? []).map((sa: any) => ({
          id: `temp_${Math.random().toString(36).slice(2)}`,
          alongamento_id: sa.alongamento_id,
          ordem: sa.ordem,
          observacoes: sa.observacoes,
        })),
      }));

      await persistirSessoes(novo.id, sessoesLocal);
      await gerarSemanasSeAplicavel(novo.id, treino.data_inicio, treino.periodizacao_id, true);
      return novo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino duplicado!' });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao duplicar', description: e.message, variant: 'destructive' }),
  });

  return {
    treinos: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    createTreino: createMutation.mutate,
    updateTreino: updateMutation.mutate,
    ativarTreino: ativarMutation.mutate,
    desativarTreino: desativarMutation.mutate,
    deleteTreino: deleteMutation.mutate,
    duplicarTreino: duplicarMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isActivating: ativarMutation.isPending,
    isDeactivating: desativarMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicarMutation.isPending,
  };
}

export function useTreino(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['treino', id],
    queryFn: async (): Promise<TreinoCompleto> => {
      if (!user) throw new Error('Usuário não autenticado');
      const { data, error } = await supabase
        .from('treinos')
        .select(TREINO_SELECT)
        .eq('id', id)
        .eq('alunos.user_id', user.id)
        .single();
      if (error) throw error;
      return { ...(data as any), sessoes: (data as any).sessoes ?? [] };
    },
    enabled: !!user && !!id,
  });
}
