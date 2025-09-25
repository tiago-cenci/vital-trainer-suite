import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';
import type { Tables, Enums } from '@/integrations/supabase/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Along = Tables<'alongamentos'>;
type Grupo = Enums<'grupo_muscular'>;

const schema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  grupo_muscular: z.enum(Constants.public.Enums.grupo_muscular),
  forma_execucao: z.string().optional(),
  musculos_envolvidos: z.string().optional(),
  observacoes: z.string().optional(),
  link_video: z.string().url('URL inválida').optional().or(z.literal('')),
  tag_id: z.string().uuid('Selecione uma tag'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  alongamento?: Along;
  tags: { id: string; nome: string }[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AlongamentoForm({ alongamento, tags, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: alongamento?.descricao ?? '',
      grupo_muscular: (alongamento?.grupo_muscular as Grupo) ?? Constants.public.Enums.grupo_muscular[0],
      forma_execucao: alongamento?.forma_execucao ?? '',
      musculos_envolvidos: alongamento?.musculos_envolvidos ?? '',
      observacoes: alongamento?.observacoes ?? '',
      link_video: alongamento?.link_video ?? '',
      tag_id: alongamento?.tag_id ?? '',
    },
  });

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{alongamento ? 'Editar Alongamento' : 'Novo Alongamento'}</CardTitle>
        <CardDescription>Cadastre instruções completas para execução</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input {...register('descricao')} placeholder="Ex.: Mobilidade de quadril em 90/90" />
            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Grupo Muscular *</Label>
            <Select
              value={watch('grupo_muscular')}
              onValueChange={(v) => setValue('grupo_muscular', v as Grupo)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.grupo_muscular.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tag *</Label>
            <Select
              value={watch('tag_id')}
              onValueChange={(v) => setValue('tag_id', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tag_id && <p className="text-sm text-destructive">{errors.tag_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Forma de execução</Label>
            <Textarea rows={4} {...register('forma_execucao')} placeholder="Passo a passo..." />
          </div>

          <div className="space-y-2">
            <Label>Músculos envolvidos</Label>
            <Textarea rows={3} {...register('musculos_envolvidos')} />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea rows={3} {...register('observacoes')} />
          </div>

          <div className="space-y-2">
            <Label>Link do vídeo</Label>
            <Input {...register('link_video')} placeholder="https://..." />
            {errors.link_video && <p className="text-sm text-destructive">{errors.link_video.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!!isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {alongamento ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={!!isSubmitting}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
