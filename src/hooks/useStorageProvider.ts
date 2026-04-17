// src/hooks/useStorageProvider.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type StorageProvider = 'none' | 'gdrive';

export type StorageSettings = {
  user_id: string;
  provider: StorageProvider;
  gdrive_root_folder_id: string | null;
  gdrive_email: string | null;
} | null;

export function useStorageProvider() {
  const { user } = useAuth();

  const query = useQuery<StorageSettings>({
    queryKey: ['storage_settings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('storage_settings')
        .select('user_id, provider, gdrive_root_folder_id, gdrive_email')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as StorageSettings) ?? null;
    },
  });

  const settings = query.data;
  const isMediaConfigured =
    settings?.provider === 'gdrive' && !!settings?.gdrive_root_folder_id;

  return {
    ...query,
    settings,
    isMediaConfigured,
    gdriveEmail: settings?.gdrive_email ?? null,
    gdriveFolderId: settings?.gdrive_root_folder_id ?? null,
  };
}
