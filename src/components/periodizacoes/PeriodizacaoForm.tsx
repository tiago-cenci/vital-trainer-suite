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
import { Loader2, Plus, Trash2, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { useTiposMicrociclos } from '@/hooks/useTiposMicrociclos';
import { toast } from '@/hooks/use-toast';

const semanaSchema = z.object({
  tipo_microciclo_id: z.string().min(1, 'Tipo de microciclo é obrigatório'),
  ordem: z.number().min(1, 'Ordem deve ser maior que 0'),
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

export function PeriodizacaoForm({ onSubmit, onCancel, isSubmitting = false }: PeriodizacaoFormProps) {
  const { tiposMicrociclos, loading: loadingTipos } = useTiposMicrociclos({});
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
      semanas: [],
    },
  });

  const { fields: semanas, append: addSemana, remove: removeSemana, move: moveSemana } = useFieldArray({
    control,
    name: 'semanas',
  });

  const addNewSemana = () => {
    if (tiposMicrociclos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Você precisa criar pelo menos um tipo de microciclo primeiro.',
        variant: 'destructive',
      });
      return;
    }

    addSemana({
      tipo_microciclo_id: tiposMicrociclos[0].id,
      ordem: semanas.length + 1,
    });
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveSemana(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < semanas.length - 1) {
      moveSemana(index, index + 1);
    }
  };

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
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sequência de Semanas</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione os tipos de microciclos e defina a ordem das semanas
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewSemana}
                disabled={loadingTipos || tiposMicrociclos.length === 0}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Semana
              </Button>
            </div>

            {loadingTipos && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Carregando tipos de microciclos...</p>
              </div>
            )}

            {!loadingTipos && tiposMicrociclos.length === 0 && (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Você precisa criar pelo menos um tipo de microciclo primeiro.
                </p>
                <Button variant="outline" onClick={onCancel}>
                  Ir para Tipos de Microciclos
                </Button>
              </div>
            )}

            {errors.semanas && (
              <p className="text-sm text-destructive">{errors.semanas.message}</p>
            )}

            {!loadingTipos && tiposMicrociclos.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {semanas.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma semana adicionada ainda.
                    </p>
                    <Button variant="outline" size="sm" onClick={addNewSemana} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Primeira Semana
                    </Button>
                  </div>
                ) : (
                  semanas.map((semana, semanaIndex) => {
                    const tipoMicrociclo = tiposMicrociclos.find(t => t.id === watch(`semanas.${semanaIndex}.tipo_microciclo_id`));
                    
                    return (
                      <Card key={semana.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveUp(semanaIndex)}
                                disabled={semanaIndex === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveDown(semanaIndex)}
                                disabled={semanaIndex === semanas.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="px-2 py-1">
                                Semana {semanaIndex + 1}
                              </Badge>
                            </div>

                            <div className="flex-1">
                              <Select
                                value={watch(`semanas.${semanaIndex}.tipo_microciclo_id`)}
                                onValueChange={(value) => {
                                  setValue(`semanas.${semanaIndex}.tipo_microciclo_id`, value);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de microciclo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tiposMicrociclos.map((tipo) => (
                                    <SelectItem key={tipo.id} value={tipo.id}>
                                      {tipo.nome}
                                      {tipo.descricao && ` - ${tipo.descricao}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.semanas?.[semanaIndex]?.tipo_microciclo_id && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.semanas[semanaIndex]?.tipo_microciclo_id?.message}
                                </p>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSemana(semanaIndex)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {tipoMicrociclo && (
                            <div className="mt-3 pl-8">
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p className="font-medium">Configurações:</p>
                                {tipoMicrociclo.config.map((config) => (
                                  <div key={config.id} className="flex gap-4">
                                    <span className="font-medium">{config.tipo_serie}:</span>
                                    <span>{config.rep_min}-{config.rep_max} reps, {config.descanso_min}s-{config.descanso_max}s</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
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