import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Aluno = Tables<'alunos'>;

const alunoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data_nascimento: z.string().optional(),
  peso: z.coerce.number().positive('Peso deve ser positivo').optional().or(z.literal('')),
  altura: z.coerce.number().positive('Altura deve ser positiva').optional().or(z.literal('')),
  objetivo: z.string().optional(),
  observacoes: z.string().optional(),
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
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      nome: aluno?.nome || '',
      email: aluno?.email || '',
      data_nascimento: aluno?.data_nascimento || '',
      peso: aluno?.peso || '',
      altura: aluno?.altura || '',
      objetivo: aluno?.objetivo || '',
      observacoes: aluno?.observacoes || '',
    },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{aluno ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
        <CardDescription>
          {aluno ? 'Atualize as informações do aluno' : 'Preencha os dados do novo aluno'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Dados Pessoais</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome completo"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  {...register('data_nascimento')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  {...register('peso')}
                  placeholder="70.5"
                />
                {errors.peso && (
                  <p className="text-sm text-destructive">{errors.peso.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  {...register('altura')}
                  placeholder="175"
                />
                {errors.altura && (
                  <p className="text-sm text-destructive">{errors.altura.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Objetivo e Observações */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Objetivo e Observações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input
                id="objetivo"
                {...register('objetivo')}
                placeholder="Ex: Perder peso, ganhar massa muscular, condicionamento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Lesões, restrições, preferências de treino..."
                rows={3}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {aluno ? 'Atualizar' : 'Criar'} Aluno
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}