import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { BetaAccess } from '@/components/landing/BetaAccess';
import { BetaValidation } from '@/components/landing/BetaValidation';
import { Waitlist } from '@/components/landing/Waitlist';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { useEffect } from 'react';

// Componentes que NÃO mudam e são reutilizados sem alteração:
// - ProblemSolution ✅ (contexto do produto é válido)
// - Features ✅ (mostra o que o testador vai avaliar)
// - HowItWorks ✅ (fluxo essencial de entendimento)
//
// Componentes removidos/substituídos para o beta:
// - Pricing → BetaAccess (sem pricing, acesso grátis durante beta)
// - Testimonials → BetaValidation (honesto sobre estágio do produto)
// - LeadForm → Waitlist (renomeado e com tom de lista de espera)
// - Insights → removido temporariamente (números reais ainda não disponíveis)

const Index = () => {
  useEffect(() => {
    document.title = 'MUVTRAINER Beta — Plataforma para personal trainers online';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'MUVTRAINER está em beta fechado. Monte treinos com IA, receba vídeos dos alunos, corrija com precisão. Acesso por convite ou lista de espera.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-[var(--header-h)]">
        {/* 1. Hero — badge beta pulsando, CTAs de login e waitlist */}
        <Hero />

        {/* 2. ProblemSolution — mantido: o contexto do produto é válido */}
        <ProblemSolution />

        {/* 3. Features — mantido: mostra o que o testador vai avaliar */}
        <Features />

        {/* 4. HowItWorks — mantido: fluxo essencial */}
        <HowItWorks />

        {/* 5. BetaValidation — substitui Testimonials: honesto sobre o estágio */}
        <BetaValidation />

        {/* 6. BetaAccess — substitui Pricing: acesso grátis, vagas limitadas */}
        <BetaAccess />

        {/* 7. Waitlist — substitui LeadForm genérico: tom de lista de espera */}
        <Waitlist />

        {/* 8. FAQ — atualizado para dúvidas de quem vai testar o beta */}
        <FAQ />

        {/* 9. FinalCTA — adaptado para beta */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
