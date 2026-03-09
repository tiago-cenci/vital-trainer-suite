import { Rocket, Users, ShieldCheck, Zap } from 'lucide-react';

export function BetaAccess() {
  const goToWaitlist = () => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });

  const perks = [
    {
      icon: Rocket,
      title: 'Acesso 100% gratuito',
      desc: 'Durante toda a fase beta, você usa a plataforma sem custo. Em troca, nos dá feedback real.',
    },
    {
      icon: Users,
      title: 'Vagas limitadas',
      desc: 'Estamos aceitando personal trainers em grupos pequenos para garantir qualidade do suporte.',
    },
    {
      icon: ShieldCheck,
      title: 'Seus dados são seus',
      desc: 'Nada some. Todo histórico, treinos e vídeos são exportáveis a qualquer momento.',
    },
    {
      icon: Zap,
      title: 'Influência direta no produto',
      desc: 'Seu feedback vai para o roadmap. Testadores beta moldam o que vira feature de produção.',
    },
  ];

  return (
    <section id="acesso" className="py-20 lg:py-28 bg-[hsl(var(--bege))]/35">
      <div className="max-w-5xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vinho)/.12)] text-[hsl(var(--vinho))] text-xs font-semibold border border-[hsl(var(--vinho)/.20)] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--vinho))] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--vinho))]"></span>
            </span>
            Beta aberto para personais selecionados
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
            Sem planos, sem cartão.
            <br />
            <span className="text-[hsl(var(--vinho))]">Por enquanto, é tudo grátis.</span>
          </h2>
          <p className="mt-4 text-foreground/60 max-w-xl mx-auto">
            Estamos validando o MUVTRAINER com personal trainers reais. Você usa de graça, nós melhoramos o produto com seu feedback. Simples assim.
          </p>
        </div>

        {/* Cards de benefícios */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {perks.map((p, i) => (
            <div key={i} className="dashboard-card p-6 flex gap-4 items-start">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundImage: 'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))' }}
              >
                <p.icon className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-foreground/65 mt-1">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="dashboard-card p-8 text-center border-2 border-[hsl(var(--vinho)/.25)]">
          <p className="text-lg font-bold">Já tem convite?</p>
          <p className="text-foreground/60 text-sm mt-1 mb-5">
            Acesse direto pela plataforma. Caso ainda não tenha recebido, entre na lista de espera abaixo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/auth">
              <button className="fitness-button inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white" style={{ backgroundImage: 'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))' }}>
                Entrar na plataforma
              </button>
            </a>
            <button
              onClick={goToWaitlist}
              className="px-6 py-2.5 rounded-full font-semibold border border-[hsl(var(--border))] text-foreground/80 hover:border-[hsl(var(--vinho))] hover:text-[hsl(var(--vinho))] transition-colors"
            >
              Quero entrar na lista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
