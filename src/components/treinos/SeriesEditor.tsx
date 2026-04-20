import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  Flame, Zap, Target, GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SerieLocal, TipoSerie } from '@/types/treino';
import { criarSerieManual, criarSeriePeriodizacao } from '@/types/treino';

// ─── Metadados de cada tipo de série ─────────────────────────────────────────

const TIPO_META: Record<TipoSerie, { label: string; abbr: string; color: string; icon: React.ReactNode }> = {
  'WARM-UP': {
    label: 'Warm-up',
    abbr: 'WU',
    color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30',
    icon: <Flame className="h-3.5 w-3.5" />,
  },
  FEEDER: {
    label: 'Feeder',
    abbr: 'FD',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  'WORK SET': {
    label: 'Work Set',
    abbr: 'WS',
    color: 'text-primary bg-primary/5 border-primary/20',
    icon: <Target className="h-3.5 w-3.5" />,
  },
};

// ─── Linha de série em modo MANUAL (DETALHADA) ───────────────────────────────

interface SerieManualRowProps {
  serie: SerieLocal;
  index: number;
  total: number;
  onChange: (updated: SerieLocal) => void;
  onRemove: () => void;
  onMoverParaCima: () => void;
  onMoverParaBaixo: () => void;
}

function SerieManualRow({
  serie, index, total, onChange, onRemove, onMoverParaCima, onMoverParaBaixo,
}: SerieManualRowProps) {
  const update = (patch: Partial<SerieLocal>) => onChange({ ...serie, ...patch });

  return (
    <div className="grid items-center gap-1.5 px-2 py-2 rounded-lg border hover:bg-muted/30 transition-colors
                    grid-cols-[24px_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
      <span className="text-xs font-mono text-muted-foreground text-center select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Reps mín */}
      <Input
        type="number" min={1} max={999}
        value={serie.reps_min}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) update({ reps_min: v, reps_max: Math.max(serie.reps_max, v) });
        }}
        className="h-8 text-xs text-center px-1"
        title="Reps mínimas"
      />
      <span className="text-muted-foreground text-xs px-0.5 select-none">a</span>
      <Input
        type="number" min={serie.reps_min} max={999}
        value={serie.reps_max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) update({ reps_max: v });
        }}
        className="h-8 text-xs text-center px-1"
        title="Reps máximas"
      />

      {/* Descanso mín – máx (segundos) */}
      <Input
        type="number" min={0} max={999}
        value={serie.descanso_min}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) update({ descanso_min: v, descanso_max: Math.max(serie.descanso_max, v) });
        }}
        className="h-8 text-xs text-center px-1"
        title="Descanso mínimo (segundos)"
      />
      <span className="text-muted-foreground text-xs px-0.5 select-none">a</span>
      <Input
        type="number" min={serie.descanso_min} max={999}
        value={serie.descanso_max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) update({ descanso_max: v });
        }}
        className="h-8 text-xs text-center px-1"
        title="Descanso máximo (segundos)"
      />

      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
              onClick={onMoverParaCima} disabled={index === 0}>
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para cima</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
              onClick={onMoverParaBaixo} disabled={index === total - 1}>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para baixo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remover série</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function SeriesManualHeader() {
  return (
    <div className="grid items-center gap-1.5 px-2 pb-1
                    grid-cols-[24px_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
      <span />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center col-span-3">
        Reps (mín – máx)
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center col-span-3">
        Descanso seg (mín – máx)
      </span>
      <span />
    </div>
  );
}

// ─── Linha de série em modo PERIODIZAÇÃO ─────────────────────────────────────

interface SeriePeriodizacaoRowProps {
  serie: SerieLocal;
  index: number;
  total: number;
  onChange: (updated: SerieLocal) => void;
  onRemove: () => void;
  onMoverParaCima: () => void;
  onMoverParaBaixo: () => void;
}

function SeriePeriodizacaoRow({
  serie, index, total, onChange, onRemove, onMoverParaCima, onMoverParaBaixo,
}: SeriePeriodizacaoRowProps) {
  const meta = TIPO_META[serie.tipo];
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/30 transition-colors">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
      <span className="text-xs font-mono text-muted-foreground select-none w-6 text-center">
        {String(index + 1).padStart(2, '0')}
      </span>

      <Select value={serie.tipo} onValueChange={(v) => onChange({ ...serie, tipo: v as TipoSerie })}>
        <SelectTrigger className="h-8 text-xs flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 gap-0.5 font-mono', meta.color)}>
              {meta.icon}{meta.abbr}
            </Badge>
            <span className="text-xs">{meta.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(TIPO_META) as [TipoSerie, typeof TIPO_META[TipoSerie]][]).map(([tipo, m]) => (
            <SelectItem key={tipo} value={tipo}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 gap-0.5 font-mono', m.color)}>
                  {m.icon}{m.abbr}
                </Badge>
                <span>{m.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
          onClick={onMoverParaCima} disabled={index === 0}>
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
          onClick={onMoverParaBaixo} disabled={index === total - 1}>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── SeriesEditor (componente principal) ─────────────────────────────────────

interface SeriesEditorProps {
  series: SerieLocal[];
  onChange: (series: SerieLocal[]) => void;
  /** Quando true, modo periodização (só ordem + tipo). Caso contrário, modo manual. */
  periodizacaoMode?: boolean;
  className?: string;
}

export function SeriesEditor({
  series, onChange, periodizacaoMode = false, className,
}: SeriesEditorProps) {

  const update = useCallback((index: number, updated: SerieLocal) => {
    onChange(series.map((s, i) => (i === index ? updated : s)));
  }, [series, onChange]);

  const remove = useCallback((index: number) => {
    onChange(series.filter((_, i) => i !== index).map((s, i) => ({ ...s, ordem: i + 1 })));
  }, [series, onChange]);

  const moverParaCima = useCallback((index: number) => {
    if (index === 0) return;
    const next = [...series];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((s, i) => ({ ...s, ordem: i + 1 })));
  }, [series, onChange]);

  const moverParaBaixo = useCallback((index: number) => {
    if (index >= series.length - 1) return;
    const next = [...series];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next.map((s, i) => ({ ...s, ordem: i + 1 })));
  }, [series, onChange]);

  // ─── Modo MANUAL ─────────────────────────────────────────────────────────
  const addSerieManual = useCallback(() => {
    const ultima = series[series.length - 1];
    onChange([...series, criarSerieManual(series.length + 1, ultima)]);
  }, [series, onChange]);

  // Duplica a série (logo abaixo dela), no modo manual
  const duplicarSerie = useCallback((index: number) => {
    const ref = series[index];
    const nova = criarSerieManual(index + 2, ref);
    const next = [
      ...series.slice(0, index + 1),
      nova,
      ...series.slice(index + 1),
    ].map((s, i) => ({ ...s, ordem: i + 1 }));
    onChange(next);
  }, [series, onChange]);

  // ─── Modo PERIODIZAÇÃO ───────────────────────────────────────────────────
  const addSeriePeriodizacao = useCallback((tipo: TipoSerie) => {
    onChange([...series, criarSeriePeriodizacao(series.length + 1, tipo)]);
  }, [series, onChange]);

  // ─── Resumo ──────────────────────────────────────────────────────────────
  const resumo = series.reduce((acc, s) => {
    acc[s.tipo] = (acc[s.tipo] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Resumo (apenas modo periodização) */}
      {periodizacaoMode && series.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {(Object.entries(resumo) as [TipoSerie, number][]).map(([tipo, qtd]) => (
            <Badge key={tipo} variant="outline"
              className={cn('text-[10px] gap-1 px-2 h-5', TIPO_META[tipo]?.color)}>
              {TIPO_META[tipo]?.icon}
              {qtd}× {TIPO_META[tipo]?.abbr}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {series.length} série{series.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Linhas */}
      {series.length > 0 && (
        <div className="space-y-1">
          {!periodizacaoMode && <SeriesManualHeader />}
          {series.map((serie, i) =>
            periodizacaoMode ? (
              <SeriePeriodizacaoRow
                key={serie.id}
                serie={serie}
                index={i}
                total={series.length}
                onChange={(u) => update(i, u)}
                onRemove={() => remove(i)}
                onMoverParaCima={() => moverParaCima(i)}
                onMoverParaBaixo={() => moverParaBaixo(i)}
              />
            ) : (
              <SerieManualRow
                key={serie.id}
                serie={serie}
                index={i}
                total={series.length}
                onChange={(u) => update(i, u)}
                onRemove={() => remove(i)}
                onMoverParaCima={() => moverParaCima(i)}
                onMoverParaBaixo={() => moverParaBaixo(i)}
              />
            )
          )}
        </div>
      )}

      {/* Botões de adição */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {periodizacaoMode ? (
          <>
            <Button type="button" variant="outline" size="sm"
              className="h-7 text-xs gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50"
              onClick={() => addSeriePeriodizacao('WARM-UP')}>
              <Flame className="h-3 w-3" /> + Warm-up
            </Button>
            <Button type="button" variant="outline" size="sm"
              className="h-7 text-xs gap-1.5 text-yellow-800 border-yellow-200 hover:bg-yellow-50"
              onClick={() => addSeriePeriodizacao('FEEDER')}>
              <Zap className="h-3 w-3" /> + Feeder
            </Button>
            <Button type="button" variant="outline" size="sm"
              className="h-7 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => addSeriePeriodizacao('WORK SET')}>
              <Target className="h-3 w-3" /> + Work Set
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5"
              onClick={addSerieManual}>
              <Plus className="h-3 w-3" /> Adicionar série
            </Button>
            {series.length > 0 && (
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={() => duplicarSerie(series.length - 1)}>
                Duplicar última
              </Button>
            )}
          </>
        )}
      </div>

      {series.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
          Nenhuma série adicionada ainda.{' '}
          {periodizacaoMode
            ? 'Adicione Warm-ups, Feeders e Work Sets na ordem desejada.'
            : 'Clique em "Adicionar série" para começar.'}
        </div>
      )}
    </div>
  );
}
