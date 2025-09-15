import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Aluno = Tables<'alunos'>;
type AlunoInsert = TablesInsert<'alunos'>;
type AlunoUpdate = TablesUpdate<'alunos'>;

export interface AlunoFilters {
  search?: string;
  objetivo?: string;
}

export function useAlunos(filters: AlunoFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alunos', user?.id, filters],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('alunos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      if (filters.objetivo) {
        query = query.ilike('objetivo', `%${filters.objetivo}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (aluno: Omit<AlunoInsert, 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('alunos')
        .insert({ ...aluno, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar aluno: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...aluno }: AlunoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('alunos')
        .update(aluno)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar aluno: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir aluno: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    alunos: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createAluno: createMutation.mutate,
    updateAluno: updateMutation.mutate,
    deleteAluno: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useAluno(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['aluno', id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}