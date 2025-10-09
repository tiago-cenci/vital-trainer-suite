import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Users, Calendar, Dumbbell, Target } from 'lucide-react';
import { SessaoExerciciosBuilder } from './SessaoExerciciosBuilder';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAlunos } from '@/hooks/useAlunos';
import { usePeriodizacoes } from '@/hooks/usePeriodizacoes';
import { SessoesBuilder } from './SessoesBuilder';
import type { TreinoCompleto } from '@/hooks/useTreinos';
import { SessaoAlongamentosManager } from '@/components/alongamentos/SessaoAlongamentosManager';


const treinoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  aluno_id: z.string().min(1, 'Aluno é obrigatório'),
  sessoes_semanais: z.number().min(1, 'Mínimo 1 sessão por semana').max(7, 'Máximo 7 sessões por semana'),
  usar_periodizacao: z.boolean(),
  periodizacao_id: z.string().uuid().optional(),
}).refine(
  (v) => !v.usar_periodizacao || !!v.periodizacao_id,
  { message: 'Selecione a periodização', path: ['periodizacao_id'] }
);

type TreinoFormData = z.infer<typeof treinoSchema>;

interface TreinoFormProps {
  treino?: TreinoCompleto;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface Sessao {
  id?: string;
  nome: string;
  ordem: number;
}

export function TreinoForm({ treino, onSubmit, onCancel, isSubmitting }: TreinoFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [usarPeriodizacao, setUsarPeriodizacao] = useState(false);

  const { alunos } = useAlunos();
  const { periodizacoes } = usePeriodizacoes();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<TreinoFormData>({
    resolver: zodResolver(treinoSchema),
    defaultValues: {
      nome: '',
      aluno_id: undefined,           // <- nunca ""
      sessoes_semanais: 5,
      usar_periodizacao: false,
      periodizacao_id: undefined,    // <- nunca ""
    }
  });

  const watchedValues = watch();
  const selectedPeriodizacao = periodizacoes.find(
    (p) => p?.id && p.id === (watchedValues.periodizacao_id ?? '')
  );

  // Initialize form when editing
  useEffect(() => {
  const alunosProntos = (alunos?.length ?? 0) > 0;
  const perProntas   = (periodizacoes?.length ?? 0) > 0;

  if (treino && alunosProntos && perProntas) {
    reset({
      nome: treino.nome,
      aluno_id: String(treino.aluno_id),
      sessoes_semanais: treino.sessoes_semanais ?? 3,
      usar_periodizacao: !!treino.periodizacao_id,
      periodizacao_id: treino.periodizacao_id ? String(treino.periodizacao_id) : undefined,
    });
    setUsarPeriodizacao(!!treino.periodizacao_id);
    setSessoes((treino.sessoes ?? []).map((s, i) => ({
      id: s.id ? String(s.id) : undefined,
      nome: s.nome,
      ordem: i + 1,
      // opcional: exercicios: s.exercicios ?? []
    })));
  }
}, [treino, alunos?.length, periodizacoes?.length, reset]);


  // Generate default sessions when sessoes_semanais changes (create mode) ou sync quando edita
  useEffect(() => {
    if (watchedValues.sessoes_semanais) {
      // Se não há treino (modo criação) OU há treino mas as sessões estão vazias
      if (!treino || sessoes.length === 0) {
        const defaultSessions = Array.from({ length: watchedValues.sessoes_semanais }, (_, i) => ({
          nome: String.fromCharCode(65 + i), // A, B, C, ...
          ordem: i + 1
        }));
        setSessoes(defaultSessions);
      }
    }
  }, [watchedValues.sessoes_semanais, treino?.id]);

  // Sincronizar número de sessões quando muda sem recriar tudo
  useEffect(() => {
    const sessoesSemanais = watchedValues.sessoes_semanais;
    if (sessoesSemanais && sessoes.length > 0 && sessoes.length !== sessoesSemanais) {
      const newSessoes = [...sessoes];
      
      if (newSessoes.length < sessoesSemanais) {
        // Adicionar novas sessões
        for (let i = newSessoes.length; i < sessoesSemanais; i++) {
          newSessoes.push({
            nome: String.fromCharCode(65 + i),
            ordem: i + 1
          });
        }
      } else if (newSessoes.length > sessoesSemanais) {
        // Remover sessões extras
        newSessoes.splice(sessoesSemanais);
      }
      
      setSessoes(newSessoes);
    }
  }, [watchedValues.sessoes_semanais, sessoes.length]);

const handleNext: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setCurrentStep((s) => Math.min(3, s + 1));
};
  const handlePrevious = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleFormSubmit = (data: TreinoFormData) => {
    const formData = {
      ...data,
      periodizacao_id: data.usar_periodizacao ? data.periodizacao_id ?? null : null,
      sessoes: sessoes
    };
    onSubmit(formData);
  };

  const handleUsarPeriodizacaoChange = (checked: boolean) => {
    setUsarPeriodizacao(checked);
    setValue('usar_periodizacao', checked);
    if (!checked) {
      setValue('periodizacao_id', undefined); // <- limpe para undefined
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold">Dados do Treino</h3>
        <p className="text-muted-foreground">Defina as informações básicas</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aluno_id">Aluno *</Label>
         <Select
  value={watch('aluno_id') ?? undefined}
  onValueChange={(v) => setValue('aluno_id', v, { shouldDirty:true })}
>

            <SelectTrigger>
              <SelectValue placeholder="Selecione um aluno" />
            </SelectTrigger>
            <SelectContent>
              {alunos
                ?.filter(a => a?.id && a?.nome)
                .map((aluno) => (
                  <SelectItem key={String(aluno.id)} value={String(aluno.id)}>
                    {aluno.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.aluno_id && (
            <p className="text-sm text-destructive">{errors.aluno_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Treino *</Label>
          <Input
            id="nome"
            placeholder="Ex: Treino de Força, Hipertrofia A/B..."
            {...register('nome')}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sessoes_semanais">Sessões por Semana *</Label>
          <Select
            value={(watchedValues.sessoes_semanais ?? 5).toString()}
            onValueChange={(value) => setValue('sessoes_semanais', parseInt(value, 10))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qtd. de sessões" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} {num === 1 ? 'sessão' : 'sessões'} por semana
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.sessoes_semanais && (
            <p className="text-sm text-destructive">{errors.sessoes_semanais.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="usar_periodizacao"
              checked={usarPeriodizacao}
              onCheckedChange={handleUsarPeriodizacaoChange}
            />
            <Label htmlFor="usar_periodizacao">Usar Periodização</Label>
          </div>

          {usarPeriodizacao && (
            <div className="space-y-2">
              <Label htmlFor="periodizacao_id">Periodização</Label>
              <Select
                value={watchedValues.periodizacao_id ?? undefined}
                onValueChange={(value) => setValue('periodizacao_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma periodização" />
                </SelectTrigger>
                <SelectContent>
                  {periodizacoes
                    ?.filter(p => p?.id && p?.nome)
                    .map((p) => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {p.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.periodizacao_id && (
                <p className="text-sm text-destructive">{errors.periodizacao_id.message}</p>
              )}
            </div>
          )}

          {selectedPeriodizacao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Resumo da Periodização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Nome:</strong> {selectedPeriodizacao.nome}</p>
                  <p><strong>Semanas:</strong> {selectedPeriodizacao.semanas.length}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPeriodizacao.semanas.map((semana: any, index: number) => (
                      <Badge key={String(semana.id ?? index)} variant="outline" className="text-xs">
                        S{index + 1}: {semana.tipos_microciclos?.nome ?? '—'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold">Agenda / Sessões</h3>
        <p className="text-muted-foreground">Configure as sessões do treino</p>
      </div>

      <SessoesBuilder
        sessoes={sessoes}
        setSessoes={setSessoes}
        sessoesSemanais={watchedValues.sessoes_semanais || 3}
      />
    </div>
  );

  const renderStep3 = () => {
    if (!treino?.id) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Dumbbell className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold">Exercícios por Sessão</h3>
            <p className="text-muted-foreground">Configure os exercícios para cada sessão</p>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <p>Salve o treino primeiro para adicionar exercícios.</p>
            <p className="text-sm mt-2">Após criar o treino, você poderá editá-lo para adicionar exercícios.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-semibold">Exercícios por Sessão</h3>
          <p className="text-muted-foreground">Configure os exercícios para cada sessão</p>
        </div>
        
        <div className="space-y-4">
          {sessoes.map((sessao) => {
            const initialEx = treino?.sessoes?.find((s) => String(s.id) === String(sessao.id))?.sessoes_exercicios as any[] | undefined;
            return (
              <SessaoExerciciosBuilder
                key={sessao.id || sessao.ordem}
                sessaoId={sessao.id || ''}
                sessaoNome={sessao.nome}
                usarPeriodizacao={watchedValues.usar_periodizacao || false}
                initialExercicios={initialEx as any}
              />
            );
          })}
        </div>

        {sessoes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure as sessões no passo anterior</p>
          </div>
        )}
      </div>
    );
  };

  const canProceedToStep2 = Boolean(watchedValues.nome && watchedValues.aluno_id && watchedValues.sessoes_semanais);
  const canProceedToStep3 = sessoes.length > 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Passo {currentStep} de 3
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Actions */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
        >
          {currentStep === 1 ? 'Cancelar' : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </>
          )}
        </Button>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              formNoValidate
              data-no-close // (se usar Radix/Dialog, útil para checar wrappers)
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>

          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (treino ? 'Atualizar' : 'Criar Treino')}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
