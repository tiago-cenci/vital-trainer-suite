import { Link } from 'react-router-dom';

export function FinalCTA() {
  const goToWaitlist = () => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      className="relative py-20 lg:py-28 text-white"
      style={{ backgroundImage: 'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))' }}
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-semibold mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Beta em andamento
        </span>
        <h2 className="text-3xl sm:text-4xl font-black">
          Treino sério, atendimento científico, <br className="hidden sm:block" />
          construído com quem usa de verdade.
        </h2>
        <p className="mt-3 text-white/80 max-w-xl mx-auto">
          Se você é personal trainer e quer parar de depender de PDF e WhatsApp, esse é o momento certo.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <button className="bg-white text-[hsl(var(--vinho))] rounded-full px-7 py-3 font-semibold hover:bg-white/90 transition-colors">
              Já tenho acesso → Entrar
            </button>
          </Link>
          <button
            onClick={goToWaitlist}
            className="bg-white/10 border border-white/30 text-white rounded-full px-7 py-3 font-semibold hover:bg-white/20 transition-colors"
          >
            Entrar na lista de espera
          </button>
        </div>
        <p className="mt-4 text-white/50 text-xs">Gratuito durante a fase beta · Sem cartão</p>
      </div>
    </section>
  );
}
