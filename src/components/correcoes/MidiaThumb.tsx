// src/components/correcoes/MidiaThumb.tsx
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  bucket: string;
  path: string;        // pode ser "gdrive:<fileId>" ou path do Supabase
  tipo: 'VIDEO' | 'FOTO';
};

export function MidiaThumb({ bucket, path, tipo }: Props) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        if (path.startsWith('gdrive:')) {
          const fileId = path.replace('gdrive:', '');
          const session = (await supabase.auth.getSession()).data.session;
          const r = await fetch(
            `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/gdrive_proxy`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ action: 'download', fileId }),
            }
          );
          if (!r.ok) throw new Error('download failed');
          const blob = await r.blob();
          setUrl(URL.createObjectURL(blob));
        } else {
          const { data, error } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(path, 60 * 10);
          if (error) throw error;
          setUrl(data?.signedUrl ?? null);
        }
      } catch {
        setUrl(null);
      }
    })();
  }, [bucket, path]);

  if (!url) return <div className="w-28 h-28 bg-muted rounded animate-pulse" />;

  return tipo === 'VIDEO'
    ? <video src={url} controls className="w-28 h-28 object-cover rounded" />
    : <img src={url} className="w-28 h-28 object-cover rounded" />;
}
