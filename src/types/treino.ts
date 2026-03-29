/**
 * treino.ts — Tipos centralizados do domínio de treinos
 * Parte 1: Séries detalhadas por linha
 */

export type TipoSerie = 'WARM-UP' | 'FEEDER' | 'WORK SET';
export type PrescricaoTipo = 'DETALHADA' | 'PERIODIZACAO';

/** Uma série individual com prescrição própria */
export interface SerieLocal {
  /** UUID real do banco, ou string temp_ para séries novas não salvas */
  id: string;
  tipo: TipoSerie;
  ordem: number;
  reps_min: number;
  reps_max: number;
  descanso_seg: number;
  /** Marcado como true quando a linha foi gerada por replicação e ainda não editada manualmente */
  _replicado?: boolean;
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
  // Legado — usado só quando prescricao_tipo === 'DETALHADA' e sem séries individuais
  // (mantido para backward compat; ao salvar, convertemos para series individuais)
  series_qtd?: number;
  reps_min?: number;
  reps_max?: number;
  descanso_seg?: number;
}

/** Uma sessão dentro do treino (estado local do form) */
export interface SessaoLocal {
  /** UUID real ou temp_ */
  id: string;
  nome: string;
  ordem: number;
  exercicios: ExercicioLocal[];
}

// ─── Helpers de criação ────────────────────────────────────────────────

function uid(): string {
  return `temp_${Math.random().toString(36).slice(2, 10)}`;
}

/** Cria uma série com valores padrão, copiando opcionalmente de uma série anterior */
export function criarSerie(
  ordem: number,
  tipo: TipoSerie = 'WORK SET',
  base?: Partial<SerieLocal>
): SerieLocal {
  return {
    id: uid(),
    tipo,
    ordem,
    reps_min: base?.reps_min ?? 8,
    reps_max: base?.reps_max ?? 12,
    descanso_seg: base?.descanso_seg ?? 90,
    _replicado: base !== undefined,
  };
}

/** Cria um bloco de séries padrão para um exercício novo (DETALHADA) */
export function criarSeriesPadrao(
  qtd = 3,
  tipo: TipoSerie = 'WORK SET'
): SerieLocal[] {
  const base = criarSerie(1, tipo);
  return Array.from({ length: qtd }, (_, i) =>
    criarSerie(i + 1, tipo, i === 0 ? undefined : base)
  );
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
    series: periodizacaoAtiva
      ? [] // no modo periodização, séries são criadas ao escolher tipos
      : criarSeriesPadrao(3, 'WORK SET'),
  };
}

/** Cria uma sessão local vazia */
export function criarSessaoLocal(nome: string, ordem: number): SessaoLocal {
  return {
    id: uid(),
    nome,
    ordem,
    exercicios: [],
  };
}

// ─── Replicação ─────────────────────────────────────────────────────────

/**
 * Replica a última série para as N próximas séries do exercício.
 * Mantém tipo diferente se as séries de destino já tiverem tipo definido.
 */
export function replicarUltimaSerie(series: SerieLocal[]): SerieLocal[] {
  if (series.length === 0) return series;
  const ultima = series[series.length - 1];
  const nova = criarSerie(series.length + 1, ultima.tipo, ultima);
  return [...series, nova];
}

/**
 * Replica a configuração (reps + descanso) de todas as séries de um exercício
 * para todas as séries de outro exercício (mesmo número de séries, ou trunca/expande).
 */
export function replicarExercicioParaExercicio(
  origem: ExercicioLocal,
  destino: ExercicioLocal
): ExercicioLocal {
  const novasSeries = destino.series.map((s, i) => {
    const ref = origem.series[i] ?? origem.series[origem.series.length - 1];
    if (!ref) return s;
    return { ...s, reps_min: ref.reps_min, reps_max: ref.reps_max, descanso_seg: ref.descanso_seg, _replicado: true };
  });
  return { ...destino, series: novasSeries };
}

/**
 * Replica configuração de todos os exercícios de uma sessão para outra sessão.
 * Emparelha por índice (exercício 1 → exercício 1, etc.).
 */
export function replicarSessaoParaSessao(
  origem: SessaoLocal,
  destino: SessaoLocal
): SessaoLocal {
  const novosExercicios = destino.exercicios.map((ex, i) => {
    const ref = origem.exercicios[i];
    if (!ref) return ex;
    return replicarExercicioParaExercicio(ref, ex);
  });
  return { ...destino, exercicios: novosExercicios };
}

// ─── Conversão banco → local ─────────────────────────────────────────────

/** Converte uma row do banco (sessao_exercicio + series) para ExercicioLocal */
export function dbToExercicioLocal(
  se: {
    id: string;
    exercicio_id: string;
    ordem: number;
    prescricao_tipo: string;
    usar_periodizacao: boolean;
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
    }[];
  }
): ExercicioLocal {
  const prescricao_tipo = (se.prescricao_tipo ?? 'DETALHADA') as PrescricaoTipo;
  
  let series: SerieLocal[] = [];

  if (se.series && se.series.length > 0) {
    // Séries individuais existem no banco
    series = [...se.series]
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((s, i) => ({
        id: s.id,
        tipo: (s.tipo as TipoSerie) ?? 'WORK SET',
        ordem: s.ordem ?? i + 1,
        reps_min: s.reps_min ?? se.reps_min ?? 8,
        reps_max: s.reps_max ?? se.reps_max ?? 12,
        descanso_seg: s.descanso_seg ?? se.descanso_seg ?? 90,
      }));
  } else if (prescricao_tipo === 'DETALHADA' && se.series_qtd) {
    // Legado: gera séries individuais a partir dos campos globais do exercício
    series = criarSeriesPadrao(se.series_qtd, 'WORK SET').map(s => ({
      ...s,
      reps_min: se.reps_min ?? 8,
      reps_max: se.reps_max ?? 12,
      descanso_seg: se.descanso_seg ?? 90,
    }));
  }

  return {
    id: se.id,
    exercicio_id: se.exercicio_id ?? '',
    ordem: se.ordem,
    prescricao_tipo,
    usar_periodizacao: se.usar_periodizacao ?? false,
    series,
  };
}
