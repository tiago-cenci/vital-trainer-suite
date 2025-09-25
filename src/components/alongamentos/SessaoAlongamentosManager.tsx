import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, Trash2, Tags } from 'lucide-react';
import { useAlongamentoTags } from '@/hooks/useAlongamentoTags';
import { useAlongamentos } from '@/hooks/useAlongamentos';
import { useSessoesAlongamentos } from '@/hooks/useSessoesAlongamentos';

interface Props {
  sessaoId: string;
}

export function SessaoAlongamentosManager({ sessaoId }: Props) {
  // filtros
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  const { tags } = useAlongamentoTags({});
  const { alongamentos } = useAlongamentos({ search, tag_id: tagId });
  const {
    items, loading,
    addSessaoAlong, addSessaoAlongByTag,
    updateSessaoAlong, removeSessaoAlong,
  } = useSessoesAlongamentos(sessaoId);

  const ordenados = useMemo(() =>
    [...items].sort((a, b) => a.ordem - b.ordem), [items]);

  function adicionarUnitario(alongamento_id: string) {
    const maxOrdem = ordenados.length ? Math.max(...ordenados.map(i => i.ordem)) : 0;
    addSessaoAlong({ sessao_id: sessaoId, alongamento_id, ordem: maxOrdem + 1, observacoes: null });
  }

  function mover(id: string, delta: number) {
    const item = ordenados.find(i => i.sessao_along_id === id);
    if (!item) return;
    const nova = Math.max(1, item.ordem + delta);
    updateSessaoAlong({ id, ordem: nova });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alongamentos da sessão</CardTitle>
        <CardDescription>Vincule alongamentos e organize a ordem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ações em massa por Tag */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar alongamentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={tagId ?? undefined}
              onValueChange={(v) => setTagId(v === '__ALL__' ? undefined : v)}
            >
              <SelectTrigger className="w-[220px]">
                <Tags className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Todas as tags</SelectItem>
                {tags.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={tagId ?? undefined}
              onValueChange={(v) => setTagId(v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecionar tag para adicionar" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => tagId && addSessaoAlongByTag(tagId)}
              disabled={!tagId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar todos da tag
            </Button>
          </div>
        </div>

        {/* Catálogo (add unitário) */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Catálogo (clique para adicionar):</div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {alongamentos.map(a => (
              <button
                key={a.id}
                onClick={() => adicionarUnitario(a.id)}
                className="text-left p-3 border rounded hover:bg-muted/50 transition"
              >
                <div className="font-medium">{a.descricao}</div>
                <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                  <Badge variant="secondary">{String(a.grupo_muscular)}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vinculados na sessão */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Na sessão:</div>
          <div className="space-y-2">
            {ordenados.map(item => (
              <div key={item.sessao_along_id} className="flex items-center gap-3 p-2 border rounded">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {item.descricao}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <Badge variant="secondary">{String(item.grupo_muscular)}</Badge>
                    <Badge variant="outline">{item.tag_nome}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => mover(item.sessao_along_id, -1)}>↑</Button>
                  <Button variant="outline" size="sm" onClick={() => mover(item.sessao_along_id, +1)}>↓</Button>
                  <Button variant="destructive" size="sm" onClick={() => removeSessaoAlong(item.sessao_along_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {ordenados.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum alongamento adicionado.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
