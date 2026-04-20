/**
 * treino.ts — Tipos centralizados do domínio de treinos
 *
 * MODOS de prescrição por exercício:
 * - DETALHADA (manual): personal define linha-a-linha reps_min/max e descanso_min/max.
 *   Não tem "tipo de série" — tudo é manual.
 * - PERIODIZACAO: personal define apenas a SEQUÊNCIA de tipos (WU/FD/WS).
 *   Reps e descanso vêm do microciclo da semana ativa.
 */

export type TipoSerie = 'WARM-UP' | 'FEEDER' | 'WORK SET';
export type PrescricaoTipo = 'DETALHADA' | 'PERIODIZACAO';

/** Uma série individual */
export interface SerieLocal {
  /** UUID real do banco, ou string temp_ para séries novas não salvas */
  id: string;
  tipo: TipoSerie;
  ordem: number;
  // Manual (DETALHADA): valores definidos pelo personal
  reps_min: number;
  reps_max: number;
  descanso_min: number;
  descanso_max: number;
}

/** Um exercício dentro de uma sessão (estado local do form) */
export interface ExercicioLocal {
  /** UUID real ou temp_ */
  id: string;
  exercicio_id: string;
  ordem: number;
  prescricao_tipo: PrescricaoTipo;
  usar_periodizacao: boolean;
  series: SerieLocal[];
  /** Texto livre do personal (método, dica, regra deste exercício) */
  observacoes: string | null;
}

/** Um alongamento dentro de uma sessão (estado local do form) */
export interface AlongamentoSessaoLocal {
  /** UUID real da tabela sessoes_alongamentos, ou temp_ */
  id: string;
  alongamento_id: string;
  ordem: number;
  observacoes: string | null;
  // Campos denormalizados para exibição rápida
  descricao?: string;
  grupo_muscular?: string;
}

/** Uma sessão dentro do treino (estado local do form) */
export interface SessaoLocal {
  /** UUID real ou temp_ */
  id: string;
  nome: string;
  ordem: number;
  exercicios: ExercicioLocal[];
  alongamentos: AlongamentoSessaoLocal[];
}

// ─── Helpers de criação ────────────────────────────────────────────────

function uid(): string {
  return `temp_${Math.random().toString(36).slice(2, 10)}`;
}

/** Cria uma série manual com valores padrão */
export function criarSerieManual(ordem: number, base?: Partial<SerieLocal>): SerieLocal {
  return {
    id: uid(),
    tipo: 'WORK SET', // ignorado em modo DETALHADA
    ordem,
    reps_min: base?.reps_min ?? 8,
    reps_max: base?.reps_max ?? 12,
    descanso_min: base?.descanso_min ?? 60,
    descanso_max: base?.descanso_max ?? 90,
  };
}

/** Cria uma série de periodização (só ordem + tipo importam) */
export function criarSeriePeriodizacao(ordem: number, tipo: TipoSerie): SerieLocal {
  return {
    id: uid(),
    tipo,
    ordem,
    reps_min: 0,
    reps_max: 0,
    descanso_min: 0,
    descanso_max: 0,
  };
}

/** Cria um bloco padrão de séries manuais (3x WORK SET) */
export function criarSeriesManuaisPadrao(qtd = 3): SerieLocal[] {
  return Array.from({ length: qtd }, (_, i) => criarSerieManual(i + 1));
}

/** Cria um exercício local vazio */
export function criarExercicioLocal(
  exercicio_id: string,
  ordem: number,
  periodizacaoAtiva: boolean
): ExercicioLocal {
  const prescricao_tipo: PrescricaoTipo = periodizacaoAtiva ? 'PERIODIZACAO' : 'DETALHADA';
  return {
    id: uid(),
    exercicio_id,
    ordem,
    prescricao_tipo,
    usar_periodizacao: periodizacaoAtiva,
    observacoes: null,
    series: periodizacaoAtiva
      ? [criarSeriePeriodizacao(1, 'WORK SET')]
      : criarSeriesManuaisPadrao(3),
  };
}

/** Cria uma sessão local vazia */
export function criarSessaoLocal(nome: string, ordem: number): SessaoLocal {
  return {
    id: uid(),
    nome,
    ordem,
    exercicios: [],
    alongamentos: [],
  };
}

/** Clona um exercício local com novos IDs temporários */
export function clonarExercicioLocal(ex: ExercicioLocal, novaOrdem: number): ExercicioLocal {
  return {
    ...ex,
    id: uid(),
    ordem: novaOrdem,
    series: ex.series.map((s) => ({ ...s, id: uid() })),
  };
}

/** Clona uma sessão inteira (exercícios + alongamentos) com novos IDs */
export function clonarSessaoConteudo(origem: SessaoLocal, destino: SessaoLocal): SessaoLocal {
  return {
    ...destino,
    exercicios: origem.exercicios.map((ex, i) => clonarExercicioLocal(ex, i + 1)),
    alongamentos: origem.alongamentos.map((a) => ({ ...a, id: uid() })),
  };
}

// ─── Conversão banco → local ─────────────────────────────────────────────

/** Converte uma row do banco (sessao_exercicio + series) para ExercicioLocal */
export function dbToExercicioLocal(se: {
  id: string;
  exercicio_id: string;
  ordem: number;
  prescricao_tipo: string;
  usar_periodizacao: boolean;
  observacoes?: string | null;
  series_qtd?: number | null;
  reps_min?: number | null;
  reps_max?: number | null;
  descanso_seg?: number | null;
  series?: {
    id: string;
    tipo: string;
    ordem?: number | null;
    reps_min?: number | null;
    reps_max?: number | null;
    descanso_seg?: number | null;
    descanso_min?: number | null;
    descanso_max?: number | null;
  }[];
}): ExercicioLocal {
  const prescricao_tipo = (se.prescricao_tipo ?? 'DETALHADA') as PrescricaoTipo;

  let series: SerieLocal[] = [];

  if (se.series && se.series.length > 0) {
    series = [...se.series]
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((s, i) => ({
        id: s.id,
        tipo: (s.tipo as TipoSerie) ?? 'WORK SET',
        ordem: s.ordem ?? i + 1,
        reps_min: s.reps_min ?? se.reps_min ?? 8,
        reps_max: s.reps_max ?? se.reps_max ?? 12,
        descanso_min: s.descanso_min ?? s.descanso_seg ?? se.descanso_seg ?? 60,
        descanso_max: s.descanso_max ?? s.descanso_seg ?? se.descanso_seg ?? 90,
      }));
  } else if (prescricao_tipo === 'DETALHADA' && se.series_qtd) {
    // Legado: gera N séries manuais a partir dos campos globais
    series = criarSeriesManuaisPadrao(se.series_qtd).map((s) => ({
      ...s,
      reps_min: se.reps_min ?? 8,
      reps_max: se.reps_max ?? 12,
      descanso_min: se.descanso_seg ?? 60,
      descanso_max: se.descanso_seg ?? 90,
    }));
  } else if (prescricao_tipo === 'PERIODIZACAO') {
    series = [criarSeriePeriodizacao(1, 'WORK SET')];
  }

  return {
    id: se.id,
    exercicio_id: se.exercicio_id ?? '',
    ordem: se.ordem,
    prescricao_tipo,
    usar_periodizacao: se.usar_periodizacao ?? false,
    observacoes: se.observacoes ?? null,
    series,
  };
}
