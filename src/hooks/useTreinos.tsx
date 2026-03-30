/**
 * useTreinos.tsx — atualizado com persistência destrutiva e dedup no carregamento
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
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
    )
  )
` as const;

// ─── Persistência destrutiva: deleta tudo e recria ─────────────────────────

async function persistirSessoes(treinoId: string, sessoes: SessaoLocal[]) {
  // 1. Buscar todas as sessões atuais para deletar
  const { data: sessoesExistentes } = await supabase
    .from('sessoes')
    .select('id')
    .eq('treino_id', treinoId);

  if (sessoesExistentes && sessoesExistentes.length > 0) {
    const ids = sessoesExistentes.map(s => s.id);

    // Deletar séries de todos os exercícios dessas sessões
    const { data: exercicios } = await supabase
      .from('sessoes_exercicios')
      .select('id')
      .in('sessao_id', ids);
    if (exercicios && exercicios.length > 0) {
      const exercicioIds = exercicios.map(e => e.id);
      await supabase.from('series').delete().in('sessao_exercicio_id', exercicioIds);
    }

    // Deletar exercícios das sessões
    await supabase.from('sessoes_exercicios').delete().in('sessao_id', ids);

    // Deletar as sessões
    await supabase.from('sessoes').delete().in('id', ids);
  }

  // 2. Recriar tudo a partir do estado local
  for (const sessao of sessoes) {
    const { data: novaSessao, error: errSessao } = await supabase
      .from('sessoes')
      .insert({ treino_id: treinoId, nome: sessao.nome, ordem: sessao.ordem })
      .select('id')
      .single();
    if (errSessao) throw errSessao;

    const sessaoId = novaSessao.id;

    for (const ex of sessao.exercicios) {
      const { data: novoEx, error: errEx } = await supabase
        .from('sessoes_exercicios')
        .insert({
          sessao_id: sessaoId,
          exercicio_id: ex.exercicio_id,
          ordem: ex.ordem,
          prescricao_tipo: ex.prescricao_tipo,
          usar_periodizacao: ex.usar_periodizacao,
          series_qtd: ex.series.length || null,
          reps_min: ex.series[0]?.reps_min ?? null,
          reps_max: ex.series[0]?.reps_max ?? null,
          descanso_seg: ex.series[0]?.descanso_seg ?? null,
        })
        .select('id')
        .single();
      if (errEx) throw errEx;

      if (ex.series.length > 0) {
        const seriesData = ex.series.map((s, i) => ({
          sessao_exercicio_id: novoEx.id,
          tipo: s.tipo,
          ordem: s.ordem ?? i + 1,
          reps_min: s.reps_min,
          reps_max: s.reps_max,
          descanso_seg: s.descanso_seg,
        }));
        const { error: errSeries } = await supabase.from('series').insert(seriesData);
        if (errSeries) throw errSeries;
      }
    }
  }
}

// ─── Hook principal (mantido igual, apenas ajustando chamada) ───────────────

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
          ? q = q.not('periodizacao_id', 'is', null)
          : q = q.is('periodizacao_id', null);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(t => ({ ...t, sessoes: t.sessoes ?? [] }));
    },
    enabled: !!user,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      aluno_id: string;
      sessoes_semanais: number;
      periodizacao_id?: string | null;
      usar_periodizacao: boolean;
      sessoes: SessaoLocal[];
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: treino, error } = await supabase
        .from('treinos')
        .insert({
          nome: data.nome,
          aluno_id: data.aluno_id,
          sessoes_semanais: data.sessoes_semanais,
          periodizacao_id: data.periodizacao_id ?? null,
          ativo: false,
        })
        .select('id')
        .single();
      if (error) throw error;

      await persistirSessoes(treino.id, data.sessoes);
      return treino;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino criado com sucesso!' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar treino', description: e.message, variant: 'destructive' }),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      nome: string;
      aluno_id: string;
      sessoes_semanais: number;
      periodizacao_id?: string | null;
      usar_periodizacao: boolean;
      sessoes: SessaoLocal[];
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      await supabase.from('treinos').update({
        nome: data.nome,
        aluno_id: data.aluno_id,
        sessoes_semanais: data.sessoes_semanais,
        periodizacao_id: data.periodizacao_id ?? null,
      }).eq('id', data.id);

      await persistirSessoes(data.id, data.sessoes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino atualizado com sucesso!' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar treino', description: e.message, variant: 'destructive' }),
  });

  // Ativar / Desativar (mantido igual)
  const ativarMutation = useMutation({
    mutationFn: async (data: { id: string; aluno_id: string }) => {
      await supabase.from('treinos').update({ ativo: false }).eq('aluno_id', data.aluno_id);
      await supabase.from('treinos').update({ ativo: true }).eq('id', data.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino ativado!' });
    },
    onError: (e: any) => toast({ title: 'Erro ao ativar treino', description: e.message, variant: 'destructive' }),
  });

  const desativarMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('treinos').update({ ativo: false }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino desativado.' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('treinos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino excluído.' });
    },
    onError: (e: any) => toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' }),
  });

  // Duplicar (mantido igual)
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
          ativo: false,
        })
        .select('id')
        .single();
      if (error) throw error;

      // Converter sessões existentes para SessaoLocal e persistir
      const sessoesLocal: SessaoLocal[] = (treino.sessoes ?? []).map(s => ({
        id: `temp_${Math.random().toString(36).slice(2)}`,
        nome: s.nome,
        ordem: s.ordem,
        exercicios: (s.sessoes_exercicios ?? []).map(se =>
          dbToExercicioLocal({
            ...se,
            exercicio_id: se.exercicio_id ?? '',
            series: se.series as any[],
          })
        ).map(ex => ({
          ...ex,
          id: `temp_${Math.random().toString(36).slice(2)}`,
        })),
      }));

      await persistirSessoes(novo.id, sessoesLocal);
      return novo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({ title: 'Treino duplicado!' });
    },
    onError: (e: any) => toast({ title: 'Erro ao duplicar', description: e.message, variant: 'destructive' }),
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
      return { ...data, sessoes: data.sessoes ?? [] };
    },
    enabled: !!user && !!id,
  });
}