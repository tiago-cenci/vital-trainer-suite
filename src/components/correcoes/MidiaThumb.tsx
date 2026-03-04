import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

type Props = {
  bucket: string;
  path: string;
  tipo: 'VIDEO' | 'FOTO';
  onRemove?: () => void;
  removing?: boolean;
};

export function MidiaThumb({ bucket, path, tipo, onRemove, removing }: Props) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let revoke: string | null = null;
    (async () => {
      try {
        if (path.startsWith('gdrive:')) {
          const fileId = path.replace('gdrive:', '');
          const session = (await supabase.auth.getSession()).data.session;
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const r = await fetch(`${supabaseUrl}/functions/v1/gdrive_proxy`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
              apikey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'download', fileId }),
          });
          if (!r.ok) throw new Error('download failed');
          const blob = await r.blob();
          revoke = URL.createObjectURL(blob);
          setUrl(revoke);
        } else {
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60 * 10);
          if (error) throw error;
          setUrl(data?.signedUrl ?? null);
        }
      } catch {
        setUrl(null);
      }
    })();
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [bucket, path]);

  return (
    <div className="relative group w-28 h-28 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
      {!url ? (
        <div className="w-full h-full animate-pulse flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tipo === 'VIDEO' ? (
        <video src={url} controls className="w-full h-full object-cover" />
      ) : (
        <img src={url} className="w-full h-full object-cover" alt="Mídia" />
      )}
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
          disabled={removing}
        >
          {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );
}
