/**
 * useTreinoSemanas — gerencia a grade semanal (treino_semanas) de um treino.
 *
 * - Lista as semanas geradas
 * - Permite override manual do tipo de microciclo de uma semana
 * - Permite recalcular tudo do zero (apaga overrides)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export interface TreinoSemanaItem {
  id: string;
  semana_num: number;
  data_inicio_semana: string | null;
  data_fim_semana: string | null;
  tipo_microciclo_id: string | null;
  override_manual: boolean;
  tipo_microciclo?: Pick<Tables<'tipos_microciclos'>, 'id' | 'nome'> | null;
}

export function useTreinoSemanas(treinoId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['treino-semanas', treinoId],
    queryFn: async (): Promise<TreinoSemanaItem[]> => {
      if (!treinoId) return [];
      const { data, error } = await supabase
        .from('treino_semanas')
        .select(`
          id, semana_num, data_inicio_semana, data_fim_semana,
          tipo_microciclo_id, override_manual,
          tipos_microciclos ( id, nome )
        `)
        .eq('treino_id', treinoId)
        .order('semana_num', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        semana_num: row.semana_num,
        data_inicio_semana: row.data_inicio_semana,
        data_fim_semana: row.data_fim_semana,
        tipo_microciclo_id: row.tipo_microciclo_id,
        override_manual: row.override_manual,
        tipo_microciclo: row.tipos_microciclos
          ? { id: row.tipos_microciclos.id, nome: row.tipos_microciclos.nome }
          : null,
      }));
    },
    enabled: !!treinoId,
  });

  const updateSemanaMutation = useMutation({
    mutationFn: async (params: { id: string; tipo_microciclo_id: string | null }) => {
      const { error } = await supabase
        .from('treino_semanas')
        .update({
          tipo_microciclo_id: params.tipo_microciclo_id,
          override_manual: true,
        })
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treino-semanas', treinoId] });
    },
    onError: (e: any) =>
      toast({ title: 'Erro ao atualizar semana', description: e.message, variant: 'destructive' }),
  });

  return {
    semanas: query.data ?? [],
    loading: query.isLoading,
    updateSemana: updateSemanaMutation.mutate,
    isUpdating: updateSemanaMutation.isPending,
  };
}
