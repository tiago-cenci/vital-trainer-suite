import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Search, Users, ChevronDown, ChevronUp, Dumbbell, Calendar, Target, Settings2, Power, PowerOff, Edit, Copy, Trash2, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TreinoCard } from '@/components/treinos/TreinoCard';
import { TreinoForm } from '@/components/treinos/TreinoForm';
import { useTreinos, type TreinoFilters, type TreinoCompleto } from '@/hooks/useTreinos';
import { useAlunos } from '@/hooks/useAlunos';

export default function Treinos() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TreinoFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingTreino, setEditingTreino] = useState<TreinoCompleto | undefined>();
  const [deletingTreino, setDeletingTreino] = useState<TreinoCompleto | undefined>();
  const [expandedAlunos, setExpandedAlunos] = useState<Set<string>>(new Set());

  const combinedFilters = { ...filters, search: search || undefined };
  const { 
    treinos, 
    loading, 
    createTreino, 
    updateTreino, 
    ativarTreino, 
    desativarTreino, 
    deleteTreino, 
    duplicarTreino,
    isCreating, 
    isUpdating,
    isActivating,
    isDeactivating,
    isDeleting,
    isDuplicating
  } = useTreinos(combinedFilters);
  
  const { alunos } = useAlunos();

  // Group treinos by aluno
  const treinosPorAluno = treinos.reduce((acc, treino) => {
    const alunoId = treino.aluno_id;
    if (!acc[alunoId]) {
      acc[alunoId] = {
        aluno: treino.alunos,
        treinos: []
      };
    }
    acc[alunoId].treinos.push(treino);
    return acc;
  }, {} as Record<string, { aluno: any; treinos: TreinoCompleto[] }>);

  const handleCreateTreino = (data: any) => {
    createTreino(data);
    setShowForm(false);
  };

  const handleUpdateTreino = (data: any) => {
    if (editingTreino) {
      updateTreino({ ...data, id: editingTreino.id });
      setEditingTreino(undefined);
    }
  };

  const handleDeleteTreino = (treino: TreinoCompleto) => {
    deleteTreino(treino.id);
    setDeletingTreino(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTreino(undefined);
  };

  const toggleAlunoExpansion = (alunoId: string) => {
    const newExpanded = new Set(expandedAlunos);
    if (newExpanded.has(alunoId)) {
      newExpanded.delete(alunoId);
    } else {
      newExpanded.add(alunoId);
    }
    setExpandedAlunos(newExpanded);
  };

  const renderEmptyState = () => (
    <Card className="text-center py-12">
      <CardContent className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Dumbbell className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Nenhum treino encontrado</h3>
          <p className="text-muted-foreground">
            {search || Object.keys(filters).length > 0
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro treino.'}
          </p>
        </div>
        {!search && Object.keys(filters).length === 0 && (
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Treino
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Treinos</h1>
              <p className="text-muted-foreground">
                Gerencie os treinos dos seus alunos
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Treino
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar treinos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filters.aluno_id || ""}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, aluno_id: value || undefined }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Todos os alunos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os alunos</SelectItem>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.ativo === undefined ? "" : filters.ativo.toString()}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    ativo: value === "" ? undefined : value === "true" 
                  }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.usa_periodizacao === undefined ? "" : filters.usa_periodizacao.toString()}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    usa_periodizacao: value === "" ? undefined : value === "true" 
                  }))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <Target className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Periodização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="true">Com periodização</SelectItem>
                  <SelectItem value="false">Sem periodização</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? renderSkeleton() : treinos.length === 0 ? renderEmptyState() : (
          <div className="space-y-4">
            {Object.entries(treinosPorAluno).map(([alunoId, { aluno, treinos: alunoTreinos }]) => (
              <Card key={alunoId}>
                <Collapsible
                  open={expandedAlunos.has(alunoId)}
                  onOpenChange={() => toggleAlunoExpansion(alunoId)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{aluno.nome}</CardTitle>
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
                        {expandedAlunos.has(alunoId) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {alunoTreinos.map((treino) => (
                          <TreinoCard
                            key={treino.id}
                            treino={treino}
                            onEdit={(treino) => setEditingTreino(treino)}
                            onDelete={(treino) => setDeletingTreino(treino)}
                            onAtivar={(treino) => ativarTreino({ id: treino.id, aluno_id: treino.aluno_id })}
                            onDesativar={(id) => desativarTreino(id)}
                            onDuplicar={(treino) => duplicarTreino(treino)}
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

        {/* Form Dialog */}
        <Dialog open={showForm || !!editingTreino} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTreino ? 'Editar Treino' : 'Novo Treino'}
              </DialogTitle>
              <DialogDescription>
                {editingTreino 
                  ? 'Edite as informações do treino.'
                  : 'Crie um novo treino seguindo os passos do assistente.'
                }
              </DialogDescription>
            </DialogHeader>
            <TreinoForm
              treino={editingTreino}
              onSubmit={editingTreino ? handleUpdateTreino : handleCreateTreino}
              onCancel={handleCloseForm}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deletingTreino} onOpenChange={() => setDeletingTreino(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o treino "{deletingTreino?.nome}"? 
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingTreino && handleDeleteTreino(deletingTreino)}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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