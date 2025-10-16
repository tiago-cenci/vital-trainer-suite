import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Users, Film, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

import { useCorrecoesList, type CorrecoesFilters, type CorrecaoRow } from '@/hooks/useCorrecoesList';
import { useAlunos } from '@/hooks/useAlunos';
import { CorrecaoModal } from '@/components/correcoes/CorrecaoModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ALL = '__ALL__';

type GroupedByDate = {
  date: string;
  dateLabel: string;
  items: CorrecaoRow[];
};

type GroupedByAluno = {
  alunoNome: string;
  dates: GroupedByDate[];
  totalPendentes: number;
  totalRascunhos: number;
  totalEnviadas: number;
};

export default function Correcoes() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CorrecoesFilters>({
    onlyComVideo: true, // sempre apenas com vídeo
    status: undefined,
    alunoId: undefined,
    from: undefined,
    to: undefined,
    limit: 200,
  });

  const combinedFilters: CorrecoesFilters = { ...filters, search: search || undefined };
  const { data: rows = [], isLoading } = useCorrecoesList(combinedFilters);
  const { alunos = [] } = useAlunos();

  // Agrupar por aluno e depois por data
  const grupos = useMemo<GroupedByAluno[]>(() => {
    const byAluno: Record<string, CorrecaoRow[]> = {};
    for (const r of rows) {
      const key = r.alunoNome || 'Sem Aluno';
      if (!byAluno[key]) byAluno[key] = [];
      byAluno[key].push(r);
    }

    return Object.entries(byAluno).map(([alunoNome, items]) => {
      // Agrupar por data
      const byDate: Record<string, CorrecaoRow[]> = {};
      items.forEach((item) => {
        const date = item.data ? format(new Date(item.data), 'yyyy-MM-dd') : 'sem-data';
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(item);
      });

      const dates: GroupedByDate[] = Object.entries(byDate)
        .map(([date, dateItems]) => ({
          date,
          dateLabel: date === 'sem-data' 
            ? 'Sem data' 
            : format(new Date(date), "d 'de' MMMM", { locale: ptBR }),
          items: dateItems.sort((a, b) => 
            (a.data || '').localeCompare(b.data || '')
          ),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // mais antigas primeiro, mais recentes por último

      const totalPendentes = items.filter(i => i.statusCorrecao === 'SEM_CORRECAO').length;
      const totalRascunhos = items.filter(i => i.statusCorrecao === 'RASCUNHO').length;
      const totalEnviadas = items.filter(i => i.statusCorrecao === 'ENVIADA').length;

      return { alunoNome, dates, totalPendentes, totalRascunhos, totalEnviadas };
    });
  }, [rows]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (k: string) => {
    const s = new Set(expanded);
    s.has(k) ? s.delete(k) : s.add(k);
    setExpanded(s);
  };

  // Modal com múltiplas execuções
  const [modalData, setModalData] = useState<{ execIds: string[]; currentIndex: number } | null>(null);

  const openDateModal = (items: CorrecaoRow[]) => {
    const execIds = items.map(i => i.execId);
    setModalData({ execIds, currentIndex: 0 });
  };

  const closeModal = () => setModalData(null);

  const handleNext = () => {
    if (!modalData) return;
    const nextIndex = (modalData.currentIndex + 1) % modalData.execIds.length;
    setModalData({ ...modalData, currentIndex: nextIndex });
  };

  const handlePrev = () => {
    if (!modalData) return;
    const prevIndex = modalData.currentIndex === 0 
      ? modalData.execIds.length - 1 
      : modalData.currentIndex - 1;
    setModalData({ ...modalData, currentIndex: prevIndex });
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <Card className="text-center py-16">
      <CardContent className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Film className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Nenhuma execução com vídeo</h3>
          <p className="text-muted-foreground">
            {search || filters.status || filters.alunoId || filters.from || filters.to
              ? 'Ajuste sua busca ou filtros para ver execuções com vídeos.'
              : 'Quando seus alunos enviarem vídeos de execuções, elas aparecerão aqui.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Correções' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display tracking-tight text-primary">Correções</h1>
          <p className="text-muted-foreground text-lg">
            Revise vídeos e envie feedback estruturado aos seus alunos
          </p>
        </div>

        {/* Busca e Filtros */}
        <Card>
          <CardContent className="pt-6">
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
                  value={filters.alunoId ?? ALL}
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
                  value={filters.status ?? ALL}
                  onValueChange={(v) => setFilters((p) => ({ ...p, status: v === ALL ? undefined : (v as any) }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todos</SelectItem>
                    <SelectItem value="SEM_CORRECAO">Sem correção</SelectItem>
                    <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                    <SelectItem value="ENVIADA">Enviada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo */}
        {isLoading ? (
          renderSkeleton()
        ) : rows.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="space-y-4">
            {grupos.map((grupo) => (
              <Card key={grupo.alunoNome}>
                <Collapsible open={expanded.has(grupo.alunoNome)} onOpenChange={() => toggle(grupo.alunoNome)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{grupo.alunoNome}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {grupo.totalPendentes} pendentes
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {grupo.totalRascunhos} rascunhos
                              </Badge>
                              <Badge className="text-xs">
                                {grupo.totalEnviadas} enviadas
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {expanded.has(grupo.alunoNome) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      {grupo.dates.map((dateGroup) => (
                        <div
                          key={dateGroup.date}
                          onClick={() => openDateModal(dateGroup.items)}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{dateGroup.dateLabel}</div>
                                <div className="text-sm text-muted-foreground">
                                  {dateGroup.items.length} execução{dateGroup.items.length !== 1 ? 'ões' : ''} com vídeo
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {dateGroup.items.some(i => i.statusCorrecao === 'SEM_CORRECAO') && (
                                <Badge variant="secondary">Pendente</Badge>
                              )}
                              {dateGroup.items.some(i => i.statusCorrecao === 'RASCUNHO') && (
                                <Badge variant="outline">Rascunho</Badge>
                              )}
                              {dateGroup.items.every(i => i.statusCorrecao === 'ENVIADA') && (
                                <Badge>Concluída</Badge>
                              )}
                              <Film className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de correção com navegação */}
        {modalData && (
          <CorrecaoModal
            execId={modalData.execIds[modalData.currentIndex]}
            open={!!modalData}
            onOpenChange={(v) => !v && closeModal()}
            onNext={modalData.execIds.length > 1 ? handleNext : undefined}
            onPrev={modalData.execIds.length > 1 ? handlePrev : undefined}
            currentIndex={modalData.currentIndex}
            totalVideos={modalData.execIds.length}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
