import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type TipoMicrociclo = Tables<'tipos_microciclos'>;
type TipoMicrocicloInsert = TablesInsert<'tipos_microciclos'>;
type TipoMicrocicloUpdate = TablesUpdate<'tipos_microciclos'>;

type TipoMicrocicloConfig = Tables<'tipos_microciclos_config'>;
type TipoMicrocicloConfigInsert = TablesInsert<'tipos_microciclos_config'>;

export interface TipoMicrocicloFilters {
  search?: string;
}

export interface TipoMicrocicloCompleto extends TipoMicrociclo {
  config: TipoMicrocicloConfig[];
}

export function useTiposMicrociclos(filters: TipoMicrocicloFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tipos_microciclos', user?.id, filters],
    queryFn: async (): Promise<TipoMicrocicloCompleto[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('tipos_microciclos')
        .select(`
          *,
          tipos_microciclos_config (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(tipo => ({
        ...tipo,
        config: tipo.tipos_microciclos_config || []
      }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      descricao?: string;
      config: Array<{
        tipo_serie: 'WORK SET' | 'WARM-UP' | 'FEEDER';
        rep_min: number;
        rep_max: number;
        descanso_min: number;
        descanso_max: number;
      }>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create tipo microciclo
      const { data: tipoMicrociclo, error: tipoError } = await supabase
        .from('tipos_microciclos')
        .insert({
          nome: data.nome,
          descricao: data.descricao,
          user_id: user.id
        })
        .select()
        .single();

      if (tipoError) throw tipoError;

      // Create configs
      if (data.config.length > 0) {
        const configs = data.config.map(config => ({
          tipo_microciclo_id: tipoMicrociclo.id,
          ...config
        }));

        const { error: configError } = await supabase
          .from('tipos_microciclos_config')
          .insert(configs);

        if (configError) throw configError;
      }

      return tipoMicrociclo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_microciclos'] });
      toast({
        title: 'Sucesso!',
        description: 'Tipo de microciclo criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar tipo de microciclo: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      nome: string;
      descricao?: string;
      config: Array<{
        tipo_serie: 'WORK SET' | 'WARM-UP' | 'FEEDER';
        rep_min: number;
        rep_max: number;
        descanso_min: number;
        descanso_max: number;
      }>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Update tipo microciclo
      const { error: updateError } = await supabase
        .from('tipos_microciclos')
        .update({
          nome: data.nome,
          descricao: data.descricao,
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Delete existing configs
      const { error: deleteError } = await supabase
        .from('tipos_microciclos_config')
        .delete()
        .eq('tipo_microciclo_id', data.id);

      if (deleteError) throw deleteError;

      // Create new configs
      if (data.config.length > 0) {
        const configs = data.config.map(config => ({
          tipo_microciclo_id: data.id,
          ...config
        }));

        const { error: configError } = await supabase
          .from('tipos_microciclos_config')
          .insert(configs);

        if (configError) throw configError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_microciclos'] });
      toast({
        title: 'Sucesso!',
        description: 'Tipo de microciclo atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tipo de microciclo: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tipos_microciclos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_microciclos'] });
      toast({
        title: 'Sucesso!',
        description: 'Tipo de microciclo excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir tipo de microciclo: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tiposMicrociclos: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createTipoMicrociclo: createMutation.mutate,
    updateTipoMicrociclo: updateMutation.mutate,
    deleteTipoMicrociclo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTipoMicrociclo(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tipo_microciclo', id],
    queryFn: async (): Promise<TipoMicrocicloCompleto> => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tipos_microciclos')
        .select(`
          *,
          tipos_microciclos_config (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        config: data.tipos_microciclos_config || []
      };
    },
    enabled: !!user && !!id,
  });
}