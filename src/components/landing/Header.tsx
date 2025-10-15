import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/muvtrainer-logo.svg';      // sua logo completa
import iconLogo from '@/assets/icon-logo.svg';  // seu ícone

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
          ? // header sticky mais neutra e legível
            'bg-[hsl(var(--card)/0.85)] backdrop-blur-md border-b border-[hsl(var(--border))] shadow-sm'
          : // no topo: sutil, sem “vermelhão”
            'bg-transparent'
      ].join(' ')}
      style={{ height: 'var(--header-h)' }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full flex items-center justify-between gap-6">
          {/* Logo dentro de “pílula” vinho em degrade bem suave */}
          <Link to="/" className="shrink-0">
            <div className="rounded-xl p-1.5 md:p-2 bg-[linear-gradient(135deg,hsl(var(--vinho)/.25),hsl(var(--acento)/.25))]">
              <img
                src={logo}
                alt="MUVTRAINER"
                className="h-7 md:h-8 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#recursos" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Recursos</a>
            <a href="#como-funciona" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Como funciona</a>
            <a href="#casos" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Casos</a>
            <a href="#planos" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">Planos</a>
            <a href="#faq" className="text-foreground/80 hover:text-[hsl(var(--vinho))] transition-colors">FAQ</a>
          </nav>

          {/* Ações */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <a href="#comece-agora">
              <Button size="sm" className="fitness-button">Começar teste grátis</Button>
            </a>
          </div>

          {/* Ícone apenas — caso queira mostrar no mobile */}
          <div className="md:hidden rounded-xl p-1 bg-[linear-gradient(135deg,hsl(var(--vinho)/.25),hsl(var(--acento)/.25))]">
            <img src={iconLogo} alt="M" className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
