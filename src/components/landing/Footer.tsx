import { Link } from 'react-router-dom';

export function Footer(){
  const go=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  return (
    <footer className="bg-[hsl(var(--vinho))] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/95"><span className="text-[hsl(var(--vinho))] font-black">M</span></div>
            <span className="font-black tracking-tight">MUVTRAINER</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-white/80">
            {['recursos','como-funciona','casos','planos','faq'].map(id=>(
              <button key={id} onClick={()=>go(id)} className="hover:text-white">{id.replace('-',' ').replace('casos','Provas')}</button>
            ))}
            <Link to="/auth" className="hover:text-white">Login</Link>
          </nav>
        </div>
        <div className="mt-6 border-t border-white/20 pt-4 text-sm text-white/70 flex items-center justify-between">
          <span>© {new Date().getFullYear()} MUVTRAINER. Todos os direitos reservados.</span>
          <span>Feito com método e ciência 🔬</span>
        </div>
      </div>
    </footer>
  );
}
