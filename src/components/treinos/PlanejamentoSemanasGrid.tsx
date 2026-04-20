/**
 * PlanejamentoSemanasGrid
 *
 * Mostra a grade semana-a-semana do treino quando há:
 *   - data_inicio
 *   - data_vencimento
 *   - periodização selecionada
 *
 * Permite override manual do tipo de microciclo por semana (com flag override_manual no banco).
 *
 * Usa o hook useTreinoSemanas. Quando o treino ainda não foi salvo (sem ID),
 * mostra um preview computado em memória a partir da periodização e datas.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Sparkles } from 'lucide-react';
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

  // Se não tem dados suficientes, não mostra nada
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

  // Se já temos treino salvo, usa as semanas do banco; senão, preview
  const semanasParaExibir =
    treinoId && semanasSalvas.length > 0
      ? semanasSalvas.map((s) => ({
          id: s.id,
          semana_num: s.semana_num,
          data_inicio_semana: s.data_inicio_semana,
          data_fim_semana: s.data_fim_semana,
          tipo_microciclo_id: s.tipo_microciclo_id,
          tipo_microciclo_nome: s.tipo_microciclo?.nome ?? null,
          override_manual: s.override_manual,
          editable: true,
        }))
      : (preview ?? []).map((s) => ({
          id: undefined as string | undefined,
          ...s,
          override_manual: false,
          editable: false,
        }));

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
          {treinoId
            ? 'Edite o microciclo de qualquer semana abaixo. Edições manuais são preservadas ao recalcular.'
            : 'Pré-visualização. A grade será criada ao salvar o treino, e você poderá editá-la então.'}
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
            {semanasParaExibir.map((s) => (
              <div
                key={s.id ?? `prev-${s.semana_num}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">S{s.semana_num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium truncate">
                    Semana {s.semana_num}
                    {s.override_manual && (
                      <Badge variant="outline" className="ml-2 text-[9px] h-4 px-1">
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
                {s.editable && s.id ? (
                  <Select
                    value={s.tipo_microciclo_id ?? ''}
                    onValueChange={(v) =>
                      updateSemana({ id: s.id!, tipo_microciclo_id: v || null })
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px] sm:w-[180px] h-8 text-xs">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposMicrociclos.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="text-[10px] sm:text-xs gap-1">
                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                    {s.tipo_microciclo_nome ?? '—'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
