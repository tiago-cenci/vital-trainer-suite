import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Dumbbell,
  Calendar,
  PlayCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Exercicio = Tables<'exercicios'>;

interface ExercicioCardProps {
  exercicio: Exercicio;
  onEdit: () => void;
  onDelete: () => void;
  onViewVideo: () => void;
}

export function ExercicioCard({ exercicio, onEdit, onDelete, onViewVideo }: ExercicioCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="dashboard-card hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{exercicio.nome}</h3>
              {exercicio.grupos_musculares && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {exercicio.grupos_musculares.map((grupo: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {grupo}
                    </Badge>
                  ))}
                </div>
              )}
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
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {exercicio.link_video && (
                <DropdownMenuItem onClick={onViewVideo}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Ver Vídeo
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Descrição */}
        {exercicio.descricao && (
          <p className="text-sm text-muted-foreground">{exercicio.descricao}</p>
        )}

        {/* Data de Criação */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            Cadastrado em {exercicio.created_at && formatDate(exercicio.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
