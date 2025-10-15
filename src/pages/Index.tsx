import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Insights } from '@/components/landing/Insights';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { LeadForm } from '@/components/landing/LeadForm';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.title = 'MUVTRAINER — Plataforma científica para personal trainers online';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Crie treinos com IA, receba vídeos, corrija e acompanhe evolução em um só lugar. Escale sua consultoria sem PDFs e WhatsApp.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* 👇 evita sobreposição: padding-top igual à altura do header */}
      <main className="pt-[var(--header-h)]">
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Insights />
        <Testimonials />
        <Pricing />
        <LeadForm />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
