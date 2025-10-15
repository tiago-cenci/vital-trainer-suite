import { Brain, Database, Video, Target, TrendingUp, Cloud } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Brain,
      title: 'Montagem de treinos com IA e periodização',
      description: 'Crie treinos personalizados em minutos com sugestões inteligentes baseadas em periodização científica.',
    },
    {
      icon: Database,
      title: 'Biblioteca de exercícios e métodos',
      description: 'Acesse catálogo completo de exercícios, alongamentos e métodos de treino prontos para usar.',
    },
    {
      icon: Video,
      title: 'Envio de vídeos pelo app',
      description: 'Alunos gravam e enviam execuções direto pelo app, sem ocupar espaço no celular.',
    },
    {
      icon: Target,
      title: 'Correções estruturadas com critérios',
      description: 'Sistema de pontuação e gamificação torna as correções mais engajantes e didáticas.',
    },
    {
      icon: TrendingUp,
      title: 'Histórico e evolução completos',
      description: 'Acompanhe progresso com fotos comparativas, métricas e gráficos de evolução ao longo do tempo.',
    },
    {
      icon: Cloud,
      title: 'Integração com Google Drive',
      description: 'Opcionalmente sincronize mídias com seu Drive para backup automático e organizado por aluno.',
    },
  ];

  return (
    <section id="recursos" className="py-20 lg:py-32 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tudo que você precisa para <span className="text-primary">escalar com qualidade</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recursos pensados para personal trainers que valorizam ciência, organização e resultados.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="dashboard-card p-6 lg:p-8 space-y-4 hover-scale"
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Value */}
        <div className="mt-12 text-center">
          <p className="text-lg text-primary font-semibold">
            Economize horas por semana com automação inteligente e organização profissional
          </p>
        </div>
      </div>
    </section>
  );
}
