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
        
        const { data, error } = await supabase.functions.invoke('gdrive_proxy', {
          body: { action: 'download', fileId },
        });

        if (error) {
          throw new Error(`Erro ao baixar vídeo do Drive: ${error.message}`);
        }

        // data is already a Blob when using functions.invoke
        const blob = data instanceof Blob ? data : new Blob([data]);
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
