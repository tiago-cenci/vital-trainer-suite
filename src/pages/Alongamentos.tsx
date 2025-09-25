import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { Plus, Search, Tags, Filter, ChevronDown, ChevronUp } from 'lucide-react';

import { useAlongamentoTags } from '@/hooks/useAlongamentoTags';
import { useAlongamentos } from '@/hooks/useAlongamentos';
import { AlongamentoTagForm } from '@/components/alongamentos/AlongamentoTagForm';
import { AlongamentoForm } from '@/components/alongamentos/AlongamentoForm';
import { AlongamentoCard } from '@/components/alongamentos/AlongamentoCard';
import { SessaoAlongamentosManager } from '@/components/alongamentos/SessaoAlongamentosManager';
import { Constants, Enums, Tables } from '@/integrations/supabase/types';

type Grupo = Enums<'grupo_muscular'>;
type Alongamento = Tables<'alongamentos'>;

const ALL = '__ALL__';

function useQueryParam(name: string) {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name), [search, name]);
}

export default function AlongamentosPage() {
  // query param opcional p/ gerenciar vínculo em uma sessão específica
  const sessaoId = useQueryParam('sessaoId');

  // estados de filtros
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [grupo, setGrupo] = useState<Grupo | undefined>(undefined);

  // hooks
  const { tags, loading: loadingTags, createTag, updateTag, deleteTag, isCreating: creatingTag, isUpdating: updatingTag } = useAlongamentoTags({});
  const { alongamentos, loading: loadingAlong, createAlongamento, updateAlongamento, deleteAlongamento, isCreating, isUpdating, isDeleting } =
    useAlongamentos({ search: search || undefined, tag_id: tagId, grupo });

  // modais
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tables<'alongamento_tags'> | undefined>();

  const [showAlongForm, setShowAlongForm] = useState(false);
  const [editingAlong, setEditingAlong] = useState<Alongamento | undefined>();

  // Handlers Tag
  function handleSubmitTag(data: { nome: string; descricao?: string }) {
    if (editingTag) {
      updateTag({ id: editingTag.id, ...data });
    } else {
      createTag(data);
    }
    setShowTagForm(false);
    setEditingTag(undefined);
  }

  // Handlers Alongamento
  function handleSubmitAlong(data: any) {
    if (editingAlong) {
      updateAlongamento({ id: editingAlong.id, ...data });
    } else {
      createAlongamento(data);
    }
    setShowAlongForm(false);
    setEditingAlong(undefined);
  }

  const renderSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <Card className="text-center py-12">
      <CardContent className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Tags className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nenhum alongamento encontrado</h3>
        <p className="text-muted-foreground">
          {search || tagId || grupo ? 'Ajuste sua busca ou filtros.' : 'Crie seu primeiro alongamento.'}
        </p>
        {!search && !tagId && !grupo && (
          <Button className="mt-2" onClick={() => setShowAlongForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Alongamento
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alongamentos</h1>
            <p className="text-muted-foreground">Gerencie seus alongamentos e vincule às sessões</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTagForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Tag
            </Button>
            <Button onClick={() => setShowAlongForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Alongamento
            </Button>
          </div>
        </div>

        {/* Se vier sessaoId, mostra gerenciador de vínculo */}
        {sessaoId && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Vínculo com a sessão</CardTitle>
              <CardDescription>Adicione e organize alongamentos nesta sessão</CardDescription>
            </CardHeader>
            <CardContent>
              <SessaoAlongamentosManager sessaoId={sessaoId} />
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filtro Tag */}
            <Select
              value={tagId ?? undefined}
              onValueChange={(v) => setTagId(v === ALL ? undefined : v)}
            >
              <SelectTrigger className="w-[220px]">
                <Tags className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todas as tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Grupo Muscular */}
            <Select
              value={grupo ?? undefined}
              onValueChange={(v) => setGrupo(v === ALL ? undefined : (v as Grupo))}
            >
              <SelectTrigger className="w-[220px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os grupos</SelectItem>
                {Constants.public.Enums.grupo_muscular.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista */}
        {loadingAlong ? (
          renderSkeleton()
        ) : alongamentos.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alongamentos.map((a) => (
              <AlongamentoCard
                key={a.id}
                alongamento={a as Alongamento & { tag?: { nome?: string } }}
                onEdit={() => {
                  setEditingAlong(a);
                  setShowAlongForm(true);
                }}
                onDelete={() => deleteAlongamento(a.id)}
              />
            ))}
          </div>
        )}

        {/* Rodapé de status simples */}
        <div className="text-xs text-muted-foreground">
          {loadingTags || loadingAlong ? (
            'Carregando…'
          ) : (
            <>
              <Badge variant="secondary">{tags.length}</Badge> tags &nbsp;·&nbsp;{' '}
              <Badge variant="secondary">{alongamentos.length}</Badge> alongamentos
            </>
          )}
        </div>

        {/* Modal: Tag */}
        <Dialog open={showTagForm || !!editingTag} onOpenChange={() => { setShowTagForm(false); setEditingTag(undefined); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTag ? 'Editar Tag' : 'Nova Tag'}</DialogTitle>
              <DialogDescription>Crie e edite categorias de alongamentos</DialogDescription>
            </DialogHeader>
            <AlongamentoTagForm
              tag={editingTag}
              onSubmit={handleSubmitTag}
              onCancel={() => { setShowTagForm(false); setEditingTag(undefined); }}
              isSubmitting={creatingTag || updatingTag}
            />
          </DialogContent>
        </Dialog>

        {/* Modal: Alongamento */}
        <Dialog open={showAlongForm || !!editingAlong} onOpenChange={() => { setShowAlongForm(false); setEditingAlong(undefined); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAlong ? 'Editar Alongamento' : 'Novo Alongamento'}</DialogTitle>
              <DialogDescription>Cadastre instruções completas para execução</DialogDescription>
            </DialogHeader>
            <AlongamentoForm
              alongamento={editingAlong}
              tags={tags}
              onSubmit={handleSubmitAlong}
              onCancel={() => { setShowAlongForm(false); setEditingAlong(undefined); }}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
