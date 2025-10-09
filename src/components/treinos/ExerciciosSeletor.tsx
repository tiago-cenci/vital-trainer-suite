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

  // fecha limpando estado
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedGrupo('');
    }
    onOpenChange(isOpen);
  };

  // filtra fora já adicionados (mantém edição em outro componente)
  const exerciciosDisponiveis = useMemo(() => {
    const ids = new Set(exerciciosJaAdicionados.map(String));
    return exercicios.filter((ex) => !ids.has(String(ex.id)));
  }, [exercicios, exerciciosJaAdicionados]);

  // grupos únicos
  const gruposMusculares = useMemo(() => {
    const set = new Set<string>();
    exerciciosDisponiveis.forEach((ex) => {
      (ex.grupos_musculares ?? []).forEach((g: any) => set.add(String(g)));
    });
    return Array.from(set).sort();
  }, [exerciciosDisponiveis]);

  // busca + filtro por grupo
  const exerciciosFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return exerciciosDisponiveis.filter((ex) => {
      const nomeOk = !q || ex.nome?.toLowerCase().includes(q);
      const grupoOk =
        !q ||
        (ex.grupos_musculares ?? []).some((g: any) => String(g).toLowerCase().includes(q));
      const matchBusca = nomeOk || grupoOk;

      const matchGrupo = !selectedGrupo || (ex.grupos_musculares ?? []).includes(selectedGrupo as any);

      return matchBusca && matchGrupo;
    });
  }, [exerciciosDisponiveis, searchTerm, selectedGrupo]);

  const handleSelect = (id: string) => {
    onSelectExercicio(id);
    // mantém modal aberta? normalmente fechamos:
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* p-0 para controlarmos padding interno e evitar overflow visual */}
      <DialogContent className="max-w-2xl sm:max-w-3xl p-0">
        {/* Layout em colunas com altura máxima controlada */}
        <div className="flex flex-col max-h-[80vh]">
          {/* Cabeçalho */}
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Selecionar Exercício
            </DialogTitle>
          </DialogHeader>

          {/* Área de filtros */}
          <div className="px-6 pb-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou grupo muscular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Filtrar por grupo muscular:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={selectedGrupo === '' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
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
                    className="rounded-full"
                    onClick={() => setSelectedGrupo(grupo)}
                  >
                    {grupo}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista scrollável (não sobrepõe a modal) */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-3">
              {exerciciosFiltrados.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Nenhum exercício encontrado</p>
                  <p className="text-sm">
                    {exerciciosJaAdicionados.length > 0
                      ? 'Todos os exercícios disponíveis já foram adicionados ou não correspondem aos filtros.'
                      : 'Tente ajustar os filtros de busca.'}
                  </p>
                </div>
              ) : (
                exerciciosFiltrados.map((exercicio) => (
                  <div
                    key={String(exercicio.id)}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-start justify-between"
                    onClick={() => handleSelect(String(exercicio.id))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelect(String(exercicio.id));
                    }}
                  >
                    {/* info esquerda */}
                    <div className="flex-1 pr-3 space-y-1">
                      <h4 className="font-medium">{exercicio.nome}</h4>
                      {exercicio.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {exercicio.descricao}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(exercicio.grupos_musculares ?? []).map((grupo: any) => (
                          <Badge key={String(grupo)} variant="secondary" className="text-xs">
                            {String(grupo)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* ação direita */}
                    <Button
                      type="button"
                      size="sm"
                      className="self-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(String(exercicio.id));
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                ))
              )}
              {/* padding extra para não “colar” no fundo do viewport do ScrollArea */}
              <div className="h-2" />
            </div>
          </ScrollArea>

          {/* Rodapé com info (fixo dentro da modal) */}
          <div className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <strong>{exerciciosFiltrados.length}</strong> exercício
              {exerciciosFiltrados.length !== 1 ? 's' : ''} disponível
              {exerciciosFiltrados.length !== 1 ? 'is' : ''} para adicionar
              {exerciciosJaAdicionados.length > 0 && (
                <>
                  {' '}
                  • <strong>{exerciciosJaAdicionados.length}</strong> já adicionado
                  {exerciciosJaAdicionados.length !== 1 ? 's' : ''} à sessão
                </>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
