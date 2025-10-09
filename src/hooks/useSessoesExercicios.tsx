import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SessaoExercicio = Tables<'sessoes_exercicios'>;
type SessaoExercicioInsert = TablesInsert<'sessoes_exercicios'>;
type SessaoExercicioUpdate = TablesUpdate<'sessoes_exercicios'>;

type Serie = Tables<'series'>;
type SerieInsert = TablesInsert<'series'>;

export interface SessaoExercicioCompleto extends SessaoExercicio {
  exercicios: {
    id: string;
    nome: string;
    grupos_musculares: string[];
  };
  series: Serie[];
}

export function useSessoesExercicios(sessaoId: string, initialData?: SessaoExercicioCompleto[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sessoes_exercicios', sessaoId],
    queryFn: async (): Promise<SessaoExercicioCompleto[]> => {
      if (!user || !sessaoId) throw new Error('Usuário não autenticado ou sessão não informada');

      const { data, error } = await supabase
        .from('sessoes_exercicios')
        .select(`
          *,
          exercicios (
            id,
            nome,
            grupos_musculares
          ),
          series (*)
        `)
        .eq('sessao_id', sessaoId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      return data || [];
    },
    initialData: initialData,
    placeholderData: initialData,
    staleTime: 60000,
    enabled: !!user && !!sessaoId,
  });

  const addExercicioMutation = useMutation({
    mutationFn: async (data: {
      exercicio_id: string;
      ordem: number;
      prescricao_tipo?: 'DETALHADA' | 'PERIODIZACAO';
      series_qtd?: number;
      reps_min?: number;
      reps_max?: number;
      descanso_seg?: number;
      usar_periodizacao?: boolean;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: sessaoExercicio, error } = await supabase
        .from('sessoes_exercicios')
        .insert([{
          sessao_id: sessaoId,
          exercicio_id: data.exercicio_id,
          ordem: data.ordem,
          prescricao_tipo: data.prescricao_tipo || 'DETALHADA',
          series_qtd: data.series_qtd,
          reps_min: data.reps_min,
          reps_max: data.reps_max,
          descanso_seg: data.descanso_seg,
          usar_periodizacao: data.usar_periodizacao || false
        }])
        .select()
        .single();

      if (error) throw error;
      return sessaoExercicio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Exercício adicionado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar exercício: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateExercicioMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      ordem: number;
      prescricao_tipo?: 'DETALHADA' | 'PERIODIZACAO';
      series_qtd?: number;
      reps_min?: number;
      reps_max?: number;
      descanso_seg?: number;
      usar_periodizacao?: boolean;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: any = {
        ordem: data.ordem
      };
      
      if (data.prescricao_tipo) updateData.prescricao_tipo = data.prescricao_tipo;
      if (data.series_qtd !== undefined) updateData.series_qtd = data.series_qtd;
      if (data.reps_min !== undefined) updateData.reps_min = data.reps_min;
      if (data.reps_max !== undefined) updateData.reps_max = data.reps_max;
      if (data.descanso_seg !== undefined) updateData.descanso_seg = data.descanso_seg;
      if (data.usar_periodizacao !== undefined) updateData.usar_periodizacao = data.usar_periodizacao;

      const { error } = await supabase
        .from('sessoes_exercicios')
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Exercício atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar exercício: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const removeExercicioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sessoes_exercicios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
      toast({
        title: 'Sucesso!',
        description: 'Exercício removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover exercício: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateOrdemMutation = useMutation({
    mutationFn: async (exercicios: Array<{ id: string; ordem: number }>) => {
      if (!user) throw new Error('Usuário não autenticado');

      for (const exercicio of exercicios) {
        const { error } = await supabase
          .from('sessoes_exercicios')
          .update({ ordem: exercicio.ordem })
          .eq('id', exercicio.id);

        if (error) throw error;
      }

      return exercicios;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      queryClient.invalidateQueries({ queryKey: ['treinos'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao reordenar exercícios: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const addSerieMutation = useMutation({
    mutationFn: async (data: {
      sessao_exercicio_id: string;
      tipo: 'WORK SET' | 'WARM-UP' | 'FEEDER';
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: serie, error } = await supabase
        .from('series')
        .insert({
          sessao_exercicio_id: data.sessao_exercicio_id,
          tipo: data.tipo
        })
        .select()
        .single();

      if (error) throw error;
      return serie;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      toast({
        title: 'Sucesso!',
        description: 'Série adicionada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar série: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const removeSerieMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes_exercicios', sessaoId] });
      toast({
        title: 'Sucesso!',
        description: 'Série removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover série: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sessoesExercicios: query.data || [],
    loading: query.isLoading,
    error: query.error,
    addExercicio: addExercicioMutation.mutate,
    updateExercicio: updateExercicioMutation.mutate,
    removeExercicio: removeExercicioMutation.mutate,
    updateOrdem: updateOrdemMutation.mutate,
    addSerie: addSerieMutation.mutate,
    removeSerie: removeSerieMutation.mutate,
    isAddingExercicio: addExercicioMutation.isPending,
    isUpdatingExercicio: updateExercicioMutation.isPending,
    isRemovingExercicio: removeExercicioMutation.isPending,
    isUpdatingOrdem: updateOrdemMutation.isPending,
    isAddingSerie: addSerieMutation.isPending,
    isRemovingSerie: removeSerieMutation.isPending,
  };
}