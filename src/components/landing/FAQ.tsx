import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ(){
  const faqs = [
    {q:'Diferença vs. apps genéricos?', a:'MUVTRAINER é B2B para o personal: periodização, correção técnica, dashboards e gestão multi-aluno. O foco é a eficiência e a escala do profissional.'},
    {q:'Como funcionam vídeos e correções?', a:'Aluno grava no app; tudo fica organizado por exercício e sessão. Você corrige por texto/vídeo com critérios e histórico salvo.'},
    {q:'Posso usar Google Drive?', a:'Sim, opcional nos planos Pro/Scale. Sincronização automática por aluno/pasta.'},
    {q:'Ajuda na periodização?', a:'Sim. Templates (linear, ondulatória, bloco) + IA e histórico para montar rápido e com método.'},
    {q:'Migração de base?', a:'Suporte de onboarding e importação por planilha. No Scale, treinamento da equipe.'},
    {q:'Teste grátis e cancelamento?', a:'14 dias grátis, sem cartão. Cancele a qualquer momento.'},
    {q:'LGPD e segurança?', a:'Criptografia em trânsito/repouso, infraestrutura certificada e consentimento claro.'},
  ];
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-10">Dúvidas frequentes</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f,i)=>(
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
