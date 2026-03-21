import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, GripVertical, Loader2, Sparkles } from 'lucide-react';
import { useAnamneseCampos, type AnamneseCampo } from '@/hooks/useAnamneseCampos';

const TIPOS_LABEL: Record<string, string> = {
  text: 'Texto curto',
  number: 'Número',
  date: 'Data',
  select: 'Seleção',
  textarea: 'Texto longo',
  boolean: 'Sim/Não',
};

export default function AnamneseConfig() {
  const { campos, loading, seedDefaults, isSeeding, createCampo, updateCampo, deleteCampo } = useAnamneseCampos();
  const [showForm, setShowForm] = useState(false);
  const [editingCampo, setEditingCampo] = useState<AnamneseCampo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({ label: '', tipo: 'text' as AnamneseCampo['tipo'], opcoes: '', obrigatorio: false });

  const openCreate = () => {
    setEditingCampo(null);
    setForm({ label: '', tipo: 'text', opcoes: '', obrigatorio: false });
    setShowForm(true);
  };

  const openEdit = (c: AnamneseCampo) => {
    setEditingCampo(c);
    const opcoes = c.opcoes ? (typeof c.opcoes === 'string' ? JSON.parse(c.opcoes) : c.opcoes) : [];
    setForm({ label: c.label, tipo: c.tipo, opcoes: opcoes.join(', '), obrigatorio: c.obrigatorio });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opcoes = form.tipo === 'select' ? form.opcoes.split(',').map(s => s.trim()).filter(Boolean) : null;
    if (editingCampo) {
      updateCampo({ id: editingCampo.id, label: form.label, tipo: form.tipo, opcoes, obrigatorio: form.obrigatorio });
    } else {
      const maxOrdem = campos.length > 0 ? Math.max(...campos.map(c => c.ordem)) : 0;
      createCampo({ label: form.label, tipo: form.tipo, opcoes, obrigatorio: form.obrigatorio, ordem: maxOrdem + 1 });
    }
    setShowForm(false);
  };

  const handleToggleAtivo = (campo: AnamneseCampo) => {
    updateCampo({ id: campo.id, ativo: !campo.ativo });
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Configurações' }, { label: 'Anamnese' }]}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Campos da Anamnese</h1>
            <p className="text-muted-foreground">Configure quais dados solicitar dos seus alunos</p>
          </div>
          <div className="flex gap-2">
            {campos.length === 0 && !loading && (
              <Button variant="outline" onClick={() => seedDefaults()} disabled={isSeeding} className="gap-2">
                {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Usar campos sugeridos
              </Button>
            )}
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Campo
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium mb-2">Nenhum campo configurado</p>
            <p className="text-sm mb-4">Clique em "Usar campos sugeridos" para começar com um template completo ou adicione campos manualmente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campos.map((campo) => (
              <Card key={campo.id} className={`transition-opacity ${!campo.ativo ? 'opacity-50' : ''}`}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{campo.label}</span>
                      <Badge variant="secondary" className="text-xs">{TIPOS_LABEL[campo.tipo]}</Badge>
                      {campo.obrigatorio && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={campo.ativo} onCheckedChange={() => handleToggleAtivo(campo)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(campo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(campo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={o => !o && setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCampo ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do campo *</Label>
                <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo de resposta *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v as AnamneseCampo['tipo'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPOS_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.tipo === 'select' && (
                <div className="space-y-2">
                  <Label>Opções (separadas por vírgula)</Label>
                  <Input value={form.opcoes} onChange={e => setForm(p => ({ ...p, opcoes: e.target.value }))} placeholder="Opção 1, Opção 2, Opção 3" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={form.obrigatorio} onCheckedChange={c => setForm(p => ({ ...p, obrigatorio: c }))} />
                <Label>Campo obrigatório</Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">{editingCampo ? 'Atualizar' : 'Criar'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir campo?</AlertDialogTitle>
              <AlertDialogDescription>Todas as respostas dos alunos para este campo também serão excluídas.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deletingId) { deleteCampo(deletingId); setDeletingId(null); } }}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
