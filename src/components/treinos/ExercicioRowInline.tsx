import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Plus, Trash2, Dumbbell, Zap, Flame, Target, ChevronDown } from "lucide-react";
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Tables } from "@/integrations/supabase/types";
import { ExerciciosSeletor } from "./ExerciciosSeletor";

// ===== Tipos =====
export type TipoSerie = "WORK SET" | "WARM-UP" | "FEEDER";
export type Exercicio = Tables<"exercicios">;
export type Serie = Tables<"series">;

export interface SessaoExercicioLocal {
  id?: string;
  exercicio_id: string;
  ordem: number;
  prescricao_tipo: "DETALHADA" | "PERIODIZACAO";
  series_qtd?: number;
  reps_min?: number;
  reps_max?: number;
  descanso_seg?: number;
  usar_periodizacao: boolean;
  exercicios?: Exercicio;
  series?: Serie[];
}

export interface SessaoLocal {
  id?: string;
  nome: string;
  ordem: number;
  exercicios: SessaoExercicioLocal[];
}

const TIPOS_SERIES = [
  { value: "WARM-UP" as TipoSerie, label: "Warm-up", icon: <Flame className="h-4 w-4" />, desc: "Aquecimento" },
  { value: "FEEDER" as TipoSerie, label: "Feeder", icon: <Zap className="h-4 w-4" />, desc: "Ativação" },
  { value: "WORK SET" as TipoSerie, label: "Work Set", icon: <Target className="h-4 w-4" />, desc: "Séries principais" },
];

function uuid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function expandCountsToSeries(counts: Record<TipoSerie, number>, sessaoExercicioId?: string): Serie[] {
  const list: Serie[] = [];
  (Object.keys(counts) as TipoSerie[]).forEach((tipo) => {
    const n = counts[tipo] ?? 0;
    for (let i = 0; i < n; i++) {
      list.push({ id: `temp_${uuid()}`, sessao_exercicio_id: sessaoExercicioId || "", tipo, created_at: new Date().toISOString() } as Serie);
    }
  });
  return list;
}

// ===== Sortable wrapper =====
function SortableWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute -left-2 top-3 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

// ===== Helpers de resumo (evitar <div> dentro de <p>) =====
function ExercicioSummary({ value, allExercicios }: { value: SessaoExercicioLocal; allExercicios: Exercicio[] }) {
  const ex = allExercicios.find((e) => String(e.id) === String(value.exercicio_id));
  const nome = ex?.nome ?? 'Exercício';
  const isPer = value.prescricao_tipo === 'PERIODIZACAO';

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge variant="secondary">{nome}</Badge>
      {isPer ? (
        <>
          <Badge variant="outline">Periodização</Badge>
          <span className="text-muted-foreground">
            (
            {(() => {
              const counts: Record<TipoSerie, number> = { 'WARM-UP': 0, FEEDER: 0, 'WORK SET': 0 };
              (value.series ?? []).forEach((s) => (counts[s.tipo as TipoSerie] = (counts[s.tipo as TipoSerie] ?? 0) + 1));
              return `${counts['WARM-UP']} WU • ${counts['FEEDER']} FD • ${counts['WORK SET']} WS`;
            })()}
            )
          </span>
        </>
      ) : (
        <>
          <Badge variant="outline">Manual</Badge>
          <span className="text-muted-foreground">
            {value.series_qtd ?? 3}x {value.reps_min ?? 8}–{value.reps_max ?? 12} • {value.descanso_seg ?? 90}s
          </span>
        </>
      )}
    </div>
  );
}


// ===== ExercicioRowInline (colapsável) =====
interface ExercicioRowProps {
  allExercicios: Exercicio[];
  value: SessaoExercicioLocal;
  periodizacaoAtiva: boolean;
  onChange: (updated: SessaoExercicioLocal) => void;
  onRemove: () => void;
  exerciciosJaAdicionados: string[];
}

function ExercicioRowInline({ allExercicios, value, periodizacaoAtiva, onChange, onRemove, exerciciosJaAdicionados }: ExercicioRowProps) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exercicioId, setExercicioId] = useState<string>(value.exercicio_id ?? "");
  const [mode, setMode] = useState<"PERIODIZACAO" | "DETALHADA">(periodizacaoAtiva ? value.prescricao_tipo : "DETALHADA");
  const [counts, setCounts] = useState<Record<TipoSerie, number>>({ "WARM-UP": 2, FEEDER: 1, "WORK SET": 3 });
  const [manual, setManual] = useState({ reps_min: value.reps_min ?? 8, reps_max: value.reps_max ?? 12, descanso_seg: value.descanso_seg ?? 90, series_qtd: value.series_qtd ?? 3 });

  useEffect(() => {
    if (value.series && value.series.length > 0) {
      const c: Record<TipoSerie, number> = { "WARM-UP": 0, FEEDER: 0, "WORK SET": 0 };
      value.series.forEach((s) => (c[s.tipo as TipoSerie] = (c[s.tipo as TipoSerie] ?? 0) + 1));
      setCounts(c);
    }
  }, []);

  useEffect(() => { if (!periodizacaoAtiva) setMode("DETALHADA"); }, [periodizacaoAtiva]);

  useEffect(() => {
    const base = { ...value, exercicio_id: exercicioId, prescricao_tipo: mode, usar_periodizacao: periodizacaoAtiva } as SessaoExercicioLocal;
    if (mode === "PERIODIZACAO") onChange({ ...base, series: expandCountsToSeries(counts, value.id), series_qtd: undefined });
    else onChange({ ...base, ...manual, series: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercicioId, mode, counts, manual]);

  const exercicio = allExercicios.find((e) => String(e.id) === String(exercicioId));
  const jaAdicionados = useMemo(() => exerciciosJaAdicionados.filter((id) => String(id) !== String(exercicioId)), [exerciciosJaAdicionados, exercicioId]);

  return (
    <Card className="border rounded-xl ml-4">
      <CardHeader className="py-2">
        <div className="flex items-center justify-between">
          <ExercicioSummary value={{ ...value, exercicio_id: exercicioId, prescricao_tipo: mode, series: mode === 'PERIODIZACAO' ? expandCountsToSeries(counts) : [] , ...manual }} allExercicios={allExercicios} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>Trocar</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div className="space-y-1">
              <Label>Exercício</Label>
              <div className="flex gap-2">
                <Input readOnly value={exercicio?.nome ?? 'Selecione...'} />
                <Button type="button" onClick={() => setPickerOpen(true)}>Escolher</Button>
              </div>
            </div> */}

            <div className="space-y-1">
              <Label>Modo</Label>
              {periodizacaoAtiva ? (
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="PERIODIZACAO">Periodização</TabsTrigger>
                    <TabsTrigger value="DETALHADA">Manual</TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <div className="text-xs text-muted-foreground">Manual obrigatório</div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {mode === "PERIODIZACAO" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TIPOS_SERIES.map((t) => (
                <div key={t.value} className="space-y-1 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">{t.icon}<Label>{t.label}</Label></div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={counts[t.value]} onChange={(e) => setCounts((c) => ({ ...c, [t.value]: Number(e.target.value || 0) }))} />
                    <span className="text-sm text-muted-foreground">qtd</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Séries</Label>
                <Input type="number" min={1} value={manual.series_qtd ?? 3} onChange={(e) => setManual((m) => ({ ...m, series_qtd: Number(e.target.value || 0) }))} />
              </div>
              <div className="space-y-1">
                <Label>Reps (mín)</Label>
                <Input type="number" min={1} value={manual.reps_min ?? 8} onChange={(e) => setManual((m) => ({ ...m, reps_min: Number(e.target.value || 0) }))} />
              </div>
              <div className="space-y-1">
                <Label>Reps (máx)</Label>
                <Input type="number" min={manual.reps_min ?? 1} value={manual.reps_max ?? 12} onChange={(e) => setManual((m) => ({ ...m, reps_max: Number(e.target.value || 0) }))} />
              </div>
              <div className="space-y-1">
                <Label>Descanso (seg)</Label>
                <Input type="number" min={0} value={manual.descanso_seg ?? 90} onChange={(e) => setManual((m) => ({ ...m, descanso_seg: Number(e.target.value || 0) }))} />
              </div>
            </div>
          )}

          <ExerciciosSeletor
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            exercicios={allExercicios}
            exerciciosJaAdicionados={jaAdicionados}
            onSelectExercicio={(id) => setExercicioId(id)}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ===== Sessão builder (colapsável + reorder) =====
interface SessaoExerciciosInlineBuilderProps {
  sessao: SessaoLocal;
  allExercicios: Exercicio[];
  periodizacaoAtiva: boolean;
  onSessaoChange: (sessao: SessaoLocal) => void;
}

export function SessaoExerciciosInlineBuilder({ sessao, allExercicios, periodizacaoAtiva, onSessaoChange }: SessaoExerciciosInlineBuilderProps) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // ✔️ Hooks sempre no topo (evita alterar ordem)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const itemsIds = (sessao.exercicios ?? []).map((e) => String(e.id ?? e.exercicio_id));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemsIds.indexOf(active.id);
    const newIndex = itemsIds.indexOf(over.id);
    const newArr = arrayMove(sessao.exercicios ?? [], oldIndex, newIndex).map((e, i) => ({ ...e, ordem: i + 1 }));
    onSessaoChange({ ...sessao, exercicios: newArr });
  };

  const resumo = useMemo(() => {
    const exs = sessao.exercicios ?? [];
    const counts: Record<TipoSerie, number> = { "WARM-UP": 0, FEEDER: 0, "WORK SET": 0 };
    let manuais = 0;
    exs.forEach((e) => {
      if (e.prescricao_tipo === "PERIODIZACAO") (e.series ?? []).forEach((s) => (counts[s.tipo as TipoSerie] = (counts[s.tipo as TipoSerie] ?? 0) + 1));
      else manuais += e.series_qtd ?? 0;
    });
    return { qtdEx: exs.length, wu: counts["WARM-UP"], fd: counts["FEEDER"], ws: counts["WORK SET"], manuais };
  }, [sessao.exercicios]);

  const handleSelectToAdd = (exercicioId: string) => {
    const novo: SessaoExercicioLocal = {
      id: `se_${uuid()}`,
      exercicio_id: String(exercicioId),
      ordem: (sessao.exercicios?.length ?? 0) + 1,
      prescricao_tipo: periodizacaoAtiva ? "PERIODIZACAO" : "DETALHADA",
      usar_periodizacao: periodizacaoAtiva,
      series: periodizacaoAtiva ? expandCountsToSeries({ "WARM-UP": 2, FEEDER: 1, "WORK SET": 3 }) : [],
      reps_min: 8,
      reps_max: 12,
      descanso_seg: 90,
      series_qtd: 3,
    };
    onSessaoChange({ ...sessao, exercicios: [...(sessao.exercicios ?? []), novo] });
    setOpen(true);
  };

  const idsJaAdicionados = (sessao.exercicios ?? []).map((e) => String(e.exercicio_id));

  return (
    <Card className="border rounded-xl">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          {/* Título SEM <p> descendente com badges */}
          <div className="flex items-center gap-3">
            <CardTitle className="text-base m-0">Sessão {sessao.nome}</CardTitle>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{resumo.qtdEx} exercícios</Badge>
              <Badge variant="outline">{resumo.wu} WU</Badge>
              <Badge variant="outline">{resumo.fd} FD</Badge>
              <Badge variant="outline">{resumo.ws} WS</Badge>
              <Badge variant="outline">{resumo.manuais} séries manuais</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Arraste para reordenar</div>
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Adicionar exercício
            </Button>
          </div>

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={itemsIds} strategy={rectSortingStrategy}>
              <div className="space-y-2">
                {(sessao.exercicios ?? []).map((ex) => (
                  <SortableWrapper key={String(ex.id ?? ex.exercicio_id)} id={String(ex.id ?? ex.exercicio_id)}>
                    <ExercicioRowInline
                      allExercicios={allExercicios}
                      value={ex}
                      periodizacaoAtiva={periodizacaoAtiva}
                      onChange={(updated) => {
                        const next = (sessao.exercicios ?? []).map((e) => (e === ex ? { ...e, ...updated } : e));
                        onSessaoChange({ ...sessao, exercicios: next });
                      }}
                      onRemove={() => {
                        const arr = [...(sessao.exercicios ?? [])];
                        const idx = arr.findIndex((e) => e === ex);
                        arr.splice(idx, 1);
                        onSessaoChange({ ...sessao, exercicios: arr.map((e, i) => ({ ...e, ordem: i + 1 })) });
                      }}
                      exerciciosJaAdicionados={idsJaAdicionados}
                    />
                  </SortableWrapper>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Modal para adicionar novo exercício */}
          <ExerciciosSeletor
            open={addOpen}
            onOpenChange={setAddOpen}
            exercicios={allExercicios}
            exerciciosJaAdicionados={idsJaAdicionados}
            onSelectExercicio={handleSelectToAdd}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ===== Uso no TreinoForm =====
// <div className="space-y-6">
//   {sessoes.map((sessao, idx) => (
//     <SessaoExerciciosInlineBuilder
//       key={sessao.id || sessao.ordem}
//       sessao={sessao}
//       allExercicios={exercicios}
//       periodizacaoAtiva={watch('usar_periodizacao')}
//       onSessaoChange={(s) => setSessoes((prev) => prev.map((x, i) => (i === idx ? s : x)))}
//     />
//   ))}
// </div>
