import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Aluno = Tables<'alunos'>;

const alunoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

interface AlunoFormProps {
  aluno?: Aluno;
  onSubmit: (data: AlunoFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AlunoForm({ aluno, onSubmit, onCancel, isSubmitting = false }: AlunoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema as any) as any,
    defaultValues: {
      nome: aluno?.nome || '',
      email: aluno?.email || '',
    },
  });

  return (
    <Card className="w-full max-w-lg border-0 shadow-none">
      <CardHeader>
        <CardTitle>{aluno ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
        <CardDescription>
          {aluno ? 'Atualize nome e email do aluno' : 'Informe nome e email — os demais dados ficam na anamnese'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Nome completo" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {aluno ? 'Atualizar' : 'Criar'} Aluno
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
