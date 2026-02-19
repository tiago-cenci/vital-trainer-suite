import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Resolves the playback URL for an execution video.
 * Supports both Supabase Storage paths and Google Drive paths (gdrive://fileId).
 */
export function useExecVideoUrl(videoPath: string | null | undefined) {
  return useQuery({
    queryKey: ['execVideoUrl', videoPath],
    enabled: !!videoPath,
    staleTime: 5 * 60 * 1000, // 5 min
    queryFn: async (): Promise<string> => {
      if (!videoPath) throw new Error('No video path');

      // Google Drive video
      if (videoPath.startsWith('gdrive://')) {
        const fileId = videoPath.replace('gdrive://', '');
        const session = (await supabase.auth.getSession()).data.session;
        if (!session?.access_token) throw new Error('Sessão inválida');

        const functionsUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
        const res = await fetch(`${functionsUrl}/gdrive_proxy`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'download', fileId }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ao baixar vídeo do Drive: ${errText}`);
        }

        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }

      // Supabase Storage video
      const { data, error } = await supabase.storage
        .from('exercicio-videos')
        .createSignedUrl(videoPath, 600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}
