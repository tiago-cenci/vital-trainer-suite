import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useExercicios } from '@/hooks/useExercicios';
import { ExercicioForm } from '@/components/exercicios/ExercicioForm';
import { ExercicioCard } from '@/components/exercicios/ExercicioCard';
import type { Tables } from '@/integrations/supabase/types';

type Exercicio = Tables<'exercicios'>;

export default function Exercicios() {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingExercicio, setEditingExercicio] = useState<Exercicio | null>(null);
    const [deletingExercicio, setDeletingExercicio] = useState<Exercicio | null>(null);

    const {
        exercicios,
        loading,
        createExercicio,
        updateExercicio,
        deleteExercicio,
        isCreating,
        isUpdating,
        isDeleting,
    } = useExercicios({ search });

    const handleCreateExercicio = (data: any) => {
        createExercicio(data);
        setShowForm(false);
    };

    const handleUpdateExercicio = (data: any) => {
        if (editingExercicio) {
            updateExercicio({ id: editingExercicio.id, ...data });
            setEditingExercicio(null);
            setShowForm(false);
        }
    };

    const handleDeleteExercicio = () => {
        if (deletingExercicio) {
            deleteExercicio(deletingExercicio.id);
            setDeletingExercicio(null);
        }
    };

    const handleEdit = (exercicio: Exercicio) => {
        setEditingExercicio(exercicio);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setEditingExercicio(null);
        setShowForm(false);
    };

    return (
        <DashboardLayout
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Exercícios' }
            ]}
        >
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Gestão de Exercícios
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie seus exercícios e grupos musculares
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Exercício
                    </Button>
                </div>

                {/* Busca */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Lista de Exercícios */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Carregando exercícios...</p>
                        </div>
                    </div>
                ) : exercicios.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">
                            {search ? 'Nenhum exercício encontrado' : 'Nenhum exercício cadastrado'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {search ? 'Tente ajustar a busca' : 'Comece cadastrando seu primeiro exercício'}
                        </p>
                        {!search && (
                            <Button onClick={() => setShowForm(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Cadastrar Primeiro Exercício
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {exercicios.map((exercicio) => (
                            <ExercicioCard
                                key={exercicio.id}
                                exercicio={exercicio}
                                onEdit={() => handleEdit(exercicio)}
                                onDelete={() => setDeletingExercicio(exercicio)}
                                onViewVideo={() => {
                                    if (exercicio.link_video) {
                                        window.open(exercicio.link_video, '_blank');
                                    } else {
                                        alert('Este exercício não possui vídeo.');
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Form Modal */}
                <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
                    <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <ExercicioForm
                            exercicio={editingExercicio}
                            onSubmit={editingExercicio ? handleUpdateExercicio : handleCreateExercicio}
                            onCancel={handleCloseForm}
                            isSubmitting={isCreating || isUpdating}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog
                    open={!!deletingExercicio}
                    onOpenChange={(open) => !open && setDeletingExercicio(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir o exercício <strong>{deletingExercicio?.nome}</strong>?
                                Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteExercicio}
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
