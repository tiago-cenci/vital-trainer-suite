import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';
import { useStorageProvider } from './useStorageProvider';
type Correcao = Tables<'correcoes'>;
type CorrecaoInsert = TablesInsert<'correcoes'>;
type CorrecaoUpdate = TablesUpdate<'correcoes'>;
type CorrecaoStatus = Enums<'correcao_status'>;

type Exec = Tables<'sessoes_exercicios_execucoes'>;
type Midia = Tables<'correcoes_midias'>;

export function useExecucao(execId: string) {
  return useQuery({
    queryKey: ['execucao', execId],
    enabled: !!execId,
    queryFn: async (): Promise<Exec> => {
      const { data, error } = await supabase
        .from('sessoes_exercicios_execucoes')
        .select('*')
        .eq('id', execId)
        .single();
      if (error) throw error;
      return data as Exec;
    },
  });
}

export function useCorrecaoAtual(execId: string) {
  // Busca rascunho existente OU última correção
  return useQuery({
    queryKey: ['correcao:atual', execId],
    enabled: !!execId,
    queryFn: async (): Promise<Correcao | null> => {
      // 1º tenta rascunho
      const { data: draft, error: e1 } = await supabase
        .from('correcoes')
        .select('*')
        .eq('sessoes_exercicios_execucoes_id', execId)
        .eq('status', 'RASCUNHO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (e1) throw e1;
      if (draft) return draft as Correcao;

      // Senão, retorna a última (enviada)
      const { data: last, error: e2 } = await supabase
        .from('correcoes')
        .select('*')
        .eq('sessoes_exercicios_execucoes_id', execId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (e2) throw e2;
      return (last as Correcao) ?? null;
    },
  });
}

export function useMidiasCorrecao(correcaoId?: string) {
  return useQuery({
    queryKey: ['correcoes:midias', correcaoId],
    enabled: !!correcaoId,
    queryFn: async (): Promise<Midia[]> => {
      const { data, error } = await supabase
        .from('correcoes_midias')
        .select('*')
        .eq('correcao_id', correcaoId! )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Midia[];
    },
  });
}

export function useSalvarCorrecao(execId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id?: string; texto: string; status: CorrecaoStatus }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // ✅ não usar Partial aqui
      const base: CorrecaoInsert = {
        sessoes_exercicios_execucoes_id: execId,
        personal_user_id: user.id,
        texto: payload.texto,
        status: payload.status, // já no enum
      };

      if (!payload.id) {
        const { data, error } = await supabase
          .from('correcoes')
          .insert(base)
          .select('*')
          .single();
        if (error) throw error;
        return data as Correcao;
      } else {
        const upd: CorrecaoUpdate = { texto: payload.texto, status: payload.status };
        const { data, error } = await supabase
          .from('correcoes')
          .update(upd)
          .eq('id', payload.id)
          .select('*')
          .single();
        if (error) throw error;
        return data as Correcao;
      }
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['correcoes:list'] });
      qc.invalidateQueries({ queryKey: ['correcao:atual', execId] });
      toast({
        title: vars.status === 'ENVIADA' ? 'Correção enviada' : 'Rascunho salvo',
        description: vars.status === 'ENVIADA'
          ? 'O aluno será notificado no app.'
          : 'Você pode continuar editando depois.',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUploadMidiaCorrecao(correcaoId?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!correcaoId) throw new Error('Crie/salve um rascunho antes de anexar mídias.');

      // Detecta tipo
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) throw new Error('Arquivo não suportado.');

      // Obter sessão (token JWT do usuário logado)
      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) throw new Error('Sessão inválida.');

      // 1️⃣ Inicializa upload no Drive (gera fileId e uploadUrl)
      const initRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/gdrive_proxy`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'upload-init',
            fileName: file.name,
            mimeType: file.type,
          }),
        }
      );

      const init = await initRes.json();
      if (!initRes.ok) throw new Error(init?.error || 'Falha no upload-init');

      // 2️⃣ Envia o binário diretamente para a function (ela encaminha ao Drive)
      const upRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/gdrive_proxy?action=upload-bytes&fileId=${encodeURIComponent(
          init.fileId
        )}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': file.type,
          },
          body: file, // ✅ ENVIA OS BYTES DIRETO
        }
      );

      const up = await upRes.json();
      if (!upRes.ok) throw new Error(up?.error || 'Falha no upload');

      // 3️⃣ Grava na tabela correcoes_midias (path = "gdrive:<id>")
      const { error: e2 } = await supabase.from('correcoes_midias').insert({
        correcao_id: correcaoId,
        tipo: isVideo ? 'VIDEO' : 'FOTO',
        path: `gdrive:${init.fileId}`, // 🔑 identifica que veio do Drive
      });
      if (e2) throw e2;

      return init.fileId;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['correcoes:midias', correcaoId] });
      toast({ title: 'Mídia anexada', description: 'Upload concluído com sucesso.' });
    },
    onError: (err: any) => {
      console.error('Erro upload GDrive:', err);
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    },
  });
}