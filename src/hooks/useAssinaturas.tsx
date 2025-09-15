import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Assinatura = Tables<'assinaturas'>;
type AssinaturaInsert = TablesInsert<'assinaturas'>;
type AssinaturaUpdate = TablesUpdate<'assinaturas'>;

export function useAssinaturas(alunoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assinaturas', alunoId],
    queryFn: async () => {
      if (!user || !alunoId) return [];

      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!alunoId,
  });

  const createMutation = useMutation({
    mutationFn: async (assinatura: AssinaturaInsert) => {
      const { data, error } = await supabase
        .from('assinaturas')
        .insert(assinatura)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas', alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar assinatura: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...assinatura }: AssinaturaUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('assinaturas')
        .update(assinatura)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas', alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar assinatura: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assinaturas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas', alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura excluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir assinatura: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    assinaturas: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createAssinatura: createMutation.mutate,
    updateAssinatura: updateMutation.mutate,
    deleteAssinatura: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}