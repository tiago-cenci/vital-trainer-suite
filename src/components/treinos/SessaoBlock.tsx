import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronUp, Plus,
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
import { criarExercicioLocal } from '@/types/treino';
import type { Tables } from '@/integrations/supabase/types';
import { ExercicioBlock } from './ExercicioBlock';
import { ExerciciosSeletor } from './ExerciciosSeletor';

type Exercicio = Tables<'exercicios'>;

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

interface SessaoBlockProps {
  sessao: SessaoLocal;
  todasSessoes: SessaoLocal[];
  allExercicios: Exercicio[];
  periodizacaoAtiva: boolean;
  onChange: (updated: SessaoLocal) => void;
  defaultOpen?: boolean;
}

export function SessaoBlock({
  sessao,
  todasSessoes,
  allExercicios,
  periodizacaoAtiva,
  onChange,
  defaultOpen = false,
}: SessaoBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showSeletor, setShowSeletor] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const updateExercicio = useCallback((updated: ExercicioLocal) => {
    onChange({
      ...sessao,
      exercicios: sessao.exercicios.map(e => e.id === updated.id ? updated : e),
    });
  }, [sessao, onChange]);

  const removeExercicio = useCallback((id: string) => {
    onChange({
      ...sessao,
      exercicios: sessao.exercicios
        .filter(e => e.id !== id)
        .map((e, i) => ({ ...e, ordem: i + 1 })),
    });
  }, [sessao, onChange]);

  const addExercicio = useCallback((exercicio_id: string) => {
    const novo = criarExercicioLocal(
      exercicio_id,
      sessao.exercicios.length + 1,
      periodizacaoAtiva
    );
    onChange({
      ...sessao,
      exercicios: [...sessao.exercicios, novo],
    });
  }, [sessao, onChange, periodizacaoAtiva]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sessao.exercicios.findIndex(e => e.id === active.id);
    const newIndex = sessao.exercicios.findIndex(e => e.id === over.id);
    const reordenados = arrayMove(sessao.exercicios, oldIndex, newIndex)
      .map((e, i) => ({ ...e, ordem: i + 1 }));

    onChange({ ...sessao, exercicios: reordenados });
  }, [sessao, onChange]);

  const idsJaAdicionados = sessao.exercicios.map(e => e.exercicio_id);
  const totalSeries = sessao.exercicios.reduce((acc, e) => acc + (e.series?.length ?? 0), 0);

  return (
    <>
      <Card className={cn('border-2 transition-all', open && 'border-primary/30')}>
        <CardHeader
          className="py-4 px-5 cursor-pointer select-none"
          onClick={() => setOpen(o => !o)}
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
                {totalSeries > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {totalSeries} série{totalSeries !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {open && (
          <CardContent className="pt-0 pb-5 px-5 space-y-3">
            {sessao.exercicios.length > 0 ? (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={sessao.exercicios.map(e => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sessao.exercicios.map(ex => (
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
                            onSessaoChange={onChange}
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
    </>
  );
}