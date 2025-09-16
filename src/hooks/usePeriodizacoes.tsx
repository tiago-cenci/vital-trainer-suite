import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Periodizacao = Tables<'periodizacoes'>;
type PeriodizacaoInsert = TablesInsert<'periodizacoes'>;
type PeriodizacaoUpdate = TablesUpdate<'periodizacoes'>;

type PeriodizacaoSemana = Tables<'periodizacoes_semanas'>;
type PeriodizacaoSemanaInsert = TablesInsert<'periodizacoes_semanas'>;

type PeriodizacaoSemanaConfig = Tables<'periodizacoes_semana_config'>;
type PeriodizacaoSemanaConfigInsert = TablesInsert<'periodizacoes_semana_config'>;

export interface PeriodizacaoFilters {
  search?: string;
}

export interface PeriodizacaoCompleta extends Periodizacao {
  semanas: (PeriodizacaoSemana & {
    config: PeriodizacaoSemanaConfig[];
  })[];
}

export function usePeriodizacoes(filters: PeriodizacaoFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['periodizacoes', user?.id, filters],
    queryFn: async (): Promise<PeriodizacaoCompleta[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('periodizacoes')
        .select(`
          *,
          periodizacoes_semanas (
            *,
            periodizacoes_semana_config (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match interface
      return (data || []).map(p => ({
        ...p,
        semanas: (p.periodizacoes_semanas || []).map(s => ({
          ...s,
          config: s.periodizacoes_semana_config || []
        }))
      }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      semanas: Array<{
        semana_num: number;
        tipo_semana: string;
        config: Array<{
          tipo_serie: 'WORK SET' | 'WARM-UP' | 'FEEDER';
          rep_min: number;
          rep_max: number;
          descanso_min: number;
          descanso_max: number;
        }>;
      }>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create periodization
      const { data: periodizacao, error: periodizacaoError } = await supabase
        .from('periodizacoes')
        .insert({ nome: data.nome, user_id: user.id })
        .select()
        .single();

      if (periodizacaoError) throw periodizacaoError;

      // Create weeks
      for (const semana of data.semanas) {
        const { data: semanaData, error: semanaError } = await supabase
          .from('periodizacoes_semanas')
          .insert({
            periodizacao_id: periodizacao.id,
            semana_num: semana.semana_num,
            tipo_semana: semana.tipo_semana
          })
          .select()
          .single();

        if (semanaError) throw semanaError;

        // Create configs for each week
        if (semana.config.length > 0) {
          const configs = semana.config.map(config => ({
            semana_id: semanaData.id,
            ...config
          }));

          const { error: configError } = await supabase
            .from('periodizacoes_semana_config')
            .insert(configs);

          if (configError) throw configError;
        }
      }

      return periodizacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodizacoes'] });
      toast({
        title: 'Sucesso!',
        description: 'Periodização criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar periodização: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('periodizacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodizacoes'] });
      toast({
        title: 'Sucesso!',
        description: 'Periodização excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir periodização: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    periodizacoes: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createPeriodizacao: createMutation.mutate,
    deletePeriodizacao: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePeriodizacao(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['periodizacao', id],
    queryFn: async (): Promise<PeriodizacaoCompleta> => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('periodizacoes')
        .select(`
          *,
          periodizacoes_semanas (
            *,
            periodizacoes_semana_config (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        semanas: (data.periodizacoes_semanas || []).map(s => ({
          ...s,
          config: s.periodizacoes_semana_config || []
        }))
      };
    },
    enabled: !!user && !!id,
  });
}