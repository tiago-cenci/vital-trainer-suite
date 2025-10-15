import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function FinalCTA(){
  const go=()=>document.getElementById('form')?.scrollIntoView({behavior:'smooth'});
  return (
    <section className="relative py-20 lg:py-28 text-white" style={{backgroundImage:'linear-gradient(135deg,hsl(var(--vinho)),hsl(var(--acento)))'}}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-black">Treino sério, atendimento científico, escala real.</h2>
        <p className="mt-2 text-white/90">Junte-se aos profissionais que transformaram o online com método.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={go} className="bg-white text-[hsl(var(--vinho))] rounded-full px-6 py-3 font-semibold">Começar teste grátis</button>
          <Link to="/auth"><Button variant="outline" className="bg-white/10 border-white/30 text-white">Login</Button></Link>
        </div>
      </div>
    </section>
  );
}
