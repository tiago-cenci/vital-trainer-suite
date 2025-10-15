import { Activity, Clock, Trophy } from 'lucide-react';

export function Insights(){
  const stats = [
    {icon:Activity, value:'850+', label:'execuções/semana', sub:'volume real por personal'},
    {icon:Clock, value:'< 24h', label:'SLA médio', sub:'resposta previsível'},
    {icon:Trophy, value:'Top 5', label:'exercícios do mês', sub:'programação guiada por dados'},
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">Dados e <span className="text-[hsl(var(--vinho))]">insights reais</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((s,i)=>(
            <div key={i} className="dashboard-card p-8 text-center hover-scale">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{backgroundImage:'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))'}}>
                <s.icon className="text-white" size={28}/>
              </div>
              <div className="text-4xl font-black">{s.value}</div>
              <div className="font-semibold">{s.label}</div>
              <div className="text-sm text-foreground/60">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
