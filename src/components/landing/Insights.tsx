import { Activity, Clock, Trophy } from 'lucide-react';

export function Insights() {
  const stats = [
    {
      icon: Activity,
      value: '850+',
      label: 'Execuções por semana',
      description: 'Volume médio de vídeos enviados por personal',
    },
    {
      icon: Clock,
      value: '< 24h',
      label: 'SLA médio de correção',
      description: 'Tempo de resposta profissional e consistente',
    },
    {
      icon: Trophy,
      value: 'Top 5',
      label: 'Exercícios mais realizados',
      description: 'Insights para ajustar programação',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary-light/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dados e <span className="text-primary">insights reais</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize métricas importantes e tome decisões baseadas em dados concretos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="dashboard-card p-8 text-center space-y-4 hover-scale"
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <stat.icon className="text-white" size={32} />
              </div>
              <div className="space-y-2">
                <div className="stat-number">{stat.value}</div>
                <h3 className="text-lg font-bold text-foreground">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
