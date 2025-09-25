import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Tag = Tables<'alongamento_tags'>;

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  tag?: Tag;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AlongamentoTagForm({ tag, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: tag?.nome ?? '',
      descricao: tag?.descricao ?? '',
    },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{tag ? 'Editar Tag' : 'Nova Tag'}</CardTitle>
        <CardDescription>Organize seus alongamentos por grupos lógicos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} {...register('descricao')} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={!!isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {tag ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={!!isSubmitting}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
