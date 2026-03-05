import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Star } from 'lucide-react';
import { useEvolucaoAluno } from '@/hooks/useCorrecaoExtra';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolucaoChartProps {
  alunoId: string;
}

export function EvolucaoChart({ alunoId }: EvolucaoChartProps) {
  const { data: evolucao = [], isLoading } = useEvolucaoAluno(alunoId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando evolução...
        </CardContent>
      </Card>
    );
  }

  if (evolucao.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Execuções
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Star className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhuma avaliação registrada ainda. As notas aparecerão aqui conforme as correções forem enviadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = evolucao.map(e => ({
    ...e,
    semanaLabel: format(new Date(e.semana + 'T12:00:00'), "dd/MM", { locale: ptBR }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução de Execuções
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Média semanal das notas de correção (1–5 estrelas)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="semanaLabel" 
              className="text-xs" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[1, 2, 3, 4, 5]} 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(1)} ★`, 'Média']}
              labelFormatter={(label) => `Semana de ${label}`}
            />
            <Line
              type="monotone"
              dataKey="media"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
