import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PeriodizacaoCompleta } from '@/hooks/usePeriodizacoes';

interface PeriodizacaoCardProps {
  periodizacao: PeriodizacaoCompleta;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PeriodizacaoCard({ periodizacao, onEdit, onDelete }: PeriodizacaoCardProps) {
  const totalSemanas = periodizacao.semanas.length;
  const tiposSemana = Array.from(new Set(periodizacao.semanas.map(s => s.tipo_semana)));

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {periodizacao.nome}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              Criada em {format(new Date(periodizacao.created_at || ''), 'dd/MM/yyyy', { locale: ptBR })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total de Semanas</p>
            <p className="text-2xl font-bold text-primary">{totalSemanas}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tipos de Semana</p>
            <div className="flex flex-wrap gap-1">
              {tiposSemana.slice(0, 2).map((tipo) => (
                <Badge key={tipo} variant="secondary" className="text-xs">
                  {tipo}
                </Badge>
              ))}
              {tiposSemana.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tiposSemana.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {totalSemanas > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Resumo das Semanas</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {periodizacao.semanas.slice(0, 3).map((semana) => (
                <div key={semana.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Semana {semana.semana_num} - {semana.tipo_semana}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {semana.config.length} config{semana.config.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
              {periodizacao.semanas.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{periodizacao.semanas.length - 3} semanas...
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Settings className="h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}