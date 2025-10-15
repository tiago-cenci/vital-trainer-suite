import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: 'O que diferencia o MUVTRAINER de apps genéricos de treino?',
      answer:
        'MUVTRAINER é uma plataforma B2B criada especificamente para personal trainers que atendem online com método científico. Diferente de apps genéricos para alunos, oferecemos ferramentas de periodização, correções estruturadas por vídeo, dashboards de evolução e gestão profissional de múltiplos alunos. Nosso foco é na eficiência do personal, não apenas na experiência do aluno.',
    },
    {
      question: 'Como funcionam os vídeos e as correções?',
      answer:
        'O aluno grava vídeos de execução direto no app, que são automaticamente organizados por exercício e sessão. Os vídeos não ocupam espaço no celular do aluno, ficando centralizados na nuvem. O personal acessa pelo dashboard web, assiste, e faz correções com texto, vídeo de retorno e pontuação por critérios técnicos. Todo histórico fica salvo para comparação de evolução.',
    },
    {
      question: 'Posso usar Google Drive para armazenar mídias?',
      answer:
        'Sim! A integração com Google Drive é opcional e disponível nos planos Pro e Scale. Quando ativada, todas as mídias (vídeos e fotos) são automaticamente sincronizadas em uma estrutura organizada no seu Drive (pasta MUVTRAINER > Aluno > Tipo de conteúdo), garantindo backup automático e acesso externo se necessário.',
    },
    {
      question: 'A plataforma ajuda na periodização?',
      answer:
        'Sim, totalmente. MUVTRAINER oferece templates de periodização (linear, ondulatória, bloco) e sugestões de IA baseadas no histórico e objetivos do aluno. Você pode criar microciclos, ajustar intensidades e volumes, e visualizar a progressão de forma clara. A montagem de treinos fica muito mais rápida e científica.',
    },
    {
      question: 'Consigo migrar minha base atual de alunos?',
      answer:
        'Com certeza. Oferecemos suporte completo para onboarding e migração de base. Você pode cadastrar alunos manualmente ou importar via planilha (CSV). Nosso time ajuda a configurar anamneses, treinos e históricos para que a transição seja suave. No plano Scale, oferecemos treinamento personalizado da equipe.',
    },
    {
      question: 'Como funciona o teste grátis e o cancelamento?',
      answer:
        'O teste grátis dura 14 dias e inclui acesso completo a todas as funcionalidades do plano escolhido. Não pedimos cartão de crédito no cadastro. Ao final do teste, você escolhe se quer continuar. O cancelamento pode ser feito a qualquer momento, sem multas ou burocracia — basta um clique no painel.',
    },
    {
      question: 'Como vocês tratam LGPD e segurança dos dados?',
      answer:
        'Levamos privacidade e segurança muito a sério. Todos os dados são criptografados em trânsito e em repouso, hospedados em infraestrutura certificada (AWS/Supabase). Cumprimos integralmente a LGPD, com política de privacidade transparente, consentimento explícito e direitos de acesso/exclusão de dados garantidos. Alunos e personals têm controle total sobre suas informações.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dúvidas <span className="text-primary">frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa saber antes de começar.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="dashboard-card px-6 border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{' '}
            <a href="mailto:contato@muvtrainer.com" className="text-primary font-semibold underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
