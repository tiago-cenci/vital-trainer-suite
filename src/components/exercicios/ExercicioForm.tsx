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
import { Constants } from '@/integrations/supabase/types';
import type { Tables } from '@/integrations/supabase/types';

type Exercicio = Tables<'exercicios'>;

const exercicioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  grupos_musculares: z.array(z.enum(Constants.public.Enums.grupo_muscular)).min(1, 'Selecione ao menos 1 grupo'),
  link_video: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ExercicioFormData = z.infer<typeof exercicioSchema>;

interface ExercicioFormProps {
  exercicio?: Exercicio;
  onSubmit: (data: ExercicioFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ExercicioForm({ exercicio, onSubmit, onCancel, isSubmitting = false }: ExercicioFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ExercicioFormData>({
    resolver: zodResolver(exercicioSchema),
    defaultValues: {
      nome: exercicio?.nome || '',
      descricao: exercicio?.descricao || '',
      grupos_musculares: exercicio?.grupos_musculares || [],
      link_video: exercicio?.link_video || '',
    },
  });

  const videoLink = watch('link_video');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{exercicio ? 'Editar Exercício' : 'Novo Exercício'}</CardTitle>
        <CardDescription>
          {exercicio ? 'Atualize as informações do exercício' : 'Preencha os dados do novo exercício'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register('nome')} placeholder="Nome do exercício" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register('descricao')} placeholder="Descrição do exercício" rows={3} />
          </div>

          {/* Grupos Musculares */}
          <div className="space-y-2">
            <Label>Grupos Musculares *</Label>
            <div className="flex flex-wrap gap-2">
              {Constants.public.Enums.grupo_muscular.map((grupo) => (
                <Button
                  key={grupo}
                  type="button"
                  variant={watch('grupos_musculares').includes(grupo) ? 'default' : 'outline'}
                  onClick={() => {
                    const current = watch('grupos_musculares') || [];
                    if (current.includes(grupo)) {
                      setValue(
                        'grupos_musculares',
                        current.filter((g) => g !== grupo)
                      );
                    } else {
                      setValue('grupos_musculares', [...current, grupo]);
                    }
                  }}
                  size="sm"
                >
                  {grupo}
                </Button>
              ))}
            </div>
            {errors.grupos_musculares && (
              <p className="text-sm text-destructive">{errors.grupos_musculares.message}</p>
            )}
          </div>

          {/* Link do Vídeo */}
          <div className="space-y-2">
            <Label htmlFor="link_video">Link do Vídeo</Label>
            <Input id="link_video" {...register('link_video')} placeholder="https://..." />
            {errors.link_video && (
              <p className="text-sm text-destructive">{errors.link_video.message}</p>
            )}
          </div>

          {/* Prévia do vídeo */}
          {videoLink && videoLink.length > 0 && (
            <div className="mt-2">
              {videoLink.includes('youtube.com') || videoLink.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="200"
                  src={videoLink.replace('watch?v=', 'embed/')}
                  title="Vídeo do exercício"
                  allowFullScreen
                />
              ) : (
                <video src={videoLink} controls className="w-full max-h-60 rounded" />
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {exercicio ? 'Atualizar' : 'Criar'} Exercício
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
