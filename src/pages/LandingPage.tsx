/**
 * LandingPage.tsx — MUVTRAINER v3
 * Estrutura enxuta: Problema → Solução → Como funciona → Waitlist → FAQ
 * Carrossel com screenshots reais (assets locais)
 * Botão primary no header: gold sobre escuro (contraste garantido)
 * Totalmente responsivo mobile-first
 */

import { useEffect, useRef, useState } from "react";
import logoImg from "@/assets/muvtrainer-logo.svg";

// ─── Screenshots reais do produto ───────────────────────────────────────────
import imgDashboard from "@/assets/dashboard do personal.png";
import imgCriacaoTreino from "@/assets/criação do treino pelo personal com ou sem periodização em cada exercicio.png";
import imgPeriodizacoes from "@/assets/periodizações personal.png";
import imgMicrociclos from "@/assets/configurações de microciclos do personal.png";
import imgCorrecoes from "@/assets/personal recebe correções avalia pela plataforma.png";
import imgExecucao from "@/assets/app do aluno - execução do treino.png";
import imgEnvioVideo from "@/assets/aluno envio do video e ver correcoes do personal.png";
import imgEvolucao from "@/assets/aluno acompanha evolução da sua execução.png";

const SLIDES_PERSONAL = [
  { src: imgDashboard, label: "Dashboard", desc: "Adesão, SLA e execuções por semana. Você sabe onde intervir hoje." },
  { src: imgCriacaoTreino, label: "Criação de treino", desc: "Monte treinos com periodização por exercício — manual ou ondulatória." },
  { src: imgPeriodizacoes, label: "Periodizações", desc: "Macrociclos com semanas de Choque, Resistência e Ordinária." },
  { src: imgMicrociclos, label: "Microciclos", desc: "Templates de semana com Work Set, Warm-up e Feeder pré-configurados." },
  { src: imgCorrecoes, label: "Fila de correções", desc: "Assista, dê nota de 1-5 e mande feedback direto ao aluno." },
];

const SLIDES_ALUNO = [
  { src: imgExecucao, label: "Execução do treino", desc: "Timer de descanso, séries marcadas e vídeo de referência integrado." },
  { src: imgEnvioVideo, label: "Envio de vídeo", desc: "Grava ou anexa direto do app — vai pro Drive do personal." },
  { src: imgEvolucao, label: "Evolução", desc: "Média de notas por semana. Dá pra ver a melhora ao longo do tempo." },
];

// ─── Carrossel ───────────────────────────────────────────────────────────────
function Carousel({ slides }: { slides: { src: string; label: string; desc: string }[] }) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (i: number) => {
    setActive((i + slides.length) % slides.length);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4500);
  };

  useEffect(() => {
    timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides.length]);

  const s = slides[active];

  return (
    <div className="muv-car">
      <div className="muv-car-stage">
        <img key={active} src={s.src} alt={s.label} className="muv-car-img" loading="lazy" />
        <div className="muv-car-overlay" />
        <div className="muv-car-caption">
          <span className="muv-car-cap-label">{s.label}</span>
          <span className="muv-car-cap-desc">{s.desc}</span>
        </div>
        <button className="muv-car-btn muv-car-btn--l" onClick={() => go(active - 1)} aria-label="Anterior">‹</button>
        <button className="muv-car-btn muv-car-btn--r" onClick={() => go(active + 1)} aria-label="Próximo">›</button>
      </div>
      <div className="muv-car-dots">
        {slides.map((_, i) => (
          <button key={i} className={`muv-car-dot${i === active ? " active" : ""}`} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
      <div className="muv-car-tabs">
        {slides.map((sl, i) => (
          <button key={i} className={`muv-car-tab${i === active ? " active" : ""}`} onClick={() => go(i)}>{sl.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const prev = document.body.style.overflow;
    document.body.style.overflow = "";

    const hdr = document.getElementById("muv-hdr");
    const onScroll = () => hdr?.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });

    const faqData = [
      { q: "Por que o acesso é por convite?", a: "Estamos validando o produto com um grupo seleto de personais. Grupos menores = suporte melhor, feedback mais rápido, produto mais sólido antes de abrir pra todo mundo." },
      { q: "O aluno pode se cadastrar sozinho?", a: "Não. O personal cadastra os alunos pela plataforma, e eles recebem um convite por email pra criar a conta no app." },
      { q: "Por que os vídeos ficam no meu Google Drive?", a: "Não queremos guardar vídeo na nossa infraestrutura — caro, arriscado e você perde o controle. Você conecta o Drive uma vez e a gente organiza tudo por aluno e exercício lá dentro." },
      { q: "É gratuito? Por quanto tempo?", a: "100% gratuito durante o beta. Quando virar produto pago, você vai saber com antecedência. Testadores beta têm condições especiais no lançamento." },
      { q: "E se eu encontrar bugs?", a: "Esperado. Tem canal de feedback direto na plataforma. Todo bug vai pra cima da fila." },
    ];

    const faqList = document.getElementById("muv-faq-list");
    if (faqList && faqList.children.length === 0) {
      faqData.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "muv-faq-item";
        item.innerHTML = `
          <button class="muv-faq-q">
            <span class="muv-faq-n">${String(i + 1).padStart(2, "0")}</span>
            <span class="muv-faq-qt">${f.q}</span>
            <svg class="muv-faq-arr" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="muv-faq-a">${f.a}</div>`;
        item.querySelector("button")?.addEventListener("click", () => {
          const was = item.classList.contains("open");
          document.querySelectorAll(".muv-faq-item.open").forEach(el => el.classList.remove("open"));
          if (!was) item.classList.add("open");
        });
        faqList.appendChild(item);
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.scrollBehavior = "";
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleMobile = () => {
    const nav = document.getElementById("muv-mob-nav");
    const open = nav?.classList.toggle("open");
    document.body.style.overflow = open ? "hidden" : "";
  };

  const handleWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector<HTMLButtonElement>("#muv-submit");
    const email = (form.querySelector<HTMLInputElement>("#muv-email"))?.value ?? "";
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Enviando...";
    // TODO: await supabase.from('waitlist').insert({ name, email, alunos })
    await new Promise(r => setTimeout(r, 900));
    document.getElementById("muv-wl-form")!.style.display = "none";
    document.getElementById("muv-wl-success")!.style.display = "block";
    (document.getElementById("muv-s-email") as HTMLElement).textContent = email;
  };

  return (
    <>
      <style>{css}</style>
      <div className="muv-root">

        {/* HEADER */}
        <header id="muv-hdr" className="muv-hdr">
          <div className="muv-hdr-in">
            <a href="/" className="muv-logo">
              <img src={logoImg} alt="MUV TRAINER" />
            </a>
            <nav className="muv-nav">
              <a href="#problema">O problema</a>
              <a href="#solucao">A solução</a>
              <a href="#produto">O produto</a>
              <a href="#como">Como funciona</a>
              <a href="#lista">Lista de espera</a>
            </nav>
            <div className="muv-hdr-ctas">
              <a href="https://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-g">App do aluno</a>
              <a href="/auth" className="muv-btn muv-btn-p">Personal → Entrar</a>
            </div>
            <button className="muv-mob-btn" onClick={toggleMobile} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </header>

        {/* MOBILE NAV */}
        <div id="muv-mob-nav" className="muv-mob-nav">
          <button className="muv-mob-close" onClick={toggleMobile}>✕</button>
          <nav className="muv-mob-links">
            {["#problema|O problema", "#solucao|A solução", "#produto|O produto", "#como|Como funciona", "#lista|Lista de espera"].map(item => {
              const [href, label] = item.split("|");
              return <a key={href} href={href} onClick={toggleMobile}>{label}</a>;
            })}
          </nav>
          <div className="muv-mob-ctas">
            <a href="https://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-g muv-btn-full" onClick={toggleMobile}>App do aluno</a>
            <a href="/auth" className="muv-btn muv-btn-p muv-btn-full" onClick={toggleMobile}>Personal → Entrar</a>
          </div>
        </div>
        <div className="muv-backdrop" onClick={toggleMobile} />

        {/* HERO */}
        <section className="muv-hero" id="hero">
          <div className="muv-hero-bg" />
          <div className="muv-wrap">
            <div className="muv-hero-inner">
              <div className="muv-hero-text">
                <div className="muv-badge">
                  <span className="muv-dot" />
                  Beta fechado · Acesso por convite
                </div>
                <h1 className="muv-serif muv-hero-h1">
                  Chega de perder aluno<br />
                  por falta<br />
                  <em className="muv-i muv-gold">de organização.</em>
                </h1>
                <div className="muv-rule" />
                <p className="muv-hero-sub">
                  Você atende bem. O problema é que com 30, 40, 50 alunos, o WhatsApp vira bagunça e você começa a perder qualidade — sem querer.
                </p>
                <div className="muv-hero-ctas">
                  <a href="/auth" className="muv-btn muv-btn-p">Personal → Entrar</a>
                  <a href="https://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-o">App do aluno</a>
                </div>
                <a href="#lista" className="muv-hero-link">
                  Ainda não tenho acesso
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </a>
              </div>
              <div className="muv-hero-img">
                <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=80" alt="Personal trainer" />
                <div className="muv-hero-img-ov" />
                <div className="muv-chip muv-chip-top">
                  <div className="muv-chip-ico">FILA</div>
                  <div>
                    <div className="muv-chip-txt">Fila de correções</div>
                    <div className="muv-chip-sub">prioridade automática</div>
                  </div>
                </div>
                <div className="muv-chip muv-chip-bot">
                  <div className="muv-chip-ico">DRIVE</div>
                  <div>
                    <div className="muv-chip-txt">Vídeos no seu Drive</div>
                    <div className="muv-chip-sub">storage zero aqui</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="muv-sec muv-sec-dark" id="problema">
          <div className="muv-wrap">
            <div className="muv-sec-head">
              <span className="muv-label">O problema</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">WhatsApp não é<br /><em className="muv-i muv-gold">ferramenta de trabalho.</em></h2>
              <p>Funciona até uns 20 alunos. Depois disso, começa a desandar.</p>
            </div>
            <div className="muv-ps-grid">
              <div className="muv-ps-card">
                <div className="muv-ps-title muv-ps-bad">✕ Como você lida hoje</div>
                <ul className="muv-ps-list">
                  {["Vídeo perdido no chat — você nem sabe se já corrigiu", "Planilha desatualizada que o aluno não encontra", "Sem saber quem está sumindo ou precisa de atenção agora", "Crescer virou sinônimo de trabalhar mais e atender pior"].map(t => (
                    <li key={t} className="muv-ps-item"><span className="muv-ps-ico muv-ps-ico-bad">✕</span><span>{t}</span></li>
                  ))}
                </ul>
              </div>
              <div className="muv-ps-card">
                <div className="muv-ps-title muv-ps-good">✓ Com o MUV TRAINER</div>
                <ul className="muv-ps-list">
                  {["Fila de correções — você sempre sabe quem atender primeiro", "Treino no app do aluno, versão sempre atualizada, sem reenviar nada", "Dashboard mostra quem está sumindo antes de você perder o aluno", "Escala sem contratar, sem perder qualidade, sem caos"].map(t => (
                    <li key={t} className="muv-ps-item"><span className="muv-ps-ico muv-ps-ico-good">✓</span><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUÇÃO */}
        <section className="muv-sec muv-sec-vinho" id="solucao">
          <div className="muv-wrap">
            <div className="muv-sec-head">
              <span className="muv-label">O que você ganha</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">Dois apps.<br /><em className="muv-i muv-gold">Um para você, um para o aluno.</em></h2>
              <p>Cada um com o que precisa. Sem misturar, sem depender de WhatsApp pra nada.</p>
            </div>
            <div className="muv-sol-grid">
              <div className="muv-sol-card muv-sol-card-p">
                <span className="muv-sol-tag muv-sol-tag-p">● Personal Trainer</span>
                <h3 className="muv-serif muv-sol-h3">Você organiza,<br />corrige e cresce.</h3>
                <ul className="muv-ps-list">
                  {[["Crie treinos", "com periodização — manual ou ondulatória, por exercício"], ["Fila de correções", "nota 1-5 e feedback que o aluno vê no app"], ["Vídeos no seu Drive", "conecta uma vez, tudo organizado por aluno"], ["Dashboard", "adesão e SLA — você sabe onde intervir hoje"]].map(([b, r]) => (
                    <li key={b} className="muv-ps-item"><span className="muv-ps-ico muv-ps-ico-good">✓</span><span><strong className="muv-strong">{b}</strong> — {r}</span></li>
                  ))}
                </ul>
                <a href="/auth" className="muv-btn muv-btn-p muv-btn-full" style={{ marginTop: 28 }}>Entrar como personal →</a>
              </div>
              <div className="muv-sol-card muv-sol-card-a">
                <span className="muv-sol-tag muv-sol-tag-a">● App do Aluno</span>
                <h3 className="muv-serif muv-sol-h3">Treinar ficou<br />simples de verdade.</h3>
                <ul className="muv-ps-list">
                  {[["Treino do dia pronto", "abre o app e já sabe o que fazer"], ["Timer automático", "descanso entre séries sem precisar de relógio"], ["Envia vídeo direto", "o personal já recebe na fila dele"], ["Histórico de correções", "notas e feedback por exercício"]].map(([b, r]) => (
                    <li key={b} className="muv-ps-item"><span className="muv-ps-ico" style={{ color: "rgba(155,205,150,.9)", fontSize: 11, marginTop: 3, flexShrink: 0 }}>✓</span><span><strong className="muv-strong">{b}</strong> — {r}</span></li>
                  ))}
                </ul>
                <a href="https://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-o muv-btn-full" style={{ marginTop: 28 }}>Acessar app do aluno</a>
                <p className="muv-sol-note">Seu personal te cadastra primeiro</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTO — Carrosséis */}
        <section className="muv-sec muv-sec-dark" id="produto">
          <div className="muv-wrap">
            <div className="muv-sec-head">
              <span className="muv-label">Veja o produto</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">Telas reais.<br /><em className="muv-i muv-gold">Sem mockup, sem ilustração.</em></h2>
              <p>O que você vê é o que você usa no beta.</p>
            </div>

            <div className="muv-prod-blk">
              <div className="muv-prod-label">
                <span className="muv-tag muv-tag-p">● Personal Trainer</span>
                <h3 className="muv-serif" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)", marginTop: 14, lineHeight: 1.2 }}>
                  Dashboard, treinos<br />e fila de correções.
                </h3>
                <p style={{ fontSize: 13.5, color: "var(--bege)", lineHeight: 1.7, marginTop: 14 }}>
                  Tudo o que você precisa para organizar a consultoria, montar treinos e corrigir com método.
                </p>
              </div>
              <Carousel slides={SLIDES_PERSONAL} />
            </div>

            <div className="muv-prod-divider" />

            <div className="muv-prod-blk muv-prod-blk-rev">
              <div className="muv-prod-label">
                <span className="muv-tag muv-tag-a">● App do Aluno</span>
                <h3 className="muv-serif" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)", marginTop: 14, lineHeight: 1.2 }}>
                  Executar, filmar<br />e acompanhar.
                </h3>
                <p style={{ fontSize: 13.5, color: "var(--bege)", lineHeight: 1.7, marginTop: 14 }}>
                  O aluno entra no app e já sabe o que fazer. Sem precisar perguntar no WhatsApp.
                </p>
              </div>
              <Carousel slides={SLIDES_ALUNO} />
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="muv-sec muv-sec-vinho" id="como">
          <div className="muv-wrap">
            <div className="muv-sec-head">
              <span className="muv-label">Como funciona</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">Quatro passos.<br /><em className="muv-i muv-gold">Tudo dentro da plataforma.</em></h2>
            </div>
            <div className="muv-steps">
              {[
                { n: "01", who: "Personal", cls: "tag-p", title: "Cria o treino", desc: "Monta com micro e macrociclos. O aluno já recebe no app." },
                { n: "02", who: "Aluno", cls: "tag-a", title: "Executa e filma", desc: "Faz o treino, marca as séries e manda o vídeo pelo app." },
                { n: "03", who: "Personal", cls: "tag-p", title: "Corrige pela fila", desc: "Assiste, dá nota e escreve o feedback. Tudo rastreado." },
                { n: "04", who: "Ambos", cls: "tag-b", title: "Acompanham a evolução", desc: "Dashboard com adesão e progresso. Nada se perde." },
              ].map(s => (
                <div key={s.n} className="muv-step">
                  <span className="muv-step-n">{s.n}</span>
                  <span className={`muv-step-who ${s.cls}`}>{s.who}</span>
                  <h4 className="muv-step-title">{s.title}</h4>
                  <p className="muv-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section className="muv-sec muv-sec-dark" id="lista">
          <div className="muv-wrap-sm">
            <div className="muv-sec-head">
              <span className="muv-label">Lista de espera</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">Quer testar<br /><em className="muv-i muv-gold">antes de todo mundo?</em></h2>
              <p>Priorizamos quem tem mais alunos ativos. Acesso em lotes semanais.</p>
            </div>

            <div id="muv-wl-form">
              <div className="muv-wl-card">
                <form onSubmit={handleWaitlist} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="muv-form-row">
                    <div className="muv-fg"><label htmlFor="muv-nome">Nome</label><input id="muv-nome" type="text" placeholder="Seu nome" required /></div>
                    <div className="muv-fg"><label htmlFor="muv-email">Email</label><input id="muv-email" type="email" placeholder="seu@email.com" required /></div>
                  </div>
                  <div className="muv-fg">
                    <label htmlFor="muv-alunos">Quantos alunos você atende hoje?</label>
                    <select id="muv-alunos" required defaultValue="">
                      <option value="" disabled>Selecione...</option>
                      <option value="0-10">Começando (0–10)</option>
                      <option value="11-30">Em crescimento (11–30)</option>
                      <option value="31-50">Consolidado (31–50)</option>
                      <option value="51+">Alto volume (51+)</option>
                    </select>
                  </div>
                  <div className="muv-chk-row">
                    <input id="muv-lgpd" type="checkbox" required />
                    <label htmlFor="muv-lgpd">
                      Concordo com a <a href="/privacidade">Política de Privacidade</a> e autorizo o MUV TRAINER a me contatar sobre o beta.
                    </label>
                  </div>
                  <button id="muv-submit" type="submit" className="muv-btn muv-btn-p muv-btn-full" style={{ height: 50 }}>
                    Entrar na lista de espera
                  </button>
                  <p className="muv-form-note">Gratuito · Sem cartão · Sem compromisso</p>
                </form>
              </div>
            </div>

            <div id="muv-wl-success" style={{ display: "none" }}>
              <div className="muv-success">
                <div className="muv-success-ico">✓</div>
                <h3 className="muv-serif" style={{ fontSize: "1.6rem", marginBottom: 12 }}>Você está na fila.</h3>
                <p>Avisaremos <strong id="muv-s-email" /> quando liberar.</p>
                <span className="muv-success-badge">Liberamos em lotes semanais</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="muv-sec muv-sec-vinho" id="faq">
          <div className="muv-wrap-sm">
            <div className="muv-sec-head">
              <span className="muv-label">Perguntas frequentes</span>
              <div className="muv-rule muv-rule-c" />
              <h2 className="muv-serif">Dúvidas<br /><em className="muv-i muv-gold">sobre o beta.</em></h2>
            </div>
            <div id="muv-faq-list" className="muv-faq-list" />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="muv-footer">
          <div className="muv-wrap">
            <div className="muv-footer-top">
              <div className="muv-footer-brand">
                <img src={logoImg} alt="MUV TRAINER" style={{ height: 26, marginBottom: 12 }} />
                <p>Para personais que querem crescer sem virar escravo do WhatsApp.</p>
              </div>
              <div className="muv-footer-cols">
                <div className="muv-footer-col">
                  <h4>Plataforma</h4>
                  <a href="#problema">O problema</a>
                  <a href="#solucao">A solução</a>
                  <a href="#como">Como funciona</a>
                </div>
                <div className="muv-footer-col">
                  <h4>Acesso</h4>
                  <a href="/auth">Entrar como personal</a>
                  <a href="https://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer">App do aluno</a>
                  <a href="#lista">Lista de espera</a>
                </div>
                <div className="muv-footer-col">
                  <h4>Legal</h4>
                  <a href="#faq">FAQ</a>
                  <a href="/privacidade">Privacidade (LGPD)</a>
                  <a href="/termos">Termos de uso</a>
                </div>
              </div>
            </div>
            <div className="muv-footer-btm">
              <span>© {new Date().getFullYear()} MUV TRAINER. Todos os direitos reservados.</span>
              <span>v0.2-beta · Em construção ativa</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Josefin+Sans:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

.muv-root {
  --dk:    #3D1614;
  --vinho: #4A1E1D;
  --mid:   #5C2520;
  --bege:  #D1BAAC;
  --cream: #EDE0D4;
  --white: #F5EEE8;
  --gold:  #C4965A;
  --gold2: #D4A96A;
  --bad:   rgba(210,115,95,.9);
  --green: rgba(155,205,150,1);
  --bd:    rgba(209,186,172,.16);
  --bd2:   rgba(209,186,172,.30);
  --hh:    68px;
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--vinho);
  color: var(--cream);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
.muv-root *, .muv-root *::before, .muv-root *::after { box-sizing: border-box; margin: 0; padding: 0 }
.muv-root a   { text-decoration: none; color: inherit }
.muv-root ul  { list-style: none }
.muv-root img { max-width: 100%; display: block }
.muv-root button { font-family: inherit; cursor: pointer }

.muv-wrap    { max-width: 1100px; margin: 0 auto; padding: 0 24px }
.muv-wrap-sm { max-width: 660px;  margin: 0 auto; padding: 0 24px }

.muv-sec       { padding: 88px 0 }
.muv-sec-dark  { background: var(--dk);    border-top: 1px solid var(--bd) }
.muv-sec-vinho { background: var(--vinho); border-top: 1px solid var(--bd) }

.muv-sec-head      { text-align: center; margin-bottom: 52px }
.muv-sec-head h2   { font-size: clamp(1.9rem,3.2vw,2.8rem) }
.muv-sec-head p    { font-size: 14.5px; color: var(--bege); max-width: 480px; margin: 14px auto 0; line-height: 1.75 }

.muv-serif { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; line-height: 1.1; color: var(--white) }
.muv-label { font-family: 'Josefin Sans', sans-serif; font-size: 9.5px; font-weight: 300; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); display: block }
.muv-rule  { width: 44px; height: 1px; background: linear-gradient(90deg, var(--gold), transparent); margin: 16px 0 }
.muv-rule-c{ margin: 16px auto }
.muv-gold  { color: var(--gold) }
.muv-i     { font-style: italic }
.muv-strong{ color: var(--cream) }

/* ── Buttons ── */
.muv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 26px; font-family: 'Josefin Sans', sans-serif; font-size: 10.5px; font-weight: 400; letter-spacing: .15em; text-transform: uppercase; border: none; transition: all .2s; white-space: nowrap }
.muv-btn-full { width: 100%; justify-content: center }
.muv-btn-p { background: var(--gold); color: var(--dk) }
.muv-btn-p:hover { background: var(--gold2); transform: translateY(-1px); box-shadow: 0 5px 18px rgba(0,0,0,.25) }
.muv-btn-o { background: transparent; color: var(--bege); border: 1px solid var(--bd2) }
.muv-btn-o:hover { color: var(--white); border-color: var(--bege) }
.muv-btn-g { background: rgba(209,186,172,.08); color: var(--bege); border: 1px solid var(--bd) }
.muv-btn-g:hover { background: rgba(209,186,172,.15); color: var(--white) }

.muv-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border: 1px solid var(--bd2); font-family: 'Josefin Sans', sans-serif; font-size: 9px; font-weight: 300; letter-spacing: .2em; text-transform: uppercase; color: var(--bege); margin-bottom: 28px }
.muv-dot   { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: pulse 2.5s infinite; flex-shrink: 0 }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }

/* ── Header ── */
.muv-hdr { position: fixed; inset-x: 0; top: 0; z-index: 999; height: var(--hh); background: var(--dk); border-bottom: 1px solid var(--bd2); transition: box-shadow .3s }
.muv-hdr.scrolled { box-shadow: 0 2px 24px rgba(0,0,0,.5) }
.muv-hdr-in { height: 100%; max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center }
.muv-logo { display: flex; align-items: center; flex-shrink: 0; margin-right: 32px }
.muv-logo img { height: 1rem; width: auto }
.muv-nav { display: flex; flex: 1; justify-content: center }
.muv-nav a { font-family: 'Josefin Sans', sans-serif; font-size: 10.5px; font-weight: 300; letter-spacing: .14em; text-transform: uppercase; color: var(--bege); padding: 10px 14px; transition: color .2s }
.muv-nav a:hover { color: var(--white) }
.muv-hdr-ctas { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 16px }
.muv-mob-btn  { display: none; background: none; border: 1px solid var(--bd); padding: 8px; color: var(--bege); margin-left: auto }

/* ── Mobile nav ── */
.muv-mob-nav { display: none; position: fixed; inset: var(--hh) 0 0 auto; width: min(300px, 84vw); z-index: 1000; background: var(--dk); border-left: 1px solid var(--bd2); padding: 24px 22px 40px; flex-direction: column; transform: translateX(100%); transition: transform .28s cubic-bezier(.4,0,.2,1); overflow-y: auto }
.muv-mob-nav.open { display: flex; transform: translateX(0) }
.muv-mob-close { background: none; border: none; color: var(--bege); font-size: 18px; align-self: flex-end; margin-bottom: 20px; padding: 4px 8px }
.muv-mob-links { display: flex; flex-direction: column; border-top: 1px solid var(--bd) }
.muv-mob-links a { font-family: 'Josefin Sans', sans-serif; font-size: 11px; font-weight: 300; letter-spacing: .16em; text-transform: uppercase; color: var(--bege); padding: 16px 0; border-bottom: 1px solid var(--bd); display: block }
.muv-mob-links a:hover { color: var(--white) }
.muv-mob-ctas { margin-top: 24px; display: flex; flex-direction: column; gap: 10px }
.muv-backdrop { display: none; position: fixed; inset: 0; z-index: 998; background: rgba(0,0,0,.5) }

/* ── Hero ── */
.muv-hero { min-height: 100vh; display: flex; align-items: center; padding: calc(var(--hh) + 56px) 0 72px; position: relative; overflow: hidden; background: var(--dk) }
.muv-hero-bg { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 15% 20%, rgba(196,150,90,.07), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(74,30,29,.7), transparent 60%) }
.muv-hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center }
.muv-hero-h1  { font-size: clamp(2.8rem,5.5vw,5rem); margin-bottom: 22px }
.muv-hero-sub { font-size: 15px; color: var(--bege); line-height: 1.75; max-width: 420px; margin-bottom: 32px }
.muv-hero-ctas { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px }
.muv-hero-link { font-family: 'Josefin Sans', sans-serif; font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: rgba(209,186,172,.5); display: inline-flex; align-items: center; gap: 5px; transition: color .2s }
.muv-hero-link:hover { color: var(--bege) }
.muv-hero-img { position: relative }
.muv-hero-img img { width: 100%; border: 1px solid var(--bd2); filter: sepia(.1) contrast(1.05) }
.muv-hero-img-ov { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(35,10,10,.7) 100%) }
.muv-chip { position: absolute; background: var(--mid); border: 1px solid var(--bd2); padding: 10px 14px; display: flex; align-items: center; gap: 9px }
.muv-chip-top { top: -12px; right: -12px }
.muv-chip-bot { bottom: -12px; left: -12px }
.muv-chip-ico { width: 30px; height: 30px; border: 1px solid var(--bd2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'Josefin Sans', sans-serif; font-size: 6.5px; letter-spacing: .06em; color: var(--gold); text-align: center }
.muv-chip-txt { font-family: 'Josefin Sans', sans-serif; font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--cream) }
.muv-chip-sub { font-size: 10px; color: rgba(209,186,172,.5); margin-top: 1px }

/* ── Listas ── */
.muv-ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--bd) }
.muv-ps-card { background: var(--vinho); padding: 36px }
.muv-ps-title { font-family: 'Josefin Sans', sans-serif; font-size: 9.5px; letter-spacing: .2em; text-transform: uppercase; padding-bottom: 18px; margin-bottom: 20px; border-bottom: 1px solid var(--bd) }
.muv-ps-bad  { color: var(--bad) }
.muv-ps-good { color: var(--gold) }
.muv-ps-list { display: flex; flex-direction: column; gap: 12px }
.muv-ps-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: var(--bege); line-height: 1.6 }
.muv-ps-ico  { flex-shrink: 0; font-size: 11px; margin-top: 3px }
.muv-ps-ico-bad  { color: var(--bad) }
.muv-ps-ico-good { color: var(--gold) }

/* ── Solução ── */
.muv-sol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--bd) }
.muv-sol-card   { padding: 36px 32px }
.muv-sol-card-p { background: var(--dk) }
.muv-sol-card-a { background: var(--mid) }
.muv-sol-tag    { font-family: 'Josefin Sans', sans-serif; font-size: 9px; font-weight: 300; letter-spacing: .2em; text-transform: uppercase; display: block; margin-bottom: 14px }
.muv-sol-tag-p  { color: var(--gold) }
.muv-sol-tag-a  { color: var(--green) }
.muv-sol-h3     { font-size: clamp(1.4rem,2.5vw,1.7rem); margin-bottom: 20px }
.muv-sol-note   { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(209,186,172,.38); text-align: center; margin-top: 12px; display: block }

/* ── Produto ── */
.muv-prod-blk { display: grid; grid-template-columns: 260px 1fr; gap: 56px; align-items: start }
.muv-prod-blk-rev { grid-template-columns: 1fr 260px }
.muv-prod-blk-rev .muv-prod-label { order: 2 }
.muv-prod-blk-rev .muv-car        { order: 1 }
.muv-prod-divider { height: 1px; background: var(--bd); margin: 60px 0 }
.muv-tag { display: inline-block; font-family: 'Josefin Sans', sans-serif; font-size: 9px; font-weight: 300; letter-spacing: .2em; text-transform: uppercase; padding: 4px 12px; border: 1px solid }
.muv-tag-p { color: var(--gold);  border-color: rgba(196,150,90,.3);  background: rgba(196,150,90,.07) }
.muv-tag-a { color: var(--green); border-color: rgba(155,205,150,.3); background: rgba(155,205,150,.07) }

/* ── Carrossel ── */
.muv-car { width: 100% }
.muv-car-stage { position: relative; border: 1px solid var(--bd2); background: var(--mid); overflow: hidden }
.muv-car-img { width: 100%; display: block; max-height: 460px; object-fit: cover; object-position: top; animation: cfade .3s ease }
@keyframes cfade { from { opacity: 0 } to { opacity: 1 } }
.muv-car-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(30,8,8,.88) 100%); pointer-events: none }
.muv-car-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 18px 14px; display: flex; flex-direction: column; gap: 4px }
.muv-car-cap-label { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--gold) }
.muv-car-cap-desc  { font-size: 12.5px; color: rgba(237,224,212,.82); line-height: 1.55 }
.muv-car-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; background: rgba(61,22,20,.8); border: 1px solid var(--bd2); color: var(--cream); font-size: 22px; display: flex; align-items: center; justify-content: center; z-index: 2; transition: background .2s; line-height: 1; padding-bottom: 2px }
.muv-car-btn:hover { background: rgba(61,22,20,.96) }
.muv-car-btn--l { left: 8px }
.muv-car-btn--r { right: 8px }
.muv-car-dots { display: flex; justify-content: center; gap: 7px; margin-top: 14px }
.muv-car-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bd2); border: none; transition: background .2s, transform .2s }
.muv-car-dot.active { background: var(--gold); transform: scale(1.35) }
.muv-car-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px }
.muv-car-tab { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .13em; text-transform: uppercase; padding: 5px 11px; border: 1px solid var(--bd); background: transparent; color: rgba(209,186,172,.48); transition: all .18s }
.muv-car-tab.active, .muv-car-tab:hover { background: rgba(196,150,90,.1); border-color: rgba(196,150,90,.38); color: var(--gold) }

/* ── Como funciona ── */
.muv-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--bd) }
.muv-step  { background: var(--dk); padding: 28px 18px; text-align: center; transition: background .2s }
.muv-step:hover { background: var(--mid) }
.muv-step-n     { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300; color: rgba(196,150,90,.22); display: block; margin-bottom: 10px }
.muv-step-who   { display: inline-block; font-family: 'Josefin Sans', sans-serif; font-size: 8px; letter-spacing: .15em; text-transform: uppercase; padding: 3px 8px; margin-bottom: 10px; border: 1px solid }
.tag-p { color: var(--gold);  border-color: rgba(196,150,90,.25);  background: rgba(196,150,90,.06) }
.tag-a { color: var(--green); border-color: rgba(155,205,150,.25); background: rgba(155,205,150,.06) }
.tag-b { color: var(--bege);  border-color: var(--bd) }
.muv-step-title { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 400; color: var(--cream); margin-bottom: 6px }
.muv-step-desc  { font-size: 12px; color: rgba(209,186,172,.6); line-height: 1.55 }

/* ── Waitlist ── */
.muv-wl-card { background: var(--vinho); border: 1px solid var(--bd2); padding: 44px; max-width: 580px; margin: 0 auto }
.muv-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
.muv-fg { display: flex; flex-direction: column; gap: 6px }
.muv-root label { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: rgba(209,186,172,.65) }
.muv-root input, .muv-root select { width: 100%; padding: 11px 13px; background: var(--dk); border: 1px solid var(--bd2); color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color .2s; appearance: none; -webkit-appearance: none }
.muv-root input:focus, .muv-root select:focus { border-color: var(--gold) }
.muv-root input::placeholder { color: rgba(209,186,172,.32) }
.muv-root select option { background: var(--dk); color: var(--white) }
.muv-chk-row { display: flex; align-items: flex-start; gap: 11px; padding: 13px; background: rgba(0,0,0,.15); border: 1px solid var(--bd) }
.muv-root input[type=checkbox] { width: 15px; height: 15px; flex-shrink: 0; accent-color: var(--gold); margin-top: 2px }
.muv-chk-row label { font-size: 12px; color: var(--bege); letter-spacing: 0; text-transform: none; line-height: 1.55 }
.muv-chk-row a { color: var(--gold) }
.muv-form-note { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(209,186,172,.38); text-align: center; margin-top: 4px }
.muv-success { background: var(--vinho); border: 1px solid var(--bd2); padding: 52px 36px; text-align: center; max-width: 460px; margin: 0 auto }
.muv-success-ico { width: 56px; height: 56px; margin: 0 auto 18px; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--gold) }
.muv-success p { font-size: 13.5px; color: var(--bege); line-height: 1.65; margin-bottom: 12px }
.muv-success-badge { display: inline-flex; font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(209,186,172,.38); border: 1px solid var(--bd); padding: 7px 14px }

/* ── FAQ ── */
.muv-faq-list { display: flex; flex-direction: column; border: 1px solid var(--bd) }
.muv-faq-item { border-bottom: 1px solid var(--bd) }
.muv-faq-item:last-child { border-bottom: none }
.muv-faq-q { width: 100%; display: flex; align-items: center; gap: 12px; padding: 18px 20px; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; color: var(--cream); text-align: left; transition: background .15s }
.muv-faq-q:hover { background: rgba(255,255,255,.03) }
.muv-faq-n  { width: 22px; height: 22px; flex-shrink: 0; border: 1px solid var(--bd2); display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-size: 9px; color: var(--gold) }
.muv-faq-qt { flex: 1; line-height: 1.45 }
.muv-faq-arr { width: 14px; height: 14px; stroke: rgba(209,186,172,.4); fill: none; stroke-width: 1.5; flex-shrink: 0; transition: transform .25s }
.muv-faq-item.open .muv-faq-arr { transform: rotate(180deg) }
.muv-faq-a { max-height: 0; overflow: hidden; padding: 0 20px 0 54px; font-size: 13.5px; color: var(--bege); line-height: 1.75; transition: max-height .3s ease, padding .3s }
.muv-faq-item.open .muv-faq-a { max-height: 200px; padding-bottom: 20px }

/* ── Footer ── */
.muv-footer { background: var(--dk); border-top: 1px solid var(--bd); padding: 48px 0 28px }
.muv-footer-top { display: grid; grid-template-columns: 220px 1fr; gap: 48px; padding-bottom: 32px; margin-bottom: 24px; border-bottom: 1px solid var(--bd); align-items: start }
.muv-footer-brand p { font-size: 12px; color: rgba(209,186,172,.45); line-height: 1.65; margin-top: 10px }
.muv-footer-cols { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px }
.muv-footer-col h4 { font-family: 'Josefin Sans', sans-serif; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px }
.muv-footer-col a, .muv-footer-col span { display: block; font-size: 12.5px; color: rgba(209,186,172,.45); margin-bottom: 9px; transition: color .15s; cursor: pointer }
.muv-footer-col a:hover { color: var(--bege) }
.muv-footer-btm { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px }
.muv-footer-btm span { font-family: 'Josefin Sans', sans-serif; font-size: 9.5px; letter-spacing: .1em; color: rgba(209,186,172,.25) }

/* ══ RESPONSIVO ══ */

@media (max-width: 1024px) {
  .muv-hero-inner  { grid-template-columns: 1fr }
  .muv-hero-img    { display: none }
  .muv-hero-h1     { font-size: clamp(2.4rem,6vw,3.8rem) }
  .muv-prod-blk, .muv-prod-blk-rev { grid-template-columns: 1fr; gap: 32px }
  .muv-prod-blk-rev .muv-prod-label { order: 0 }
  .muv-prod-blk-rev .muv-car        { order: 0 }
  .muv-steps { grid-template-columns: repeat(2,1fr) }
  .muv-footer-top  { grid-template-columns: 1fr }
  .muv-footer-cols { grid-template-columns: 1fr 1fr }
}

@media (max-width: 768px) {
  .muv-root { --hh: 60px }
  .muv-sec  { padding: 64px 0 }
  .muv-wrap, .muv-wrap-sm { padding: 0 18px }
  .muv-nav, .muv-hdr-ctas { display: none !important }
  .muv-mob-btn { display: flex }
  .muv-hero   { padding: calc(var(--hh) + 40px) 0 48px; min-height: auto }
  .muv-hero-h1  { font-size: clamp(2.1rem,8vw,2.9rem) }
  .muv-hero-sub { font-size: 14px }
  .muv-hero-ctas { flex-direction: column }
  .muv-hero-ctas .muv-btn { width: 100%; justify-content: center }
  .muv-sec-head    { margin-bottom: 36px }
  .muv-sec-head h2 { font-size: clamp(1.7rem,6vw,2.3rem) }
  .muv-ps-grid, .muv-sol-grid { grid-template-columns: 1fr }
  .muv-ps-card, .muv-sol-card { padding: 24px 18px }
  .muv-car-img  { max-height: 320px }
  .muv-car-tabs { display: none }
  .muv-steps { grid-template-columns: 1fr 1fr }
  .muv-wl-card  { padding: 28px 18px }
  .muv-form-row { grid-template-columns: 1fr }
  .muv-success  { padding: 40px 18px }
  .muv-footer-cols { grid-template-columns: 1fr 1fr }
  .muv-footer-btm  { flex-direction: column; text-align: center }
}

@media (max-width: 480px) {
  .muv-hero-h1  { font-size: clamp(1.9rem,9vw,2.5rem) }
  .muv-steps    { grid-template-columns: 1fr }
  .muv-car-btn  { display: none }
  .muv-car-img  { max-height: 260px }
  .muv-footer-cols { grid-template-columns: 1fr }
}
`;
