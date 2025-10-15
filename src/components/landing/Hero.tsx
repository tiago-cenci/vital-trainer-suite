import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-fitness.jpg';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    'Montagem de treinos com IA e periodização',
    'Correções por vídeo organizadas por exercício',
    'Dashboard de evolução e SLA de correções',
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary-light to-background opacity-60" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <CheckCircle2 size={16} />
                Consultoria online de alta performance
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                MUVTRAINER — Consultoria online{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  guiada pela ciência
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                Crie treinos em minutos, acompanhe com precisão e escale sua consultoria sem confusão de PDFs e WhatsApp.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 justify-center lg:justify-start">
                  <CheckCircle2 className="text-accent shrink-0 mt-1" size={20} />
                  <span className="text-foreground/90">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => scrollToSection('comece-agora')}>
                <Button size="lg" className="fitness-button w-full sm:w-auto">
                  Começar teste grátis
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </button>
              <button onClick={() => scrollToSection('recursos')}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver recursos
                </Button>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">+200 alunos por personal</span> sem perder qualidade
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-primary">
              <img
                src={heroImage}
                alt="Dashboard MUVTRAINER mostrando gestão de treinos e evolução de alunos"
                className="w-full h-auto"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-card hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">95%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de adesão</p>
                  <p className="text-sm font-semibold text-foreground">Treinos concluídos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
