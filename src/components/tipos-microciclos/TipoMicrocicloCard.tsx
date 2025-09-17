import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Settings } from 'lucide-react';
import { type TipoMicrocicloCompleto } from '@/hooks/useTiposMicrociclos';

interface TipoMicrocicloCardProps {
  tipo: TipoMicrocicloCompleto;
  onEdit: () => void;
  onDelete: () => void;
}

const tipoSerieColors = {
  'WORK SET': 'bg-primary text-primary-foreground',
  'WARM-UP': 'bg-secondary text-secondary-foreground',
  'FEEDER': 'bg-accent text-accent-foreground'
};

const tipoSerieLabels = {
  'WORK SET': 'Work Set',
  'WARM-UP': 'Warm-up',
  'FEEDER': 'Feeder'
};

export function TipoMicrocicloCard({ tipo, onEdit, onDelete }: TipoMicrocicloCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              {tipo.nome}
            </CardTitle>
            {tipo.descricao && (
              <CardDescription className="mt-1">
                {tipo.descricao}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Configurações por Tipo de Série:
          </h4>
          
          {tipo.config.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Nenhuma configuração definida
            </p>
          ) : (
            <div className="space-y-2">
              {tipo.config.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${tipoSerieColors[config.tipo_serie]}`}
                    >
                      {tipoSerieLabels[config.tipo_serie]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {config.rep_min}-{config.rep_max} reps
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {config.descanso_min}s-{config.descanso_max}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          Criado em: {new Date(tipo.created_at).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}