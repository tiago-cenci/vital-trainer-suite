import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter, Users, Loader2 } from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';
import { AlunoCard } from '@/components/alunos/AlunoCard';
import { AlunoForm } from '@/components/alunos/AlunoForm';
import { AssinaturasModal } from '@/components/alunos/AssinaturasModal';
import type { Tables } from '@/integrations/supabase/types';

type Aluno = Tables<'alunos'>;

export default function Alunos() {
  const [search, setSearch] = useState('');
  const [objetivoFilter, setObjetivoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);
  const [assinaturasAluno, setAssinaturasAluno] = useState<Aluno | null>(null);

  const { 
    alunos, 
    loading, 
    createAluno, 
    updateAluno, 
    deleteAluno,
    isCreating,
    isUpdating,
    isDeleting 
  } = useAlunos({ search, objetivo: objetivoFilter === 'all' ? '' : objetivoFilter });

  const handleCreateAluno = (data: any) => {
    createAluno(data);
    setShowForm(false);
  };

  const handleUpdateAluno = (data: any) => {
    if (editingAluno) {
      updateAluno({ id: editingAluno.id, ...data });
      setEditingAluno(null);
      setShowForm(false);
    }
  };

  const handleDeleteAluno = () => {
    if (deletingAluno) {
      deleteAluno(deletingAluno.id);
      setDeletingAluno(null);
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingAluno(null);
    setShowForm(false);
  };

  const objetivos = Array.from(new Set(alunos.map(a => a.objetivo).filter(Boolean)));

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Alunos' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestão de Alunos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus alunos e suas informações
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={objetivoFilter} onValueChange={setObjetivoFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os objetivos</SelectItem>
                {objetivos.map((objetivo) => (
                  <SelectItem key={objetivo} value={objetivo}>
                    {objetivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Alunos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando alunos...</p>
            </div>
          </div>
        ) : alunos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {search || objetivoFilter ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search || objetivoFilter 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando seu primeiro aluno'
              }
            </p>
            {!search && !objetivoFilter && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Primeiro Aluno
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {alunos.map((aluno) => (
              <AlunoCard
                key={aluno.id}
                aluno={aluno}
                onEdit={() => handleEdit(aluno)}
                onDelete={() => setDeletingAluno(aluno)}
                onViewSubscriptions={() => setAssinaturasAluno(aluno)}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <AlunoForm
                aluno={editingAluno}
                onSubmit={editingAluno ? handleUpdateAluno : handleCreateAluno}
                onCancel={handleCloseForm}
                isSubmitting={isCreating || isUpdating}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog 
          open={!!deletingAluno} 
          onOpenChange={(open) => !open && setDeletingAluno(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o aluno <strong>{deletingAluno?.nome}</strong>? 
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAluno}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assinaturas Modal */}
        {assinaturasAluno && (
          <AssinaturasModal
            aluno={assinaturasAluno}
            open={!!assinaturasAluno}
            onOpenChange={(open) => !open && setAssinaturasAluno(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}