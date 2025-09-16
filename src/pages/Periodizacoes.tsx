import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Target, Loader2 } from 'lucide-react';
import { usePeriodizacoes, type PeriodizacaoCompleta } from '@/hooks/usePeriodizacoes';
import { PeriodizacaoCard } from '@/components/periodizacoes/PeriodizacaoCard';
import { PeriodizacaoForm } from '@/components/periodizacoes/PeriodizacaoForm';

export default function Periodizacoes() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deletingPeriodizacao, setDeletingPeriodizacao] = useState<PeriodizacaoCompleta | null>(null);

  const {
    periodizacoes,
    loading,
    createPeriodizacao,
    deletePeriodizacao,
    isCreating,
    isDeleting
  } = usePeriodizacoes({ search });

  const handleCreatePeriodizacao = (data: any) => {
    createPeriodizacao(data);
    setShowForm(false);
  };

  const handleDeletePeriodizacao = () => {
    if (deletingPeriodizacao) {
      deletePeriodizacao(deletingPeriodizacao.id);
      setDeletingPeriodizacao(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Periodizações' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestão de Periodizações
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas periodizações de treino e suas configurações semanais
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Periodização
          </Button>
        </div>

        {/* Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome da periodização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Periodizações */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando periodizações...</p>
            </div>
          </div>
        ) : periodizacoes.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'Nenhuma periodização encontrada' : 'Nenhuma periodização cadastrada'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando sua primeira periodização de treino'
              }
            </p>
            {!search && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Periodização
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {periodizacoes.map((periodizacao) => (
              <PeriodizacaoCard
                key={periodizacao.id}
                periodizacao={periodizacao}
                onEdit={() => {
                  // TODO: Implementar edição
                }}
                onDelete={() => setDeletingPeriodizacao(periodizacao)}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PeriodizacaoForm
              onSubmit={handleCreatePeriodizacao}
              onCancel={handleCloseForm}
              isSubmitting={isCreating}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deletingPeriodizacao}
          onOpenChange={(open) => !open && setDeletingPeriodizacao(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a periodização <strong>{deletingPeriodizacao?.nome}</strong>?
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePeriodizacao}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}