// src/hooks/useStorageProvider.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type StorageSettings = {
  user_id: string;
  provider: 'supabase' | 'gdrive';
  gdrive_root_folder_id: string | null;
} | null;

export function useStorageProvider() {
  const { user } = useAuth();

  return useQuery<StorageSettings>({
    queryKey: ['storage_settings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('storage_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as StorageSettings;
    },
  });
}
