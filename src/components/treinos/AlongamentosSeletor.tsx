import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Tags, Plus, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlongamentos } from '@/hooks/useAlongamentos';
import { useAlongamentoTags } from '@/hooks/useAlongamentoTags';
import type { Tables } from '@/integrations/supabase/types';

type Alongamento = Tables<'alongamentos'>;

interface AlongamentosSeletorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alongamentosJaAdicionados: string[];
  onSelectAlongamentos: (alongamentos: Alongamento[]) => void;
}

export function AlongamentosSeletor({
  open,
  onOpenChange,
  alongamentosJaAdicionados,
  onSelectAlongamentos,
}: AlongamentosSeletorProps) {
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [selecionadosLocais, setSelecionadosLocais] = useState<Alongamento[]>([]);

  const { tags } = useAlongamentoTags();
  const { alongamentos, loading } = useAlongamentos({
    search,
    tag_id: tagId === '__ALL__' ? undefined : tagId,
  });

  // Limpa a seleção local ao abrir o modal
  useEffect(() => {
    if (open) {
      setSelecionadosLocais([]);
    }
  }, [open]);

  const toggleSelecao = (along: Alongamento) => {
    setSelecionadosLocais(prev => {
      const isSelecionado = prev.some(a => a.id === along.id);
      if (isSelecionado) {
        return prev.filter(a => a.id !== along.id);
      } else {
        return [...prev, along];
      }
    });
  };

  const handleConfirmar = () => {
    onSelectAlongamentos(selecionadosLocais);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Selecionar Alongamentos</DialogTitle>
          <DialogDescription>
            Selecione múltiplos alongamentos para adicionar ao início da sessão.
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

          {selecionadosLocais.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md border border-dashed">
              <span className="text-[10px] font-bold uppercase text-muted-foreground w-full mb-1">
                Selecionados ({selecionadosLocais.length}):
              </span>
              {selecionadosLocais.map(a => (
                <Badge key={a.id} variant="secondary" className="gap-1 pr-1">
                  {a.descricao}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => toggleSelecao(a)}
                  />
                </Badge>
              ))}
            </div>
          )}
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
                const isAlreadyAdded = alongamentosJaAdicionados.includes(a.id);
                const isSelectedLocally = selecionadosLocais.some(sel => sel.id === a.id);
                
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors group cursor-pointer ${
                      isSelectedLocally ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    } ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isAlreadyAdded && toggleSelecao(a)}
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
                    <div className={`ml-4 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelectedLocally ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {isSelectedLocally && <Check className="h-3.5 w-3.5" />}
                      {!isSelectedLocally && !isAlreadyAdded && <Plus className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />}
                      {isAlreadyAdded && <Check className="h-3.5 w-3.5 text-muted-foreground/30" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar} 
            disabled={selecionadosLocais.length === 0}
            className="min-w-[120px]"
          >
            Adicionar {selecionadosLocais.length > 0 ? `(${selecionadosLocais.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
