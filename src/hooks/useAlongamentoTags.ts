import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Tag = Tables<'alongamento_tags'>;
type TagInsert = TablesInsert<'alongamento_tags'>;
type TagUpdate = TablesUpdate<'alongamento_tags'>;

export interface TagFilters {
  search?: string;
}

export function useAlongamentoTags(filters: TagFilters = {}) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['alongamento_tags', user?.id, filters],
    enabled: !!user,
    queryFn: async (): Promise<Tag[]> => {
      if (!user) throw new Error('Usuário não autenticado');
      let q = supabase.from('alongamento_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (filters.search) q = q.ilike('nome', `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Omit<TagInsert, 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { data, error } = await supabase
        .from('alongamento_tags')
        .insert({ ...payload, user_id: user.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamento_tags'] });
      toast({ title: 'Tag criada' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar tag', description: e.message, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: TagUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('alongamento_tags')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamento_tags'] });
      toast({ title: 'Tag atualizada' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar tag', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alongamento_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alongamento_tags'] });
      toast({ title: 'Tag removida' });
    },
    onError: (e: any) => toast({ title: 'Erro ao remover tag', description: e.message, variant: 'destructive' }),
  });

  return {
    tags: list.data ?? [],
    loading: list.isLoading,
    error: list.error,
    createTag: create.mutate,
    updateTag: update.mutate,
    deleteTag: remove.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
