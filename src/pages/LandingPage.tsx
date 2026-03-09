/**
 * LandingPage.tsx
 * 
 * Landing page standalone do MUVTRAINER.
 * Renderiza HTML/CSS autocontido para garantir identidade visual
 * independente das variáveis CSS do tema (shadcn/Tailwind light mode).
 * 
 * Uso no router:
 *   <Route path="/" element={<LandingPage />} />
 * 
 * Assets necessários em src/assets/:
 *   - muvtrainer-logo.png  (logo com fundo vinho)
 *   - muvtrainer-logo.svg  (logo vetorial, mesmos paths)
 */

import { useEffect } from "react";

// ─── Importa a logo — Vite resolve o path e faz hash do arquivo ───
import logoImg from "@/assets/muvtrainer-logo.svg";
// Se tiver o SVG também: import logoSvg from "@/assets/muvtrainer-logo.svg";

export default function LandingPage() {
  // Injeta os estilos globais da landing (escopo isolado pelo prefixo .muv-)
  useEffect(() => {
    // Garante scroll suave e remove overflow-hidden que o app pode ter setado
    document.documentElement.style.scrollBehavior = "smooth";
    const prev = document.body.style.overflow;
    document.body.style.overflow = "";

    // Header scroll effect
    const hdr = document.getElementById("muv-hdr");
    const onScroll = () => {
      hdr?.classList.toggle("muv-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // FAQ accordion
    const faqData = [
      {
        q: "O que é o beta e por que o acesso é por convite?",
        a: "O MUV TRAINER está em validação com personal trainers selecionados. Liberamos em grupos menores para garantir suporte de qualidade, iterar rápido com base no uso real e validar as hipóteses do produto antes de escalar.",
      },
      {
        q: "Preciso ser personal para usar? E o aluno?",
        a: "O personal trainer se cadastra pelo painel web e configura sua conta. Depois, ele cadastra seus alunos — que acessam pelo app nativo. O aluno não pode se cadastrar sozinho, precisa ser vinculado a um personal.",
      },
      {
        q: "Por que os vídeos ficam no meu Google Drive?",
        a: "Decisão arquitetural consciente: não armazenamos vídeos na nossa infraestrutura. Cada personal conecta seu Drive via OAuth. O sistema cria a estrutura de pastas por aluno e exercício. Resultado: custo zero de storage, redução de risco LGPD e controle total dos dados.",
      },
      {
        q: "É gratuito? Por quanto tempo?",
        a: "Sim, 100% gratuito durante o beta. Quando virar produto comercial, avisaremos com antecedência. Testadores beta terão condições diferenciadas no lançamento.",
      },
      {
        q: "O que já está disponível no MVP?",
        a: "Cadastro de alunos, criação e edição de treinos, gestão de correções com fila de prioridade, integração com Google Drive, dashboard operacional simples e app do aluno com registro de cargas e envio de vídeos.",
      },
      {
        q: "O que está fora do MVP intencionalmente?",
        a: "IA para geração de treinos, gamificação, pagamentos integrados e avaliação postural automatizada. Trade-off consciente: foco no core operacional primeiro.",
      },
      {
        q: "E se eu encontrar bugs?",
        a: "Esperado e bem-vindo. Há um canal direto de feedback dentro da plataforma. Todo bug reportado vai para o topo da fila de prioridade da equipe.",
      },
    ];

    const faqList = document.getElementById("muv-faq-list");
    if (faqList && faqList.children.length === 0) {
      faqData.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "muv-faq-item";
        item.innerHTML = `
          <button class="muv-faq-q" type="button">
            <span class="muv-faq-n">${String(i + 1).padStart(2, "0")}</span>
            <span class="muv-faq-q-text">${f.q}</span>
            <svg class="muv-faq-arr" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="muv-faq-a">${f.a}</div>
        `;
        item.querySelector("button")?.addEventListener("click", () => {
          const wasOpen = item.classList.contains("open");
          document
            .querySelectorAll(".muv-faq-item.open")
            .forEach((el) => el.classList.remove("open"));
          if (!wasOpen) item.classList.add("open");
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

  // Waitlist submit (TODO: integrar Supabase)
  const handleWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector<HTMLButtonElement>("#muv-wl-btn");
    const emailInput = form.querySelector<HTMLInputElement>("#muv-email");
    if (!btn || !emailInput) return;

    btn.disabled = true;
    btn.textContent = "Enviando...";

    // TODO: substituir pelo insert no Supabase
    // const { error } = await supabase.from('waitlist').insert({
    //   name: (form.querySelector('#muv-nome') as HTMLInputElement).value,
    //   email: emailInput.value,
    //   alunos: (form.querySelector('#muv-alunos') as HTMLSelectElement).value,
    // });

    await new Promise((r) => setTimeout(r, 900));

    const formEl = document.getElementById("muv-wl-form");
    const successEl = document.getElementById("muv-wl-success");
    const semailEl = document.getElementById("muv-semail");
    if (formEl) formEl.style.display = "none";
    if (successEl) successEl.style.display = "block";
    if (semailEl) semailEl.textContent = emailInput.value;
  };

  const toggleMobile = () => {
    document.getElementById("muv-mobile-nav")?.classList.toggle("open");
  };

  return (
    <>
      {/* ── Estilos isolados da landing (prefixo .muv-) ── */}
      <style>{landingCSS}</style>

      <div className="muv-root">
        {/* ─── HEADER ─── */}
        <header id="muv-hdr" className="muv-header">
          {/* SEM muv-wrap — o inner usa padding próprio para 100% de largura */}
          <div className="muv-header-inner">
            <a href="/" className="muv-logo-wrap">
              <img src={logoImg} alt="MUV TRAINER" className="muv-logo-img" />
            </a>
            <nav className="muv-nav">
              <a href="#muv-para-voce">Para você</a>
              <a href="#muv-recursos">Recursos</a>
              <a href="#muv-como-funciona">Como funciona</a>
              <a href="#muv-faq">FAQ</a>
              <a href="#muv-waitlist">Lista de espera</a>
            </nav>
            <div className="muv-header-ctas">
              <a
                href="http://muvtrainer-athlete.lovable.app"
                target="_blank"
                rel="noreferrer"
                className="muv-btn muv-btn-ghost"
              >
                App do aluno
              </a>
              <a href="/auth" className="muv-btn muv-btn-primary">
                Personal → Entrar
              </a>
            </div>
            <button
              className="muv-mobile-btn"
              onClick={toggleMobile}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="muv-mobile-nav" id="muv-mobile-nav">
          <nav className="muv-nav">
            <a href="#muv-para-voce" onClick={toggleMobile}>Para você</a>
            <a href="#muv-recursos" onClick={toggleMobile}>Recursos</a>
            <a href="#muv-como-funciona" onClick={toggleMobile}>Como funciona</a>
            <a href="#muv-faq" onClick={toggleMobile}>FAQ</a>
            <a href="#muv-waitlist" onClick={toggleMobile}>Lista de espera</a>
          </nav>
          <div className="muv-header-ctas" style={{ flexDirection: "column", marginTop: 20 }}>
            <a href="http://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-ghost">App do aluno</a>
            <a href="/auth" className="muv-btn muv-btn-primary">Sou personal — Entrar</a>
          </div>
        </div>

        {/* ─── HERO ─── */}
        <section className="muv-hero" id="muv-hero">
          <div className="muv-hero-bg" />
          <div className="muv-hero-noise" />
          <div className="muv-wrap">
            <div className="muv-hero-inner">
              <div className="muv-hero-text">
                <div className="muv-badge" style={{ marginBottom: 28 }}>
                  <span className="muv-badge-dot" />
                  Beta fechado · Acesso por convite
                </div>
                <h1 className="muv-display muv-hero-h1">
                  Gestão científica<br />
                  para personal<br />
                  <em className="muv-italic muv-gold">de alto rendimento.</em>
                </h1>
                <div className="muv-rule" />
                <p className="muv-hero-sub">
                  Personal trainers que faturam acima de R$10k/mês perdem controle quando superam 50 alunos. WhatsApp, planilhas e Google Drive separados não escalam.
                </p>
                <blockquote className="muv-hero-quote">
                  "Quero organizar treinos, correções e alunos em um único lugar, para escalar meu negócio sem perder controle nem qualidade."
                </blockquote>
                <div className="muv-hero-ctas">
                  <a href="/auth" className="muv-btn muv-btn-primary">Sou personal — Entrar</a>
                  <a href="http://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-outline">App do aluno</a>
                </div>
                <a href="#muv-waitlist" className="muv-hero-link">
                  Ainda não tenho acesso
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </a>
                <div className="muv-metrics">
                  <div className="muv-metric"><span className="muv-metric-v">Beta</span><span className="muv-metric-l">em andamento</span></div>
                  <div className="muv-metric"><span className="muv-metric-v">100%</span><span className="muv-metric-l">gratuito agora</span></div>
                  <div className="muv-metric"><span className="muv-metric-v">2 apps</span><span className="muv-metric-l">personal + aluno</span></div>
                </div>
              </div>
              <div className="muv-hero-visual">
                <div className="muv-hero-frame">
                  <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=85" alt="Consultoria científica" />
                  <div className="muv-hero-frame-overlay" />
                </div>
                <div className="muv-hero-tag muv-hero-tag-top">
                  <div className="muv-hero-tag-icon">FILA</div>
                  <div>
                    <div className="muv-hero-tag-text">Fila única de correções</div>
                    <div className="muv-hero-tag-sub">organizada por prioridade</div>
                  </div>
                </div>
                <div className="muv-hero-tag muv-hero-tag-bot">
                  <div className="muv-hero-tag-icon">DRIVE</div>
                  <div>
                    <div className="muv-hero-tag-text">Vídeos no seu Google Drive</div>
                    <div className="muv-hero-tag-sub">storage zero no produto</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DUAL AUDIENCE ─── */}
        <section className="muv-dual" id="muv-para-voce">
          <div className="muv-wrap">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">Para quem é</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">Uma plataforma.<br /><em className="muv-italic muv-gold">Dois lados do treino.</em></h2>
              <p>Personal trainer e aluno em sincronia — cada um com a experiência certa para o seu papel no processo.</p>
            </div>
            <div className="muv-dual-grid">
              {/* Personal */}
              <div className="muv-dual-card">
                <div className="muv-dual-head muv-dual-head--personal">
                  <div className="muv-dual-tag">● Personal Trainer</div>
                  <h3 className="muv-display" style={{ fontSize: "1.75rem" }}>Você monta, corrige<br />e escala com método.</h3>
                </div>
                <div className="muv-dual-body">
                  <ul className="muv-dual-list">
                    {[
                      ["Cadastro de alunos", "com anamnese, metas e histórico centralizado"],
                      ["Criação e edição de treinos", "com micro e macrociclos organizados"],
                      ["Fila única de correções", "sabe sempre quem corrigir primeiro"],
                      ["Google Drive integrado", "vídeos dos alunos no seu storage"],
                      ["Dashboard operacional", "adesão, SLA e evolução em tempo real"],
                    ].map(([strong, rest]) => (
                      <li key={strong} className="muv-dual-item">
                        <span className="muv-check">✓</span>
                        <div><strong>{strong}</strong> — {rest}</div>
                      </li>
                    ))}
                  </ul>
                  <a href="/auth" className="muv-btn muv-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Entrar como personal →
                  </a>
                </div>
              </div>
              {/* Aluno */}
              <div className="muv-dual-card">
                <div className="muv-dual-head muv-dual-head--aluno">
                  <div className="muv-dual-tag" style={{ color: "rgba(160,200,150,1)" }}>● Aluno</div>
                  <h3 className="muv-display" style={{ fontSize: "1.75rem" }}>Você treina com<br />clareza e evidência.</h3>
                </div>
                <div className="muv-dual-body">
                  <ul className="muv-dual-list">
                    {[
                      ["Treino do dia organizado", "abre o app e já sabe o que fazer"],
                      ["Registro de cargas e reps", "em tempo real durante o treino"],
                      ["Envio de vídeos por exercício", "direto para o personal corrigir"],
                      ["Histórico de correções", "vinculadas a cada exercício"],
                      ["Evolução visual", "veja seu progresso mês a mês"],
                    ].map(([strong, rest]) => (
                      <li key={strong} className="muv-dual-item">
                        <span className="muv-check">✓</span>
                        <div><strong>{strong}</strong> — {rest}</div>
                      </li>
                    ))}
                  </ul>
                  <a href="http://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                    Acessar app do aluno
                  </a>
                  <p className="muv-dual-note">Seu personal precisa te cadastrar primeiro</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROBLEM / SOLUTION ─── */}
        <section className="muv-problem" id="muv-problema">
          <div className="muv-wrap">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">O problema real</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">WhatsApp não é<br /><em className="muv-italic muv-gold">gestão de consultoria.</em></h2>
              <p>O stack improvisado funciona até uns 20 alunos. Depois de 50, quebra completamente.</p>
            </div>
            <div className="muv-ps-grid">
              <div className="muv-ps-card">
                <div className="muv-ps-head muv-ps-head--bad">✕ Stack atual — o caos</div>
                <ul className="muv-ps-list">
                  {[
                    "WhatsApp como fila de trabalho — mensagens perdidas, sem prioridade",
                    "Vídeos espalhados no celular e nuvem, sem organização por exercício",
                    "Planilhas duplicadas — treino atualizado que ninguém acha",
                    "Sem visão clara de quem precisa de correção urgente",
                    "Impossível escalar sem contratar secretária ou perder qualidade",
                  ].map((t) => (
                    <li key={t} className="muv-ps-item">
                      <span className="muv-ps-icon muv-ps-icon--bad">✕</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="muv-ps-card">
                <div className="muv-ps-head muv-ps-head--good">✓ Com MUV TRAINER — controle</div>
                <ul className="muv-ps-list">
                  {[
                    "Fila única de correções com prioridade automática por SLA",
                    "Vídeos organizados no seu Google Drive por aluno e exercício",
                    "Treinos no app — aluno sempre com a versão mais recente",
                    "Dashboard com adesão e SLA — você sabe exatamente onde intervir",
                    "Menos caos, mais controle, mais escala — sem contratar ninguém",
                  ].map((t) => (
                    <li key={t} className="muv-ps-item">
                      <span className="muv-ps-icon muv-ps-icon--good">✓</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="muv-features" id="muv-recursos">
          <div className="muv-wrap">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">O que está incluído no MVP</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">Core operacional.<br /><em className="muv-italic muv-gold">Sem features desnecessárias.</em></h2>
              <p>Trade-off consciente: foco em resolver o problema real de gestão, não em funcionalidades "sexy" que distraem do objetivo.</p>
            </div>
            <div className="muv-feat-grid">
              {[
                { n: "01", hl: true, label: "Personal", title: "Cadastro de alunos", desc: "Anamnese, fotos iniciais, metas e histórico completo. Tudo em um lugar só, sem planilhas paralelas." },
                { n: "02", label: "Personal", title: "Treinos e periodização", desc: "Criação e edição de treinos com micro e macrociclos. Aluno acessa sempre a versão mais atual pelo app." },
                { n: "03", label: "Personal", title: "Gestão de correções", desc: "Fila única de vídeos aguardando correção. Avaliação por critérios técnicos, feedback rastreável por exercício." },
                { n: "04", label: "Arquitetura", title: "Google Drive integrado", desc: "Cada personal conecta seu Drive via OAuth. Pastas organizadas por aluno e exercício. Storage zero no produto." },
                { n: "05", label: "Personal", title: "Dashboard operacional", desc: "Taxa de adesão, SLA de correções e evolução por aluno. Dados simples para decidir rápido onde intervir." },
                { n: "06", label: "Aluno", title: "App nativo do aluno", desc: "Treino do dia, registro de cargas, envio de vídeos e visualização de correções. Sem precisar do WhatsApp." },
              ].map((f) => (
                <div key={f.n} className={`muv-feat-card${f.hl ? " muv-feat-card--hl" : ""}`}>
                  <span className="muv-feat-num">{f.n}</span>
                  <p className="muv-label" style={{ marginBottom: 10 }}>{f.label}</p>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="muv-how" id="muv-como-funciona">
          <div className="muv-wrap">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">O fluxo completo</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">Do onboarding ao<br /><em className="muv-italic muv-gold">dashboard de evolução.</em></h2>
              <p>Cinco etapas, tudo dentro da plataforma. Sem alternar entre WhatsApp, planilha, Drive e bloco de notas.</p>
            </div>
            <div className="muv-steps">
              {[
                { n: "01", aud: "Personal", audCls: "aud-p", title: "Onboarding", desc: "Cadastra aluno com anamnese, fotos e metas." },
                { n: "02", aud: "Personal", audCls: "aud-p", title: "Montagem do treino", desc: "Cria micro e macrociclos. Aluno recebe no app automaticamente." },
                { n: "03", aud: "Aluno", audCls: "aud-a", title: "Execução e vídeo", desc: "Marca séries, registra cargas e envia vídeo por exercício." },
                { n: "04", aud: "Personal", audCls: "aud-p", title: "Correção técnica", desc: "Avalia pela fila. Feedback com critérios vinculado ao exercício." },
                { n: "05", aud: "Ambos", audCls: "aud-b", title: "Evolução e insights", desc: "Dashboard com adesão, SLA e progresso por período." },
              ].map((s) => (
                <div key={s.n} className="muv-step">
                  <span className="muv-step-n">{s.n}</span>
                  <span className={`muv-step-aud ${s.audCls}`}>{s.aud}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WAITLIST ─── */}
        <section className="muv-waitlist" id="muv-waitlist">
          <div className="muv-wrap">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">Lista de espera</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">Quer testar antes<br /><em className="muv-italic muv-gold">de todo mundo?</em></h2>
              <p>Priorizamos personal trainers com mais alunos ativos. Acesso liberado por ordem de chegada e perfil de uso.</p>
            </div>

            <div id="muv-wl-form">
              <div className="muv-wl-card">
                <form onSubmit={handleWaitlist} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="muv-form-row">
                    <div className="muv-form-group">
                      <label htmlFor="muv-nome">Nome completo</label>
                      <input id="muv-nome" type="text" placeholder="Seu nome" required />
                    </div>
                    <div className="muv-form-group">
                      <label htmlFor="muv-email">Email profissional</label>
                      <input id="muv-email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  <div className="muv-form-group">
                    <label htmlFor="muv-alunos">Quantos alunos online você atende hoje?</label>
                    <select id="muv-alunos" required defaultValue="">
                      <option value="" disabled>Selecione...</option>
                      <option value="0-10">Estou começando (0–10 alunos)</option>
                      <option value="11-30">Em crescimento (11–30 alunos)</option>
                      <option value="31-50">Consolidado (31–50 alunos)</option>
                      <option value="51+">Alto volume (51+ alunos)</option>
                    </select>
                  </div>
                  <div className="muv-check-row">
                    <input id="muv-lgpd" type="checkbox" required />
                    <label htmlFor="muv-lgpd">
                      Concordo com a <a href="#">Política de Privacidade</a> (LGPD) e autorizo o MUV TRAINER a me contatar sobre o acesso beta.
                    </label>
                  </div>
                  <button id="muv-wl-btn" type="submit" className="muv-btn muv-btn-primary" style={{ width: "100%", justifyContent: "center", height: 50 }}>
                    Entrar na lista de espera
                  </button>
                  <p className="muv-form-note">Gratuito durante o beta · Sem cartão · Sem compromisso</p>
                </form>
              </div>
            </div>

            <div id="muv-wl-success" style={{ display: "none" }}>
              <div className="muv-success-box">
                <div className="muv-success-icon">✓</div>
                <h3 className="muv-display" style={{ fontSize: "1.6rem" }}>Você está na fila.</h3>
                <p>Avisaremos <strong id="muv-semail" /> quando liberar acesso.</p>
                <span className="muv-success-note">Liberamos acesso em lotes semanais</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="muv-faq-section" id="muv-faq">
          <div className="muv-wrap muv-wrap--sm">
            <div className="muv-sec-head muv-sec-head--center">
              <p className="muv-label">Dúvidas frequentes</p>
              <div className="muv-rule muv-rule--center" />
              <h2 className="muv-display">Perguntas sobre<br /><em className="muv-italic muv-gold">o beta e o produto.</em></h2>
            </div>
            <div id="muv-faq-list" className="muv-faq-list" />
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="muv-final">
          <div className="muv-wrap">
            <div className="muv-final-inner">
              <p className="muv-label" style={{ marginBottom: 20 }}>MUV TRAINER · Beta</p>
              <h2 className="muv-display" style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", marginBottom: 14 }}>
                Menos caos, mais controle,<br /><em className="muv-italic muv-gold">mais escala.</em>
              </h2>
              <div className="muv-rule muv-rule--center" style={{ margin: "24px auto" }} />
              <p style={{ fontSize: 15, color: "var(--muv-bege)", maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.7 }}>
                Construído para personal trainers autônomos que querem crescer sem contratar alguém só para organizar agenda e mensagens.
              </p>
              <div className="muv-final-ctas">
                <a href="/auth" className="muv-btn muv-btn-primary">Sou personal — Entrar →</a>
                <a href="http://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer" className="muv-btn muv-btn-outline">App do aluno</a>
                <a href="#muv-waitlist" className="muv-btn muv-btn-ghost">Lista de espera</a>
              </div>
              <p className="muv-final-note">Gratuito durante o beta · Dados sempre seus · LGPD compliant</p>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="muv-footer">
          <div className="muv-wrap">
            <div className="muv-footer-top">
              <div>
                <img src={logoImg} alt="MUV TRAINER" style={{ height: 28, marginBottom: 12 }} />
                <p style={{ fontSize: 12.5, color: "rgba(209,186,172,.50)", lineHeight: 1.65 }}>
                  Plataforma de gestão científica para personal trainers de alto rendimento escalar a consultoria online com método e sem perder qualidade.
                </p>
              </div>
              <div className="muv-footer-cols">
                <div className="muv-footer-col">
                  <h4>Plataforma</h4>
                  <a href="#muv-para-voce">Para você</a>
                  <a href="#muv-recursos">Recursos</a>
                  <a href="#muv-como-funciona">Como funciona</a>
                </div>
                <div className="muv-footer-col">
                  <h4>Acesso</h4>
                  <a href="/auth">Entrar como personal</a>
                  <a href="http://muvtrainer-athlete.lovable.app" target="_blank" rel="noreferrer">App do aluno</a>
                  <a href="#muv-waitlist">Lista de espera</a>
                </div>
                <div className="muv-footer-col">
                  <h4>Suporte</h4>
                  <a href="#muv-faq">FAQ</a>
                  <span>Privacidade (LGPD)</span>
                  <span>Termos de uso</span>
                </div>
              </div>
            </div>
            <div className="muv-footer-bottom">
              <span>© {new Date().getFullYear()} MUV TRAINER. Todos os direitos reservados.</span>
              <span>v0.1-beta · Produto em construção ativa</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── CSS ISOLADO (prefixo .muv- para não conflitar com Tailwind/shadcn) ───
const landingCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Josefin+Sans:wght@100;200;300;400&family=DM+Sans:wght@300;400;500&display=swap');

.muv-root {
  --muv-dark:   #3D1614;
  --muv-vinho:  #4A1E1D;
  --muv-mid:    #5C2520;
  --muv-warm:   #6E2E28;
  --muv-bege:   #D1BAAC;
  --muv-cream:  #EDE0D4;
  --muv-white:  #F5EEE8;
  --muv-gold:   #C4965A;
  --muv-gold-lt: #D4A96A;
  --muv-bd-dim: rgba(209,186,172,.12);
  --muv-bd-soft:rgba(209,186,172,.22);
  --muv-bd-med: rgba(209,186,172,.35);
  --muv-hh: 80px;

  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--muv-vinho);
  color: var(--muv-cream);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

.muv-root *, .muv-root *::before, .muv-root *::after { box-sizing: border-box }
.muv-root a { text-decoration: none; color: inherit }
.muv-root ul { list-style: none; margin: 0; padding: 0 }
.muv-root img { max-width: 100%; display: block }
.muv-root button { font-family: inherit }

.muv-wrap     { max-width: 1160px; margin: 0 auto; padding: 0 28px }
.muv-wrap--sm { max-width: 720px;  margin: 0 auto; padding: 0 28px }
.muv-root section { padding: 96px 0 }

/* Typography */
.muv-display { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; line-height: 1.1; letter-spacing: -.01em; color: var(--muv-white) }
.muv-label   { font-family: 'Josefin Sans', sans-serif; font-size: 10px; font-weight: 300; letter-spacing: .22em; text-transform: uppercase; color: var(--muv-gold); display: block }
.muv-italic  { font-style: italic }
.muv-gold    { color: var(--muv-gold) }

/* Buttons */
.muv-btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:14px 32px; font-family:'Josefin Sans',sans-serif; font-size:11px; font-weight:300; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; border:none; transition:all .25s; white-space:nowrap; text-decoration:none; }
.muv-btn-primary { background:var(--muv-cream); color:var(--muv-dark) }
.muv-btn-primary:hover { background:var(--muv-white); transform:translateY(-1px) }
.muv-btn-outline { background:transparent; color:var(--muv-bege); border:1px solid var(--muv-bd-med) }
.muv-btn-outline:hover { border-color:var(--muv-bege); color:var(--muv-cream) }
.muv-btn-ghost { background:rgba(209,186,172,.08); color:var(--muv-bege); border:1px solid var(--muv-bd-dim) }
.muv-btn-ghost:hover { background:rgba(209,186,172,.14); color:var(--muv-cream) }

/* Badge */
.muv-badge { display:inline-flex; align-items:center; gap:8px; padding:5px 14px; border:1px solid var(--muv-bd-soft); font-family:'Josefin Sans',sans-serif; font-size:9.5px; font-weight:300; letter-spacing:.2em; text-transform:uppercase; color:var(--muv-bege) }
.muv-badge-dot { width:5px; height:5px; border-radius:50%; background:var(--muv-gold); animation:muv-pulse 2.5s infinite }
@keyframes muv-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }

/* Rule */
.muv-rule { width:48px; height:1px; background:linear-gradient(90deg,var(--muv-gold),transparent); margin:18px 0 }
.muv-rule--center { margin:18px auto }

/* Header */
.muv-header {
  position: fixed !important; inset-x: 0 !important; top: 0 !important; z-index: 9999 !important;
  height: var(--muv-hh) !important;
  width: 100% !important;
  background: #3D1614 !important;
  border-bottom: 1px solid rgba(209,186,172,.22) !important;
  transition: box-shadow .3s, background .3s;
}
.muv-header.muv-scrolled {
  background: rgba(35,10,10,.97) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 32px rgba(0,0,0,.55);
}

/* inner SEM max-width — ocupa de borda a borda com padding lateral */
.muv-header-inner {
  height: 100% !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 32px !important;
  gap: 0 !important;
}

/* ── LOGO MAIOR ──────────────────────────────────────────────────── */
.muv-logo-wrap {
  display: flex !important; align-items: center !important;
  flex-shrink: 0 !important;
  margin-right: 40px !important;
}
.muv-logo-img {
  height: 1rem !important;
  width: auto !important;
}

/* ── NAV — ocupa o espaço do meio, centralizado ─────────────────── */
.muv-nav {
  display: flex !important;
  align-items: center !important;
  gap: 0 !important;
  flex: 1 !important;
  justify-content: center !important;
}
.muv-nav a {
  font-family: 'Josefin Sans', sans-serif !important;
  font-size: 12px !important;
  font-weight: 300 !important;
  letter-spacing: .14em !important;
  text-transform: uppercase !important;
  color: #D1BAAC !important;
  padding: 10px 18px !important;
  transition: color .2s, background .2s;
  white-space: nowrap !important;
  text-decoration: none !important;
}
.muv-nav a:hover { color: #F5EEE8 !important; background: rgba(255,255,255,.07) !important }

/* ── CTAs — lado direito ─────────────────────────────────────────── */
.muv-header-ctas {
  display: flex !important; align-items: center !important;
  gap: 10px !important; flex-shrink: 0 !important;
  margin-left: 24px !important;
}

.muv-mobile-btn { display:none; background:none; border:1px solid rgba(209,186,172,.22); padding:9px; cursor:pointer; color:#D1BAAC }
.muv-mobile-nav { display:none; position:fixed; inset-x:0; top:var(--muv-hh); z-index:99; background:rgba(45,15,15,.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--muv-bd-dim); padding:24px 28px 32px }
.muv-mobile-nav.open { display:block }
.muv-mobile-nav .muv-nav { flex-direction:column; align-items:flex-start }
.muv-mobile-nav .muv-nav a { display:block; width:100%; padding:14px 0; border-bottom:1px solid var(--muv-bd-dim) }

/* Hero */
.muv-hero { min-height:100vh; display:flex; align-items:center; padding-top:calc(var(--muv-hh) + 48px); padding-bottom:64px; position:relative; overflow:hidden }
.muv-hero-bg { position:absolute; inset:0; z-index:0; background:radial-gradient(ellipse 80% 60% at 20% 15%,rgba(196,150,90,.06) 0%,transparent 55%),radial-gradient(ellipse 55% 45% at 85% 80%,rgba(74,30,29,.80) 0%,transparent 60%),var(--muv-dark) }
.muv-hero-noise { position:absolute; inset:0; z-index:0; opacity:.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:200px }
.muv-hero-inner { position:relative; z-index:1; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center }
.muv-hero-h1 { font-size:clamp(2.8rem,5.5vw,5.2rem); margin-bottom:28px }
.muv-hero-sub { font-size:15px; color:var(--muv-bege); line-height:1.7; margin-bottom:10px; max-width:440px }
.muv-hero-quote { padding:18px 22px; border-left:2px solid var(--muv-gold); background:rgba(196,150,90,.06); font-family:'Cormorant Garamond',serif; font-size:15px; font-style:italic; color:var(--muv-bege); line-height:1.65; margin-bottom:36px }
.muv-hero-ctas { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:18px }
.muv-hero-link { font-family:'Josefin Sans',sans-serif; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:rgba(209,186,172,.5); display:flex; align-items:center; gap:6px; transition:color .2s }
.muv-hero-link:hover { color:var(--muv-bege) }
.muv-metrics { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--muv-bd-dim); margin-top:44px }
.muv-metric { padding:20px 0 }
.muv-metric+.muv-metric { border-left:1px solid var(--muv-bd-dim); padding-left:20px }
.muv-metric-v { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; color:var(--muv-gold); display:block }
.muv-metric-l { font-family:'Josefin Sans',sans-serif; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:rgba(209,186,172,.55); margin-top:3px; display:block }
.muv-hero-visual { position:relative }
.muv-hero-frame { border:1px solid var(--muv-bd-soft); overflow:hidden; position:relative }
.muv-hero-frame img { width:100%; display:block; filter:sepia(.15) contrast(1.05); max-height:520px; object-fit:cover }
.muv-hero-frame-overlay { position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(45,15,15,.65) 100%) }
.muv-hero-tag { position:absolute; background:var(--muv-mid); border:1px solid var(--muv-bd-med); padding:12px 16px; display:flex; align-items:center; gap:10px }
.muv-hero-tag-top { top:-14px; right:-14px }
.muv-hero-tag-bot { bottom:-14px; left:-14px }
.muv-hero-tag-icon { width:34px; height:34px; border:1px solid var(--muv-bd-med); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Josefin Sans',sans-serif; font-size:7px; font-weight:300; letter-spacing:.08em; color:var(--muv-gold); text-align:center }
.muv-hero-tag-text { font-family:'Josefin Sans',sans-serif; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--muv-cream); font-weight:300 }
.muv-hero-tag-sub  { font-size:10px; color:rgba(209,186,172,.5); margin-top:1px }

/* Sec head */
.muv-sec-head { margin-bottom:60px }
.muv-sec-head h2 { font-size:clamp(2rem,3.5vw,3rem) }
.muv-sec-head p { font-size:14.5px; color:var(--muv-bege); max-width:500px; margin-top:16px; line-height:1.7 }
.muv-sec-head--center { text-align:center }
.muv-sec-head--center p { margin-left:auto; margin-right:auto }

/* Dual */
.muv-dual { background:var(--muv-dark); border-top:1px solid var(--muv-bd-dim); border-bottom:1px solid var(--muv-bd-dim) }
.muv-dual-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--muv-bd-dim) }
.muv-dual-card { background:var(--muv-vinho) }
.muv-dual-head { padding:32px 36px 28px; border-bottom:1px solid var(--muv-bd-dim) }
.muv-dual-head--personal { background:linear-gradient(135deg,var(--muv-dark) 0%,var(--muv-mid) 100%) }
.muv-dual-head--aluno    { background:var(--muv-dark) }
.muv-dual-tag { font-family:'Josefin Sans',sans-serif; font-size:9px; font-weight:300; letter-spacing:.2em; text-transform:uppercase; color:var(--muv-gold); margin-bottom:14px; display:block }
.muv-dual-body { padding:32px 36px }
.muv-dual-list { display:flex; flex-direction:column; gap:14px; margin-bottom:24px }
.muv-dual-item { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--muv-bege); line-height:1.6 }
.muv-check { color:var(--muv-gold); font-size:12px; margin-top:2px; flex-shrink:0 }
.muv-dual-item strong { color:var(--muv-cream) }
.muv-dual-note { font-family:'Josefin Sans',sans-serif; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(209,186,172,.40); margin-top:10px; text-align:center; display:block }

/* Problem */
.muv-problem { background:var(--muv-vinho) }
.muv-ps-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--muv-bd-dim) }
.muv-ps-card { background:var(--muv-dark); padding:40px }
.muv-ps-head { padding-bottom:20px; margin-bottom:24px; border-bottom:1px solid var(--muv-bd-dim); font-family:'Josefin Sans',sans-serif; font-size:10px; letter-spacing:.2em; text-transform:uppercase }
.muv-ps-head--bad  { color:rgba(210,120,100,.90) }
.muv-ps-head--good { color:var(--muv-gold) }
.muv-ps-list { display:flex; flex-direction:column; gap:12px; margin:0; padding:0 }
.muv-ps-item { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--muv-bege); line-height:1.55 }
.muv-ps-icon { flex-shrink:0; font-size:11px; margin-top:2px }
.muv-ps-icon--bad  { color:rgba(210,120,100,.80) }
.muv-ps-icon--good { color:var(--muv-gold) }

/* Features */
.muv-features { background:var(--muv-dark) }
.muv-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--muv-bd-dim) }
.muv-feat-card { background:var(--muv-vinho); padding:32px; position:relative; overflow:hidden; transition:background .2s }
.muv-feat-card:hover { background:var(--muv-mid) }
.muv-feat-card--hl { background:var(--muv-mid); border-top:2px solid var(--muv-gold) }
.muv-feat-num { font-family:'Cormorant Garamond',serif; font-size:48px; font-weight:300; color:rgba(196,150,90,.10); position:absolute; top:16px; right:20px; line-height:1; user-select:none; pointer-events:none }
.muv-feat-card h3 { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:400; color:var(--muv-cream); margin-bottom:8px; margin-top:0 }
.muv-feat-card p  { font-size:13px; color:rgba(209,186,172,.70); line-height:1.65; margin:0 }

/* How */
.muv-how { background:var(--muv-vinho); border-top:1px solid var(--muv-bd-dim) }
.muv-steps { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--muv-bd-dim) }
.muv-step { background:var(--muv-dark); padding:28px 20px; text-align:center; transition:background .2s }
.muv-step:hover { background:var(--muv-mid) }
.muv-step-n { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:300; color:rgba(196,150,90,.25); display:block; margin-bottom:12px }
.muv-step-aud { display:inline-block; font-family:'Josefin Sans',sans-serif; font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; padding:3px 9px; margin-bottom:10px; border:1px solid var(--muv-bd-dim) }
.aud-p { color:var(--muv-gold);    border-color:rgba(196,150,90,.25) !important; background:rgba(196,150,90,.06) }
.aud-a { color:rgba(160,200,150,1); border-color:rgba(160,200,150,.25) !important; background:rgba(160,200,150,.06) }
.aud-b { color:var(--muv-bege) }
.muv-step h4 { font-family:'Cormorant Garamond',serif; font-size:.95rem; font-weight:400; color:var(--muv-cream); margin-bottom:6px; margin-top:0 }
.muv-step p  { font-size:12px; color:rgba(209,186,172,.60); line-height:1.55; margin:0 }

/* Waitlist */
.muv-waitlist { background:var(--muv-dark); border-top:1px solid var(--muv-bd-dim) }
.muv-wl-card { background:var(--muv-vinho); border:1px solid var(--muv-bd-soft); padding:48px; max-width:600px; margin:0 auto }
.muv-form-row  { display:grid; grid-template-columns:1fr 1fr; gap:14px }
.muv-form-group { display:flex; flex-direction:column; gap:7px }
.muv-root label { font-family:'Josefin Sans',sans-serif; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:rgba(209,186,172,.65) }
.muv-root input,.muv-root select { width:100%; padding:12px 14px; background:var(--muv-dark); border:1px solid var(--muv-bd-soft); color:var(--muv-cream); font-family:'DM Sans',sans-serif; font-size:14px; transition:border-color .2s; appearance:none; -webkit-appearance:none; outline:none }
.muv-root input:focus,.muv-root select:focus { border-color:var(--muv-gold) }
.muv-root input::placeholder { color:rgba(209,186,172,.30) }
.muv-root select option { background:var(--muv-dark) }
.muv-check-row { display:flex; align-items:flex-start; gap:12px; padding:14px; background:rgba(0,0,0,.15); border:1px solid var(--muv-bd-dim) }
.muv-root input[type=checkbox] { width:16px; height:16px; flex-shrink:0; accent-color:var(--muv-gold); margin-top:2px }
.muv-check-row label { font-size:12px; color:var(--muv-bege); letter-spacing:0; text-transform:none; line-height:1.55 }
.muv-check-row a { color:var(--muv-gold) }
.muv-form-note { font-family:'Josefin Sans',sans-serif; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(209,186,172,.40); text-align:center; margin:4px 0 0 }
.muv-success-box { background:var(--muv-vinho); border:1px solid var(--muv-bd-soft); padding:56px 40px; text-align:center; max-width:480px; margin:0 auto }
.muv-success-icon { width:60px; height:60px; margin:0 auto 20px; border:1px solid var(--muv-gold); display:flex; align-items:center; justify-content:center; font-size:24px; color:var(--muv-gold) }
.muv-success-box p { font-size:13.5px; color:var(--muv-bege); line-height:1.65; margin-bottom:14px }
.muv-success-note { display:inline-flex; font-family:'Josefin Sans',sans-serif; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(209,186,172,.40); border:1px solid var(--muv-bd-dim); padding:8px 16px }

/* FAQ */
.muv-faq-section { background:var(--muv-vinho) }
.muv-faq-list { display:flex; flex-direction:column; border:1px solid var(--muv-bd-dim) }
.muv-faq-item { border-bottom:1px solid var(--muv-bd-dim) }
.muv-faq-item:last-child { border-bottom:none }
.muv-faq-q { width:100%; display:flex; align-items:center; gap:14px; padding:20px 24px; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:400; color:var(--muv-cream); text-align:left; transition:background .15s }
.muv-faq-q:hover { background:rgba(255,255,255,.03) }
.muv-faq-n { width:24px; height:24px; flex-shrink:0; border:1px solid var(--muv-bd-soft); display:flex; align-items:center; justify-content:center; font-family:'Josefin Sans',sans-serif; font-size:9px; color:var(--muv-gold); font-weight:300 }
.muv-faq-q-text { flex:1; line-height:1.45 }
.muv-faq-arr { width:16px; height:16px; stroke:rgba(209,186,172,.40); fill:none; stroke-width:1.5; flex-shrink:0; transition:transform .25s }
.muv-faq-item.open .muv-faq-arr { transform:rotate(180deg) }
.muv-faq-a { max-height:0; overflow:hidden; padding:0 24px 0 62px; font-size:13.5px; color:var(--muv-bege); line-height:1.7; transition:max-height .3s ease,padding .3s }
.muv-faq-item.open .muv-faq-a { max-height:200px; padding-bottom:20px }

/* Final CTA */
.muv-final { padding:112px 0; position:relative; overflow:hidden; background:var(--muv-dark); border-top:1px solid var(--muv-bd-dim) }
.muv-final::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(196,150,90,.07) 0%,transparent 65%); pointer-events:none }
.muv-final-inner { position:relative; z-index:1; text-align:center }
.muv-final-ctas { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-bottom:14px }
.muv-final-note { font-family:'Josefin Sans',sans-serif; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(209,186,172,.30) }

/* Footer */
.muv-footer { background:var(--muv-dark); border-top:1px solid var(--muv-bd-dim); padding:56px 0 32px }
.muv-footer-top { display:grid; grid-template-columns:260px 1fr; gap:60px; padding-bottom:40px; margin-bottom:32px; border-bottom:1px solid var(--muv-bd-dim); align-items:start }
.muv-footer-cols { display:grid; grid-template-columns:repeat(3,1fr); gap:32px }
.muv-footer-col h4 { font-family:'Josefin Sans',sans-serif; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:var(--muv-gold); margin-bottom:18px }
.muv-footer-col a,.muv-footer-col span { display:block; font-size:13px; color:rgba(209,186,172,.50); margin-bottom:10px; transition:color .15s; cursor:pointer }
.muv-footer-col a:hover { color:var(--muv-bege) }
.muv-footer-bottom { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px }
.muv-footer-bottom span { font-family:'Josefin Sans',sans-serif; font-size:10px; letter-spacing:.12em; color:rgba(209,186,172,.28) }

/* Responsive */
@media(max-width:1024px){
  .muv-hero-inner   { grid-template-columns:1fr }
  .muv-hero-visual  { display:none }
  .muv-feat-grid    { grid-template-columns:1fr 1fr }
  .muv-steps        { grid-template-columns:1fr 1fr }
  .muv-footer-top   { grid-template-columns:1fr }
  .muv-footer-cols  { grid-template-columns:1fr 1fr }
}
@media(max-width:768px){
  .muv-root section { padding:64px 0 }
  .muv-dual-grid,.muv-ps-grid,.muv-form-row { grid-template-columns:1fr }
  .muv-feat-grid { grid-template-columns:1fr }
  .muv-nav,.muv-header-ctas { display:none !important }
  .muv-mobile-btn { display:flex }
  .muv-steps { grid-template-columns:1fr 1fr }
  .muv-footer-cols { grid-template-columns:1fr }
  .muv-wl-card { padding:28px 20px }
  .muv-final-ctas { flex-direction:column; align-items:center }
  .muv-final-ctas .muv-btn { width:100%; max-width:320px; justify-content:center }
  .muv-metrics { grid-template-columns:1fr 1fr }
}
@media(max-width:480px){
  .muv-steps { grid-template-columns:1fr }
}
`;
