import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown, ChevronUp, GripVertical, Trash2, Copy, Dumbbell, MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExercicioLocal, SessaoLocal } from '@/types/treino';
import type { Tables } from '@/integrations/supabase/types';
import { clonarExercicioLocal } from '@/types/treino';
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
  /** Permite alterar outras sessões (para duplicar exercício para outra sessão) */
  onSessoesChange: (sessoes: SessaoLocal[]) => void;
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
  onSessoesChange,
  dragHandleProps,
}: ExercicioBlockProps) {
  const [open, setOpen] = useState(false);
  const [showSeletor, setShowSeletor] = useState(false);

  const exercicioInfo = useMemo(
    () => allExercicios.find((e) => e.id === exercicio.exercicio_id),
    [allExercicios, exercicio.exercicio_id]
  );

  // ─── Mudança de modo (DETALHADA ↔ PERIODIZACAO) ───────────────────────
  function handleModoChange(modo: 'DETALHADA' | 'PERIODIZACAO') {
    if (modo === exercicio.prescricao_tipo) return;
    onChange({
      ...exercicio,
      prescricao_tipo: modo,
      usar_periodizacao: modo === 'PERIODIZACAO',
      // Reseta as séries ao mudar de modo, pois a estrutura é diferente
      series:
        modo === 'PERIODIZACAO'
          ? [{ id: `temp_${Math.random().toString(36).slice(2)}`, tipo: 'WORK SET' as const, ordem: 1, reps_min: 0, reps_max: 0, descanso_min: 0, descanso_max: 0 }]
          : exercicio.series.length > 0
            ? exercicio.series
            : [{ id: `temp_${Math.random().toString(36).slice(2)}`, tipo: 'WORK SET' as const, ordem: 1, reps_min: 8, reps_max: 12, descanso_min: 60, descanso_max: 90 }],
    });
  }

  // ─── Duplicar exercício dentro da mesma sessão ──────────────────────────
  function handleDuplicarNaSessao() {
    const novo = clonarExercicioLocal(exercicio, sessaoAtual.exercicios.length + 1);
    const sessaoAtualizada: SessaoLocal = {
      ...sessaoAtual,
      exercicios: [...sessaoAtual.exercicios, novo],
    };
    onSessoesChange(
      todasSessoes.map((s) => (s.id === sessaoAtual.id ? sessaoAtualizada : s))
    );
  }

  // ─── Duplicar exercício para outra sessão ───────────────────────────────
  function handleDuplicarParaSessao(destinoId: string) {
    const destino = todasSessoes.find((s) => s.id === destinoId);
    if (!destino) return;
    const novo = clonarExercicioLocal(exercicio, destino.exercicios.length + 1);
    const destinoAtualizado: SessaoLocal = {
      ...destino,
      exercicios: [...destino.exercicios, novo],
    };
    onSessoesChange(
      todasSessoes.map((s) => (s.id === destinoId ? destinoAtualizado : s))
    );
  }

  // ─── Resumo para o header (quando fechado) ─────────────────────────────
  const resumoLabel = useMemo(() => {
    if (exercicio.series.length === 0) return 'Sem séries';
    if (exercicio.prescricao_tipo === 'PERIODIZACAO') {
      const grupos: Record<string, number> = {};
      exercicio.series.forEach((s) => {
        grupos[s.tipo] = (grupos[s.tipo] ?? 0) + 1;
      });
      return Object.entries(grupos)
        .map(([tipo, qtd]) => {
          const abr = tipo === 'WORK SET' ? 'WS' : tipo === 'WARM-UP' ? 'WU' : 'FD';
          return `${qtd}×${abr}`;
        })
        .join(' · ');
    }
    return `${exercicio.series.length} série${exercicio.series.length !== 1 ? 's' : ''}`;
  }, [exercicio.series, exercicio.prescricao_tipo]);

  const outrasSessoes = todasSessoes.filter((s) => s.id !== sessaoAtual.id);

  return (
    <Card className={cn('border transition-all duration-200', open && 'shadow-md border-primary/20')}>
      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <CardHeader className="py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {dragHandleProps && (
            <span
              {...dragHandleProps}
              className="cursor-grab text-muted-foreground hover:text-foreground shrink-0 hidden sm:inline-flex"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {exercicioInfo?.nome ?? 'Exercício'}
              </p>
              {!open && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <span>{resumoLabel}</span>
                  {exercicio.prescricao_tipo === 'PERIODIZACAO' && (
                    <Badge variant="outline" className="text-[10px] py-0 h-4">Periodização</Badge>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Ações do header */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mais ações">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Ações do exercício</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSeletor(true)}>
                  Trocar exercício
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicarNaSessao}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicar nesta sessão
                </DropdownMenuItem>
                {outrasSessoes.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Duplicar para outra sessão
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {outrasSessoes.map((s) => (
                        <DropdownMenuItem key={s.id} onClick={() => handleDuplicarParaSessao(s.id)}>
                          Sessão {s.nome}
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            {s.exercicios.length}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Expandir/colapsar */}
            <Button
              type="button" variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Recolher' : 'Expandir'}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ── Conteúdo expandido ─────────────────────────────────────────────── */}
      {open && (
        <CardContent className="pt-0 pb-4 px-3 sm:px-4 space-y-4">
          {/* Seletor de modo (apenas se periodização estiver ativa no treino) */}
          {periodizacaoAtiva && (
            <Tabs
              value={exercicio.prescricao_tipo}
              onValueChange={(v) => handleModoChange(v as 'DETALHADA' | 'PERIODIZACAO')}
              className="w-full"
            >
              <TabsList className="h-8 text-xs w-full grid grid-cols-2">
                <TabsTrigger value="DETALHADA" className="text-xs">Manual</TabsTrigger>
                <TabsTrigger value="PERIODIZACAO" className="text-xs">Usa Periodização</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Editor de séries */}
          <SeriesEditor
            series={exercicio.series}
            onChange={(series) => onChange({ ...exercicio, series })}
            periodizacaoMode={exercicio.prescricao_tipo === 'PERIODIZACAO'}
          />

          {/* Observação livre */}
          <div className="space-y-1.5">
            <Label htmlFor={`obs-${exercicio.id}`} className="text-xs text-muted-foreground">
              Observação (método, dica, regra do exercício…)
            </Label>
            <Textarea
              id={`obs-${exercicio.id}`}
              value={exercicio.observacoes ?? ''}
              onChange={(e) => onChange({ ...exercicio, observacoes: e.target.value || null })}
              placeholder="Ex: drop-set na última, cadência 3-1-3, foco na contração…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>

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

      {/* Modal: trocar exercício */}
      <ExerciciosSeletor
        open={showSeletor}
        onOpenChange={setShowSeletor}
        exercicios={allExercicios}
        exerciciosJaAdicionados={
          sessaoAtual.exercicios
            .filter((e) => e.id !== exercicio.id)
            .map((e) => e.exercicio_id)
        }
        onSelectExercicio={(id) => {
          onChange({ ...exercicio, exercicio_id: id });
          setShowSeletor(false);
        }}
      />
    </Card>
  );
}
