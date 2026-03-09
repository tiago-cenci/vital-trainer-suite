import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-fitness.jpg';

export function Hero() {
  const goToWaitlist = () => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });

  const bullets = [
    'Montagem de treinos com IA e periodização real',
    'Correções por vídeo organizadas por exercício',
    'Dashboard de evolução, adesão e SLA de correções',
  ];

  return (
    <section
      className="
        relative overflow-hidden
        bg-[radial-gradient(1200px_500px_at_20%_0%,hsl(var(--acento)/.10),transparent_60%),radial-gradient(900px_400px_at_80%_10%,hsl(var(--vinho)/.10),transparent_60%)]
      "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            {/* Badge Beta pulsando */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vinho)/.12)] text-[hsl(var(--vinho))] text-xs font-semibold border border-[hsl(var(--vinho)/.25)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--vinho))] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--vinho))]"></span>
              </span>
              Beta fechado · Acesso por convite
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[hsl(var(--foreground))]">
              Chega de PDF e gambiarra.
              <br />
              <span className="text-[hsl(var(--vinho))]">Treino sério</span> exige
              <br /> método — e <span className="text-[hsl(var(--vinho))]">MUVTRAINER</span>.
            </h1>

            <p className="mt-5 text-base text-foreground/70 max-w-xl bg-[hsl(var(--vinho)/.06)] border border-[hsl(var(--vinho)/.15)] rounded-xl px-4 py-3">
              Estamos em fase de testes com personal trainers selecionados. Se você recebeu um convite, entre agora. Caso contrário, entre na lista de espera.
            </p>

            <ul className="mt-6 space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/90">
                  <CheckCircle2 className="text-[hsl(var(--success))] mt-0.5 shrink-0" size={18} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button size="lg" className="fitness-button gap-2">
                  <LogIn size={18} /> Já tenho acesso → Entrar
                </Button>
              </Link>
              <button onClick={goToWaitlist}>
                <Button size="lg" variant="outline" className="gap-2">
                  Quero acesso <ArrowRight size={18} />
                </Button>
              </button>
            </div>

            <p className="mt-4 text-xs text-foreground/40">
              Acesso gratuito durante a fase beta · Sem cartão necessário
            </p>
          </div>

          {/* Imagem */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-[0_20px_60px_-25px_rgba(0,0,0,.25)]">
              <img src={heroImage} alt="" className="w-full h-auto" loading="eager" />
            </div>

            {/* Badge flutuante */}
            <div className="hidden md:block absolute -bottom-6 -left-6">
              <div className="dashboard-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--vinho))] to-[hsl(var(--acento))] text-white font-bold flex items-center justify-center text-sm">
                  BETA
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fase de validação</p>
                  <p className="text-sm font-semibold">Testadores ativos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
