import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface AnamnseResposta {
  id: string;
  aluno_id: string;
  campo_id: string;
  valor: string | null;
  created_at: string;
  updated_at: string;
}

export function useAnamnseRespostas(alunoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['anamnese_respostas', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anamnese_respostas')
        .select('*')
        .eq('aluno_id', alunoId);
      if (error) throw error;
      return data as AnamnseResposta[];
    },
    enabled: !!user && !!alunoId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (respostas: { campo_id: string; valor: string | null }[]) => {
      if (!alunoId) throw new Error('Aluno não informado');
      const rows = respostas.map(r => ({
        aluno_id: alunoId,
        campo_id: r.campo_id,
        valor: r.valor,
      }));
      const { error } = await supabase
        .from('anamnese_respostas')
        .upsert(rows, { onConflict: 'aluno_id,campo_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamnese_respostas', alunoId] });
      toast({ title: 'Anamnese salva!' });
    },
    onError: (e) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return {
    respostas: query.data || [],
    loading: query.isLoading,
    upsertRespostas: upsertMutation.mutate,
    isSaving: upsertMutation.isPending,
  };
}
