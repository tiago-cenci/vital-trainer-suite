import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, Trash2, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Sessao {
  id?: string;
  nome: string;
  ordem: number;
}

interface SessoesBuilderProps {
  sessoes: Sessao[];
  setSessoes: (sessoes: Sessao[]) => void;
  sessoesSemanais: number;
}

export function SessoesBuilder({ sessoes, setSessoes, sessoesSemanais }: SessoesBuilderProps) {
  const handleAddSessao = () => {
    const newSessao: Sessao = {
      nome: String.fromCharCode(65 + sessoes.length), // A, B, C, etc.
      ordem: sessoes.length + 1
    };
    setSessoes([...sessoes, newSessao]);
  };

  const handleRemoveSessao = (index: number) => {
    const newSessoes = sessoes.filter((_, i) => i !== index);
    // Reorder remaining sessions
    const reorderedSessoes = newSessoes.map((sessao, i) => ({
      ...sessao,
      ordem: i + 1
    }));
    setSessoes(reorderedSessoes);
  };

  const handleUpdateSessaoNome = (index: number, nome: string) => {
    const newSessoes = [...sessoes];
    newSessoes[index] = { ...newSessoes[index], nome };
    setSessoes(newSessoes);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sessoes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const reorderedSessoes = items.map((sessao, index) => ({
      ...sessao,
      ordem: index + 1
    }));

    setSessoes(reorderedSessoes);
  };

  const generateDefaultSessions = () => {
    const defaultSessions = Array.from({ length: sessoesSemanais }, (_, i) => ({
      nome: String.fromCharCode(65 + i), // A, B, C, etc.
      ordem: i + 1
    }));
    setSessoes(defaultSessions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuração das Sessões
          </CardTitle>
          <CardDescription>
            Configure {sessoesSemanais} sessão{sessoesSemanais !== 1 ? 'ões' : ''} por semana.
            Você pode personalizar os nomes e reordenar as sessões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {sessoes.length} de {sessoesSemanais} sessões
              </Badge>
            </div>
            <div className="flex gap-2">
              {sessoes.length < sessoesSemanais && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddSessao}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sessão
                </Button>
              )}
              {sessoes.length === 0 && (
                <Button type="button" variant="outline" size="sm" onClick={generateDefaultSessions}>
                  Gerar Padrão
                </Button>
              )}
            </div>
          </div>

          {sessoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão configurada</p>
              <p className="text-sm">Clique em "Gerar Padrão" para criar sessões automaticamente</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sessoes">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {sessoes.map((sessao, index) => (
                      <Draggable key={index} draggableId={index.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center gap-3 p-3 border rounded-lg bg-background
                              ${snapshot.isDragging ? 'shadow-lg' : 'hover:bg-muted/50'}
                              transition-colors
                            `}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Badge variant="outline" className="shrink-0">
                                {sessao.ordem}
                              </Badge>
                              <Input
                                value={sessao.nome}
                                onChange={(e) => handleUpdateSessaoNome(index, e.target.value)}
                                placeholder={`Sessão ${sessao.ordem}`}
                                className="text-sm"
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSessao(index)}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      </Card>

      {sessoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p><strong>Total de sessões:</strong> {sessoes.length}</p>
              <p><strong>Frequência semanal:</strong> {sessoesSemanais} vez{sessoesSemanais !== 1 ? 'es' : ''} por semana</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {sessoes.map((sessao) => (
                  <Badge key={sessao.ordem} variant="secondary" className="text-xs">
                    {sessao.nome}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}