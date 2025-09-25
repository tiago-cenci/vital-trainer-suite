import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, History } from 'lucide-react';
import type { CorrecaoRow } from '@/hooks/useCorrecoesList';

interface CorrecaoCardProps {
  item: CorrecaoRow;
  onOpen: (execId: string) => void;
}

export function CorrecaoCard({ item, onOpen }: CorrecaoCardProps) {
  return (
    <div
      className="border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/40 transition"
      role="button"
      onClick={() => onOpen(item.execId)}
    >
      {item.temVideo ? (
        <div className="w-20 h-12 bg-black/5 rounded flex items-center justify-center">
          <Film className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : (
        <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
          <History className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.exercicioNome}</div>
        <div className="text-xs text-muted-foreground">
          {item.data ? new Date(item.data).toLocaleString() : '—'}
        </div>
        <div className="mt-1">
          <Badge
            variant={
              item.statusCorrecao === 'ENVIADA'
                ? 'default'
                : item.statusCorrecao === 'RASCUNHO'
                ? 'secondary'
                : 'outline'
            }
            className="text-[10px]"
          >
            {item.statusCorrecao}
          </Badge>
        </div>
      </div>

      <Button size="sm" onClick={(e) => { e.stopPropagation(); onOpen(item.execId); }}>
        {item.temVideo ? 'Revisar' : 'Ver histórico'}
      </Button>
    </div>
  );
}
