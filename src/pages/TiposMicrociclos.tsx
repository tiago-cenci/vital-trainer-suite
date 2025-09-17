import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Settings, Loader2 } from 'lucide-react';
import { useTiposMicrociclos, type TipoMicrocicloCompleto } from '@/hooks/useTiposMicrociclos';
import { TipoMicrocicloCard } from '@/components/tipos-microciclos/TipoMicrocicloCard';
import { TipoMicrocicloForm } from '@/components/tipos-microciclos/TipoMicrocicloForm';

export default function TiposMicrociclos() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoMicrocicloCompleto | null>(null);
  const [deletingTipo, setDeletingTipo] = useState<TipoMicrocicloCompleto | null>(null);

  const {
    tiposMicrociclos,
    loading,
    createTipoMicrociclo,
    updateTipoMicrociclo,
    deleteTipoMicrociclo,
    isCreating,
    isUpdating,
    isDeleting
  } = useTiposMicrociclos({ search });

  const handleCreateTipo = (data: any) => {
    createTipoMicrociclo(data);
    setShowForm(false);
  };

  const handleUpdateTipo = (data: any) => {
    if (editingTipo) {
      updateTipoMicrociclo({ id: editingTipo.id, ...data });
      setEditingTipo(null);
    }
  };

  const handleDeleteTipo = () => {
    if (deletingTipo) {
      deleteTipoMicrociclo(deletingTipo.id);
      setDeletingTipo(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTipo(null);
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tipos de Microciclos' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tipos de Microciclos
            </h1>
            <p className="text-muted-foreground">
              Crie templates de microciclos/semanas com configurações predefinidas
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Tipo
          </Button>
        </div>

        {/* Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Tipos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Carregando tipos...</p>
            </div>
          </div>
        ) : tiposMicrociclos.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? 'Nenhum tipo encontrado' : 'Nenhum tipo cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro tipo de microciclo'
              }
            </p>
            {!search && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Tipo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tiposMicrociclos.map((tipo) => (
              <TipoMicrocicloCard
                key={tipo.id}
                tipo={tipo}
                onEdit={() => setEditingTipo(tipo)}
                onDelete={() => setDeletingTipo(tipo)}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Dialog open={showForm || !!editingTipo} onOpenChange={(open) => !open && handleCloseForm()}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TipoMicrocicloForm
              tipo={editingTipo}
              onSubmit={editingTipo ? handleUpdateTipo : handleCreateTipo}
              onCancel={handleCloseForm}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deletingTipo}
          onOpenChange={(open) => !open && setDeletingTipo(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o tipo <strong>{deletingTipo?.nome}</strong>?
                Esta ação não pode ser desfeita e afetará todas as periodizações que usam este tipo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTipo}
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