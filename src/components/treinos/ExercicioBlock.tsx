import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  ArrowLeftRight,
  RefreshCw,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExercicioLocal, SessaoLocal } from '@/types/treino';
import type { Tables } from '@/integrations/supabase/types';
import { replicarExercicioParaExercicio, replicarSessaoParaSessao } from '@/types/treino';
import { SeriesEditor } from './SeriesEditor';
import { ExerciciosSeletor } from './ExerciciosSeletor';

type Exercicio = Tables<'exercicios'>;

interface ExercicioBlockProps {
  exercicio: ExercicioLocal;
  allExercicios: Exercicio[];
  sessaoAtual: SessaoLocal;
  todasSessoes: SessaoLocal[];
  periodizacaoAtiva: boolean;
  onChange: (updated: ExercicioLocal) => void;
  onRemove: () => void;
  onSessaoChange: (sessao: SessaoLocal) => void; // para replicar para outra sessão
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export function ExercicioBlock({
  exercicio,
  allExercicios,
  sessaoAtual,
  todasSessoes,
  periodizacaoAtiva,
  onChange,
  onRemove,
  onSessaoChange,
  dragHandleProps,
}: ExercicioBlockProps) {
  const [open, setOpen] = useState(false);
  const [showSeletor, setShowSeletor] = useState(false);
  const [showReplicarExercicio, setShowReplicarExercicio] = useState(false);
  const [showReplicarSessao, setShowReplicarSessao] = useState(false);

  const exercicioInfo = useMemo(
    () => allExercicios.find(e => e.id === exercicio.exercicio_id),
    [allExercicios, exercicio.exercicio_id]
  );

  // ─── Mudança de modo (DETALHADA ↔ PERIODIZACAO) ───────────────────────

  function handleModoChange(modo: 'DETALHADA' | 'PERIODIZACAO') {
    onChange({
      ...exercicio,
      prescricao_tipo: modo,
      usar_periodizacao: modo === 'PERIODIZACAO',
      // Mantém séries existentes; o SeriesEditor cuida do restante
    });
  }

  // ─── Replicar para exercício ───────────────────────────────────────────

  function handleReplicarParaExercicio(destinoId: string) {
    const destino = sessaoAtual.exercicios.find(e => e.id === destinoId);
    if (!destino) return;
    const atualizado = replicarExercicioParaExercicio(exercicio, destino);
    const novosExercicios = sessaoAtual.exercicios.map(e =>
      e.id === destinoId ? atualizado : e
    );
    onSessaoChange({ ...sessaoAtual, exercicios: novosExercicios });
    setShowReplicarExercicio(false);
  }

  // ─── Replicar para sessão ─────────────────────────────────────────────

  function handleReplicarParaSessao(destinoSessaoId: string) {
    const destino = todasSessoes.find(s => s.id === destinoSessaoId);
    if (!destino) return;
    const atualizada = replicarSessaoParaSessao(sessaoAtual, destino);
    onSessaoChange(atualizada);
    setShowReplicarSessao(false);
  }

  // ─── Resumo para o header (quando fechado) ─────────────────────────────

  const resumoSeries = useMemo(() => {
    const grupos: Record<string, number> = {};
    exercicio.series.forEach(s => {
      grupos[s.tipo] = (grupos[s.tipo] ?? 0) + 1;
    });
    return grupos;
  }, [exercicio.series]);

  const resumoLabel = useMemo(() => {
    if (exercicio.series.length === 0) return 'Sem séries';
    const partes = Object.entries(resumoSeries).map(([tipo, qtd]) => {
      const abr = tipo === 'WORK SET' ? 'WS' : tipo === 'WARM-UP' ? 'WU' : 'FD';
      return `${qtd}×${abr}`;
    });
    return partes.join(' · ');
  }, [resumoSeries, exercicio.series]);

  const outrosExercicios = sessaoAtual.exercicios.filter(e => e.id !== exercicio.id);
  const outrasSessoes = todasSessoes.filter(s => s.id !== sessaoAtual.id);

  return (
    <>
      <Card className={cn('border transition-all duration-200', open && 'shadow-md border-primary/20')}>
        {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-3">
            {/* Handle de drag (opcional) */}
            {dragHandleProps && (
              <span
                {...dragHandleProps}
                className="cursor-grab text-muted-foreground hover:text-foreground shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </span>
            )}

            {/* Ícone + nome */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {exercicioInfo?.nome ?? 'Exercício'}
                </p>
                {!open && (
                  <p className="text-xs text-muted-foreground">
                    {resumoLabel}
                    {exercicio.prescricao_tipo === 'PERIODIZACAO' && (
                      <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">Periodização</Badge>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Ações do header */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Menu de replicação */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Replicar configuração</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={outrosExercicios.length === 0}
                    onClick={() => setShowReplicarExercicio(true)}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                    Para outro exercício desta sessão
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={outrasSessoes.length === 0}
                    onClick={() => setShowReplicarSessao(true)}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                    Sessão inteira para outra sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Trocar exercício */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => setShowSeletor(true)}
              >
                Trocar
              </Button>

              {/* Remover */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              {/* Expandir/colapsar */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(o => !o)}
              >
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* ── Conteúdo expandido ─────────────────────────────────────────────── */}
        {open && (
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            {/* Seletor de modo (apenas se periodização estiver ativa no treino) */}
            {periodizacaoAtiva && (
              <Tabs
                value={exercicio.prescricao_tipo}
                onValueChange={(v) => handleModoChange(v as 'DETALHADA' | 'PERIODIZACAO')}
                className="w-full"
              >
                <TabsList className="h-8 text-xs w-full grid grid-cols-2">
                  <TabsTrigger value="DETALHADA" className="text-xs">Manual / Detalhado</TabsTrigger>
                  <TabsTrigger value="PERIODIZACAO" className="text-xs">Usa Periodização</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Editor de séries */}
            <SeriesEditor
              series={exercicio.series}
              onChange={(series) => onChange({ ...exercicio, series })}
              periodizacaoMode={exercicio.prescricao_tipo === 'PERIODIZACAO'}
              onReplicarParaExercicio={
                outrosExercicios.length > 0 ? () => setShowReplicarExercicio(true) : undefined
              }
              onReplicarParaSessao={
                outrasSessoes.length > 0 ? () => setShowReplicarSessao(true) : undefined
              }
            />

            {/* Grupos musculares do exercício */}
            {exercicioInfo?.grupos_musculares && exercicioInfo.grupos_musculares.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t">
                {exercicioInfo.grupos_musculares.map((g: string) => (
                  <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── Modal: trocar exercício ─────────────────────────────────────────── */}
      <ExerciciosSeletor
        open={showSeletor}
        onOpenChange={setShowSeletor}
        exercicios={allExercicios}
        exerciciosJaAdicionados={
          sessaoAtual.exercicios
            .filter(e => e.id !== exercicio.id)
            .map(e => e.exercicio_id)
        }
        onSelectExercicio={(id) => {
          onChange({ ...exercicio, exercicio_id: id });
          setShowSeletor(false);
        }}
      />

      {/* ── Modal: replicar para exercício ─────────────────────────────────── */}
      <Dialog open={showReplicarExercicio} onOpenChange={setShowReplicarExercicio}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Copiar configuração de séries</DialogTitle>
            <DialogDescription>
              Selecione o exercício de destino. As reps e descanso serão copiados para cada série correspondente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {outrosExercicios.map(e => {
              const info = allExercicios.find(ex => ex.id === e.exercicio_id);
              return (
                <Button
                  key={e.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3"
                  onClick={() => handleReplicarParaExercicio(e.id)}
                >
                  <Dumbbell className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-left">{info?.nome ?? 'Exercício'}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: replicar sessão → sessão ────────────────────────────────── */}
      <Dialog open={showReplicarSessao} onOpenChange={setShowReplicarSessao}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Copiar configuração da sessão</DialogTitle>
            <DialogDescription>
              Os exercícios de "{sessaoAtual.nome}" serão emparelhados por índice com a sessão de destino.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {outrasSessoes.map(s => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-3"
                onClick={() => handleReplicarParaSessao(s.id)}
              >
                <span className="text-sm font-semibold text-primary">Sessão {s.nome}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {s.exercicios.length} exercício{s.exercicios.length !== 1 ? 's' : ''}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
