import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Pricing() {
  const scrollToForm = () => {
    const element = document.getElementById('comece-agora');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para quem está começando',
      limit: 'Até 15 alunos',
      features: [
        'Treinos com IA e periodização',
        'Biblioteca de exercícios completa',
        'Correções por vídeo ilimitadas',
        'Dashboard de evolução',
        'Suporte por email',
        'Onboarding personalizado',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 'R$ 197',
      period: '/mês',
      description: 'Para personals em crescimento',
      limit: 'Até 50 alunos',
      features: [
        'Tudo do Starter, mais:',
        'Integração com Google Drive',
        'Relatórios avançados de evolução',
        'Gamificação e pontuação',
        'Templates de periodização',
        'Suporte prioritário',
        'Whitelabel (logo personalizada)',
      ],
      highlighted: true,
    },
    {
      name: 'Scale',
      price: 'R$ 397',
      period: '/mês',
      description: 'Para alta performance',
      limit: 'Alunos ilimitados',
      features: [
        'Tudo do Pro, mais:',
        'API de integração',
        'Múltiplos personals (equipe)',
        'Analytics e BI avançado',
        'Suporte dedicado via WhatsApp',
        'Treinamento da equipe',
        'SLA de resposta garantido',
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="planos" className="py-20 lg:py-32 bg-secondary-light/30 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Planos para <span className="text-primary">cada momento da sua jornada</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem 14 dias de teste grátis. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`dashboard-card p-8 space-y-6 flex flex-col ${
                plan.highlighted ? 'border-2 border-primary shadow-primary' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="py-4">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.limit}</p>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="text-accent shrink-0 mt-0.5" size={18} />
                    <span className="text-foreground/90 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={scrollToForm} className="w-full">
                <Button
                  className={`w-full ${plan.highlighted ? 'fitness-button' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  Começar teste grátis
                </Button>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Todos os preços em reais (BRL). Pagamento seguro via cartão de crédito ou PIX.
          </p>
        </div>
      </div>
    </section>
  );
}
