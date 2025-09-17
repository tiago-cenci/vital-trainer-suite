import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Dumbbell, Pencil } from 'lucide-react';
import { useExercicios } from '@/hooks/useExercicios';
import { useTreinos } from '@/hooks/useTreinos';

type TreinoCardItem = ReturnType<typeof useTreinos>['treinos'][number];

type TreinoCardProps = {
    treino: TreinoCardItem;
    onEdit?: (treino: TreinoCardItem) => void;
    onDelete?: (treino: TreinoCardItem) => void;
};

export function TreinoCard({ treino, onEdit, onDelete }: TreinoCardProps) {
    const { addSessao, removeSessao, addSessaoExercicio, removeSessaoExercicio, addSerie, removeSerie, tipoSerieEnum } = useTreinos();
    const { exercicios = [] } = useExercicios();
    const [novaSessao, setNovaSessao] = useState<string>('');
    const [ordemEx, setOrdemEx] = useState<Record<string, number>>({});

    const tipoSerieList = useMemo(() => Object.values(tipoSerieEnum), [tipoSerieEnum]);

    return (
        <Card className="flex flex-col">
            <CardHeader className="space-y-1">
                <div className="flex items-start justify-between">
                    <CardTitle className="truncate">{treino.nome}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={treino.ativo ? 'default' : 'secondary'}>
                            {treino.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {onEdit && (
                            <Button variant="outline" size="sm" type="button" onClick={() => onEdit?.(treino)}>
                                <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="destructive" size="sm" type="button" onClick={() => onDelete?.(treino)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Excluir
                            </Button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {treino.sessoes_semanais ? `${treino.sessoes_semanais} sessões/semana` : 'Sem frequência definida'}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Adicionar sessão */}
                <div className="flex gap-2">
                    <Input placeholder="Nome da sessão (ex.: Treino A)" value={novaSessao} onChange={(e) => setNovaSessao(e.target.value)} />
                    <Button
                        type="button"
                        onClick={() => {
                            if (!novaSessao.trim()) return;
                            addSessao.mutate({ treino_id: treino.id, nome: novaSessao.trim() });
                            setNovaSessao('');
                        }}
                    ><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
                </div>

                {/* Listar sessões */}
                {treino.sessoes?.map((s) => (
                    <div key={s.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{s.nome}</h4>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSessao.mutate(s.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Adicionar exercício na sessão */}
                        <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
                            <div className="flex-1">
                                <Label className="text-xs">Exercício</Label>
                                <Select
                                    onValueChange={(exercicio_id) => {
                                        const ordem = ordemEx[s.id!] ?? (s.sessoes_exercicios?.length ?? 0) + 1;
                                        addSessaoExercicio.mutate({ sessao_id: s.id, exercicio_id, ordem });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exercicios.map((e) => (
                                            <SelectItem key={e.id} value={e.id!}>
                                                <div className="flex items-center gap-2">
                                                    <Dumbbell className="h-3 w-3" /> {e.nome}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Ordem</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    className="w-24"
                                    value={ordemEx[s.id!] ?? ((s.sessoes_exercicios?.length ?? 0) + 1)}
                                    onChange={(e) => setOrdemEx((prev) => ({ ...prev, [s.id!]: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        {/* Exercícios da sessão */}
                        <div className="space-y-2">
                            {s.sessoes_exercicios?.sort((a, b) => a.ordem - b.ordem).map((se) => (
                                <div key={se.id} className="rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="font-medium">#{se.ordem}</span>{' '}
                                            {exercicios.find(e => e.id === se.exercicio_id)?.nome ?? 'Exercício'}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSessaoExercicio.mutate(se.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Séries */}
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-end gap-2">
                                            <div className="w-56">
                                                <Label className="text-xs">Tipo da série</Label>
                                                <Select
                                                    onValueChange={(tipo) =>
                                                        addSerie.mutate({ sessao_exercicio_id: se.id, tipo: tipo as any })
                                                    }
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                                                    <SelectContent>
                                                        {tipoSerieList.map((t) => (
                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="button" onClick={() => addSerie.mutate({ sessao_exercicio_id: se.id, tipo: tipoSerieList[0] as any })}>
                                                <Plus className="mr-2 h-4 w-4" />Adicionar série
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {se.series?.map((sr) => (
                                                <div key={sr.id} className="text-xs border rounded px-2 py-1 flex items-center gap-2">
                                                    <span>{sr.tipo}</span>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSerie.mutate(sr.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
