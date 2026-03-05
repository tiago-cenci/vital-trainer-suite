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

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Remove "data:...;base64," prefix
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  return useQuery({
    queryKey: ['correcao:atual', execId],
    enabled: !!execId,
    queryFn: async (): Promise<Correcao | null> => {
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
        .eq('correcao_id', correcaoId!)
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
    mutationFn: async (payload: { id?: string; texto: string; status: CorrecaoStatus; pontuacao?: number | null }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const base: CorrecaoInsert = {
        sessoes_exercicios_execucoes_id: execId,
        personal_user_id: user.id,
        texto: payload.texto,
        status: payload.status,
        pontuacao_opcional: payload.pontuacao ?? null,
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
        const upd: CorrecaoUpdate = { texto: payload.texto, status: payload.status, pontuacao_opcional: payload.pontuacao ?? null };
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
      qc.invalidateQueries({ queryKey: ['correcao:media-nota', execId] });
      qc.invalidateQueries({ queryKey: ['evolucao:aluno'] });
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
  const { data: storageSettings } = useStorageProvider();
  const provider = storageSettings?.provider || 'supabase';

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!correcaoId) throw new Error('Crie/salve um rascunho antes de anexar mídias.');
      if (!user) throw new Error('Usuário não autenticado');

      const results: string[] = [];

      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        if (!isVideo && !isImage) throw new Error(`Arquivo não suportado: ${file.name}`);

        const tipo = isVideo ? 'VIDEO' : 'FOTO';
        let path: string;

        if (provider === 'gdrive') {
          const session = (await supabase.auth.getSession()).data.session;
          if (!session?.access_token) throw new Error('Sessão inválida.');

          // Get aluno_id
          const { data: correcao } = await supabase
            .from('correcoes')
            .select(`
              sessoes_exercicios_execucoes_id,
              sessoes_exercicios_execucoes (
                treino_execucao_id,
                treinos_execucoes (
                  aluno_id
                )
              )
            `)
            .eq('id', correcaoId)
            .single();

          const alunoId = (correcao as any)?.sessoes_exercicios_execucoes?.treinos_execucoes?.aluno_id;

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

          // Step 1: init (creates file metadata + folders)
          const initRes = await fetch(`${supabaseUrl}/functions/v1/gdrive_proxy`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'upload-init',
              fileName: file.name,
              mimeType: file.type,
              refTable: 'correcoes_midias',
              refId: correcaoId,
              alunoId,
            }),
          });

          if (!initRes.ok) {
            const err = await initRes.text();
            throw new Error(`Erro ao iniciar upload: ${err}`);
          }

          const { fileId } = await initRes.json();

          // Step 2: upload content through edge function (avoids CORS)
          const fileBase64 = await fileToBase64(file);

          const uploadRes = await fetch(`${supabaseUrl}/functions/v1/gdrive_proxy`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'upload-content',
              fileId,
              mimeType: file.type,
              fileBase64,
            }),
          });

          if (!uploadRes.ok) {
            const err = await uploadRes.text();
            throw new Error(`Erro ao enviar conteúdo: ${err}`);
          }

          path = `gdrive:${fileId}`;
        } else {
          // Supabase Storage
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${user.id}/${correcaoId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('correcoes')
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;
          path = filePath;
        }

        // Save record
        const { error: insertError } = await supabase
          .from('correcoes_midias')
          .insert({ correcao_id: correcaoId, tipo, path });

        if (insertError) throw insertError;
        results.push(path);
      }

      return results;
    },
    onSuccess: (paths) => {
      qc.invalidateQueries({ queryKey: ['correcoes:midias', correcaoId] });
      toast({
        title: `${paths.length} mídia(s) anexada(s)`,
        description: `Upload concluído via ${provider === 'gdrive' ? 'Google Drive' : 'Supabase'}.`,
      });
    },
    onError: (err: any) => {
      console.error('Erro upload:', err);
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMidiaCorrecao(correcaoId?: string) {
  const qc = useQueryClient();
  const { data: storageSettings } = useStorageProvider();
  const provider = storageSettings?.provider || 'supabase';

  return useMutation({
    mutationFn: async (midia: Midia) => {
      // Delete from storage
      if (midia.path.startsWith('gdrive:')) {
        const fileId = midia.path.replace('gdrive:', '');
        const session = (await supabase.auth.getSession()).data.session;
        if (!session?.access_token) throw new Error('Sessão inválida.');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(`${supabaseUrl}/functions/v1/gdrive_proxy`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'delete', fileId }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Erro ao deletar do Drive: ${err}`);
        }
      } else {
        // Supabase Storage
        const { error } = await supabase.storage
          .from('correcoes')
          .remove([midia.path]);
        if (error) throw error;
      }

      // Delete from DB
      const { error: dbError } = await supabase
        .from('correcoes_midias')
        .delete()
        .eq('id', midia.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['correcoes:midias', correcaoId] });
      toast({ title: 'Mídia removida' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' });
    },
  });
}
