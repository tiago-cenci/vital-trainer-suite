import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Power, PowerOff, Edit, Copy, Trash2, MoreVertical, Calendar, Target, Dumbbell, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TreinoCompleto } from '@/hooks/useTreinos';

interface TreinoCardProps {
  treino: TreinoCompleto;
  onEdit: (treino: TreinoCompleto) => void;
  onDelete: (treino: TreinoCompleto) => void;
  onAtivar: (treino: TreinoCompleto) => void;
  onDesativar: (id: string) => void;
  onDuplicar: (treino: TreinoCompleto) => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isDuplicating?: boolean;
}

export function TreinoCard({
  treino,
  onEdit,
  onDelete,
  onAtivar,
  onDesativar,
  onDuplicar,
  isActivating,
  isDeactivating,
  isDuplicating
}: TreinoCardProps) {
  const totalExercicios = treino.sessoes.reduce(
    (total, sessao) => total + sessao.sessoes_exercicios.length, 
    0
  );

  const temSeries = treino.sessoes.some(sessao => 
    sessao.sessoes_exercicios.some(ex => ex.series.length > 0)
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-6">{treino.nome}</CardTitle>
            <CardDescription className="text-sm">
              Criado {formatDistanceToNow(new Date(treino.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {treino.ativo ? (
                <DropdownMenuItem 
                  onClick={() => onDesativar(treino.id)}
                  disabled={isDeactivating}
                >
                  <PowerOff className="h-4 w-4 mr-2" />
                  {isDeactivating ? 'Desativando...' : 'Desativar'}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onAtivar(treino)}
                  disabled={isActivating || totalExercicios === 0}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {isActivating ? 'Ativando...' : 'Ativar'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(treino)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDuplicar(treino)}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? 'Duplicando...' : 'Duplicar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(treino)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {treino.ativo && (
            <Badge variant="default" className="text-xs">
              <Power className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          )}
          {treino.periodizacoes && (
            <Badge variant="secondary" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {treino.periodizacoes.nome}
            </Badge>
          )}
          {temSeries && (
            <Badge variant="outline" className="text-xs">
              <Dumbbell className="h-3 w-3 mr-1" />
              Com Séries
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sessões:</span>
              <span className="font-medium">{treino.sessoes_semanais}/semana</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Exercícios:</span>
              <span className="font-medium">{totalExercicios}</span>
            </div>
          </div>

          {treino.sessoes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Sessões:</p>
              <div className="flex flex-wrap gap-1">
                {treino.sessoes.map((sessao, index) => (
                  <Badge key={sessao.id} variant="outline" className="text-xs">
                    {sessao.nome} ({sessao.sessoes_exercicios.length})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {totalExercicios === 0 && (
            <div className="text-center py-3 text-muted-foreground text-sm">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhum exercício adicionado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}