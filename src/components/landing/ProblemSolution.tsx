import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ProblemSolution() {
  const problems = [
    'Vídeos espalhados no WhatsApp e câmera do celular',
    'PDFs desatualizados e difíceis de gerenciar',
    'Impossível comparar execuções ao longo do tempo',
    'Perda de histórico e falta de organização',
  ];

  const solutions = [
    'Plataforma web para o personal + app nativo para o aluno',
    'Treinos, vídeos e correções centralizados em um só lugar',
    'Histórico completo de execuções por exercício',
    'Dashboard de evolução com fotos, métricas e comparativos',
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary-light/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Do caos à <span className="text-primary">clareza científica</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pare de perder tempo procurando vídeos e mensagens. Centralize tudo em uma plataforma profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Problema */}
            <div className="dashboard-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-destructive" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">O problema</h3>
              </div>
              
              <ul className="space-y-4">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertCircle className="text-destructive shrink-0 mt-1" size={18} />
                    <span className="text-foreground/80">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solução */}
            <div className="dashboard-card p-8 space-y-6 border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">A solução MUVTRAINER</h3>
              </div>
              
              <ul className="space-y-4">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-1" size={18} />
                    <span className="text-foreground/90 font-medium">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
