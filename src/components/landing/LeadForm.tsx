import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function LeadForm(){
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(false);
  const [email,setEmail]=useState('');
  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    try{
      // TODO: integrar com /api/leads
      await new Promise(r=>setTimeout(r,1200));
      setOk(true);
    }finally{ setLoading(false); }
  };

  if(ok){
    return (
      <section className="py-20 lg:py-28" id="form">
        <div className="max-w-xl mx-auto px-4 text-center dashboard-card p-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundImage:'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))'}}>
            <CheckCircle2 className="text-white" size={28}/>
          </div>
          <h3 className="text-2xl font-black">Sucesso! 🎉</h3>
          <p className="text-foreground/70">Enviamos as instruções para <b>{email}</b>. Verifique também o spam.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28" id="form">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-8">Comece seu teste grátis</h2>
        <form onSubmit={submit} className="dashboard-card p-8 space-y-5">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input required placeholder="Seu nome"/>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input required type="email" placeholder="seu@email.com" onChange={e=>setEmail(e.target.value)}/>
          </div>
          <div className="space-y-2">
            <Label>Nº de alunos</Label>
            <Select defaultValue="11-30">
              <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="0-10">0–10</SelectItem>
                <SelectItem value="11-30">11–30</SelectItem>
                <SelectItem value="31-50">31–50</SelectItem>
                <SelectItem value="51+">51+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="lgpd" required/>
            <Label htmlFor="lgpd" className="text-sm">Concordo com a Política de Privacidade (LGPD).</Label>
          </div>
          <Button type="submit" className="fitness-button w-full" disabled={loading}>
            {loading? <><Loader2 className="mr-2 animate-spin" /> Processando…</> : 'Começar agora'}
          </Button>
        </form>
      </div>
    </section>
  );
}
