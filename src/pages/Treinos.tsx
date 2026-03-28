import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Search, Users, ChevronDown, ChevronUp, Dumbbell, Filter, Target } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TreinoCard } from '@/components/treinos/TreinoCard';
import { useTreinos, type TreinoFilters, type TreinoCompleto } from '@/hooks/useTreinos';
import { useAlunos } from '@/hooks/useAlunos';

const ALL = '__ALL__';

export default function Treinos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TreinoFilters>({});
  const [deletingTreino, setDeletingTreino] = useState<TreinoCompleto | undefined>();
  const [expandedAlunos, setExpandedAlunos] = useState<Set<string>>(new Set());

  const combinedFilters = { ...filters, search: search || undefined };
  const {
    treinos, loading,
    ativarTreino, desativarTreino, deleteTreino, duplicarTreino,
    isActivating, isDeactivating, isDeleting, isDuplicating,
  } = useTreinos(combinedFilters);

  const { alunos } = useAlunos();

  // Agrupar por aluno
  const treinosPorAluno = treinos.reduce((acc, treino) => {
    const alunoId = String(treino.aluno_id);
    if (!acc[alunoId]) acc[alunoId] = { aluno: treino.alunos, treinos: [] };
    acc[alunoId].treinos.push(treino);
    return acc;
  }, {} as Record<string, { aluno: any; treinos: TreinoCompleto[] }>);

  const toggleAluno = (id: string) => {
    setExpandedAlunos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <Card className="text-center py-16">
      <CardContent className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Nenhum treino encontrado</h3>
          <p className="text-muted-foreground">
            {search || Object.keys(filters).length > 0
              ? 'Tente ajustar os filtros.'
              : 'Crie o primeiro treino para começar.'}
          </p>
        </div>
        {!search && Object.keys(filters).length === 0 && (
          <Button onClick={() => navigate('/treinos/novo')}>
            <Plus className="h-4 w-4 mr-2" /> Criar Primeiro Treino
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Treinos</h1>
            <p className="text-muted-foreground">Gerencie os treinos dos seus alunos</p>
          </div>
          <Button onClick={() => navigate('/treinos/novo')} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Treino
          </Button>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar treinos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.aluno_id ?? ALL}
            onValueChange={v => setFilters(p => ({ ...p, aluno_id: v === ALL ? undefined : v }))}
          >
            <SelectTrigger className="w-[200px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos os alunos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os alunos</SelectItem>
              {alunos.filter(a => a?.id && a?.nome).map(a => (
                <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.ativo === undefined ? ALL : String(filters.ativo)}
            onValueChange={v => setFilters(p => ({ ...p, ativo: v === ALL ? undefined : v === 'true' }))}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.usa_periodizacao === undefined ? ALL : String(filters.usa_periodizacao)}
            onValueChange={v => setFilters(p => ({ ...p, usa_periodizacao: v === ALL ? undefined : v === 'true' }))}
          >
            <SelectTrigger className="w-[190px]">
              <Target className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periodização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              <SelectItem value="true">Com periodização</SelectItem>
              <SelectItem value="false">Sem periodização</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conteúdo */}
        {loading ? renderSkeleton() : treinos.length === 0 ? renderEmpty() : (
          <div className="space-y-4">
            {Object.entries(treinosPorAluno).map(([alunoId, { aluno, treinos: alunoTreinos }]) => (
              <Card key={alunoId}>
                <Collapsible open={expandedAlunos.has(alunoId)} onOpenChange={() => toggleAluno(alunoId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{aluno?.nome ?? '—'}</CardTitle>
                            <CardDescription>
                              {alunoTreinos.length} treino{alunoTreinos.length !== 1 ? 's' : ''}
                              {alunoTreinos.some(t => t.ativo) && (
                                <Badge variant="default" className="ml-2">
                                  {alunoTreinos.filter(t => t.ativo).length} ativo{alunoTreinos.filter(t => t.ativo).length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        {expandedAlunos.has(alunoId)
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {alunoTreinos.map(treino => (
                          <TreinoCard
                            key={treino.id}
                            treino={treino}
                            onEdit={() => navigate(`/treinos/${treino.id}/editar`)}
                            onDelete={() => setDeletingTreino(treino)}
                            onAtivar={() => ativarTreino({ id: treino.id, aluno_id: treino.aluno_id! })}
                            onDesativar={() => desativarTreino(treino.id)}
                            onDuplicar={() => duplicarTreino(treino)}
                            isActivating={isActivating}
                            isDeactivating={isDeactivating}
                            isDuplicating={isDuplicating}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Delete dialog */}
        <AlertDialog open={!!deletingTreino} onOpenChange={() => setDeletingTreino(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir treino?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{deletingTreino?.nome}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (deletingTreino) { deleteTreino(deletingTreino.id); setDeletingTreino(undefined); } }}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
