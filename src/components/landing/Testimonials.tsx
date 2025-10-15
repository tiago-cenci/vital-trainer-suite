import { Quote } from 'lucide-react';

export function Testimonials(){
  const items = [
    {name:'Rafael Costa', role:'Personal Trainer', city:'SP', text:'Dobrei a base sem perder qualidade. Correção por vídeo organizada mudou meu atendimento.'},
    {name:'Juliana Ferreira', role:'Especialista em Periodização', city:'PR', text:'Periodização de verdade. Economia de 10+ horas/semana na montagem com IA.'},
    {name:'Marcos Oliveira', role:'Personal Online', city:'RJ', text:'Meus alunos amam o app; eu amo o dashboard. Adesão clara e intervenção rápida.'},
  ];
  return (
    <section id="casos" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">Personals que escalaram com ciência</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t,i)=>(
            <div key={i} className="dashboard-card p-7 space-y-4 hover-scale">
              <Quote className="text-[hsl(var(--vinho))]/30" size={36}/>
              <p className="italic">{`"${t.text}"`}</p>
              <div className="pt-3 border-t border-[hsl(var(--border))]">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-foreground/70">{t.role} • {t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
