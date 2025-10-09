import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, GripVertical, Settings2, AlertCircle, Dumbbell } from 'lucide-react';
import { useExercicios } from '@/hooks/useExercicios';
import { ExerciciosSeletor } from './ExerciciosSeletor';
import { SeriesManager } from './SeriesManager';
import type { SessaoExercicioLocal } from './TreinoForm';

interface SessaoExerciciosBuilderProps {
  sessaoNome: string;
  periodizacaoId?: string;
  exercicios: SessaoExercicioLocal[];
  onExerciciosChange: (exercicios: SessaoExercicioLocal[]) => void;
}

export function SessaoExerciciosBuilder({ 
  sessaoNome, 
  periodizacaoId,
  exercicios,
  onExerciciosChange
}: SessaoExerciciosBuilderProps) {
  const [showExerciciosSeletor, setShowExerciciosSeletor] = useState(false);
  const [managingSeriesFor, setManagingSeriesFor] = useState<SessaoExercicioLocal | null>(null);

  const { exercicios: todosExercicios } = useExercicios();
  const exerciciosJaAdicionados = exercicios.map(e => e.exercicio_id);

  const handleAddExercicio = (exercicioId: string) => {
    const exercicio = todosExercicios.find(e => e.id === exercicioId);
    if (!exercicio) return;

    const novoExercicio: SessaoExercicioLocal = {
      id: `temp_${crypto.randomUUID()}`,
      exercicio_id: exercicioId,
      ordem: exercicios.length + 1,
      prescricao_tipo: periodizacaoId ? 'PERIODIZACAO' : 'DETALHADA',
      series_qtd: periodizacaoId ? undefined : 3,
      reps_min: periodizacaoId ? undefined : 8,
      reps_max: periodizacaoId ? undefined : 12,
      descanso_seg: periodizacaoId ? undefined : 90,
      usar_periodizacao: !!periodizacaoId,
      exercicios: exercicio,
      series: []
    };

    onExerciciosChange([...exercicios, novoExercicio]);
    setShowExerciciosSeletor(false);
  };

  const handleUpdateExercicio = (exercicioId: string, updates: Partial<SessaoExercicioLocal>) => {
    onExerciciosChange(
      exercicios.map(e => 
        e.id === exercicioId 
          ? { 
              ...e, 
              ...updates,
              prescricao_tipo: updates.usar_periodizacao ? 'PERIODIZACAO' : 'DETALHADA'
            } 
          : e
      )
    );
  };

  const handleRemoveExercicio = (exercicioId: string) => {
    onExerciciosChange(exercicios.filter(e => e.id !== exercicioId));
  };

  const handleSeriesChange = (exercicioId: string, series: any[]) => {
    onExerciciosChange(
      exercicios.map(e => 
        e.id === exercicioId ? { ...e, series } : e
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Sessão {sessaoNome}</CardTitle>
        <CardDescription>
          {exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {exercicios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exercício adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Exercício" para começar</p>
            </div>
          ) : (
            exercicios.map((sessaoExercicio, index) => {
              const exercicio = sessaoExercicio.exercicios;
              const temPeriodizacao = !!periodizacaoId;
              const usandoPeriodizacao = sessaoExercicio.usar_periodizacao;

              return (
                <Card key={sessaoExercicio.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2 mt-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{exercicio?.nome}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exercicio?.grupos_musculares?.map((grupo: any) => (
                              <Badge key={grupo} variant="secondary" className="text-xs">
                                {grupo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercicio(sessaoExercicio.id!)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {temPeriodizacao && (
                      <div className="space-y-2">
                        <Label>Modo de Prescrição</Label>
                        <Select
                          value={usandoPeriodizacao ? 'periodizacao' : 'detalhada'}
                          onValueChange={(value) => 
                            handleUpdateExercicio(sessaoExercicio.id!, {
                              usar_periodizacao: value === 'periodizacao'
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="periodizacao">Usar Periodização</SelectItem>
                            <SelectItem value="detalhada">Prescrição Detalhada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {!usandoPeriodizacao && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Séries</Label>
                          <Input
                            type="number"
                            min="1"
                            value={sessaoExercicio.series_qtd || ''}
                            onChange={(e) => 
                              handleUpdateExercicio(sessaoExercicio.id!, {
                                series_qtd: parseInt(e.target.value) || undefined
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Repetições (Min-Max)</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Min"
                              value={sessaoExercicio.reps_min || ''}
                              onChange={(e) => 
                                handleUpdateExercicio(sessaoExercicio.id!, {
                                  reps_min: parseInt(e.target.value) || undefined
                                })
                              }
                            />
                            <Input
                              type="number"
                              min="1"
                              placeholder="Max"
                              value={sessaoExercicio.reps_max || ''}
                              onChange={(e) => 
                                handleUpdateExercicio(sessaoExercicio.id!, {
                                  reps_max: parseInt(e.target.value) || undefined
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Descanso (segundos)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={sessaoExercicio.descanso_seg || ''}
                            onChange={(e) => 
                              handleUpdateExercicio(sessaoExercicio.id!, {
                                descanso_seg: parseInt(e.target.value) || undefined
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {usandoPeriodizacao && (
                      <>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Este exercício usa periodização. Configure os tipos de séries abaixo.
                          </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Séries Configuradas</p>
                            <p className="text-xs text-muted-foreground">
                              {sessaoExercicio.series?.length || 0} tipo(s) de série
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setManagingSeriesFor(sessaoExercicio)}
                          >
                            <Settings2 className="h-4 w-4 mr-2" />
                            Gerenciar Séries
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Button
          type="button"
          onClick={() => setShowExerciciosSeletor(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Exercício
        </Button>
      </CardContent>

      <ExerciciosSeletor
        open={showExerciciosSeletor}
        onOpenChange={setShowExerciciosSeletor}
        onSelectExercicio={handleAddExercicio}
        exercicios={todosExercicios}
        exerciciosJaAdicionados={exerciciosJaAdicionados}
      />

      {managingSeriesFor && (
        <SeriesManager
          exercicio={managingSeriesFor}
          open={!!managingSeriesFor}
          onOpenChange={(open) => !open && setManagingSeriesFor(null)}
          onSeriesChange={handleSeriesChange}
        />
      )}
    </Card>
  );
}
