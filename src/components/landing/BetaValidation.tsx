import { Users, MessageCircle, Dumbbell } from 'lucide-react';

export function BetaValidation() {
  const stats = [
    {
      icon: Users,
      value: 'Personal trainers',
      label: 'testando agora',
      desc: 'Profissionais selecionados validando o produto em condições reais de trabalho.',
    },
    {
      icon: Dumbbell,
      value: 'Treinos reais',
      label: 'sendo montados na plataforma',
      desc: 'Periodizações com IA sendo testadas com alunos de verdade.',
    },
    {
      icon: MessageCircle,
      value: 'Feedback direto',
      label: 'moldando o roadmap',
      desc: 'Cada sugestão dos testadores vai direto para o backlog de desenvolvimento.',
    },
  ];

  return (
    <section id="beta-validacao" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--vinho)/.10)] text-[hsl(var(--vinho))] text-xs font-semibold border border-[hsl(var(--vinho)/.20)] mb-4">
            Fase de validação ativa
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
            Em uso real por{' '}
            <span className="text-[hsl(var(--vinho))]">personal trainers</span>
          </h2>
          <p className="mt-4 text-foreground/60 max-w-xl mx-auto">
            Ainda não temos 500 cases para mostrar — e está tudo bem. Estamos no começo, construindo com método e com quem usa de verdade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="dashboard-card p-7 hover-scale">
              <div
                className="w-14 h-14 mb-4 rounded-xl flex items-center justify-center"
                style={{ backgroundImage: 'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))' }}
              >
                <s.icon className="text-white" size={24} />
              </div>
              <p className="text-xl font-black text-[hsl(var(--vinho))]">{s.value}</p>
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-sm text-foreground/60 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Aviso honesto */}
        <div className="mt-10 dashboard-card p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center border border-[hsl(var(--vinho)/.15)] bg-[hsl(var(--vinho)/.04)]">
          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--vinho)/.15)]">
            <span className="text-[hsl(var(--vinho))] text-lg">👋</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Uma palavra honesta sobre o beta</p>
            <p className="text-sm text-foreground/65 mt-1">
              O MUVTRAINER está funcional, mas ainda tem arestas. Você vai encontrar bugs, coisas incompletas e mudanças frequentes. Se isso não te assusta, você é exatamente quem queremos nesta fase.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
