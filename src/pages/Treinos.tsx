import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import TreinoSummaryCard from '@/components/treinos/TreinoSummaryCard';
import { TreinoForm, TreinoFormData } from '@/components/treinos/TreinoForm';
import { useTreinos } from '@/hooks/useTreinos';
import { useExercicios } from '@/hooks/useExercicios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Search, Loader2, ClipboardList, Filter, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

type TreinoItem = ReturnType<typeof useTreinos>['treinos'][number];

export default function Treinos() {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<TreinoItem | null>(null);
    const [deleting, setDeleting] = useState<TreinoItem | null>(null);

    const [search, setSearch] = useState('');
    const [ativo, setAtivo] = useState<'todos' | 'apenas_ativos' | 'apenas_inativos'>('todos');

    const ativoFilter =
        ativo === 'apenas_ativos' ? true :
            ativo === 'apenas_inativos' ? false : undefined;

    const {
        treinos,
        loading,
        isCreating, isUpdating, isDeleting,
        createTreino, updateTreino, removeTreino,
        addSessao, updateSessaoExercicio, removeSessaoExercicio,
    } = useTreinos({ search, ativo: ativoFilter });

    const { exercicios = [] } = useExercicios();

    // Agrupar por aluno
    const groupedByAluno = useMemo(() => {
        const groups: Record<string, { alunoNome: string; itens: TreinoItem[] }> = {};
        for (const t of treinos) {
            const groupKey = t.aluno_id ?? 'sem_aluno';
            const alunoNome = t.alunos?.nome ?? 'Sem aluno';
            if (!groups[groupKey]) groups[groupKey] = { alunoNome, itens: [] };
            groups[groupKey].itens.push(t);
        }
        // ordenar por nome do aluno
        return Object.values(groups).sort((a, b) => a.alunoNome.localeCompare(b.alunoNome));
    }, [treinos]);

    // CREATE
    async function handleCreate(data: TreinoFormData) {
        try {
            const novo = await createTreino.mutateAsync({
                nome: data.nome,
                ativo: data.ativo,
                sessoes_semanais: data.sessoes_semanais ?? null,
                aluno_id: data.aluno_id || null,
                periodizacao_id: data.periodizacao_id || null,
            });

            const n = data.sessoes_semanais ?? 0;
            if (n > 0) {
                const ops = Array.from({ length: n }).map((_, i) =>
                    addSessao.mutateAsync({ treino_id: novo.id, nome: `Sessão ${i + 1}` })
                );
                await Promise.all(ops);
            }
            setShowCreate(false);
        } catch (e) {
            // toast já é disparado no hook
        }
    }

    // UPDATE (somente dados básicos aqui; gerenciamento de sessões/exercícios no modal de editar)
    async function handleUpdateBasics(data: TreinoFormData) {
        if (!editing?.id) return;
        await updateTreino.mutateAsync({
            id: editing.id,
            nome: data.nome,
            ativo: data.ativo,
            sessoes_semanais: data.sessoes_semanais ?? null,
            aluno_id: data.aluno_id || null,
            periodizacao_id: data.periodizacao_id || null,
        });
        setEditing(null);
    }

    async function handleDelete() {
        if (!deleting?.id) return;
        await removeTreino.mutateAsync(deleting.id);
        setDeleting(null);
    }

    // Helpers para reordenar exercícios por setas
    function moveExercicio(sessionId: string, list: any[], idx: number, dir: -1 | 1) {
        const j = idx + dir;
        if (j < 0 || j >= list.length) return;
        const a = list[idx];
        const b = list[j];
        // swap ordens
        updateSessaoExercicio.mutate({ id: a.id, ordem: b.ordem });
        updateSessaoExercicio.mutate({ id: b.id, ordem: a.ordem });
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Treinos' }
            ]}
        >
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Treinos</h1>
                        <p className="text-muted-foreground">
                            Cadastre treinos e gerencie sessões, exercícios e séries
                        </p>
                    </div>
                    <Button type="button" onClick={() => setShowCreate(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Treino
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome do treino..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
                            <Filter className="h-3 w-3" /> Filtros
                        </Badge>
                        <select
                            className="border rounded-md px-3 py-2 text-sm bg-background"
                            value={ativo}
                            onChange={(e) => setAtivo(e.target.value as any)}
                        >
                            <option value="todos">Todos</option>
                            <option value="apenas_ativos">Apenas ativos</option>
                            <option value="apenas_inativos">Apenas inativos</option>
                        </select>
                    </div>
                </div>

                {/* Lista agrupada por aluno */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Carregando treinos...</p>
                        </div>
                    </div>
                ) : treinos.length === 0 ? (
                    <div className="text-center py-12">
                        <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">
                            {search ? 'Nenhum treino encontrado' : 'Nenhum treino cadastrado'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {search ? 'Tente ajustar os termos de busca' : 'Comece criando seu primeiro treino'}
                        </p>
                        {!search && (
                            <Button type="button" onClick={() => setShowCreate(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Criar Primeiro Treino
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedByAluno.map((group) => (
                            <section key={group.alunoNome} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">{group.alunoNome}</h2>
                                    <span className="text-sm text-muted-foreground">{group.itens.length} treino(s)</span>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {group.itens.map((t) => (
                                        <TreinoSummaryCard
                                            key={t.id}
                                            treino={{ id: t.id, nome: t.nome, ativo: !!t.ativo, sessoes_semanais: t.sessoes_semanais ?? null }}
                                            onEdit={() => setEditing(t)}
                                            onDelete={() => setDeleting(t)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* MODAL: Criar Treino */}
                <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
                    <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Novo Treino</DialogTitle>
                            <DialogDescription>Preencha os dados do treino. Será criado o número de sessões informado.</DialogDescription>
                        </DialogHeader>
                        <TreinoForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreate(false)}
                            isSubmitting={isCreating}
                        />
                    </DialogContent>
                </Dialog>

                {/* MODAL: Editar / Gerenciar */}
                <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                    <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Gerenciar Treino</DialogTitle>
                            <DialogDescription>Edite os dados básicos e reordene exercícios das sessões.</DialogDescription>
                        </DialogHeader>

                        {editing && (
                            <div className="space-y-6">
                                {/* Form básico */}
                                <TreinoForm
                                    defaultValues={{
                                        nome: editing.nome,
                                        ativo: !!editing.ativo,
                                        sessoes_semanais: editing.sessoes_semanais ?? undefined,
                                        aluno_id: editing.aluno_id ?? '',
                                        periodizacao_id: editing.periodizacao_id ?? '',
                                    }}
                                    onSubmit={handleUpdateBasics}
                                    onCancel={() => setEditing(null)}
                                    isSubmitting={isUpdating}
                                />

                                {/* Sessões + Exercícios com reordenação */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Sessões</h3>

                                    {editing.sessoes?.map((s) => {
                                        const exs = [...(s.sessoes_exercicios ?? [])].sort((a, b) => a.ordem - b.ordem);
                                        return (
                                            <div key={s.id} className="rounded-lg border p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">{s.nome}</div>
                                                </div>

                                                {exs.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">Sem exercícios nessa sessão.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {exs.map((se, idx) => {
                                                            const nomeEx = exercicios.find(e => e.id === se.exercicio_id)?.nome ?? 'Exercício';
                                                            return (
                                                                <div key={se.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                                                    <div className="text-sm">
                                                                        <span className="font-medium">#{se.ordem}</span>{' '}
                                                                        {nomeEx}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button variant="outline" size="icon" type="button" onClick={() => moveExercicio(s.id!, exs, idx, -1)}>
                                                                            <ArrowUp className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="outline" size="icon" type="button" onClick={() => moveExercicio(s.id!, exs, idx, 1)}>
                                                                            <ArrowDown className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeSessaoExercicio.mutate(se.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* CONFIRMAR EXCLUSÃO */}
                <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir o treino <strong>{deleting?.nome}</strong>?<br />
                                Esta ação não pode ser desfeita e removerá sessões/exercícios/séries vinculados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
