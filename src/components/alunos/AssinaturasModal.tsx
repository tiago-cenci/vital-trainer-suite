import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type Aluno = Tables<'alunos'>;
type Assinatura = Tables<'assinaturas'>;

interface AssinaturasModalProps {
  aluno: Aluno;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssinaturasModal({ aluno, open, onOpenChange }: AssinaturasModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAssinatura, setEditingAssinatura] = useState<Assinatura | null>(null);
  const { assinaturas, loading, createAssinatura, updateAssinatura, deleteAssinatura } = useAssinaturas(aluno.id);

  const [formData, setFormData] = useState({
    valor: '',
    forma_pagamento: '',
    data_inicio: '',
    data_vencimento: '',
  });

  const resetForm = () => {
    setFormData({
      valor: '',
      forma_pagamento: '',
      data_inicio: '',
      data_vencimento: '',
    });
    setEditingAssinatura(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assinaturaData = {
      aluno_id: aluno.id,
      valor: parseFloat(formData.valor),
      forma_pagamento: formData.forma_pagamento,
      data_inicio: formData.data_inicio,
      data_vencimento: formData.data_vencimento,
    };

    if (editingAssinatura) {
      updateAssinatura({ id: editingAssinatura.id, ...assinaturaData });
    } else {
      createAssinatura(assinaturaData);
    }
    
    resetForm();
  };

  const handleEdit = (assinatura: Assinatura) => {
    setFormData({
      valor: assinatura.valor.toString(),
      forma_pagamento: assinatura.forma_pagamento || '',
      data_inicio: assinatura.data_inicio,
      data_vencimento: assinatura.data_vencimento,
    });
    setEditingAssinatura(assinatura);
    setShowForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadge = (assinatura: Assinatura) => {
    const today = new Date();
    const vencimento = new Date(assinatura.data_vencimento);
    const inicio = new Date(assinatura.data_inicio);
    
    if (today < inicio) {
      return <Badge variant="outline">Futura</Badge>;
    } else if (today > vencimento) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Assinaturas - {aluno.nome}
          </DialogTitle>
          <DialogDescription>
            Gerencie as assinaturas e pagamentos do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {assinaturas.length} assinatura(s) cadastrada(s)
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Assinatura
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingAssinatura ? 'Editar Assinatura' : 'Nova Assinatura'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                        placeholder="150.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
                      <Select 
                        value={formData.forma_pagamento} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_inicio">Data de Início *</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                      <Input
                        id="data_vencimento"
                        type="date"
                        value={formData.data_vencimento}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {editingAssinatura ? 'Atualizar' : 'Criar'} Assinatura
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Assinaturas */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando assinaturas...
              </div>
            ) : assinaturas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma assinatura cadastrada</p>
                <p className="text-sm">Clique em "Nova Assinatura" para começar</p>
              </div>
            ) : (
              assinaturas.map((assinatura) => (
                <Card key={assinatura.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-lg">
                              {formatCurrency(assinatura.valor)}
                            </span>
                          </div>
                          {getStatusBadge(assinatura)}
                        </div>
                        
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Pagamento:</span>
                            <span>{assinatura.forma_pagamento}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Período:</span>
                            <span>
                              {formatDate(assinatura.data_inicio)} até {formatDate(assinatura.data_vencimento)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(assinatura)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAssinatura(assinatura.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}