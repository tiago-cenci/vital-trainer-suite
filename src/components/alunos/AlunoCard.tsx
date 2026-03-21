import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Edit, Trash2, Mail, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Aluno = Tables<'alunos'>;

interface AlunoCardProps {
  aluno: Aluno;
  onEdit: () => void;
  onDelete: () => void;
  onViewSubscriptions?: () => void;
  onViewEvolution?: () => void;
}

export function AlunoCard({ aluno, onEdit, onDelete }: AlunoCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR }); }
    catch { return dateString; }
  };

  return (
    <Card
      className="dashboard-card hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/alunos/${aluno.id}`)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-primary text-white">
                {getInitials(aluno.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{aluno.nome}</h3>
              {aluno.email && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{aluno.email}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Cadastrado em {aluno.created_at && formatDate(aluno.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
