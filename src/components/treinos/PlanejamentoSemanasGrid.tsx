/**
 * PlanejamentoSemanasGrid
 *
 * Grade semana-a-semana do treino. Cada tipo de microciclo recebe uma cor
 * determinística (mesmo tipo = mesma cor sempre) para diferenciação visual rápida.
 *
 * Edição manual:
 *  - Em modo preview (treino ainda não salvo): override fica em estado local.
 *  - Em modo salvo (treino com ID): persiste em treino_semanas com override_manual=true.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { useTreinoSemanas } from '@/hooks/useTreinoSemanas';
import { useTiposMicrociclos } from '@/hooks/useTiposMicrociclos';
import type { PeriodizacaoCompleta } from '@/hooks/usePeriodizacoes';
import { format, parseISO, addDays, differenceInCalendarWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PreviewSemana {
  semana_num: number;
  data_inicio_semana: string;
  data_fim_semana: string;
  tipo_microciclo_id: string | null;
  tipo_microciclo_nome: string | null;
}

function gerarPreviewSemanas(
  data_inicio: string,
  data_vencimento: string,
  periodizacao: PeriodizacaoCompleta
): PreviewSemana[] {
  const start = parseISO(data_inicio);
  const end = parseISO(data_vencimento);
  const totalSemanas = Math.max(1, differenceInCalendarWeeks(end, start) + 1);
  const cicloLen = periodizacao.semanas.length || 1;
  const semanasOrdenadas = [...periodizacao.semanas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  return Array.from({ length: totalSemanas }, (_, i) => {
    const dataIni = addDays(start, i * 7);
    const dataFim = addDays(dataIni, 6);
    const idxCiclo = i % cicloLen;
    const semanaPerio = semanasOrdenadas[idxCiclo];
    return {
      semana_num: i + 1,
      data_inicio_semana: format(dataIni, 'yyyy-MM-dd'),
      data_fim_semana: format(dataFim, 'yyyy-MM-dd'),
      tipo_microciclo_id: semanaPerio?.tipo_microciclo_id ?? null,
      tipo_microciclo_nome: (semanaPerio as any)?.tipos_microciclos?.nome ?? null,
    };
  });
}

/**
 * Hash determinístico string → hue (0-360). Mesmo ID sempre gera a mesma cor.
 */
function hashToHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function corDoTipo(id: string | null | undefined): {
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
} {
  if (!id) {
    return {
      bg: 'hsl(var(--muted) / 0.2)',
      border: 'hsl(var(--border))',
      badgeBg: 'hsl(var(--muted))',
      badgeText: 'hsl(var(--muted-foreground))',
      dot: 'hsl(var(--muted-foreground))',
    };
  }
  const hue = hashToHue(id);
  return {
    bg: `hsl(${hue} 70% 95%)`,
    border: `hsl(${hue} 60% 75%)`,
    badgeBg: `hsl(${hue} 65% 88%)`,
    badgeText: `hsl(${hue} 55% 28%)`,
    dot: `hsl(${hue} 65% 50%)`,
  };
}

interface PlanejamentoSemanasGridProps {
  treinoId?: string;
  data_inicio: string | null | undefined;
  data_vencimento: string | null | undefined;
  periodizacao: PeriodizacaoCompleta | null | undefined;
}

export function PlanejamentoSemanasGrid({
  treinoId,
  data_inicio,
  data_vencimento,
  periodizacao,
}: PlanejamentoSemanasGridProps) {
  const { semanas: semanasSalvas, loading, updateSemana, isUpdating } = useTreinoSemanas(treinoId);
  const { tiposMicrociclos } = useTiposMicrociclos();

  const preview = useMemo<PreviewSemana[] | null>(() => {
    if (!data_inicio || !data_vencimento || !periodizacao) return null;
    return gerarPreviewSemanas(data_inicio, data_vencimento, periodizacao);
  }, [data_inicio, data_vencimento, periodizacao]);

  // Overrides locais para o modo preview (antes do treino ser salvo)
  const [previewOverrides, setPreviewOverrides] = useState<Record<number, string | null>>({});

  // Reset overrides locais se a periodização ou as datas mudarem
  useEffect(() => {
    setPreviewOverrides({});
  }, [data_inicio, data_vencimento, periodizacao?.id]);

  if (!data_inicio || !data_vencimento || !periodizacao) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Grade semanal do treino
          </CardTitle>
          <CardDescription className="text-xs">
            Defina <strong>data de início</strong>, <strong>data de vencimento</strong> e selecione uma <strong>periodização</strong> para visualizar e personalizar a grade semanal.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isSavedMode = !!(treinoId && semanasSalvas.length > 0);

  type Linha = {
    key: string;
    id?: string;
    semana_num: number;
    data_inicio_semana: string | null;
    data_fim_semana: string | null;
    tipo_microciclo_id: string | null;
    tipo_microciclo_nome: string | null;
    override_manual: boolean;
    editable: boolean;
  };

  const semanasParaExibir: Linha[] = isSavedMode
    ? semanasSalvas.map((s) => ({
        key: s.id,
        id: s.id,
        semana_num: s.semana_num,
        data_inicio_semana: s.data_inicio_semana,
        data_fim_semana: s.data_fim_semana,
        tipo_microciclo_id: s.tipo_microciclo_id,
        tipo_microciclo_nome: s.tipo_microciclo?.nome ?? null,
        override_manual: s.override_manual,
        editable: true,
      }))
    : (preview ?? []).map((s) => {
        const overrideId =
          s.semana_num in previewOverrides ? previewOverrides[s.semana_num] : undefined;
        const finalId = overrideId !== undefined ? overrideId : s.tipo_microciclo_id;
        const finalNome =
          overrideId !== undefined
            ? tiposMicrociclos.find((t) => t.id === overrideId)?.nome ?? null
            : s.tipo_microciclo_nome;
        return {
          key: `prev-${s.semana_num}`,
          semana_num: s.semana_num,
          data_inicio_semana: s.data_inicio_semana,
          data_fim_semana: s.data_fim_semana,
          tipo_microciclo_id: finalId,
          tipo_microciclo_nome: finalNome,
          override_manual: overrideId !== undefined,
          editable: true,
        };
      });

  const handleChange = (linha: Linha, novoId: string) => {
    const valor = novoId === '__none__' ? null : novoId;
    if (isSavedMode && linha.id) {
      updateSemana({ id: linha.id, tipo_microciclo_id: valor });
    } else {
      setPreviewOverrides((prev) => ({ ...prev, [linha.semana_num]: valor }));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Grade semanal do treino
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {semanasParaExibir.length} semana{semanasParaExibir.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          {isSavedMode
            ? 'Edite o microciclo de qualquer semana abaixo. Edições manuais são preservadas ao recalcular.'
            : 'Pré-visualização editável. Suas escolhas serão aplicadas ao salvar o treino.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && treinoId ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {semanasParaExibir.map((s) => {
              const cor = corDoTipo(s.tipo_microciclo_id);
              return (
                <div
                  key={s.key}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg transition-colors"
                  style={{
                    backgroundColor: cor.bg,
                    borderColor: cor.border,
                  }}
                >
                  <div
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-md flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{ backgroundColor: cor.badgeBg, color: cor.badgeText }}
                  >
                    S{s.semana_num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium truncate flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: cor.dot }}
                      />
                      Semana {s.semana_num}
                      {s.override_manual && (
                        <Badge variant="outline" className="ml-1 text-[9px] h-4 px-1">
                          manual
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {s.data_inicio_semana && s.data_fim_semana ? (
                        <>
                          {format(parseISO(s.data_inicio_semana), 'dd/MM', { locale: ptBR })}
                          {' – '}
                          {format(parseISO(s.data_fim_semana), 'dd/MM/yyyy', { locale: ptBR })}
                        </>
                      ) : '—'}
                    </div>
                  </div>
                  <Select
                    value={s.tipo_microciclo_id ?? '__none__'}
                    onValueChange={(v) => handleChange(s, v)}
                    disabled={isSavedMode && isUpdating}
                  >
                    <SelectTrigger
                      className="w-[140px] sm:w-[180px] h-8 text-xs bg-background"
                      style={{ borderColor: cor.border }}
                    >
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="text-xs text-muted-foreground">
                        — sem tipo —
                      </SelectItem>
                      {tiposMicrociclos.map((t) => {
                        const c = corDoTipo(t.id);
                        return (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: c.dot }}
                              />
                              {t.nome}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
