import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Constants } from '@/integrations/supabase/types';

type Treino = Tables<'treinos'>;
type TreinoInsert = TablesInsert<'treinos'>;
type TreinoUpdate = TablesUpdate<'treinos'>;

type Sessao = Tables<'sessoes'>;
type SessaoInsert = TablesInsert<'sessoes'>;

type SessaoExercicio = Tables<'sessoes_exercicios'>;
type SessaoExercicioInsert = TablesInsert<'sessoes_exercicios'>;

type Serie = Tables<'series'>;
type SerieInsert = TablesInsert<'series'>;

type Aluno = Tables<'alunos'>;

export interface TreinoFilters {
    search?: string;
    alunoId?: string;
    ativo?: boolean;
}

export interface TreinoCompleto extends Treino {
    alunos?: Aluno | null; // join
    sessoes: (Sessao & {
        sessoes_exercicios: (SessaoExercicio & {
            series: Serie[];
        })[];
    })[];
}

async function fetchTreinos(filters: TreinoFilters = {}): Promise<TreinoCompleto[]> {
    let q = supabase
        .from('treinos')
        .select(`
      *,
      alunos(*),
      sessoes(
        *,
        sessoes_exercicios(
          *,
          series(*)
        )
      )
    `)
        .order('created_at', { ascending: false });

    if (filters.search) q = q.ilike('nome', `%${filters.search}%`);
    if (typeof filters.ativo === 'boolean') q = q.eq('ativo', filters.ativo);
    if (filters.alunoId) q = q.eq('aluno_id', filters.alunoId);

    const { data, error } = await q;
    if (error) throw error;
    return (data as TreinoCompleto[]) ?? [];
}

export function useTreinos(filters: TreinoFilters = {}) {
    const queryClient = useQueryClient();

    const list = useQuery({
        queryKey: ['treinos', filters],
        queryFn: () => fetchTreinos(filters),
    });

    const createTreino = useMutation({
        mutationFn: async (input: TreinoInsert) => {
            const { data, error } = await supabase.from('treinos').insert(input).select('*').single();
            if (error) throw error;
            return data as Treino;
        },
        onSuccess: () => {
            toast({ title: 'Treino criado com sucesso' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao criar treino', description: e.message, variant: 'destructive' }),
    });

    const updateTreino = useMutation({
        mutationFn: async ({ id, ...changes }: TreinoUpdate & { id: string }) => {
            const { data, error } = await supabase.from('treinos').update(changes).eq('id', id).select('*').single();
            if (error) throw error;
            return data as Treino;
        },
        onSuccess: () => {
            toast({ title: 'Treino atualizado' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' }),
    });

    const removeTreino = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('treinos').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            toast({ title: 'Treino removido' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' }),
    });

    const addSessao = useMutation({
        mutationFn: async (input: SessaoInsert) => {
            const { data, error } = await supabase.from('sessoes').insert(input).select('*').single();
            if (error) throw error;
            return data as Sessao;
        },
        onSuccess: () => {
            toast({ title: 'Sessão adicionada' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao adicionar sessão', description: e.message, variant: 'destructive' }),
    });

    const removeSessao = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('sessoes').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            toast({ title: 'Sessão removida' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao remover sessão', description: e.message, variant: 'destructive' }),
    });

    const addSessaoExercicio = useMutation({
        mutationFn: async (input: SessaoExercicioInsert) => {
            const { data, error } = await supabase.from('sessoes_exercicios').insert(input).select('*').single();
            if (error) throw error;
            return data as SessaoExercicio;
        },
        onSuccess: () => {
            toast({ title: 'Exercício adicionado à sessão' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao adicionar exercício', description: e.message, variant: 'destructive' }),
    });

    const updateSessaoExercicio = useMutation({
        mutationFn: async (input: Partial<SessaoExercicio> & { id: string }) => {
            const { id, ...changes } = input;
            const { data, error } = await supabase.from('sessoes_exercicios').update(changes).eq('id', id).select('*').single();
            if (error) throw error;
            return data as SessaoExercicio;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao reordenar exercício', description: e.message, variant: 'destructive' }),
    });

    const removeSessaoExercicio = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('sessoes_exercicios').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            toast({ title: 'Exercício removido da sessão' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao remover exercício', description: e.message, variant: 'destructive' }),
    });

    const addSerie = useMutation({
        mutationFn: async (input: SerieInsert) => {
            const { data, error } = await supabase.from('series').insert(input).select('*').single();
            if (error) throw error;
            return data as Serie;
        },
        onSuccess: () => {
            toast({ title: 'Série adicionada' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao adicionar série', description: e.message, variant: 'destructive' }),
    });

    const removeSerie = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('series').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            toast({ title: 'Série removida' });
            queryClient.invalidateQueries({ queryKey: ['treinos'] });
        },
        onError: (e: any) => toast({ title: 'Erro ao remover série', description: e.message, variant: 'destructive' }),
    });

    return {
        treinos: list.data ?? [],
        loading: list.isLoading || list.isFetching,

        isCreating: createTreino.isPending,
        isUpdating: updateTreino.isPending,
        isDeleting: removeTreino.isPending,

        createTreino,
        updateTreino,
        removeTreino,

        addSessao,
        removeSessao,
        addSessaoExercicio,
        updateSessaoExercicio,
        removeSessaoExercicio,
        addSerie,
        removeSerie,

        tipoSerieEnum: Constants.public.Enums.tipo_serie,
    };
}
