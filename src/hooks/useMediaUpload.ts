// src/hooks/useMediaUpload.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStorageProvider } from './useStorageProvider';
import { toast } from '@/hooks/use-toast';

interface UploadParams {
  file: File;
  bucket: string;
  path: string;
  refTable: string;
  refId: string;
  alunoId?: string;
}

export function useMediaUpload() {
  const queryClient = useQueryClient();
  const { data: storageSettings } = useStorageProvider();
  const provider = storageSettings?.provider || 'supabase';

  return useMutation({
    mutationFn: async ({ file, bucket, path, refTable, refId, alunoId }: UploadParams) => {
      console.log('[useMediaUpload] Provider:', provider);
      
      if (provider === 'gdrive') {
        return await uploadToGoogleDrive(file, refTable, refId, alunoId);
      } else {
        return await uploadToSupabase(file, bucket, path);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
      toast({
        title: 'Upload realizado',
        description: 'Mídia enviada com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('[useMediaUpload] Erro:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    },
  });
}

async function uploadToSupabase(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;
  return { provider: 'supabase', path: data.path };
}

async function uploadToGoogleDrive(
  file: File,
  refTable: string,
  refId: string,
  alunoId?: string
) {
  const session = await supabase.auth.getSession();
  if (!session.data.session) throw new Error('Não autenticado');

  // 1. Iniciar upload
  const initRes = await fetch(
    `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/gdrive_proxy`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upload-init',
        fileName: file.name,
        mimeType: file.type,
        refTable,
        refId,
        alunoId,
      }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Erro ao iniciar upload: ${err}`);
  }

  const { uploadUrl, fileId, folderPath } = await initRes.json();

  // 2. Upload do arquivo
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Erro ao fazer upload no Google Drive');
  }

  console.log('[useMediaUpload] Upload Google Drive concluído:', fileId);
  
  return {
    provider: 'gdrive',
    path: `gdrive:${fileId}`,
    folderPath,
  };
}
