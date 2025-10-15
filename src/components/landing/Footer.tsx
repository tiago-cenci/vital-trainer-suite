import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigation = {
    produto: [
      { name: 'Recursos', id: 'recursos' },
      { name: 'Como funciona', id: 'como-funciona' },
      { name: 'Casos', id: 'casos' },
      { name: 'Planos', id: 'planos' },
      { name: 'FAQ', id: 'faq' },
    ],
    empresa: [
      { name: 'Blog', href: '#' },
      { name: 'Política de Privacidade', href: '#' },
      { name: 'Termos de Uso', href: '#' },
      { name: 'LGPD', href: '#' },
    ],
    suporte: [
      { name: 'Central de Ajuda', href: '#' },
      { name: 'Contato', href: 'mailto:contato@muvtrainer.com' },
    ],
  };

  return (
    <footer className="bg-primary text-white py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">MUVTRAINER</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Plataforma científica para personal trainers que valorizam método, organização e resultados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/muvtrainer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:contato@muvtrainer.com"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-3">
              {navigation.produto.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {navigation.empresa.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-3">
              {navigation.suporte.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/auth"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()} MUVTRAINER. Todos os direitos reservados.
          </p>
          <p className="text-white/70 text-sm">
            Feito com método e ciência 🔬
          </p>
        </div>
      </div>
    </footer>
  );
}
