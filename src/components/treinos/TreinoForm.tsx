import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';
import { usePeriodizacoes } from '@/hooks/usePeriodizacoes';

const schema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    ativo: z.boolean().default(true),
    sessoes_semanais: z.coerce.number().int().min(0).default(5),
    aluno_id: z.string().uuid().optional().or(z.literal('')),
    periodizacao_id: z.string().uuid().optional().or(z.literal('')),
});
export type TreinoFormData = z.infer<typeof schema>;

type Props = {
    defaultValues?: Partial<TreinoFormData>;
    onSubmit: (data: TreinoFormData) => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
};

const NONE = '__none';

export function TreinoForm({ defaultValues, onSubmit, onCancel, isSubmitting }: Props) {
    const { alunos = [] } = useAlunos();
    const { periodizacoes = [] } = usePeriodizacoes();

    const { register, handleSubmit, control, formState: { errors } } = useForm<TreinoFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome: '',
            ativo: true,
            sessoes_semanais: 5,
            aluno_id: '',
            periodizacao_id: '',
            ...defaultValues,
        }
    });

    return (
        <Card>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Label>Nome</Label>
                        <Input placeholder="Ex.: Hipertrofia A/B" {...register('nome')} />
                        {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>}
                    </div>
                    <div>
                        <Label>Sessões/semana</Label>
                        <Input type="number" min={0} {...register('sessoes_semanais', { valueAsNumber: true })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Aluno (opcional)</Label>
                        <Controller
                            control={control}
                            name="aluno_id"
                            render={({ field }) => {
                                const value = field.value && field.value.length > 0 ? field.value : NONE;
                                return (
                                    <Select value={value} onValueChange={(v) => field.onChange(v === NONE ? '' : v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>Nenhum</SelectItem>
                                            {alunos.map((a) => (
                                                <SelectItem key={a.id} value={a.id!}>{a.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                    </div>

                    <div>
                        <Label>Periodização (opcional)</Label>
                        <Controller
                            control={control}
                            name="periodizacao_id"
                            render={({ field }) => {
                                const value = field.value && field.value.length > 0 ? field.value : NONE;
                                return (
                                    <Select value={value} onValueChange={(v) => field.onChange(v === NONE ? '' : v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecione uma periodização" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>Nenhuma</SelectItem>
                                            {periodizacoes.map((p) => (
                                                <SelectItem key={p.id} value={p.id!}>{p.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-6 md:mt-7">
                        <Controller
                            control={control}
                            name="ativo"
                            render={({ field }) => (
                                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                            )}
                        />
                        <Label className="!mt-0 cursor-pointer">Ativo</Label>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
