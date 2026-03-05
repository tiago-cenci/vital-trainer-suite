/**
 * src/utils/dateUtils.ts
 *
 * Utilitário centralizado de formatação de datas para o MUVTRAINER.
 *
 * PROBLEMA CORRIGIDO:
 * O Supabase armazena todas as datas como timestamptz em UTC.
 * Ex: uma correção enviada às 21:59 BRT fica salva como "2026-03-05T00:59:08+00:00".
 * O date-fns puro (format, parseISO) não tem conhecimento de timezone —
 * ele opera no fuso local do ambiente JS, que pode não ser BRT.
 * Resultado: vídeo enviado às 21:59 de dia 4 aparecia como dia 5 ("amanhã").
 *
 * SOLUÇÃO: todas as funções abaixo usam Intl.DateTimeFormat com
 * timeZone: 'America/Sao_Paulo' para garantir exibição correta
 * independentemente do fuso do dispositivo do usuário.
 */

const TZ = 'America/Sao_Paulo';

/**
 * Retorna a chave de data no formato 'YYYY-MM-DD' no fuso BRT.
 * Use para agrupar registros por dia (substitui format(new Date(x), 'yyyy-MM-dd')).
 *
 * Trata dois casos:
 * 1. String com horário e timezone (ex: '2026-03-05T00:59:08+00:00') → converte para BRT
 * 2. String de data pura 'YYYY-MM-DD' (sem horário) → usa o valor diretamente,
 *    pois new Date('YYYY-MM-DD') interpreta como meia-noite UTC, causando off-by-one em BRT.
 *
 * @example
 * toDateKeyBRT('2026-03-05T00:59:08+00:00') // → '2026-03-04'
 * toDateKeyBRT('2026-03-04')                 // → '2026-03-04' (sem conversão)
 */
export function toDateKeyBRT(value: string | Date | null | undefined): string {
  if (!value) return 'sem-data';

  const str = typeof value === 'string' ? value : (value as Date).toISOString();

  // String de data pura YYYY-MM-DD: já é um dia calendário, não converter.
  // new Date('2026-03-04') vira meia-noite UTC = 21h BRT do dia 3 — off-by-one.
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Com horário + timezone: converter para o dia correto em BRT.
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Formata uma chave 'YYYY-MM-DD' (já em BRT) para label legível.
 * Substitui format(new Date(dateKey), "d 'de' MMMM", { locale: ptBR }).
 *
 * @example
 * formatDateKeyLabel('2026-03-04') // → '4 de março'
 */
export function formatDateKeyLabel(dateKey: string): string {
  if (!dateKey || dateKey === 'sem-data') return 'Sem data';
  // Adiciona T12:00:00 para evitar problema de off-by-one ao parsear YYYY-MM-DD
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString('pt-BR', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Formata uma data UTC para exibição no fuso BRT: "04/03/2026".
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data e hora no fuso BRT: "04/03/2026 às 21:59".
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  const date = d.toLocaleDateString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} às ${time}`;
}

/**
 * Retorna string relativa ("agora mesmo", "há 2h", "ontem", "há 3 dias")
 * calculada com base no horário de Brasília.
 */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';

  const now = new Date();
  const date = new Date(value);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  const todayBRT = toDateKeyBRT(now);
  const dateBRT = toDateKeyBRT(date);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayBRT = toDateKeyBRT(yesterday);

  if (dateBRT === todayBRT) {
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    return `há ${diffHrs}h`;
  }
  if (dateBRT === yesterdayBRT) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;

  return formatDate(date);
}

/**
 * Retorna só o horário no fuso BRT: "21:59".
 */
export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}
