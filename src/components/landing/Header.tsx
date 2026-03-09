import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/muvtrainer-logo.svg';
import iconLogo from '@/assets/icon-logo.svg';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[hsl(var(--card)/0.85)] backdrop-blur-md border-b border-[hsl(var(--border))] shadow-sm'
          : 'bg-transparent',
      ].join(' ')}
      style={{ height: 'var(--header-h)' }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full flex items-center justify-between gap-6">
          {/* Logo + badge Beta */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <div className="rounded-xl p-1.5 md:p-2 bg-[linear-gradient(135deg,hsl(var(--vinho)/.25),hsl(var(--acento)/.25))]">
              <img
                src={logo}
                alt="MUVTRAINER"
                className="h-7 md:h-8 w-auto object-contain"
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--vinho)/.12)] border border-[hsl(var(--vinho)/.25)] text-[hsl(var(--vinho))] text-[10px] font-bold tracking-widest uppercase">
              Beta
            </span>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#recursos" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Recursos</a>
            <a href="#como-funciona" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Como funciona</a>
            <a href="#faq" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">FAQ</a>
            <a href="#waitlist" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Lista de espera</a>
          </nav>

          {/* Ação única: Login */}
          <div className="hidden md:flex items-center gap-3">
            <Button size="sm" className="bg-black gap-2">
              <a target='blank' href="http://muvtrainer-athlete.lovable.app">Entrar como aluno</a>
            </Button>
            <Link to="/auth">
              <Button size="sm" className="fitness-button gap-2">
                Entrar como personal
              </Button>
            </Link>
          </div>

          {/* Mobile: só ícone */}
          <div className="md:hidden flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[hsl(var(--vinho)/.12)] border border-[hsl(var(--vinho)/.25)] text-[hsl(var(--vinho))] text-[10px] font-bold tracking-widest uppercase">
              Beta
            </span>
            <div className="rounded-xl p-1 bg-[linear-gradient(135deg,hsl(var(--vinho)/.25),hsl(var(--acento)/.25))]">
              <img src={iconLogo} alt="M" className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
