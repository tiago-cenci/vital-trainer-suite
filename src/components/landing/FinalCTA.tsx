import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const scrollToForm = () => {
    const element = document.getElementById('comece-agora');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Pronto para escalar sua consultoria sem perder a qualidade?
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Junte-se a centenas de personal trainers que já transformaram sua forma de atender online com método científico e organização profissional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button onClick={scrollToForm}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-primary font-semibold">
                Começar teste grátis
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </button>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                Já tenho conta — Login
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/70 pt-4">
            14 dias grátis • Sem cartão necessário • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
