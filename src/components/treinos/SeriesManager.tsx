import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Zap, Flame, Target } from 'lucide-react';
import { useSessoesExercicios } from '@/hooks/useSessoesExercicios';
import type { Tables } from '@/integrations/supabase/types';

type TipoSerie = 'WORK SET' | 'WARM-UP' | 'FEEDER';

interface SeriesManagerProps {
  sessaoExercicioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeriesChange?: () => void;
}

const TIPOS_SERIES: Array<{ value: TipoSerie; label: string; icon: React.ReactNode; description: string }> = [
  {
    value: 'WORK SET',
    label: 'Work Set',
    icon: <Target className="h-4 w-4" />,
    description: 'Séries principais de trabalho'
  },
  {
    value: 'WARM-UP',
    label: 'Warm-up',
    icon: <Flame className="h-4 w-4" />,
    description: 'Séries de aquecimento'
  },
  {
    value: 'FEEDER',
    label: 'Feeder',
    icon: <Zap className="h-4 w-4" />,
    description: 'Séries de ativação/preparação'
  }
];

export function SeriesManager({ sessaoExercicioId, open, onOpenChange, onSeriesChange }: SeriesManagerProps) {
  const [selectedTipoSerie, setSelectedTipoSerie] = useState<TipoSerie>('WORK SET');

  const {
    sessoesExercicios,
    addSerie,
    removeSerie,
    isAddingSerie,
    isRemovingSerie
  } = useSessoesExercicios(''); // Passamos vazio pois vamos buscar por exercício específico

  // Encontrar o exercício específico
  const exercicioAtual = sessoesExercicios.find(se => se.id === sessaoExercicioId);
  const seriesAtuais = exercicioAtual?.series || [];

  // Verificar quais tipos já existem
  const tiposJaAdicionados = seriesAtuais.map(s => s.tipo);

  const handleAddSerie = () => {
    if (!selectedTipoSerie || tiposJaAdicionados.includes(selectedTipoSerie)) return;
    
    addSerie({
      sessao_exercicio_id: sessaoExercicioId,
      tipo: selectedTipoSerie
    });
    
    onSeriesChange?.();
  };

  const handleRemoveSerie = (serieId: string) => {
    removeSerie(serieId);
    onSeriesChange?.();
  };

  const tiposDisponiveis = TIPOS_SERIES.filter(tipo => !tiposJaAdicionados.includes(tipo.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gerenciar Séries
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {exercicioAtual && (
            <div className="space-y-2">
              <p className="font-medium">{exercicioAtual.exercicios.nome}</p>
              <div className="flex flex-wrap gap-1">
                {exercicioAtual.exercicios.grupos_musculares?.map((grupo: any) => (
                  <Badge key={grupo} variant="outline" className="text-xs">
                    {grupo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Séries atuais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Séries Configuradas</h4>
            
            {seriesAtuais.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Nenhuma série configurada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {seriesAtuais.map((serie) => {
                  const tipoInfo = TIPOS_SERIES.find(t => t.value === serie.tipo);
                  return (
                    <div key={serie.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {tipoInfo?.icon}
                        <div>
                          <p className="font-medium text-sm">{tipoInfo?.label}</p>
                          <p className="text-xs text-muted-foreground">{tipoInfo?.description}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSerie(serie.id)}
                        disabled={isRemovingSerie}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adicionar nova série */}
          {tiposDisponiveis.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Adicionar Nova Série</h4>
                
                <div className="space-y-2">
                  <Select value={selectedTipoSerie} onValueChange={(value: TipoSerie) => setSelectedTipoSerie(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de série" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDisponiveis.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            {tipo.icon}
                            <div>
                              <p className="font-medium">{tipo.label}</p>
                              <p className="text-xs text-muted-foreground">{tipo.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={handleAddSerie}
                    disabled={isAddingSerie || !selectedTipoSerie || tiposJaAdicionados.includes(selectedTipoSerie)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAddingSerie ? 'Adicionando...' : 'Adicionar Série'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {tiposDisponiveis.length === 0 && seriesAtuais.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Todos os tipos de séries foram adicionados</p>
            </div>
          )}

          {/* Informações */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p><strong>Dica:</strong> Cada exercício pode ter até 3 tipos diferentes de séries:</p>
            <ul className="mt-1 space-y-1">
              <li>• <strong>Work Set:</strong> Séries principais de trabalho</li>
              <li>• <strong>Warm-up:</strong> Séries de aquecimento</li>
              <li>• <strong>Feeder:</strong> Séries de ativação/preparação</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}