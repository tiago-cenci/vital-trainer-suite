import { Brain, Database, Video, Target, TrendingUp, Cloud } from 'lucide-react';

export function Features(){
  const features = [
    {icon:Brain, title:'IA + periodização', desc:'Sugestões inteligentes por micro/macro, com método.'},
    {icon:Database, title:'Biblioteca & métodos', desc:'Exercícios, alongamentos e métodos prontos.'},
    {icon:Video, title:'Vídeos do aluno', desc:'Envio direto do app, centralizado por exercício.'},
    {icon:Target, title:'Correção por critérios', desc:'Pontuação técnica e retorno didático.'},
    {icon:TrendingUp, title:'Evolução e BI', desc:'Adesão, SLA e comparativos visuais.'},
    {icon:Cloud, title:'Google Drive (opcional)', desc:'Backup automático e pasta organizada.'},
  ];
  return (
    <section id="recursos" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">
          Tudo para escalar <span className="text-[hsl(var(--vinho))]">sem perder qualidade</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f,i)=>(
            <div key={i} className="dashboard-card p-7 hover-scale">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{backgroundImage:'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))'}}>
                <f.icon className="text-white" size={26}/>
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
