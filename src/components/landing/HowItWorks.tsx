import { ClipboardList, Dumbbell, Send, MessageSquare, BarChart3 } from 'lucide-react';

export function HowItWorks(){
  const steps = [
    {icon:ClipboardList, title:'Onboarding', desc:'Anamnese, fotos iniciais e metas.'},
    {icon:Dumbbell, title:'Montagem com IA', desc:'Periodização + sugestões em minutos.'},
    {icon:Send, title:'Execução & Vídeo', desc:'Aluno marca séries e envia vídeos pelo app.'},
    {icon:MessageSquare, title:'Correção técnica', desc:'Critérios, gamificação e retorno claro.'},
    {icon:BarChart3, title:'Evolução & Insights', desc:'Adesão, SLA e comparativos visuais.'},
  ];
  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-[hsl(var(--bege))]/35">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">Como funciona na prática</h2>
        <div className="grid lg:grid-cols-5 gap-6">
          {steps.map((s,i)=>(
            <div key={i} className="dashboard-card p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{backgroundImage:'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))'}}>
                <s.icon className="text-white"/>
              </div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-foreground/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
