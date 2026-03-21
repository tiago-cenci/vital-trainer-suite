import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { useAssinaturas } from '@/hooks/useAssinaturas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type Assinatura = Tables<'assinaturas'>;

interface AssinaturasInlineProps {
  alunoId: string;
}

export function AssinaturasInline({ alunoId }: AssinaturasInlineProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAssinatura, setEditingAssinatura] = useState<Assinatura | null>(null);
  const { assinaturas, loading, createAssinatura, updateAssinatura, deleteAssinatura } = useAssinaturas(alunoId);

  const [formData, setFormData] = useState({ valor: '', forma_pagamento: '', data_inicio: '', data_vencimento: '' });

  const resetForm = () => {
    setFormData({ valor: '', forma_pagamento: '', data_inicio: '', data_vencimento: '' });
    setEditingAssinatura(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { aluno_id: alunoId, valor: parseFloat(formData.valor), forma_pagamento: formData.forma_pagamento, data_inicio: formData.data_inicio, data_vencimento: formData.data_vencimento };
    if (editingAssinatura) { updateAssinatura({ id: editingAssinatura.id, ...data }); } else { createAssinatura(data); }
    resetForm();
  };

  const handleEdit = (a: Assinatura) => {
    setFormData({ valor: a.valor.toString(), forma_pagamento: a.forma_pagamento || '', data_inicio: a.data_inicio, data_vencimento: a.data_vencimento });
    setEditingAssinatura(a);
    setShowForm(true);
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });

  const getStatusBadge = (a: Assinatura) => {
    const today = new Date();
    const venc = new Date(a.data_vencimento);
    const ini = new Date(a.data_inicio);
    if (today < ini) return <Badge variant="outline">Futura</Badge>;
    if (today > venc) return <Badge variant="destructive">Vencida</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{assinaturas.length} assinatura(s)</div>
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nova Assinatura</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">{editingAssinatura ? 'Editar' : 'Nova'} Assinatura</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Valor *</Label><Input type="number" step="0.01" value={formData.valor} onChange={e => setFormData(p => ({ ...p, valor: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Forma de Pagamento *</Label>
                  <Select value={formData.forma_pagamento} onValueChange={v => setFormData(p => ({ ...p, forma_pagamento: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'PIX', 'Transferência'].map(fp => <SelectItem key={fp} value={fp}>{fp}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Data de Início *</Label><Input type="date" value={formData.data_inicio} onChange={e => setFormData(p => ({ ...p, data_inicio: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Data de Vencimento *</Label><Input type="date" value={formData.data_vencimento} onChange={e => setFormData(p => ({ ...p, data_vencimento: e.target.value }))} required /></div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">{editingAssinatura ? 'Atualizar' : 'Criar'}</Button>
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : assinaturas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma assinatura cadastrada</p>
        </div>
      ) : (
        assinaturas.map(a => (
          <Card key={a.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-semibold text-lg">{formatCurrency(a.valor)}</span></div>
                    {getStatusBadge(a)}
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">Pagamento:</span><span>{a.forma_pagamento}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate(a.data_inicio)} até {formatDate(a.data_vencimento)}</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteAssinatura(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
