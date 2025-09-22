import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Dumbbell, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Exercicio = Tables<'exercicios'>;

interface ExerciciosSeletorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercicio: (exercicioId: string) => void;
  exercicios: Exercicio[];
  exerciciosJaAdicionados: string[];
}

export function ExerciciosSeletor({
  open,
  onOpenChange,
  onSelectExercicio,
  exercicios,
  exerciciosJaAdicionados
}: ExerciciosSeletorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');

  // Filtrar exercícios disponíveis
  const exerciciosDisponiveis = useMemo(() => {
    return exercicios.filter(ex => !exerciciosJaAdicionados.includes(ex.id));
  }, [exercicios, exerciciosJaAdicionados]);

  // Obter todos os grupos musculares únicos
  const gruposMusculares = useMemo(() => {
    const grupos = new Set<string>();
    exerciciosDisponiveis.forEach(ex => {
      ex.grupos_musculares?.forEach((grupo: any) => grupos.add(grupo));
    });
    return Array.from(grupos).sort();
  }, [exerciciosDisponiveis]);

  // Filtrar exercícios por busca e grupo
  const exerciciosFiltrados = useMemo(() => {
    return exerciciosDisponiveis.filter(exercicio => {
      const matchesSearch = !searchTerm || 
        exercicio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercicio.grupos_musculares?.some((grupo: any) => 
          grupo.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesGrupo = !selectedGrupo || 
        exercicio.grupos_musculares?.includes(selectedGrupo as any);

      return matchesSearch && matchesGrupo;
    });
  }, [exerciciosDisponiveis, searchTerm, selectedGrupo]);

  const handleSelectExercicio = (exercicioId: string) => {
    onSelectExercicio(exercicioId);
    setSearchTerm('');
    setSelectedGrupo('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSearchTerm('');
      setSelectedGrupo('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Selecionar Exercício
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou grupo muscular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtros por grupo muscular */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Filtrar por grupo muscular:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedGrupo === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGrupo('')}
              >
                Todos
              </Button>
              {gruposMusculares.map((grupo) => (
                <Button
                  key={grupo}
                  type="button"
                  variant={selectedGrupo === grupo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGrupo(grupo)}
                >
                  {grupo}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lista de exercícios */}
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-2">
              {exerciciosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum exercício encontrado</p>
                  <p className="text-sm">
                    {exerciciosJaAdicionados.length > 0 
                      ? 'Todos os exercícios disponíveis já foram adicionados ou não correspondem aos filtros'
                      : 'Tente ajustar os filtros de busca'
                    }
                  </p>
                </div>
              ) : (
                exerciciosFiltrados.map((exercicio) => (
                  <div
                    key={exercicio.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectExercicio(exercicio.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{exercicio.nome}</h4>
                        {exercicio.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {exercicio.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {exercicio.grupos_musculares?.map((grupo: any) => (
                            <Badge key={grupo} variant="secondary" className="text-xs">
                              {grupo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectExercicio(exercicio.id);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Informações adicionais */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>
              <strong>{exerciciosFiltrados.length}</strong> exercício{exerciciosFiltrados.length !== 1 ? 's' : ''} disponível{exerciciosFiltrados.length !== 1 ? 'is' : ''} para adicionar
              {exerciciosJaAdicionados.length > 0 && (
                <span className="ml-2">
                  • <strong>{exerciciosJaAdicionados.length}</strong> já adicionado{exerciciosJaAdicionados.length !== 1 ? 's' : ''} à sessão
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}