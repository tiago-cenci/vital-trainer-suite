import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ProblemSolution(){
  const problems = [
    'Vídeos espalhados no WhatsApp',
    'PDFs desatualizados e confusos',
    'Sem comparação de execução ao longo do tempo',
    'Perda de histórico e zero previsibilidade'
  ];
  const solutions = [
    'Web para o personal + app nativo para o aluno',
    'Treinos, vídeos e correções em um só lugar',
    'Histórico de execuções por exercício com evidências',
    'Dashboards de evolução, adesão e SLA'
  ];
  return (
    <section className="py-20 lg:py-28" id="provas">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-12">
          Organização científica ≠ grupo no WhatsApp
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="dashboard-card p-7 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500"/><h3 className="font-bold text-xl">O problema</h3>
            </div>
            <ul className="space-y-3">{problems.map((p,i)=>(
              <li key={i} className="flex gap-3"><AlertCircle className="text-red-500 mt-0.5"/>{p}</li>
            ))}</ul>
          </div>
          <div className="dashboard-card p-7 space-y-4 border-2 border-[hsl(var(--vinho))]/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[hsl(var(--acento))]"/><h3 className="font-bold text-xl">A solução MUVTRAINER</h3>
            </div>
            <ul className="space-y-3">{solutions.map((s,i)=>(
              <li key={i} className="flex gap-3"><CheckCircle2 className="text-[hsl(var(--acento))] mt-0.5"/><span className="font-medium">{s}</span></li>
            ))}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
