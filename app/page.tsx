'use client';

import Link from 'next/link';
import {
  Trophy,
  Rocket,
  GraduationCap,
  FileText,
  ShieldCheck,
  Target,
  BarChart3,
  Building2,
  ClipboardCheck,
  ShoppingCart,
  Scale,
  ChevronRight,
} from 'lucide-react';

const solucoes = [
  { title: 'Projetos Incentivados', desc: 'Da ideia à aprovação, com documentos, valores, prazos e status.', icon: FileText },
  { title: 'Captação Inteligente', desc: 'CRM, patrocinadores, propostas, follow-ups e pipeline comercial.', icon: Target },
  { title: 'Prestação de Contas', desc: 'Comprovantes, relatórios, pendências, prazos e controle de execução.', icon: ClipboardCheck },
  { title: 'Marketplace', desc: 'Projetos disponíveis para empresas apoiarem com incentivo fiscal.', icon: ShoppingCart },
  { title: 'Impacto e ESG', desc: 'Relatórios sociais, ODS, beneficiários e indicadores para patrocinadores.', icon: BarChart3 },
  { title: 'Jurídico e LGPD', desc: 'Contratos, termos, procurações, aceites e segurança documental.', icon: Scale },
];

export default function SitePublico() {
  return (
    <main className="page">
      <header className="navbar">
        <div className="brand">
          <div className="brandIcon"><Trophy size={24} /></div>
          <div>
            <strong>IncentiVou</strong>
            <span>Transformando esporte em legado</span>
          </div>
        </div>

        <nav>
          <a>Início</a>
          <a>Soluções</a>
          <a>Planos</a>
          <a>Marketplace</a>
          <a>Academy</a>
        </nav>

        <Link href="/login" className="loginBtn">
          Acessar sistema
        </Link>
      </header>

      <section className="hero">
        <div>
          <div className="pill">Plataforma completa</div>

          <h1>
            Transforme incentivo fiscal em <span>projetos esportivos reais</span>
          </h1>

          <p>
            O IncentiVou conecta proponentes, patrocinadores e gestores em uma
            plataforma completa para projetos incentivados, captação, execução,
            prestação de contas, ESG e marketplace.
          </p>

          <div className="actions">
            <Link href="/simulador" className="primary">
              <FileText size={19} />
              Testar simulador
            </Link>

            <Link href="/login" className="secondary">
              <Rocket size={19} />
              Acessar sistema
            </Link>

            <Link href="/academy" className="secondary">
              <GraduationCap size={19} />
              Ver Academy
            </Link>
          </div>
        </div>

        <div className="heroPanel">
          <div className="circle"><strong>360°</strong></div>
          <div>
            <h3>Gestão completa</h3>
            <p>Da aprovação à prestação de contas.</p>
          </div>

          <div className="panelStats">
            <div><strong>Projetos</strong><span>Cadastro e aprovação</span></div>
            <div><strong>Captação</strong><span>CRM e patrocinadores</span></div>
            <div><strong>Impacto</strong><span>ESG e relatórios</span></div>
          </div>
        </div>
      </section>

      <section className="sectionTitle">
        <span>Soluções</span>
        <h2>Tudo que você precisa em uma única plataforma</h2>
      </section>

      <section className="cards">
        {solucoes.map((item) => {
          const Icon = item.icon;
          return (
            <div className="card" key={item.title}>
              <div className="iconBox"><Icon size={34} /></div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <ChevronRight className="arrow" size={22} />
            </div>
          );
        })}
      </section>

      <section className="cta">
        <ShieldCheck size={42} />
        <h2>Quer estruturar ou captar para um projeto incentivado?</h2>
        <p>Use o simulador gratuito e nossa equipe entrará em contato.</p>
        <Link href="/simulador">Fazer simulação agora</Link>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(36, 228, 155, 0.22), transparent 32%),
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.22), transparent 30%),
            linear-gradient(135deg, #031226 0%, #061a35 44%, #07152f 100%);
          color: white;
          font-family: Arial, Helvetica, sans-serif;
          padding-bottom: 56px;
        }

        .navbar {
          height: 88px;
          padding: 0 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(3,18,38,.72);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brandIcon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #24e49b, #14b8a6);
          color: #04111f;
        }

        .brand strong {
          display: block;
          font-size: 27px;
        }

        .brand span {
          color: #9fb3d1;
          font-size: 12px;
        }

        nav {
          display: flex;
          gap: 34px;
          font-weight: 800;
          color: #d8e6ff;
        }

        nav a:first-child {
          color: #24e49b;
          border-bottom: 3px solid #24e49b;
          padding-bottom: 10px;
        }

        .loginBtn {
          background: linear-gradient(135deg, #24e49b, #16c784);
          color: #04111f;
          padding: 14px 20px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
        }

        .hero {
          max-width: 1540px;
          min-height: 520px;
          margin: 0 auto;
          padding: 76px 72px;
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 54px;
          align-items: center;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 28px;
          background:
            linear-gradient(90deg, rgba(3,18,38,.98), rgba(3,18,38,.7)),
            radial-gradient(circle at 70% 45%, rgba(36,228,155,.32), transparent 35%);
          border: 1px solid rgba(255,255,255,.08);
        }

        .pill {
          display: inline-flex;
          padding: 11px 16px;
          border-radius: 999px;
          background: rgba(36,228,155,.12);
          color: #24e49b;
          border: 1px solid rgba(36,228,155,.35);
          text-transform: uppercase;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 76px);
          line-height: .98;
          letter-spacing: -3px;
        }

        h1 span {
          color: #24e49b;
        }

        .hero p {
          max-width: 760px;
          margin: 26px 0 0;
          color: #d5e4fa;
          font-size: 20px;
          line-height: 1.55;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 34px;
        }

        .primary,
        .secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 54px;
          padding: 0 28px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
        }

        .primary {
          background: linear-gradient(135deg, #24e49b, #16c784);
          color: #04111f;
        }

        .secondary {
          color: white;
          border: 1px solid rgba(255,255,255,.24);
          background: rgba(255,255,255,.04);
        }

        .heroPanel {
          border-radius: 28px;
          padding: 36px;
          background: linear-gradient(145deg, rgba(10,31,64,.94), rgba(6,21,47,.94));
          border: 1px solid rgba(255,255,255,.12);
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 28px;
          align-items: center;
        }

        .circle {
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at center, #07152f 54%, transparent 56%),
            conic-gradient(#24e49b 0 82%, rgba(255,255,255,.13) 82% 100%);
        }

        .circle strong {
          font-size: 25px;
        }

        .heroPanel h3 {
          margin: 0 0 8px;
          font-size: 24px;
        }

        .panelStats {
          grid-column: 1 / -1;
          border-top: 1px solid rgba(255,255,255,.12);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          padding-top: 26px;
        }

        .panelStats div {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,.045);
        }

        .panelStats strong {
          display: block;
          color: #24e49b;
          font-size: 20px;
        }

        .panelStats span {
          color: #aebfda;
          font-size: 13px;
        }

        .sectionTitle,
        .cards,
        .cta {
          max-width: 1540px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 72px;
          padding-right: 72px;
        }

        .sectionTitle {
          margin-top: 42px;
          margin-bottom: 20px;
        }

        .sectionTitle span {
          color: #24e49b;
          font-weight: 900;
          text-transform: uppercase;
        }

        .sectionTitle h2 {
          margin: 8px 0 0;
          font-size: 32px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .card {
          position: relative;
          min-height: 140px;
          padding: 26px 58px 26px 26px;
          border-radius: 20px;
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 18px;
          align-items: center;
          background: linear-gradient(145deg, rgba(13,42,82,.9), rgba(7,24,52,.94));
          border: 1px solid rgba(255,255,255,.1);
        }

        .iconBox {
          color: #24e49b;
        }

        .card h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .card p {
          margin: 0;
          color: #bed0e8;
          line-height: 1.4;
        }

        .arrow {
          position: absolute;
          right: 20px;
          color: #d8e6ff;
        }

        .cta {
          margin-top: 30px;
          padding-top: 40px;
          padding-bottom: 40px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(36,228,155,.14), rgba(59,130,246,.12));
          border: 1px solid rgba(255,255,255,.1);
          text-align: center;
        }

        .cta h2 {
          font-size: 34px;
          margin: 14px 0 8px;
        }

        .cta p {
          color: #d5e4fa;
          margin-bottom: 24px;
        }

        .cta a {
          display: inline-block;
          background: #24e49b;
          color: #04111f;
          padding: 15px 24px;
          border-radius: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        @media (max-width: 1100px) {
          nav { display: none; }
          .hero { grid-template-columns: 1fr; padding: 48px 28px; }
          .cards { grid-template-columns: 1fr 1fr; padding: 0 28px; }
          .sectionTitle, .cta { padding-left: 28px; padding-right: 28px; }
          .navbar { padding: 0 28px; }
        }

        @media (max-width: 700px) {
          .navbar { padding: 18px; height: auto; }
          .brand strong { font-size: 23px; }
          .hero { padding: 36px 18px; }
          h1 { font-size: 42px; letter-spacing: -1.5px; }
          .actions { flex-direction: column; }
          .primary, .secondary { width: 100%; justify-content: center; }
          .heroPanel { grid-template-columns: 1fr; }
          .panelStats { grid-template-columns: 1fr; }
          .cards { grid-template-columns: 1fr; padding: 0 18px; }
          .sectionTitle, .cta { padding-left: 18px; padding-right: 18px; }
        }
      `}</style>
    </main>
  );
}

