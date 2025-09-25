import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SessaoAlong = Tables<'sessoes_alongamentos'>;
type SessaoAlongInsert = TablesInsert<'sessoes_alongamentos'>;
type SessaoAlongUpdate = TablesUpdate<'sessoes_alongamentos'>;

export interface SessaoAlongRow {
  sessao_along_id: string;
  sessao_id: string;
  ordem: number;
  observacoes: string | null;
  alongamento_id: string;
  descricao: string;
  grupo_muscular: any;
  forma_execucao: string | null;
  musculos_envolvidos: string | null;
  along_observacoes: string | null;
  link_video: string | null;
  tag_id: string;
  tag_nome: string;
}

export function useSessoesAlongamentos(sessao_id?: string) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['sessoes_alongamentos', sessao_id],
    enabled: !!sessao_id,
    queryFn: async (): Promise<SessaoAlongRow[]> => {
      const { data, error } = await (supabase as any)
        .rpc('listar_alongamentos_sessao', { p_sessao_id: sessao_id });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (payload: Omit<SessaoAlongInsert, 'ordem' | 'observacoes'> & { ordem?: number; observacoes?: string | null }) => {
      const { data, error } = await supabase
        .from('sessoes_alongamentos')
        .insert({ ...payload, ordem: payload.ordem ?? 1, observacoes: payload.observacoes ?? null })
        .select('*')
        .single();
      if (error) throw error;
      return data as SessaoAlong;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessoes_alongamentos', sessao_id] });
      toast({ title: 'Alongamento adicionado à sessão' });
    },
    onError: (e: any) => toast({ title: 'Erro ao adicionar', description: e.message, variant: 'destructive' }),
  });

  const addByTag = useMutation({
    mutationFn: async (tag_id: string) => {
      const { data, error } = await (supabase as any)
        .rpc('adicionar_alongamentos_por_tag', { p_sessao_id: sessao_id, p_tag_id: tag_id });
      if (error) throw error;
      return data as number; // quantidade inserida
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['sessoes_alongamentos', sessao_id] });
      toast({ title: 'Adicionados', description: `${count} alongamentos inseridos` });
    },
    onError: (e: any) => toast({ title: 'Erro ao adicionar por tag', description: e.message, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: SessaoAlongUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('sessoes_alongamentos')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as SessaoAlong;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessoes_alongamentos', sessao_id] });
      toast({ title: 'Atualizado' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sessoes_alongamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessoes_alongamentos', sessao_id] });
      toast({ title: 'Removido' });
    },
    onError: (e: any) => toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' }),
  });

  return {
    items: list.data ?? [],
    loading: list.isLoading,
    error: list.error,
    addSessaoAlong: add.mutate,
    addSessaoAlongByTag: addByTag.mutate,
    updateSessaoAlong: update.mutate,
    removeSessaoAlong: remove.mutate,
    isAdding: add.isPending || addByTag.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
