import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Power, PowerOff, Edit, Copy, Trash2, MoreVertical, Calendar, Target, Dumbbell, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TreinoCompleto } from '@/hooks/useTreinos';

interface TreinoCardProps {
  treino: TreinoCompleto;
  onEdit: () => void;           // ← simplificado: navega para a rota
  onDelete: () => void;
  onAtivar: () => void;
  onDesativar: () => void;
  onDuplicar: () => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isDuplicating?: boolean;
}

export function TreinoCard({
  treino, onEdit, onDelete, onAtivar, onDesativar, onDuplicar,
  isActivating, isDeactivating, isDuplicating,
}: TreinoCardProps) {
  const totalExercicios = treino.sessoes.reduce(
    (acc, s) => acc + s.sessoes_exercicios.length, 0
  );

  const dataInicio = (treino as any).data_inicio;
  const dataVenc = (treino as any).data_vencimento;
  const descricao = (treino as any).descricao_plano;

  // Badge de vencimento
  const vencimentoBadge = (() => {
    if (!dataVenc) return null;
    const dias = differenceInDays(new Date(dataVenc + 'T12:00:00'), new Date());
    if (dias < 0) return { label: 'Vencido', variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" /> };
    if (dias <= 14) return { label: `Vence em ${dias}d`, variant: 'outline' as const, icon: <Clock className="h-3 w-3 text-orange-500" /> };
    return { label: format(new Date(dataVenc + 'T12:00:00'), 'dd/MM/yyyy'), variant: 'outline' as const, icon: <Calendar className="h-3 w-3" /> };
  })();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0 pr-2">
            <CardTitle className="text-base leading-snug truncate">{treino.nome}</CardTitle>
            <CardDescription className="text-xs">
              Criado {formatDistanceToNow(new Date(treino.created_at!), { addSuffix: true, locale: ptBR })}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {treino.ativo ? (
                <DropdownMenuItem onClick={onDesativar} disabled={isDeactivating}>
                  <PowerOff className="h-4 w-4 mr-2" />
                  {isDeactivating ? 'Desativando...' : 'Desativar'}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onAtivar} disabled={isActivating || totalExercicios === 0}>
                  <Power className="h-4 w-4 mr-2" />
                  {isActivating ? 'Ativando...' : 'Ativar'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicar} disabled={isDuplicating}>
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? 'Duplicando...' : 'Duplicar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges de status */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {treino.ativo && (
            <Badge variant="default" className="text-xs gap-1">
              <Power className="h-3 w-3" /> Ativo
            </Badge>
          )}
          {treino.periodizacoes && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Target className="h-3 w-3" /> {treino.periodizacoes.nome}
            </Badge>
          )}
          {vencimentoBadge && (
            <Badge variant={vencimentoBadge.variant} className="text-xs gap-1">
              {vencimentoBadge.icon} {vencimentoBadge.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{treino.sessoes_semanais}×/sem</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{totalExercicios} exercício{totalExercicios !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Descrição resumida */}
        {descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 rounded px-2 py-1.5">
            {descricao}
          </p>
        )}

        {/* Sessões */}
        {treino.sessoes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {treino.sessoes.map(s => (
              <Badge key={s.id} variant="outline" className="text-[10px]">
                {s.nome} ({s.sessoes_exercicios.length})
              </Badge>
            ))}
          </div>
        )}

        {totalExercicios === 0 && (
          <div className="text-center py-3 text-muted-foreground text-xs border border-dashed rounded">
            Nenhum exercício adicionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
