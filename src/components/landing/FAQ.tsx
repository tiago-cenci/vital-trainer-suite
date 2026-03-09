import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      q: 'O que é o beta e por que estão pedindo convite?',
      a: 'O MUVTRAINER está em fase de validação com personal trainers selecionados. Liberamos o acesso em grupos menores para conseguir dar suporte de qualidade e iterar rápido com base no uso real.',
    },
    {
      q: 'É gratuito durante o beta?',
      a: 'Sim, 100% gratuito durante toda a fase beta. Quando sair da validação e virar produto oficial, avisaremos com antecedência sobre os planos e preços — e testadores beta terão condições especiais.',
    },
    {
      q: 'Quais funcionalidades já estão disponíveis?',
      a: 'Montagem de treinos com IA e periodização, envio e organização de vídeos pelo app do aluno, correções por critérios técnicos, dashboard de evolução e integração com Google Drive (opcional). Outras features estão em desenvolvimento.',
    },
    {
      q: 'O app do aluno já existe?',
      a: 'Sim. O aluno acessa pelo app nativo onde marca séries, envia vídeos e acompanha o treino. O personal gerencia tudo pelo painel web.',
    },
    {
      q: 'Posso migrar minha base de alunos?',
      a: 'Durante o beta, a importação é manual ou via planilha. Estamos trabalhando em uma ferramenta de migração mais automatizada para versões futuras.',
    },
    {
      q: 'E se eu encontrar um bug?',
      a: 'Esperado e bem-vindo! Temos um canal direto de feedback dentro da plataforma. Todo bug reportado é tratado como prioridade pela equipe.',
    },
    {
      q: 'Meus dados e dos meus alunos ficam seguros?',
      a: 'Sim. Criptografia em trânsito e em repouso, infraestrutura Supabase certificada. Todos os dados são exportáveis a qualquer momento — você nunca fica refém da plataforma.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">Dúvidas frequentes</h2>
        <p className="text-center text-foreground/60 mb-10 text-sm">Sobre o beta, o produto e o que esperar.</p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="dashboard-card px-4">
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-foreground/70">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
