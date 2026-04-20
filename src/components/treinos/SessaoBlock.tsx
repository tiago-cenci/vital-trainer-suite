import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown, ChevronUp, Plus, Trash2, Copy, MoreVertical,
} from 'lucide-react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { SessaoLocal, ExercicioLocal } from '@/types/treino';
import { criarExercicioLocal, clonarSessaoConteudo } from '@/types/treino';
import type { Tables } from '@/integrations/supabase/types';
import { ExercicioBlock } from './ExercicioBlock';
import { ExerciciosSeletor } from './ExerciciosSeletor';
import { AlongamentosSeletor } from './AlongamentosSeletor';
import { toast } from '@/hooks/use-toast';

type Exercicio = Tables<'exercicios'>;
type Alongamento = Tables<'alongamentos'>;

// ─── Wrapper sortable ──────────────────────────────────────────────────────────

interface SortableExercicioProps {
  exercicioLocal: ExercicioLocal;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}

function SortableExercicio({ exercicioLocal, children }: SortableExercicioProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercicioLocal.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

// ─── SessaoBlock ───────────────────────────────────────────────────────────────

interface SessaoBlockProps {
  sessao: SessaoLocal;
  todasSessoes: SessaoLocal[];
  allExercicios: Exercicio[];
  periodizacaoAtiva: boolean;
  /** Atualiza só esta sessão */
  onChange: (sessao: SessaoLocal) => void;
  /** Atualiza várias sessões (usado para duplicar entre sessões) */
  onSessoesChange: (sessoes: SessaoLocal[]) => void;
  defaultOpen?: boolean;
}

export function SessaoBlock({
  sessao,
  todasSessoes,
  allExercicios,
  periodizacaoAtiva,
  onChange,
  onSessoesChange,
  defaultOpen = false,
}: SessaoBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showSeletor, setShowSeletor] = useState(false);
  const [showAlongSeletor, setShowAlongSeletor] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // ─── Mutações de exercício ─────────────────────────────────────────────────
  const updateExercicio = useCallback((updated: ExercicioLocal) => {
    onChange({
      ...sessao,
      exercicios: sessao.exercicios.map((e) => (e.id === updated.id ? updated : e)),
    });
  }, [sessao, onChange]);

  const removeExercicio = useCallback((id: string) => {
    onChange({
      ...sessao,
      exercicios: sessao.exercicios
        .filter((e) => e.id !== id)
        .map((e, i) => ({ ...e, ordem: i + 1 })),
    });
  }, [sessao, onChange]);

  const addExercicio = useCallback((exercicio_id: string) => {
    const novo = criarExercicioLocal(
      exercicio_id,
      sessao.exercicios.length + 1,
      periodizacaoAtiva
    );
    onChange({ ...sessao, exercicios: [...sessao.exercicios, novo] });
    setShowSeletor(false);
    setOpen(true);
  }, [sessao, onChange, periodizacaoAtiva]);

  // ─── Mutações de alongamento ───────────────────────────────────────────────
  const addAlongamentos = useCallback((alongs: Alongamento[]) => {
    const novos = alongs.map((along, index) => ({
      id: `temp_${Math.random().toString(36).slice(2)}_${index}`,
      alongamento_id: along.id,
      ordem: (sessao.alongamentos?.length ?? 0) + index + 1,
      observacoes: null,
      descricao: along.descricao,
      grupo_muscular: along.grupo_muscular,
    }));

    onChange({
      ...sessao,
      alongamentos: [...(sessao.alongamentos ?? []), ...novos],
    });
    setShowAlongSeletor(false);
    setOpen(true);
  }, [sessao, onChange]);

  const removeAlongamento = useCallback((id: string) => {
    onChange({
      ...sessao,
      alongamentos: (sessao.alongamentos ?? [])
        .filter((a) => a.id !== id)
        .map((a, i) => ({ ...a, ordem: i + 1 })),
    });
  }, [sessao, onChange]);

  // ─── Duplicar sessão inteira para outra sessão ───────────────────────────
  const duplicarSessaoPara = useCallback((destinoId: string) => {
    const destino = todasSessoes.find((s) => s.id === destinoId);
    if (!destino) return;
    const atualizada = clonarSessaoConteudo(sessao, destino);
    onSessoesChange(todasSessoes.map((s) => (s.id === destinoId ? atualizada : s)));
    toast({
      title: `Conteúdo duplicado`,
      description: `Sessão ${destino.nome} agora contém os exercícios e alongamentos da Sessão ${sessao.nome}.`,
    });
  }, [sessao, todasSessoes, onSessoesChange]);

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sessao.exercicios.findIndex((e) => e.id === active.id);
    const newIndex = sessao.exercicios.findIndex((e) => e.id === over.id);
    const reordenados = arrayMove(sessao.exercicios, oldIndex, newIndex)
      .map((e, i) => ({ ...e, ordem: i + 1 }));

    onChange({ ...sessao, exercicios: reordenados });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const idsJaAdicionados = sessao.exercicios.map((e) => e.exercicio_id);
  const alongsJaAdicionados = (sessao.alongamentos ?? []).map((a) => a.alongamento_id);
  const totalSeries = sessao.exercicios.reduce((acc, e) => acc + e.series.length, 0);
  const totalAlongs = sessao.alongamentos?.length ?? 0;
  const outrasSessoes = todasSessoes.filter((s) => s.id !== sessao.id);

  return (
    <>
      <Card className={cn('border-2 transition-all', open && 'border-primary/30')}>
        {/* ── Cabeçalho da sessão ─────────────────────────────────────────────── */}
        <CardHeader
          className="py-4 px-4 sm:px-5 cursor-pointer select-none"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary-foreground">{sessao.nome}</span>
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-base">Sessão {sessao.nome}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {sessao.exercicios.length} exercício{sessao.exercicios.length !== 1 ? 's' : ''}
                </span>
                {totalAlongs > 0 && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/30 text-primary">
                    {totalAlongs} alongamento{totalAlongs !== 1 ? 's' : ''}
                  </Badge>
                )}
                {totalSeries > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {totalSeries} série{totalSeries !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu de ações da sessão */}
            {outrasSessoes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Ações da sessão"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Duplicar conteúdo desta sessão para…
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {outrasSessoes.map((s) => (
                    <DropdownMenuItem key={s.id} onClick={() => duplicarSessaoPara(s.id)}>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Sessão {s.nome}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {s.exercicios.length}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
              aria-label={open ? 'Recolher' : 'Expandir'}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {/* ── Conteúdo da sessão ─────────────────────────────────────────────── */}
        {open && (
          <CardContent className="pt-0 pb-5 px-4 sm:px-5 space-y-6">
            {/* ── Alongamentos ───────────────────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Alongamentos (Início)
              </h3>

              <div className="space-y-2">
                {(sessao.alongamentos ?? []).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/30 group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.descricao}</div>
                      <div className="text-[10px] text-muted-foreground">{a.grupo_muscular}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAlongamento(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 h-8 border-dashed text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAlongSeletor(true)}
                >
                  <Plus className="h-3 w-3" />
                  Adicionar alongamento
                </Button>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* ── Exercícios ─────────────────────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Exercícios
              </h3>
              {sessao.exercicios.length > 0 ? (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={sessao.exercicios.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sessao.exercicios.map((ex) => (
                        <SortableExercicio key={ex.id} exercicioLocal={ex}>
                          {(dragHandleProps) => (
                            <ExercicioBlock
                              exercicio={ex}
                              allExercicios={allExercicios}
                              sessaoAtual={sessao}
                              todasSessoes={todasSessoes}
                              periodizacaoAtiva={periodizacaoAtiva}
                              onChange={updateExercicio}
                              onRemove={() => removeExercicio(ex.id)}
                              onSessoesChange={onSessoesChange}
                              dragHandleProps={dragHandleProps}
                            />
                          )}
                        </SortableExercicio>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                  Nenhum exercício nesta sessão. Clique em "+ Exercício" para adicionar.
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 h-9 border-dashed text-muted-foreground hover:text-foreground"
                onClick={() => setShowSeletor(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar exercício
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <ExerciciosSeletor
        open={showSeletor}
        onOpenChange={setShowSeletor}
        exercicios={allExercicios}
        exerciciosJaAdicionados={idsJaAdicionados}
        onSelectExercicio={addExercicio}
      />

      <AlongamentosSeletor
        open={showAlongSeletor}
        onOpenChange={setShowAlongSeletor}
        alongamentosJaAdicionados={alongsJaAdicionados}
        onSelectAlongamentos={addAlongamentos}
      />
    </>
  );
}
