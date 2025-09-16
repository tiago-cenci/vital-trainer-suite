import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Target } from 'lucide-react';

const configSchema = z.object({
  tipo_serie: z.enum(['WORK SET', 'WARM-UP', 'FEEDER'], { required_error: 'Tipo de série é obrigatório' }),
  rep_min: z.coerce.number().min(1, 'Mínimo de repetições deve ser maior que 0'),
  rep_max: z.coerce.number().min(1, 'Máximo de repetições deve ser maior que 0'),
  descanso_min: z.coerce.number().min(0, 'Descanso mínimo deve ser 0 ou maior'),
  descanso_max: z.coerce.number().min(0, 'Descanso máximo deve ser 0 ou maior'),
});

const semanaSchema = z.object({
  semana_num: z.coerce.number().min(1, 'Número da semana deve ser maior que 0'),
  tipo_semana: z.string().min(1, 'Tipo de semana é obrigatório'),
  config: z.array(configSchema).min(1, 'Pelo menos uma configuração é obrigatória'),
});

const periodizacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  semanas: z.array(semanaSchema).min(1, 'Pelo menos uma semana é obrigatória'),
});

type PeriodizacaoFormData = z.infer<typeof periodizacaoSchema>;

interface PeriodizacaoFormProps {
  onSubmit: (data: PeriodizacaoFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const tipoSerieLabels = {
  'WORK SET': 'Work Set (Trabalho)',
  'WARM-UP': 'Warm-up (Aquecimento)',
  'FEEDER': 'Feeder (Alimentação)'
};

export function PeriodizacaoForm({ onSubmit, onCancel, isSubmitting = false }: PeriodizacaoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PeriodizacaoFormData>({
    resolver: zodResolver(periodizacaoSchema),
    defaultValues: {
      nome: '',
      semanas: [
        {
          semana_num: 1,
          tipo_semana: 'Básica',
          config: [
            {
              tipo_serie: 'WORK SET',
              rep_min: 8,
              rep_max: 12,
              descanso_min: 60,
              descanso_max: 90,
            }
          ]
        }
      ],
    },
  });

  const { fields: semanas, append: addSemana, remove: removeSemana } = useFieldArray({
    control,
    name: 'semanas',
  });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Nova Periodização
        </CardTitle>
        <CardDescription>
          Crie uma nova periodização definindo as semanas e configurações de treino
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome da Periodização */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Periodização *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Hipertrofia 12 semanas, Força básica..."
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <Separator />

          {/* Semanas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Semanas da Periodização</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSemana({
                  semana_num: semanas.length + 1,
                  tipo_semana: '',
                  config: [{
                    tipo_serie: 'WORK SET',
                    rep_min: 8,
                    rep_max: 12,
                    descanso_min: 60,
                    descanso_max: 90,
                  }]
                })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Semana
              </Button>
            </div>

            {errors.semanas && (
              <p className="text-sm text-destructive">{errors.semanas.message}</p>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {semanas.map((semana, semanaIndex) => (
                <Card key={semana.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Semana {semanaIndex + 1}</h4>
                      {semanas.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSemana(semanaIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Número da Semana</Label>
                        <Input
                          type="number"
                          {...register(`semanas.${semanaIndex}.semana_num` as const)}
                          min="1"
                        />
                        {errors.semanas?.[semanaIndex]?.semana_num && (
                          <p className="text-sm text-destructive">
                            {errors.semanas[semanaIndex]?.semana_num?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Semana</Label>
                        <Input
                          {...register(`semanas.${semanaIndex}.tipo_semana` as const)}
                          placeholder="Ex: Básica, Intensiva, Deload..."
                        />
                        {errors.semanas?.[semanaIndex]?.tipo_semana && (
                          <p className="text-sm text-destructive">
                            {errors.semanas[semanaIndex]?.tipo_semana?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Configurações da Semana */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Configurações de Treino</Label>

                      {/* Para simplificar, vamos mostrar apenas uma config por semana por enquanto */}
                      <div className="grid gap-3 p-3 border rounded-md border-border/50 bg-muted/20">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Tipo de Série</Label>
                            <Select
                              value={watch(`semanas.${semanaIndex}.config.0.tipo_serie`)}
                              onValueChange={(value) => {
                                setValue(`semanas.${semanaIndex}.config.0.tipo_serie`, value as 'WORK SET' | 'WARM-UP' | 'FEEDER');
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WORK SET">Work Set</SelectItem>
                                <SelectItem value="WARM-UP">Warm-up</SelectItem>
                                <SelectItem value="FEEDER">Feeder</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Repetições (min-max)</Label>
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                className="h-8"
                                {...register(`semanas.${semanaIndex}.config.0.rep_min` as const)}
                                placeholder="Min"
                                min="1"
                              />
                              <Input
                                type="number"
                                className="h-8"
                                {...register(`semanas.${semanaIndex}.config.0.rep_max` as const)}
                                placeholder="Max"
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Descanso (seg, min-max)</Label>
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                className="h-8"
                                {...register(`semanas.${semanaIndex}.config.0.descanso_min` as const)}
                                placeholder="Min"
                                min="0"
                              />
                              <Input
                                type="number"
                                className="h-8"
                                {...register(`semanas.${semanaIndex}.config.0.descanso_max` as const)}
                                placeholder="Max"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              Criar Periodização
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