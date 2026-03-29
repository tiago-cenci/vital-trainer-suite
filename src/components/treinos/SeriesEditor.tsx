import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Trash2, Copy, CopyCheck, ChevronDown, ChevronUp,
  Flame, Zap, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SerieLocal, TipoSerie } from '@/types/treino';
import { criarSerie } from '@/types/treino';

// ─── Metadados de cada tipo de série ─────────────────────────────────────────

const TIPO_META: Record<TipoSerie, { label: string; abbr: string; color: string; icon: React.ReactNode }> = {
  'WARM-UP': {
    label: 'Warm-up',
    abbr: 'WU',
    color: 'text-orange-500 bg-orange-50 border-orange-200',
    icon: <Flame className="h-3.5 w-3.5" />,
  },
  FEEDER: {
    label: 'Feeder',
    abbr: 'FD',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  'WORK SET': {
    label: 'Work Set',
    abbr: 'WS',
    color: 'text-primary bg-primary/5 border-primary/20',
    icon: <Target className="h-3.5 w-3.5" />,
  },
};

// ─── Linha de série ────────────────────────────────────────────────────────────

interface SerieRowProps {
  serie: SerieLocal;
  index: number;
  total: number;
  onChange: (updated: SerieLocal) => void;
  onRemove: () => void;
  onReplicarParaProxima: () => void;
  onReplicarParaTodas: () => void;
  onMoverParaCima: () => void;
  onMoverParaBaixo: () => void;
  periodizacaoMode: boolean;
}

function SerieRow({
  serie,
  index,
  total,
  onChange,
  onRemove,
  onReplicarParaProxima,
  onReplicarParaTodas,
  onMoverParaCima,
  onMoverParaBaixo,
  periodizacaoMode,
}: SerieRowProps) {
  const meta = TIPO_META[serie.tipo];

  const update = (patch: Partial<SerieLocal>) => onChange({ ...serie, ...patch, _replicado: false });

  return (
    <div
      className={cn(
        'grid items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
        'hover:bg-muted/30',
        serie._replicado && 'bg-muted/20 border-dashed',
        // Layout: num | tipo | reps-min | – | reps-max | descanso | ações
        'grid-cols-[28px_110px_1fr_10px_1fr_1fr_auto]'
      )}
    >
      {/* Número da série */}
      <span className="text-xs font-mono text-muted-foreground text-center select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Tipo */}
      <Select
        value={serie.tipo}
        onValueChange={(v) => update({ tipo: v as TipoSerie })}
      >
        <SelectTrigger className="h-8 text-xs px-2">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 h-4 gap-0.5 font-mono', meta.color)}
            >
              {meta.icon}
              {meta.abbr}
            </Badge>
            {/* Em telas maiores, mostra o label */}
            <span className="hidden sm:inline text-xs">{meta.label}</span>
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

      {/* Reps mín */}
      <div className="relative">
        <Input
          type="number"
          min={1}
          max={999}
          value={serie.reps_min}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) update({ reps_min: v, reps_max: Math.max(serie.reps_max, v) });
          }}
          className="h-8 text-xs text-center pr-1 pl-1"
          title="Reps mínimas"
        />
      </div>

      {/* Separador visual */}
      <span className="text-muted-foreground text-xs text-center select-none">–</span>

      {/* Reps máx */}
      <div className="relative">
        <Input
          type="number"
          min={serie.reps_min}
          max={999}
          value={serie.reps_max}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) update({ reps_max: v });
          }}
          className="h-8 text-xs text-center pr-1 pl-1"
          title="Reps máximas"
        />
      </div>

      {/* Descanso */}
      <div className="relative">
        <Input
          type="number"
          min={0}
          max={600}
          value={serie.descanso_seg}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) update({ descanso_seg: v });
          }}
          className="h-8 text-xs text-center pr-1 pl-1"
          title="Descanso em segundos"
        />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-0.5">
        {/* Mover para cima */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoverParaCima}
              disabled={index === 0}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para cima</TooltipContent>
        </Tooltip>

        {/* Mover para baixo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoverParaBaixo}
              disabled={index === total - 1}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para baixo</TooltipContent>
        </Tooltip>

        {/* Replicar para próxima */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReplicarParaProxima}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Adicionar próxima série igual</TooltipContent>
        </Tooltip>

        {/* Replicar para todas */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={onReplicarParaTodas}
            >
              <CopyCheck className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar reps e descanso para todas as séries</TooltipContent>
        </Tooltip>

        {/* Remover */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remover série</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Cabeçalho da tabela ──────────────────────────────────────────────────────

function SeriesTableHeader() {
  return (
    <div className="grid grid-cols-[28px_110px_1fr_10px_1fr_1fr_auto] gap-2 px-3 pb-1">
      <span />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Reps mín</span>
      <span />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Reps máx</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Desc (s)</span>
      <span />
    </div>
  );
}

// ─── SeriesEditor (componente principal) ─────────────────────────────────────

interface SeriesEditorProps {
  series: SerieLocal[];
  onChange: (series: SerieLocal[]) => void;
  /** Quando true, mostra também tipos Warm-up e Feeder */
  periodizacaoMode?: boolean;
  /** Callbacks de replicação entre exercícios */
  onReplicarParaExercicio?: () => void;
  onReplicarParaSessao?: () => void;
  className?: string;
}

export function SeriesEditor({
  series,
  onChange,
  periodizacaoMode = false,
  onReplicarParaExercicio,
  onReplicarParaSessao,
  className,
}: SeriesEditorProps) {
  // ─── Mutações de série ───────────────────────────────────────────────

  const update = useCallback((index: number, updated: SerieLocal) => {
    const next = series.map((s, i) => (i === index ? updated : s));
    onChange(next);
  }, [series, onChange]);

  const remove = useCallback((index: number) => {
    const next = series
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, ordem: i + 1 }));
    onChange(next);
  }, [series, onChange]);

  const addSerie = useCallback((tipo: TipoSerie = 'WORK SET') => {
    const ultima = [...series].reverse().find(s => s.tipo === tipo) ?? series[series.length - 1];
    const nova = criarSerie(series.length + 1, tipo, ultima);
    onChange([...series, nova]);
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

  /** Adiciona uma cópia da série logo abaixo dela */
  const replicarParaProxima = useCallback((index: number) => {
    const ref = series[index];
    const nova = criarSerie(index + 2, ref.tipo, ref);
    const next = [
      ...series.slice(0, index + 1),
      nova,
      ...series.slice(index + 1),
    ].map((s, i) => ({ ...s, ordem: i + 1 }));
    onChange(next);
  }, [series, onChange]);

  /** Copia reps e descanso desta série para todas as outras do mesmo tipo */
  const replicarParaTodas = useCallback((index: number) => {
    const ref = series[index];
    const next = series.map(s =>
      s.tipo === ref.tipo
        ? { ...s, reps_min: ref.reps_min, reps_max: ref.reps_max, descanso_seg: ref.descanso_seg, _replicado: true }
        : s
    );
    onChange(next);
  }, [series, onChange]);

  // ─── Resumo por tipo ───────────────────────────────────────────────────────
  const resumo = series.reduce((acc, s) => {
    acc[s.tipo] = (acc[s.tipo] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Badges de resumo */}
      {series.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {(Object.entries(resumo) as [TipoSerie, number][]).map(([tipo, qtd]) => (
            <Badge
              key={tipo}
              variant="outline"
              className={cn('text-[10px] gap-1 px-2 h-5', TIPO_META[tipo]?.color)}
            >
              {TIPO_META[tipo]?.icon}
              {qtd}× {TIPO_META[tipo]?.abbr}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {series.length} série{series.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Cabeçalho + linhas */}
      {series.length > 0 && (
        <div className="space-y-1">
          <SeriesTableHeader />
          {series.map((serie, i) => (
            <SerieRow
              key={serie.id}
              serie={serie}
              index={i}
              total={series.length}
              periodizacaoMode={periodizacaoMode}
              onChange={(updated) => update(i, updated)}
              onRemove={() => remove(i)}
              onReplicarParaProxima={() => replicarParaProxima(i)}
              onReplicarParaTodas={() => replicarParaTodas(i)}
              onMoverParaCima={() => moverParaCima(i)}
              onMoverParaBaixo={() => moverParaBaixo(i)}
            />
          ))}
        </div>
      )}

      {/* Botões de adição */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {periodizacaoMode ? (
          // Modo periodização: botões por tipo
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => addSerie('WARM-UP')}
            >
              <Flame className="h-3 w-3" /> + Warm-up
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
              onClick={() => addSerie('FEEDER')}
            >
              <Zap className="h-3 w-3" /> + Feeder
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => addSerie('WORK SET')}
            >
              <Target className="h-3 w-3" /> + Work Set
            </Button>
          </>
        ) : (
          // Modo detalhado: botão único
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => addSerie('WORK SET')}
          >
            <Plus className="h-3 w-3" /> Adicionar série
          </Button>
        )}

        {/* Separador */}
        {(onReplicarParaExercicio || onReplicarParaSessao) && (
          <div className="h-4 w-px bg-border mx-1" />
        )}

        {/* Replicar para outro exercício */}
        {onReplicarParaExercicio && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={onReplicarParaExercicio}
              >
                <Copy className="h-3 w-3" /> Copiar para exercício
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar configuração para outro exercício da sessão</TooltipContent>
          </Tooltip>
        )}

        {/* Replicar para outra sessão */}
        {onReplicarParaSessao && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={onReplicarParaSessao}
              >
                <CopyCheck className="h-3 w-3" /> Copiar para sessão
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar configuração de todos os exercícios para outra sessão</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Estado vazio */}
      {series.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
          Nenhuma série adicionada ainda.{' '}
          {periodizacaoMode
            ? 'Adicione Warm-ups, Feeders e Work Sets acima.'
            : 'Clique em "Adicionar série" para começar.'}
        </div>
      )}
    </div>
  );
}
