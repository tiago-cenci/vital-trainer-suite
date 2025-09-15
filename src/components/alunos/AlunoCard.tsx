import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Calendar,
  Weight,
  Ruler,
  Target,
  CreditCard
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

type Aluno = Tables<'alunos'>;

interface AlunoCardProps {
  aluno: Aluno;
  onEdit: () => void;
  onDelete: () => void;
  onViewSubscriptions: () => void;
}

export function AlunoCard({ aluno, onEdit, onDelete, onViewSubscriptions }: AlunoCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-primary text-white">
                {getInitials(aluno.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{aluno.nome}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <User className="h-3 w-3" />
                <span>
                  {aluno.data_nascimento && `${calculateAge(aluno.data_nascimento)} anos`}
                </span>
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
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewSubscriptions}>
                <CreditCard className="h-4 w-4 mr-2" />
                Assinaturas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Contato */}
        {aluno.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{aluno.email}</span>
          </div>
        )}

        {/* Dados Físicos */}
        <div className="grid grid-cols-2 gap-4">
          {aluno.peso && (
            <div className="flex items-center gap-2 text-sm">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <span>{aluno.peso} kg</span>
            </div>
          )}
          {aluno.altura && (
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span>{aluno.altura} cm</span>
            </div>
          )}
        </div>

        {/* Objetivo */}
        {aluno.objetivo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Objetivo:</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {aluno.objetivo}
            </Badge>
          </div>
        )}

        {/* Data de Criação */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            Cadastrado em {aluno.created_at && formatDate(aluno.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}