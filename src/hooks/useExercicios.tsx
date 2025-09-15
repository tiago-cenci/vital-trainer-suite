import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Exercicio = Tables<'exercicios'>;
type ExercicioInsert = TablesInsert<'exercicios'>;
type ExercicioUpdate = TablesUpdate<'exercicios'>;

export interface ExercicioFilters {
    search?: string;
    grupo_muscular?: string;
}

export function useExercicios(filters: ExercicioFilters = {}) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['exercicios', user?.id, filters],
        queryFn: async () => {
            if (!user) throw new Error('Usuário não autenticado');

            let builder = supabase
                .from('exercicios')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (filters.search) {
                builder = builder.ilike('nome', `%${filters.search}%`);
            }

            if (filters.grupo_muscular) {
                builder = builder.contains('grupos_musculares', [filters.grupo_muscular]);
            }

            const { data, error } = await builder;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: async (exercicio: Omit<ExercicioInsert, 'user_id'>) => {
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('exercicios')
                .insert({ ...exercicio, user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercicios'] });
            toast({ title: 'Sucesso!', description: 'Exercício criado com sucesso.' });
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: 'Erro ao criar exercício: ' + error.message, variant: 'destructive' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...exercicio }: ExercicioUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('exercicios')
                .update(exercicio)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercicios'] });
            toast({ title: 'Sucesso!', description: 'Exercício atualizado com sucesso.' });
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: 'Erro ao atualizar exercício: ' + error.message, variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('exercicios').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercicios'] });
            toast({ title: 'Sucesso!', description: 'Exercício excluído com sucesso.' });
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: 'Erro ao excluir exercício: ' + error.message, variant: 'destructive' });
        },
    });

    return {
        exercicios: query.data || [],
        loading: query.isLoading,
        error: query.error,
        createExercicio: createMutation.mutate,
        updateExercicio: updateMutation.mutate,
        deleteExercicio: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

export function useExercicio(id: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['exercicio', id],
        queryFn: async () => {
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('exercicios')
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
