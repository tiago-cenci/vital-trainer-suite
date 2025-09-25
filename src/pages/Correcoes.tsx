import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Users, Film, Filter, ChevronDown, ChevronUp, Clock, History } from 'lucide-react';

import { useCorrecoesList, type CorrecoesFilters } from '@/hooks/useCorrecoesList';
import { useAlunos } from '@/hooks/useAlunos';
import { CorrecaoCard } from '@/components/correcoes/CorrecaoCard';
import { CorrecaoModal } from '@/components/correcoes/CorrecaoModal';

const ALL = '__ALL__';

export default function Correcoes() {
  // Filtros de tela
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CorrecoesFilters>({
    onlyComVideo: false,
    status: undefined,
    alunoId: undefined,
    from: undefined,
    to: undefined,
    limit: 100,
  });

  const combinedFilters: CorrecoesFilters = { ...filters, search: search || undefined };

  const { data: rows = [], isLoading } = useCorrecoesList(combinedFilters);
  const { alunos = [] } = useAlunos();

  // Agrupar por aluno
  const grupos = useMemo(() => {
    const byAluno: Record<string, typeof rows> = {};
    for (const r of rows) {
      const key = r.alunoNome || '—';
      if (!byAluno[key]) byAluno[key] = [];
      byAluno[key].push(r);
    }
    return byAluno;
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (k: string) => {
    const s = new Set(expanded);
    s.has(k) ? s.delete(k) : s.add(k);
    setExpanded(s);
  };

  // Modal
  const [openedExecId, setOpenedExecId] = useState<string | null>(null);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <Card className="text-center py-12">
      <CardContent className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Film className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nada por aqui</h3>
        <p className="text-muted-foreground">
          {search || filters.status || filters.alunoId || filters.from || filters.to
            ? 'Ajuste sua busca ou filtros.'
            : 'Quando seus alunos enviarem execuções, elas aparecerão aqui.'}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Correções</h1>
              <p className="text-muted-foreground">Revise vídeos e envie feedback estruturado</p>
            </div>
          </div>

          {/* Busca e Filtros */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno ou exercício…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Filtro: Aluno */}
              <Select
                value={filters.alunoId ?? undefined}
                onValueChange={(v) => setFilters((p) => ({ ...p, alunoId: v === ALL ? undefined : v }))}
              >
                <SelectTrigger className="w-[200px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Todos os alunos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos os alunos</SelectItem>
                  {alunos
                    .filter((a) => a?.id && a?.nome)
                    .map((a) => (
                      <SelectItem key={String(a.id)} value={String(a.id)}>
                        {a.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Filtro: Status */}
              <Select
                value={filters.status ?? undefined}
                onValueChange={(v) => setFilters((p) => ({ ...p, status: v === ALL ? undefined : (v as any) }))}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  <SelectItem value="SEM_CORRECAO">Sem correção</SelectItem>
                  <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                  <SelectItem value="ENVIADA">Enviada</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro: Com vídeo */}
              <Select
                value={String(!!filters.onlyComVideo)}
                onValueChange={(v) => setFilters((p) => ({ ...p, onlyComVideo: v === 'true' }))}
              >
                <SelectTrigger className="w-[160px]">
                  <Film className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Com vídeo?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Todos</SelectItem>
                  <SelectItem value="true">Apenas com vídeo</SelectItem>
                </SelectContent>
              </Select>

              {/* Período */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.from ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value || undefined }))}
                    className="w-[150px]"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="date"
                    value={filters.to ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value || undefined }))}
                    className="w-[150px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          renderSkeleton()
        ) : rows.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="space-y-4">
            {Object.entries(grupos).map(([alunoNome, items]) => (
              <Card key={alunoNome}>
                <Collapsible open={expanded.has(alunoNome)} onOpenChange={() => toggle(alunoNome)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{alunoNome}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              {items.length} execução{items.length !== 1 ? 'es' : ''}
                              <span className="inline-flex items-center gap-1">
                                <Badge variant="secondary">
                                  {items.filter((i) => i.statusCorrecao === 'SEM_CORRECAO').length} pendentes
                                </Badge>
                                <Badge variant="outline">
                                  {items.filter((i) => i.statusCorrecao === 'RASCUNHO').length} rascunhos
                                </Badge>
                                <Badge>
                                  {items.filter((i) => i.statusCorrecao === 'ENVIADA').length} enviadas
                                </Badge>
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        {expanded.has(alunoNome) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((r) => (
                          <CorrecaoCard key={r.execId} item={r} onOpen={(id) => setOpenedExecId(id)} />
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de correção */}
        <CorrecaoModal
          execId={openedExecId}
          open={!!openedExecId}
          onOpenChange={(v) => !v && setOpenedExecId(null)}
        />
      </div>
    </DashboardLayout>
  );
}
