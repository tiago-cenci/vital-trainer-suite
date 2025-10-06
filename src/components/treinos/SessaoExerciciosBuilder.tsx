import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, GripVertical, Trash2, Edit, Target, Clock, Repeat } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useSessoesExercicios, type SessaoExercicioCompleto } from '@/hooks/useSessoesExercicios';
import { useExercicios } from '@/hooks/useExercicios';
import { ExerciciosSeletor } from './ExerciciosSeletor';
import { SeriesManager } from './SeriesManager';

interface SessaoExerciciosBuilderProps {
  sessaoId: string;
  sessaoNome: string;
  usarPeriodizacao: boolean;
  onExerciciosChange?: () => void;
}

export function SessaoExerciciosBuilder({ 
  sessaoId, 
  sessaoNome, 
  usarPeriodizacao,
  onExerciciosChange 
}: SessaoExerciciosBuilderProps) {
  const [showExerciciosSelector, setShowExerciciosSelector] = useState(false);
  const [selectedExercicioForSeries, setSelectedExercicioForSeries] = useState<string | null>(null);
  const [editingExercicio, setEditingExercicio] = useState<SessaoExercicioCompleto | null>(null);

  const {
    sessoesExercicios,
    loading,
    addExercicio,
    updateExercicio,
    removeExercicio,
    updateOrdem,
    isAddingExercicio,
    isUpdatingExercicio,
    isRemovingExercicio
  } = useSessoesExercicios(sessaoId);

  const { exercicios } = useExercicios();

  const handleAddExercicio = (exercicioId: string) => {
    const nextOrdem = Math.max(0, ...sessoesExercicios.map(se => se.ordem)) + 1;
    
    // Usar valores padrão do último exercício se existir
    const lastExercicio = sessoesExercicios[sessoesExercicios.length - 1];
    
    addExercicio({
      exercicio_id: exercicioId,
      ordem: nextOrdem,
      prescricao_tipo: usarPeriodizacao ? 'PERIODIZACAO' : 'DETALHADA',
      series_qtd: lastExercicio?.series_qtd || 3,
      reps_min: lastExercicio?.reps_min || 8,
      reps_max: lastExercicio?.reps_max || 12,
      descanso_seg: lastExercicio?.descanso_seg || 90,
      usar_periodizacao: usarPeriodizacao
    });
    
    setShowExerciciosSelector(false);
    onExerciciosChange?.();
  };

  const handleRemoveExercicio = (exercicioId: string) => {
    removeExercicio(exercicioId);
    onExerciciosChange?.();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sessoesExercicios);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedUpdates = items.map((item, index) => ({
      id: item.id,
      ordem: index + 1
    }));

    updateOrdem(reorderedUpdates);
  };

  const handleUpdateExercicio = (data: {
    series_qtd?: number;
    reps_min?: number;
    reps_max?: number;
    descanso_seg?: number;
    usar_periodizacao?: boolean;
  }) => {
    if (editingExercicio) {
      updateExercicio({
        id: editingExercicio.id,
        ordem: editingExercicio.ordem,
        prescricao_tipo: usarPeriodizacao ? 'PERIODIZACAO' : 'DETALHADA',
        series_qtd: data.series_qtd ?? editingExercicio.series_qtd,
        reps_min: data.reps_min ?? editingExercicio.reps_min,
        reps_max: data.reps_max ?? editingExercicio.reps_max,
        descanso_seg: data.descanso_seg ?? editingExercicio.descanso_seg,
        usar_periodizacao: data.usar_periodizacao ?? editingExercicio.usar_periodizacao
      });
      setEditingExercicio(null);
      onExerciciosChange?.();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sessão {sessaoNome}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sessão {sessaoNome}
            </CardTitle>
            <CardDescription>
              {sessoesExercicios.length} exercício{sessoesExercicios.length !== 1 ? 's' : ''}
              {usarPeriodizacao && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Com Periodização
                </Badge>
              )}
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowExerciciosSelector(true)}
            disabled={isAddingExercicio}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Exercício
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {sessoesExercicios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum exercício adicionado</p>
            <p className="text-sm">Clique em "Adicionar Exercício" para começar</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`sessao-${sessaoId}`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {sessoesExercicios.map((sessaoExercicio, index) => (
                    <Draggable 
                      key={sessaoExercicio.id} 
                      draggableId={sessaoExercicio.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            border rounded-lg p-4 bg-background
                            ${snapshot.isDragging ? 'shadow-lg' : 'hover:bg-muted/50'}
                            transition-colors
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{sessaoExercicio.exercicios.nome}</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {sessaoExercicio.exercicios.grupos_musculares?.map((grupo: any) => (
                                      <Badge key={grupo} variant="outline" className="text-xs">
                                        {grupo}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingExercicio(sessaoExercicio)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedExercicioForSeries(sessaoExercicio.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveExercicio(sessaoExercicio.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Prescrição */}
                              {!usarPeriodizacao && (
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Repeat className="h-3 w-3" />
                                    <span>{sessaoExercicio.series_qtd || 3} séries</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    <span>{sessaoExercicio.reps_min}-{sessaoExercicio.reps_max} reps</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{sessaoExercicio.descanso_seg}s descanso</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {sessaoExercicio.prescricao_tipo}
                                  </div>
                                </div>
                              )}

                              {/* Séries */}
                              {sessaoExercicio.series.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {sessaoExercicio.series.map((serie) => (
                                    <Badge key={serie.id} variant="secondary" className="text-xs">
                                      {serie.tipo}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>

      {/* Dialog para seleção de exercícios */}
      <ExerciciosSeletor
        open={showExerciciosSelector}
        onOpenChange={setShowExerciciosSelector}
        onSelectExercicio={handleAddExercicio}
        exercicios={exercicios}
        exerciciosJaAdicionados={sessoesExercicios.map(se => se.exercicio_id)}
      />

      {/* Dialog para editar exercício */}
      {editingExercicio && (
        <Dialog open={!!editingExercicio} onOpenChange={() => setEditingExercicio(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Prescrição</DialogTitle>
            </DialogHeader>
            <ExercicioPrescricaoForm
              exercicio={editingExercicio}
              usarPeriodizacao={usarPeriodizacao}
              onSubmit={handleUpdateExercicio}
              onCancel={() => setEditingExercicio(null)}
              isSubmitting={isUpdatingExercicio}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para gerenciar séries */}
      {selectedExercicioForSeries && (
        <SeriesManager
          sessaoExercicioId={selectedExercicioForSeries}
          open={!!selectedExercicioForSeries}
          onOpenChange={() => setSelectedExercicioForSeries(null)}
          onSeriesChange={() => onExerciciosChange?.()}
        />
      )}
    </Card>
  );
}

// Componente para editar prescrição do exercício
function ExercicioPrescricaoForm({
  exercicio,
  usarPeriodizacao,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  exercicio: SessaoExercicioCompleto;
  usarPeriodizacao: boolean;
  onSubmit: (data: {
    series_qtd?: number;
    reps_min?: number;
    reps_max?: number;
    descanso_seg?: number;
    usar_periodizacao?: boolean;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    series_qtd: exercicio.series_qtd || 3,
    reps_min: exercicio.reps_min || 8,
    reps_max: exercicio.reps_max || 12,
    descanso_seg: exercicio.descanso_seg || 90,
    usar_periodizacao: exercicio.usar_periodizacao || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Exercício</Label>
        <p className="text-sm text-muted-foreground">{exercicio.exercicios.nome}</p>
      </div>

      {!usarPeriodizacao && (
        <>
          <div className="space-y-2">
            <Label htmlFor="series_qtd">Número de Séries</Label>
            <Input
              id="series_qtd"
              type="number"
              min="1"
              max="10"
              value={formData.series_qtd}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                series_qtd: parseInt(e.target.value) || 1 
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reps_min">Reps Mínimas</Label>
              <Input
                id="reps_min"
                type="number"
                min="1"
                value={formData.reps_min}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reps_min: parseInt(e.target.value) || 1 
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps_max">Reps Máximas</Label>
              <Input
                id="reps_max"
                type="number"
                min="1"
                value={formData.reps_max}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reps_max: parseInt(e.target.value) || 1 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descanso_seg">Descanso (segundos)</Label>
            <Input
              id="descanso_seg"
              type="number"
              min="0"
              step="15"
              value={formData.descanso_seg}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                descanso_seg: parseInt(e.target.value) || 0 
              }))}
            />
          </div>
        </>
      )}

      {usarPeriodizacao && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Prescrição via Periodização</p>
          <p>As repetições e descanso serão definidos automaticamente pela periodização selecionada no treino.</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}