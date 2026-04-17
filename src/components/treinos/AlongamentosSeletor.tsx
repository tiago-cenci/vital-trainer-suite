import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Tags, Plus, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlongamentos } from '@/hooks/useAlongamentos';
import { useAlongamentoTags } from '@/hooks/useAlongamentoTags';
import type { Tables } from '@/integrations/supabase/types';

type Alongamento = Tables<'alongamentos'>;

interface AlongamentosSeletorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alongamentosJaAdicionados: string[];
  onSelectAlongamento: (alongamento: Alongamento) => void;
}

export function AlongamentosSeletor({
  open,
  onOpenChange,
  alongamentosJaAdicionados,
  onSelectAlongamento,
}: AlongamentosSeletorProps) {
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  const { tags } = useAlongamentoTags();
  const { alongamentos, loading } = useAlongamentos({
    search,
    tag_id: tagId === '__ALL__' ? undefined : tagId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Selecionar Alongamentos</DialogTitle>
          <DialogDescription>
            Busque e selecione alongamentos para adicionar ao início da sessão.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={tagId ?? '__ALL__'}
              onValueChange={(v) => setTagId(v)}
            >
              <SelectTrigger className="w-[180px]">
                <Tags className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todas as tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : alongamentos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum alongamento encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 pb-6">
              {alongamentos.map((a) => {
                const isAdded = alongamentosJaAdicionados.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{a.descricao}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {a.grupo_muscular}
                        </Badge>
                        {tags.find(t => t.id === a.tag_id) && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {tags.find(t => t.id === a.tag_id)?.nome}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? "secondary" : "default"}
                      className="ml-4 h-8 w-8 p-0 shrink-0"
                      onClick={() => onSelectAlongamento(a)}
                      disabled={isAdded}
                    >
                      {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
