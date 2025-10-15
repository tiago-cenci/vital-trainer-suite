import { ClipboardList, Dumbbell, Send, MessageSquare, BarChart3 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: ClipboardList,
      title: 'Configure o onboarding',
      description: 'Personal cria anamnese personalizada, captura fotos iniciais e define metas com o aluno.',
    },
    {
      icon: Dumbbell,
      title: 'Monte treinos com IA',
      description: 'Use periodização e sugestões inteligentes para criar treinos em minutos. Envie pelo app.',
    },
    {
      icon: Send,
      title: 'Aluno executa e envia',
      description: 'Aluno marca séries concluídas e grava vídeos de execução direto no app, organizados por exercício.',
    },
    {
      icon: MessageSquare,
      title: 'Correção estruturada',
      description: 'Personal corrige com vídeo/texto, usa critérios técnicos e gamificação para engajar o aluno.',
    },
    {
      icon: BarChart3,
      title: 'Acompanhe evolução',
      description: 'Dashboards mostram progresso, SLA de correções, adesão e comparativos visuais de execução.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Como funciona na <span className="text-primary">prática</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do primeiro contato até o acompanhamento contínuo, tudo simplificado e profissional.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="dashboard-card p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-start hover-scale"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0">
                  <step.icon className="text-white" size={28} />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 sm:hidden">
                  <span className="text-primary font-bold text-lg">{index + 1}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed sm:ml-13">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
