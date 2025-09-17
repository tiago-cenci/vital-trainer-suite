import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

type TreinoSummary = {
    id: string;
    nome: string;
    ativo: boolean | null;
    sessoes_semanais: number | null;
};

type Props = {
    treino: TreinoSummary;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function TreinoSummaryCard({ treino, onEdit, onDelete }: Props) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="truncate">{treino.nome}</CardTitle>
                    <Badge variant={treino.ativo ? 'default' : 'secondary'}>
                        {treino.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3 pt-0">
                <div className="text-sm text-muted-foreground">
                    {treino.sessoes_semanais ? `${treino.sessoes_semanais} sessões/semana` : 'Sem frequência definida'}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" type="button" onClick={onEdit}>
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" type="button" onClick={onDelete}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
