import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, MoreHorizontal, Edit, Trash2, Tags } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';

type Along = Tables<'alongamentos'>;

interface Props {
  alongamento: Along & { tag?: { nome?: string } };
  onEdit: () => void;
  onDelete: () => void;
}

export function AlongamentoCard({ alongamento, onEdit, onDelete }: Props) {
  return (
    <Card className="dashboard-card hover:shadow-lg transition">
      <CardHeader className="pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-primary text-white flex items-center justify-center">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{alongamento.descricao}</div>
            <div className="mt-1 flex gap-2">
              <Badge variant="secondary">{String(alongamento.grupo_muscular)}</Badge>
              {alongamento.tag_id && (
                <Badge variant="outline" className="gap-1">
                  <Tags className="h-3 w-3" /> {alongamento.tag?.nome ?? 'Tag'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2">
        {alongamento.forma_execucao && (
          <p className="text-sm text-muted-foreground">
            {alongamento.forma_execucao}
          </p>
        )}
        {alongamento.link_video && (
          <a href={alongamento.link_video} target="_blank" className="text-sm text-primary underline">
            Ver vídeo
          </a>
        )}
      </CardContent>
    </Card>
  );
}
