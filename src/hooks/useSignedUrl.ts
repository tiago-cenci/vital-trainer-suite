// src/hooks/useSignedUrl.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSignedUrl(bucket: string | undefined, path?: string | null, ttlSec = 600) {
  return useQuery({
    queryKey: ['signedUrl', bucket, path, ttlSec],
    enabled: !!bucket && !!path,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(bucket!).createSignedUrl(path!, ttlSec);
      if (error) throw error;
      return data!.signedUrl as string;
    },
  });
}
