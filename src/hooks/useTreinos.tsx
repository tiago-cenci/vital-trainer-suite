import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Treino = Tables<'treinos'>;
type TreinoInsert = TablesInsert<'treinos'>;
type TreinoUpdate = TablesUpdate<'treinos'>;

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

export function useTreinos(filters: TreinoFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['treinos', user?.id, filters],
    queryFn: async (): Promise<TreinoCompleto[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('treinos')
        .select(`
          *,
          alunos (*),
          periodizacoes (
            id,
            nome
          ),
          sessoes (
            *,
            sessoes_exercicios (
              *,
              exercicios (*),
              series (*)
            )
          )
        `)
        .eq('alunos.user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      if (filters.aluno_id) {
        query = query.eq('aluno_id', filters.aluno_id);
      }

      if (filters.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters.usa_periodizacao !== undefined) {
        if (filters.usa_periodizacao) {
          query = query.not('periodizacao_id', 'is', null);
        } else {
          query = query.is('periodizacao_id', null);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(treino => ({
        ...treino,
        sessoes: treino.sessoes || []
      }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      aluno_id: string;
      sessoes_semanais: number;
      periodizacao_id?: string;
      sessoes: Array<{
        nome: string;
        ordem: number;
      }>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create treino
      const { data: treino, error: treinoError } = await supabase
        .from('treinos')
        .insert({
          nome: data.nome,
          aluno_id: data.aluno_id,
          sessoes_semanais: data.sessoes_semanais,
          periodizacao_id: data.periodizacao_id,
          ativo: false
        })
        .select()
        .single();

      if (treinoError) throw treinoError;

      // Create sessoes
      if (data.sessoes.length > 0) {
        const sessoesData = data.sessoes.map(sessao => ({
          treino_id: treino.id,
          nome: sessao.nome
        }));

        const { error: sessoesError } = await supabase
          .from('sessoes')
          .insert(sessoesData);

        if (sessoesError) throw sessoesError;
      }

      return treino;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      nome: string;
      aluno_id: string;
      sessoes_semanais: number;
      periodizacao_id?: string;
      sessoes: Array<{
        id?: string;
        nome: string;
        ordem: number;
      }>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Update treino
      const { error: updateError } = await supabase
        .from('treinos')
        .update({
          nome: data.nome,
          aluno_id: data.aluno_id,
          sessoes_semanais: data.sessoes_semanais,
          periodizacao_id: data.periodizacao_id,
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Delete existing sessoes
      const { error: deleteError } = await supabase
        .from('sessoes')
        .delete()
        .eq('treino_id', data.id);

      if (deleteError) throw deleteError;

      // Create new sessoes
      if (data.sessoes.length > 0) {
        const sessoesData = data.sessoes.map(sessao => ({
          treino_id: data.id,
          nome: sessao.nome
        }));

        const { error: sessoesError } = await supabase
          .from('sessoes')
          .insert(sessoesData);

        if (sessoesError) throw sessoesError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const ativarMutation = useMutation({
    mutationFn: async (data: { id: string; aluno_id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // First deactivate all other treinos for this aluno
      const { error: deactivateError } = await supabase
        .from('treinos')
        .update({ ativo: false })
        .eq('aluno_id', data.aluno_id);

      if (deactivateError) throw deactivateError;

      // Then activate this treino
      const { error: activateError } = await supabase
        .from('treinos')
        .update({ ativo: true })
        .eq('id', data.id);

      if (activateError) throw activateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino ativado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao ativar treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const desativarMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('treinos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino desativado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao desativar treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treinos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const duplicarMutation = useMutation({
    mutationFn: async (treino: TreinoCompleto) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create duplicated treino
      const { data: novoTreino, error: treinoError } = await supabase
        .from('treinos')
        .insert({
          nome: `${treino.nome} (Cópia)`,
          aluno_id: treino.aluno_id,
          sessoes_semanais: treino.sessoes_semanais,
          periodizacao_id: treino.periodizacao_id,
          ativo: false
        })
        .select()
        .single();

      if (treinoError) throw treinoError;

      // Duplicate sessoes
      for (const sessao of treino.sessoes) {
        const { data: novaSessao, error: sessaoError } = await supabase
          .from('sessoes')
          .insert({
            treino_id: novoTreino.id,
            nome: sessao.nome
          })
          .select()
          .single();

        if (sessaoError) throw sessaoError;

          // Duplicate sessoes_exercicios
          for (const sessaoExercicio of sessao.sessoes_exercicios) {
            const { data: novoSessaoExercicio, error: sessaoExercicioError } = await supabase
              .from('sessoes_exercicios')
              .insert([{
                sessao_id: novaSessao.id,
                exercicio_id: sessaoExercicio.exercicio_id,
                ordem: sessaoExercicio.ordem,
                prescricao_tipo: 'DETALHADA',
                series_qtd: sessaoExercicio.series_qtd || 3,
                reps_min: sessaoExercicio.reps_min || 8,
                reps_max: sessaoExercicio.reps_max || 12,
                descanso_seg: sessaoExercicio.descanso_seg || 90,
                usar_periodizacao: sessaoExercicio.usar_periodizacao || false
              }])
              .select()
              .single();

          if (sessaoExercicioError) throw sessaoExercicioError;

          // Duplicate series
          for (const serie of sessaoExercicio.series) {
            const { error: serieError } = await supabase
              .from('series')
              .insert({
                sessao_exercicio_id: novoSessaoExercicio.id,
                tipo: serie.tipo
              });

            if (serieError) throw serieError;
          }
        }
      }

      return novoTreino;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino duplicado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao duplicar treino: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    treinos: query.data || [],
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
        .select(`
          *,
          alunos (*),
          periodizacoes (
            id,
            nome
          ),
          sessoes (
            *,
            sessoes_exercicios (
              *,
              exercicios (*),
              series (*)
            )
          )
        `)
        .eq('id', id)
        .eq('alunos.user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        sessoes: data.sessoes || []
      };
    },
    enabled: !!user && !!id,
  });
}