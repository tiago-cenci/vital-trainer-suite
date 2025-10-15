import { Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Rafael Costa',
      location: 'São Paulo, SP',
      role: 'Personal Trainer',
      quote: 'Consegui dobrar minha base de alunos sem perder qualidade. O sistema de correções por vídeo organizado por exercício mudou completamente meu atendimento.',
    },
    {
      name: 'Juliana Ferreira',
      location: 'Curitiba, PR',
      role: 'Especialista em Periodização',
      quote: 'Finalmente uma plataforma que entende periodização de verdade. Economizo 10+ horas por semana na montagem de treinos com as sugestões de IA.',
    },
    {
      name: 'Marcos Oliveira',
      location: 'Rio de Janeiro, RJ',
      role: 'Personal Online',
      quote: 'Meus alunos adoram o app e eu adoro o dashboard. Consigo ver exatamente quem está aderindo e quem precisa de atenção. Profissionalismo total.',
    },
  ];

  return (
    <section id="casos" className="py-20 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Personals que <span className="text-primary">escalaram com ciência</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados reais de profissionais que levam consultoria online a sério.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="dashboard-card p-8 space-y-6 hover-scale"
            >
              <Quote className="text-primary/30" size={40} />
              
              <p className="text-foreground/90 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              <div className="pt-4 border-t border-border">
                <p className="font-bold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                <p className="text-sm text-primary">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
