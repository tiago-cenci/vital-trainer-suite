import { Link } from 'react-router-dom';

export function Footer() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-[hsl(var(--vinho))] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/95">
              <span className="text-[hsl(var(--vinho))] font-black">M</span>
            </div>
            <span className="font-black tracking-tight">MUVTRAINER</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold tracking-widest uppercase">
              Beta
            </span>
          </div>

          <nav className="flex flex-wrap gap-4 text-white/80 text-sm">
            {[
              { id: 'recursos', label: 'Recursos' },
              { id: 'como-funciona', label: 'Como funciona' },
              { id: 'faq', label: 'FAQ' },
              { id: 'waitlist', label: 'Lista de espera' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => go(id)} className="hover:text-white transition-colors">
                {label}
              </button>
            ))}
            <Link to="/auth" className="hover:text-white transition-colors">
              Entrar
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-white/20 pt-4 text-sm text-white/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} MUVTRAINER. Todos os direitos reservados.</span>
          <span className="text-white/40 text-xs">
            v0.1-beta · Produto em desenvolvimento ativo 🔬
          </span>
        </div>
      </div>
    </footer>
  );
}
