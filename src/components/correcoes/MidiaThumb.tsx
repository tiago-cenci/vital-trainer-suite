import React from 'react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface MidiaThumbProps {
  bucket: 'execucoes' | 'correcoes';
  path: string;
  tipo: 'FOTO' | 'VIDEO';
}

export function MidiaThumb({ bucket, path, tipo }: MidiaThumbProps) {
  const { data: url } = useSignedUrl(bucket, path);

  if (!url) return <div className="w-24 h-16 bg-muted rounded animate-pulse" />;

  return tipo === 'FOTO' ? (
    <img src={url} alt="mídia" className="w-24 h-16 object-cover rounded" />
  ) : (
    <video src={url} className="w-24 h-16 rounded" controls />
  );
}
