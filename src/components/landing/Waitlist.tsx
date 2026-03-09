import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

export function Waitlist() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: integrar com /api/leads ou Supabase direto
      await new Promise((r) => setTimeout(r, 1200));
      setOk(true);
    } finally {
      setLoading(false);
    }
  };

  if (ok) {
    return (
      <section className="py-20 lg:py-28" id="waitlist">
        <div className="max-w-xl mx-auto px-4 text-center dashboard-card p-10">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundImage: 'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))' }}
          >
            <CheckCircle2 className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-black">Você está na fila! 🎉</h3>
          <p className="text-foreground/70 mt-2">
            Avisaremos <b>{email}</b> assim que liberar acesso. Fique de olho na caixa de entrada (e no spam).
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-foreground/50">
            <Clock size={14} />
            <span>Liberamos acesso em lotes semanais</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28" id="waitlist">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vinho)/.10)] text-[hsl(var(--vinho))] text-xs font-semibold border border-[hsl(var(--vinho)/.20)] mb-3">
            Lista de espera
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">Quer testar antes de todo mundo?</h2>
          <p className="text-foreground/60 mt-2 text-sm">
            Entre na lista. Liberamos acesso por ordem de chegada, priorizando quem tem mais alunos ativos.
          </p>
        </div>

        <form onSubmit={submit} className="dashboard-card p-8 space-y-5">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input required placeholder="Seu nome" />
          </div>
          <div className="space-y-2">
            <Label>Email profissional</Label>
            <Input
              required
              type="email"
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Quantos alunos online você atende hoje?</Label>
            <Select defaultValue="11-30">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-10">0–10 alunos</SelectItem>
                <SelectItem value="11-30">11–30 alunos</SelectItem>
                <SelectItem value="31-50">31–50 alunos</SelectItem>
                <SelectItem value="51+">51+ alunos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="lgpd" required />
            <Label htmlFor="lgpd" className="text-sm text-foreground/70">
              Concordo com a Política de Privacidade (LGPD) e em receber comunicações do MUVTRAINER.
            </Label>
          </div>
          <Button type="submit" className="fitness-button w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" /> Enviando…
              </>
            ) : (
              'Entrar na lista de espera'
            )}
          </Button>
          <p className="text-center text-xs text-foreground/40">
            Gratuito durante o beta · Sem compromisso
          </p>
        </form>
      </div>
    </section>
  );
}
