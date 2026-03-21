import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface AnamneseCampo {
  id: string;
  user_id: string;
  label: string;
  tipo: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  opcoes: string[] | null;
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

interface CampoInsert {
  label: string;
  tipo: AnamneseCampo['tipo'];
  opcoes?: string[] | null;
  obrigatorio?: boolean;
  ordem?: number;
  ativo?: boolean;
}

const DEFAULT_CAMPOS: CampoInsert[] = [
  { label: 'CPF', tipo: 'text', ordem: 1 },
  { label: 'Data de Nascimento', tipo: 'date', ordem: 2 },
  { label: 'Endereço', tipo: 'text', ordem: 3 },
  { label: 'Como conheceu o personal', tipo: 'select', opcoes: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Indicação', 'Outro'], ordem: 4 },
  { label: 'Telefone/WhatsApp', tipo: 'text', ordem: 5 },
  { label: 'Frequência semanal de treino', tipo: 'number', ordem: 6 },
  { label: 'Dias disponíveis para treinar', tipo: 'text', ordem: 7 },
  { label: 'Altura (cm)', tipo: 'number', ordem: 8 },
  { label: 'Peso atual (kg)', tipo: 'number', ordem: 9 },
  { label: '% Gordura', tipo: 'number', ordem: 10 },
  { label: 'Profissão', tipo: 'text', ordem: 11 },
  { label: 'Rotina diária (gasto calórico)', tipo: 'select', opcoes: ['Sedentário', 'Moderado', 'Ativo', 'Trabalho braçal'], ordem: 12 },
  { label: 'Objetivo curto prazo', tipo: 'textarea', ordem: 13 },
  { label: 'Objetivo longo prazo', tipo: 'textarea', ordem: 14 },
  { label: 'Dificuldade para ganhar/perder peso', tipo: 'textarea', ordem: 15 },
  { label: 'Pode fazer aeróbicos nos dias sem musculação?', tipo: 'boolean', ordem: 16 },
  { label: 'Uso de substâncias de desempenho', tipo: 'textarea', ordem: 17 },
  { label: 'Restrições, lesões e problemas de saúde', tipo: 'textarea', ordem: 18 },
  { label: 'Exercícios que não pode fazer', tipo: 'textarea', ordem: 19 },
  { label: 'Patologias (doenças)', tipo: 'textarea', ordem: 20 },
  { label: 'Medicamentos em uso', tipo: 'textarea', ordem: 21 },
  { label: 'Uso de drogas recreativas', tipo: 'textarea', ordem: 22 },
  { label: 'Dificuldades com treinamento', tipo: 'textarea', ordem: 23 },
  { label: 'Horários para refeições', tipo: 'text', ordem: 24 },
  { label: 'Preferências de treino', tipo: 'textarea', ordem: 25 },
  { label: 'Preparação para TAF', tipo: 'textarea', ordem: 26 },
  { label: 'Dieta atual', tipo: 'textarea', ordem: 27 },
  { label: 'Observações adicionais', tipo: 'textarea', ordem: 28 },
];

export function useAnamneseCampos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['anamnese_campos', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('anamnese_campos')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data as AnamneseCampo[];
    },
    enabled: !!user,
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');
      const rows = DEFAULT_CAMPOS.map(c => ({
        ...c,
        user_id: user.id,
        opcoes: c.opcoes ? JSON.stringify(c.opcoes) : null,
      }));
      const { error } = await supabase.from('anamnese_campos').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamnese_campos'] });
      toast({ title: 'Campos padrão criados com sucesso!' });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (campo: CampoInsert) => {
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('anamnese_campos').insert({
        ...campo,
        user_id: user.id,
        opcoes: campo.opcoes ? JSON.stringify(campo.opcoes) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamnese_campos'] });
      toast({ title: 'Campo criado!' });
    },
    onError: (e) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...campo }: Partial<CampoInsert> & { id: string }) => {
      const updateData: any = { ...campo };
      if (campo.opcoes !== undefined) {
        updateData.opcoes = campo.opcoes ? JSON.stringify(campo.opcoes) : null;
      }
      const { error } = await supabase.from('anamnese_campos').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamnese_campos'] });
    },
    onError: (e) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('anamnese_campos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamnese_campos'] });
      toast({ title: 'Campo removido!' });
    },
    onError: (e) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return {
    campos: query.data || [],
    loading: query.isLoading,
    seedDefaults: seedMutation.mutate,
    isSeeding: seedMutation.isPending,
    createCampo: createMutation.mutate,
    updateCampo: updateMutation.mutate,
    deleteCampo: deleteMutation.mutate,
  };
}
