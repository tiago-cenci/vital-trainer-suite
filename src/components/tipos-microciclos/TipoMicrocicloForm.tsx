import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Settings } from 'lucide-react';
import { type TipoMicrocicloCompleto } from '@/hooks/useTiposMicrociclos';

const configSchema = z.object({
  tipo_serie: z.enum(['WORK SET', 'WARM-UP', 'FEEDER'], { required_error: 'Tipo de série é obrigatório' }),
  rep_min: z.coerce.number().min(1, 'Mínimo de repetições deve ser maior que 0'),
  rep_max: z.coerce.number().min(1, 'Máximo de repetições deve ser maior que 0'),
  descanso_min: z.coerce.number().min(0, 'Descanso mínimo deve ser 0 ou maior'),
  descanso_max: z.coerce.number().min(0, 'Descanso máximo deve ser 0 ou maior'),
});

const tipoMicrocicloSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  config: z.array(configSchema).min(1, 'Pelo menos uma configuração é obrigatória'),
}).refine((data) => {
  // Validate that rep_max >= rep_min
  return data.config.every(config => config.rep_max >= config.rep_min);
}, {
  message: 'Repetições máximas devem ser maiores ou iguais às mínimas',
  path: ['config']
}).refine((data) => {
  // Validate that descanso_max >= descanso_min
  return data.config.every(config => config.descanso_max >= config.descanso_min);
}, {
  message: 'Descanso máximo deve ser maior ou igual ao mínimo',
  path: ['config']
});

type TipoMicrocicloFormData = z.infer<typeof tipoMicrocicloSchema>;

interface TipoMicrocicloFormProps {
  tipo?: TipoMicrocicloCompleto | null;
  onSubmit: (data: TipoMicrocicloFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const tipoSerieLabels = {
  'WORK SET': 'Work Set (Trabalho)',
  'WARM-UP': 'Warm-up (Aquecimento)',
  'FEEDER': 'Feeder (Alimentação)'
};

export function TipoMicrocicloForm({ tipo, onSubmit, onCancel, isSubmitting = false }: TipoMicrocicloFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TipoMicrocicloFormData>({
    resolver: zodResolver(tipoMicrocicloSchema),
    defaultValues: {
      nome: tipo?.nome || '',
      descricao: tipo?.descricao || '',
      config: tipo?.config.length ? tipo.config.map(c => ({
        tipo_serie: c.tipo_serie,
        rep_min: c.rep_min,
        rep_max: c.rep_max,
        descanso_min: c.descanso_min,
        descanso_max: c.descanso_max,
      })) : [
        {
          tipo_serie: 'WORK SET',
          rep_min: 8,
          rep_max: 12,
          descanso_min: 60,
          descanso_max: 90,
        }
      ],
    },
  });

  const { fields: configs, append: addConfig, remove: removeConfig } = useFieldArray({
    control,
    name: 'config',
  });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {tipo ? 'Editar Tipo de Microciclo' : 'Novo Tipo de Microciclo'}
        </CardTitle>
        <CardDescription>
          {tipo 
            ? 'Edite as configurações do tipo de microciclo'
            : 'Crie um template de microciclo com configurações predefinidas'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Tipo *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Ex: Ordinária, Choque, Resistência..."
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                {...register('descricao')}
                placeholder="Descrição opcional do tipo"
              />
            </div>
          </div>

          <Separator />

          {/* Configurações por Tipo de Série */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Configurações por Tipo de Série</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addConfig({
                  tipo_serie: 'WORK SET',
                  rep_min: 8,
                  rep_max: 12,
                  descanso_min: 60,
                  descanso_max: 90,
                })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Configuração
              </Button>
            </div>

            {errors.config && (
              <p className="text-sm text-destructive">{errors.config.message}</p>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {configs.map((config, configIndex) => (
                <Card key={config.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Configuração {configIndex + 1}</h4>
                      {configs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConfig(configIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Tipo de Série</Label>
                        <Select
                          value={watch(`config.${configIndex}.tipo_serie`)}
                          onValueChange={(value) => {
                            setValue(`config.${configIndex}.tipo_serie`, value as 'WORK SET' | 'WARM-UP' | 'FEEDER');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WORK SET">Work Set</SelectItem>
                            <SelectItem value="WARM-UP">Warm-up</SelectItem>
                            <SelectItem value="FEEDER">Feeder</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.config?.[configIndex]?.tipo_serie && (
                          <p className="text-sm text-destructive">
                            {errors.config[configIndex]?.tipo_serie?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Repetições (min-max)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            {...register(`config.${configIndex}.rep_min` as const)}
                            placeholder="Min"
                            min="1"
                          />
                          <Input
                            type="number"
                            {...register(`config.${configIndex}.rep_max` as const)}
                            placeholder="Max"
                            min="1"
                          />
                        </div>
                        {(errors.config?.[configIndex]?.rep_min || errors.config?.[configIndex]?.rep_max) && (
                          <p className="text-sm text-destructive">
                            {errors.config[configIndex]?.rep_min?.message || errors.config[configIndex]?.rep_max?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Descanso em segundos (min-max)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            {...register(`config.${configIndex}.descanso_min` as const)}
                            placeholder="Min"
                            min="0"
                          />
                          <Input
                            type="number"
                            {...register(`config.${configIndex}.descanso_max` as const)}
                            placeholder="Max"
                            min="0"
                          />
                        </div>
                        {(errors.config?.[configIndex]?.descanso_min || errors.config?.[configIndex]?.descanso_max) && (
                          <p className="text-sm text-destructive">
                            {errors.config[configIndex]?.descanso_min?.message || errors.config[configIndex]?.descanso_max?.message}
                          </p>
                        )}
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
              {tipo ? 'Atualizar Tipo' : 'Criar Tipo'}
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