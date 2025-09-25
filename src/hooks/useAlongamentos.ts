import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';

type Along = Tables<'alongamentos'>;
type AlongInsert = TablesInsert<'alongamentos'>;
type AlongUpdate = TablesUpdate<'alongamentos'>;
type Grupo = Enums<'grupo_muscular'>;

export interface AlongFilters {
  search?: string;
  tag_id?: string;
  grupo?: Grupo;
}

export function useAlongamentos(filters: AlongFilters = {}) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['alongamentos', user?.id, filters],
    enabled: !!user,
    queryFn: async (): Promise<Along[]> => {
      if (!user) throw new Error('Usuário não autenticado');
      let q = supabase.from('alongamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (filters.search) q = q.ilike('descricao', `%${filters.search}%`);
      if (filters.tag_id) q = q.eq('tag_id', filters.tag_id);
      if (filters.grupo) q = q.eq('grupo_muscular', filters.grupo);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Omit<AlongInsert, 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { data, error } = await supabase
        .from('alongamentos')
        .insert({ ...payload, user_id: user.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Along;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamentos'] });
      toast({ title: 'Alongamento criado' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar', description: e.message, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: AlongUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('alongamentos')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as Along;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamentos'] });
      toast({ title: 'Alongamento atualizado' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alongamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamentos'] });
      toast({ title: 'Alongamento removido' });
    },
    onError: (e: any) => toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' }),
  });

  return {
    alongamentos: list.data ?? [],
    loading: list.isLoading,
    error: list.error,
    createAlongamento: create.mutate,
    updateAlongamento: update.mutate,
    deleteAlongamento: remove.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
