import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Pricing(){
  const go=()=>document.getElementById('form')?.scrollIntoView({behavior:'smooth'});
  const plans = [
    {name:'Starter', price:'R$ 97', period:'/mês', limit:'até 15 alunos', highlight:false, feats:[
      'Treinos com IA + periodização','Biblioteca completa','Correções por vídeo','Dashboard de evolução','Onboarding guiado'
    ]},
    {name:'Pro', price:'R$ 197', period:'/mês', limit:'até 50 alunos', highlight:true, feats:[
      'Tudo do Starter','Integração Google Drive','Relatórios avançados','Gamificação por critérios','Templates de micro/macro','Whitelabel'
    ]},
    {name:'Scale', price:'R$ 397', period:'/mês', limit:'alunos ilimitados', highlight:false, feats:[
      'Tudo do Pro','API e múltiplos personals','BI avançado','Suporte dedicado WhatsApp','Treinamento da equipe','SLA garantido'
    ]},
  ];
  return (
    <section id="planos" className="py-20 lg:py-28 bg-[hsl(var(--bege))]/35">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">Planos para cada fase</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p)=>(
            <div key={p.name} className={`relative dashboard-card p-8 flex flex-col ${p.highlight?'border-2 border-[hsl(var(--vinho))] shadow-primary':''}`}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(var(--vinho))] text-white px-3 py-1 rounded-full text-xs font-semibold">Mais popular</span>}
              <div>
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="text-foreground/60">{p.limit}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-black text-[hsl(var(--vinho))]">{p.price}</span>
                  <span className="text-foreground/60">{p.period}</span>
                </div>
              </div>
              <ul className="my-6 space-y-2">{p.feats.map(f=>(
                <li key={f} className="flex gap-2"><Check className="text-[hsl(var(--acento))]" size={18}/><span>{f}</span></li>
              ))}</ul>
              <Button onClick={go} className={p.highlight? 'fitness-button' : ''} variant={p.highlight? 'default':'outline'}>Começar teste grátis</Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-foreground/60 mt-6">14 dias grátis • sem cartão • cancele quando quiser</p>
      </div>
    </section>
  );
}
