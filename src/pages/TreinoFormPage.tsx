import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Plus, Users, Target, Calendar, FileText,
  Loader2, Save, Dumbbell, AlertCircle,
} from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';
import { usePeriodizacoes } from '@/hooks/usePeriodizacoes';
import { useExercicios } from '@/hooks/useExercicios';
import { useTreinos, useTreino } from '@/hooks/useTreinos';
import type { SessaoLocal } from '@/types/treino';
import { criarSessaoLocal, dbToExercicioLocal } from '@/types/treino';
import { SessaoBlock } from '@/components/treinos/SessaoBlock';
import { cn } from '@/lib/utils';

// ─── Schema de validação ──────────────────────────────────────────────────────

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  aluno_id: z.string().min(1, 'Selecione um aluno'),
  sessoes_semanais: z.number().min(1).max(7),
  usar_periodizacao: z.boolean(),
  periodizacao_id: z.string().uuid().optional(),
  data_inicio: z.string().optional(),
  data_vencimento: z.string().optional(),
  descricao_plano: z.string().optional(),
}).refine(
  (v) => !v.usar_periodizacao || !!v.periodizacao_id,
  { message: 'Selecione a periodização', path: ['periodizacao_id'] }
).refine(
  (v) => !v.data_inicio || !v.data_vencimento || v.data_vencimento >= v.data_inicio,
  { message: 'Vencimento deve ser após o início', path: ['data_vencimento'] }
);

type FormData = z.infer<typeof schema>;

// ─── Componente ───────────────────────────────────────────────────────────────

interface TreinoFormPageProps {
  mode: 'criar' | 'editar';
}

export default function TreinoFormPage({ mode }: TreinoFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { alunos } = useAlunos();
  const { periodizacoes } = usePeriodizacoes();
  const { exercicios } = useExercicios();
  const { createTreino, updateTreino, isCreating, isUpdating } = useTreinos();
  const { data: treinoExistente, isLoading: loadingExistente } = useTreino(
    mode === 'editar' ? id ?? '' : ''
  );

  const [sessoes, setSessoes] = useState<SessaoLocal[]>([]);
  const [showConfirmSair, setShowConfirmSair] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      aluno_id: '',
      sessoes_semanais: 3,
      usar_periodizacao: false,
      periodizacao_id: undefined,
      data_inicio: '',
      data_vencimento: '',
      descricao_plano: '',
    },
  });

  const watchAll = watch();
  const usarPeriodizacao = watchAll.usar_periodizacao;
  const sessoesSemanal = watchAll.sessoes_semanais ?? 3;
  const periodizacaoSelecionada = periodizacoes.find(
    p => p.id === watchAll.periodizacao_id
  );

  // ─── Carregar treino existente (modo editar) ──────────────────────────────

  useEffect(() => {
    if (mode !== 'editar' || !treinoExistente || (alunos.length === 0 && periodizacoes.length === 0)) return;

    reset({
      nome: treinoExistente.nome,
      aluno_id: treinoExistente.aluno_id ?? '',
      sessoes_semanais: treinoExistente.sessoes_semanais ?? 3,
      usar_periodizacao: !!treinoExistente.periodizacao_id,
      periodizacao_id: treinoExistente.periodizacao_id ?? undefined,
      data_inicio: (treinoExistente as any).data_inicio ?? '',
      data_vencimento: (treinoExistente as any).data_vencimento ?? '',
      descricao_plano: (treinoExistente as any).descricao_plano ?? '',
    });

    setSessoes(
      (treinoExistente.sessoes ?? [])
        .sort((a, b) => a.ordem - b.ordem)
        .map(s => ({
          id: s.id,
          nome: s.nome,
          ordem: s.ordem,
          exercicios: (s.sessoes_exercicios ?? [])
            .sort((a, b) => a.ordem - b.ordem)
            .map(se => dbToExercicioLocal({
              ...se,
              exercicio_id: se.exercicio_id ?? '',
              series: (se.series as any[]) ?? [],
            })),
          alongamentos: (s.sessoes_alongamentos ?? [])
            .sort((a, b) => a.ordem - b.ordem)
            .map(sa => ({
              id: sa.id,
              alongamento_id: sa.alongamento_id,
              ordem: sa.ordem,
              observacoes: sa.observacoes,
              descricao: sa.alongamentos?.descricao,
              grupo_muscular: sa.alongamentos?.grupo_muscular,
            })),
        }))
    );
  }, [treinoExistente, alunos.length, periodizacoes.length]);

  // ─── Sincronizar número de sessões com o form ─────────────────────────────

  useEffect(() => {
    if (mode === 'editar') return; // Não recria sessões ao editar
    setSessoes(prev => {
      if (prev.length === sessoesSemanal) return prev;
      if (prev.length < sessoesSemanal) {
        const extras = Array.from({ length: sessoesSemanal - prev.length }, (_, i) => {
          const letra = String.fromCharCode(65 + prev.length + i);
          return criarSessaoLocal(letra, prev.length + i + 1);
        });
        return [...prev, ...extras];
      }
      return prev.slice(0, sessoesSemanal);
    });
  }, [sessoesSemanal, mode]);

  // ─── Dirty tracking ───────────────────────────────────────────────────────

  const updateSessao = useCallback((updated: SessaoLocal) => {
    setSessoes(prev => prev.map(s => s.id === updated.id ? updated : s));
    setIsDirty(true);
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────

  function onSubmit(data: FormData) {
    const payload = {
      nome: data.nome,
      aluno_id: data.aluno_id,
      sessoes_semanais: data.sessoes_semanais,
      periodizacao_id: data.usar_periodizacao ? (data.periodizacao_id ?? null) : null,
      usar_periodizacao: data.usar_periodizacao,
      // Campos extras (Parte 2)
      data_inicio: data.data_inicio || undefined,
      data_vencimento: data.data_vencimento || undefined,
      descricao_plano: data.descricao_plano || undefined,
      sessoes,
    };

    if (mode === 'editar' && id) {
      updateTreino({ ...payload, id }, {
        onSuccess: () => navigate('/treinos'),
      });
    } else {
      createTreino(payload, {
        onSuccess: () => navigate('/treinos'),
      });
    }
  }

  function handleVoltar() {
    if (isDirty) {
      setShowConfirmSair(true);
    } else {
      navigate('/treinos');
    }
  }

  const isSubmitting = isCreating || isUpdating;

  if (mode === 'editar' && loadingExistente) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Treinos', href: '/treinos' },
        { label: mode === 'editar' ? 'Editar treino' : 'Novo treino' },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16">
        {/* ── Topbar ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoltar}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'editar' ? 'Editar Treino' : 'Novo Treino'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'editar'
                  ? 'Atualize as configurações, séries e exercícios.'
                  : 'Configure o treino, adicione exercícios e defina as séries.'}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === 'editar' ? 'Salvar alterações' : 'Criar treino'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ── Coluna esquerda: sessões ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Sessões e Exercícios
              </h2>
              <Badge variant="secondary">
                {sessoes.length} sessão{sessoes.length !== 1 ? 'ões' : ''}
              </Badge>
            </div>

            {sessoes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Configure o número de sessões semanais ao lado para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessoes.map(sessao => (
                  <SessaoBlock
                    key={sessao.id}
                    sessao={sessao}
                    todasSessoes={sessoes}
                    allExercicios={exercicios}
                    periodizacaoAtiva={usarPeriodizacao}
                    onChange={updateSessao}
                    onSessoesChange={(novas) => { setSessoes(novas); setIsDirty(true); }}
                    defaultOpen={sessoes.length === 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Coluna direita: configurações ─────────────────────────────── */}
          <div className="space-y-5 xl:sticky xl:top-20">

            {/* Informações gerais */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Informações gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome do treino *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Hipertrofia A/B, Força Básica..."
                    {...register('nome')}
                    onChange={e => { register('nome').onChange(e); setIsDirty(true); }}
                  />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                </div>

                {/* Aluno */}
                <div className="space-y-1.5">
                  <Label>Aluno *</Label>
                  <Select
                    value={watchAll.aluno_id || undefined}
                    onValueChange={v => { setValue('aluno_id', v); setIsDirty(true); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.aluno_id && <p className="text-xs text-destructive">{errors.aluno_id.message}</p>}
                </div>

                {/* Sessões semanais */}
                <div className="space-y-1.5">
                  <Label>Sessões por semana *</Label>
                  <Select
                    value={String(watchAll.sessoes_semanais ?? 3)}
                    onValueChange={v => { setValue('sessoes_semanais', parseInt(v, 10)); setIsDirty(true); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <SelectItem key={n} value={String(n)}>
                          {n} sessão{n !== 1 ? 'ões' : ''}/semana
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Datas e plano — Parte 2 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Vigência do plano
                </CardTitle>
                <CardDescription className="text-xs">
                  Opcional. Defina o período e explique o foco deste ciclo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="data_inicio">Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      {...register('data_inicio')}
                      onChange={e => { register('data_inicio').onChange(e); setIsDirty(true); }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="data_vencimento">Vencimento</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      {...register('data_vencimento')}
                      onChange={e => { register('data_vencimento').onChange(e); setIsDirty(true); }}
                    />
                    {errors.data_vencimento && (
                      <p className="text-xs text-destructive">{errors.data_vencimento.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="descricao_plano" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Descrição / foco do ciclo
                  </Label>
                  <Textarea
                    id="descricao_plano"
                    placeholder="Descreva o foco deste período, o que mudou em relação ao anterior, observações importantes..."
                    rows={4}
                    {...register('descricao_plano')}
                    onChange={e => { register('descricao_plano').onChange(e); setIsDirty(true); }}
                    className="resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Periodização */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Periodização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="usar_periodizacao"
                    checked={usarPeriodizacao}
                    onCheckedChange={v => {
                      setValue('usar_periodizacao', v);
                      if (!v) setValue('periodizacao_id', undefined);
                      setIsDirty(true);
                    }}
                  />
                  <Label htmlFor="usar_periodizacao" className="cursor-pointer">
                    Usar periodização neste treino
                  </Label>
                </div>

                {usarPeriodizacao && (
                  <>
                    <Select
                      value={watchAll.periodizacao_id ?? undefined}
                      onValueChange={v => { setValue('periodizacao_id', v); setIsDirty(true); }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a periodização" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodizacoes.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.periodizacao_id && (
                      <p className="text-xs text-destructive">{errors.periodizacao_id.message}</p>
                    )}

                    {/* Resumo da periodização selecionada */}
                    {periodizacaoSelecionada && (
                      <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1.5">
                        <p className="font-medium">{periodizacaoSelecionada.nome}</p>
                        <p className="text-muted-foreground">
                          {periodizacaoSelecionada.semanas.length} semana{periodizacaoSelecionada.semanas.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {periodizacaoSelecionada.semanas.map((s, i) => (
                            <Badge key={s.id} variant="outline" className="text-[10px]">
                              S{i + 1}: {(s as any).tipos_microciclos?.nome ?? '—'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        Os exercícios marcados como "Usa Periodização" seguirão as faixas de reps e descanso do microciclo ativo automaticamente no app do aluno.
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Botão salvar (redundante no mobile) */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 xl:hidden"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mode === 'editar' ? 'Salvar alterações' : 'Criar treino'}
            </Button>
          </div>
        </div>
      </form>

      {/* ── Confirm sair sem salvar ──────────────────────────────────────────── */}
      <AlertDialog open={showConfirmSair} onOpenChange={setShowConfirmSair}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Se sair agora, elas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/treinos')}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
