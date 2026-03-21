import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import type { AnamneseCampo } from '@/hooks/useAnamneseCampos';
import { useAnamnseRespostas } from '@/hooks/useAnamnseRespostas';

interface AnamneseFormProps {
  alunoId: string;
  campos: AnamneseCampo[];
}

export function AnamneseForm({ alunoId, campos }: AnamneseFormProps) {
  const { respostas, loading, upsertRespostas, isSaving } = useAnamnseRespostas(alunoId);
  const [values, setValues] = useState<Record<string, string>>({});

  const activeCampos = campos.filter(c => c.ativo);

  useEffect(() => {
    if (respostas.length > 0) {
      const map: Record<string, string> = {};
      respostas.forEach(r => { map[r.campo_id] = r.valor || ''; });
      setValues(map);
    }
  }, [respostas]);

  const handleChange = (campoId: string, value: string) => {
    setValues(prev => ({ ...prev, [campoId]: value }));
  };

  const handleSave = () => {
    const data = activeCampos.map(c => ({
      campo_id: c.id,
      valor: values[c.id] || null,
    }));
    upsertRespostas(data);
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando anamnese...</div>;
  }

  if (activeCampos.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Nenhum campo de anamnese configurado.</p>
        <p className="text-sm mt-1">Configure os campos em Configurações → Anamnese.</p>
      </div>
    );
  }

  const parseOpcoes = (opcoes: string[] | null): string[] => {
    if (!opcoes) return [];
    if (typeof opcoes === 'string') {
      try { return JSON.parse(opcoes); } catch { return []; }
    }
    return opcoes;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5">
        {activeCampos.map(campo => {
          const val = values[campo.id] || '';
          return (
            <div key={campo.id} className="space-y-2">
              <Label>
                {campo.label}
                {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
              </Label>

              {campo.tipo === 'text' && (
                <Input value={val} onChange={e => handleChange(campo.id, e.target.value)} />
              )}

              {campo.tipo === 'number' && (
                <Input type="number" step="any" value={val} onChange={e => handleChange(campo.id, e.target.value)} />
              )}

              {campo.tipo === 'date' && (
                <Input type="date" value={val} onChange={e => handleChange(campo.id, e.target.value)} />
              )}

              {campo.tipo === 'textarea' && (
                <Textarea value={val} onChange={e => handleChange(campo.id, e.target.value)} rows={3} />
              )}

              {campo.tipo === 'boolean' && (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={val === 'true'}
                    onCheckedChange={checked => handleChange(campo.id, String(checked))}
                  />
                  <span className="text-sm text-muted-foreground">{val === 'true' ? 'Sim' : 'Não'}</span>
                </div>
              )}

              {campo.tipo === 'select' && (
                <Select value={val} onValueChange={v => handleChange(campo.id, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parseOpcoes(campo.opcoes).map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar Anamnese
      </Button>
    </div>
  );
}
