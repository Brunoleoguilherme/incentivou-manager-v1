// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Users,
  Building2,
  Target,
  ShieldCheck,
  ClipboardCheck,
  Wallet,
  Download,
  GraduationCap,
  ShoppingCart,
  BarChart3,
  Scale,
  Bell,
  ChevronRight,
  Trophy,
  LogOut,
  Landmark,
  UserRound,
} from 'lucide-react';


const cards = [
  { title: 'Projetos Incentivados', desc: 'Cadastro, status, valores, leis, prazos e documentação', icon: FileText, href: '/projetos', color: '#24E49B' },
  { title: 'Proponentes', desc: 'Associações, clubes, institutos, atletas e federações', icon: Users, href: '/proponentes', color: '#3B82F6' },
  { title: 'Patrocinadores', desc: 'Empresas apoiadoras, limite fiscal, contatos e histórico', icon: Building2, href: '/patrocinadores', color: '#A855F7' },
  { title: 'Captação Inteligente', desc: 'CRM, pipeline, propostas, follow-ups e comissões', icon: Target, href: '/captacao', color: '#FB923C' },
  { title: 'Execução Segura', desc: 'Gestão técnica, checklist, riscos, glosas e execução', icon: ShieldCheck, href: '/execucao', color: '#22C55E' },
  { title: 'Prestação de Contas', desc: 'Comprovantes, relatórios, pendências e prazos', icon: ClipboardCheck, href: '/prestacao-contas', color: '#14B8A6' },
  { title: 'Financeiro', desc: 'Entradas, saídas, saldos, centro de custo e repasses', icon: Wallet, href: '/financeiro', color: '#EAB308' },
  { title: 'Modelos e Downloads', desc: 'Planilhas, contratos, e-books e documentos modelo', icon: Download, href: '/downloads', color: '#EC4899' },
  { title: 'IncentiVou Academy', desc: 'E-books gratuitos, premium, cursos e certificações', icon: GraduationCap, href: '/academy', color: '#6366F1' },
  { title: 'Marketplace', desc: 'Projetos disponíveis para empresas e oportunidades de apoio', icon: ShoppingCart, href: '/marketplace', color: '#4ADE80' },
  { title: 'Impacto e ESG', desc: 'ODS, beneficiários, impacto social e relatórios para empresas', icon: BarChart3, href: '/impacto-esg', color: '#8B5CF6' },
  { title: 'Jurídico', desc: 'Contratos, procurações, termos, LGPD e assinaturas', icon: Scale, href: '/juridico', color: '#F43F5E' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const salvo = localStorage.getItem('incentivou_usuario');
    if (!salvo) {
      router.push('/login');
      return;
    }
    setUsuario(JSON.parse(salvo));
  }, [router]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  if (!usuario) return null;

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/dashboard" className="brand">
          <div className="brandIcon">
            <Trophy size={24} />
          </div>
          <div>
            <strong>IncentiVou</strong>
            <span>Manager</span>
          </div>
        </Link>

        <nav>
          <Link href="/dashboard" className="active">Início</Link>
          <Link href="/simulacoes">Simulações</Link>
          <Link href="/site-publico">Site Público</Link>
          <Link href="/simulador">Simulador</Link>
        </nav>

        <div className="userBox">
          <button className="iconButton">
            <Bell size={19} />
            <i />
          </button>

          <div className="avatar">B</div>

          <div className="userText">
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>

          <button onClick={sair} className="logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="dashboardHero">
        <div className="intro">
          <span>Gestão completa</span>
          <h1>
            Tudo que você precisa <br />
            <b>em um só lugar</b>
          </h1>
          <p>
            Gerencie projetos, patrocinadores, captação, execução, prestação de contas,
            financeiro, documentos, marketplace e impacto social.
          </p>
        </div>

        <div className="summary">
          <div className="summaryTop">
            <div className="circle">
              <strong>78%</strong>
            </div>

            <div>
              <h2>Projetos ativos</h2>
              <p>12 projetos em execução</p>
            </div>

            <Link href="/relatorios" className="reportButton">
              <BarChart3 size={16} />
              Ver relatórios
            </Link>
          </div>

          <div className="summaryCards">
            <div className="metric green">
              <div><Landmark size={24} /></div>
              <strong>R$ 8,2M</strong>
              <span>Valor captado</span>
            </div>

            <div className="metric blue">
              <div><UserRound size={24} /></div>
              <strong>1.245</strong>
              <span>Atletas beneficiados</span>
            </div>

            <div className="metric purple">
              <div><Users size={24} /></div>
              <strong>28</strong>
              <span>Patrocinadores</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cards">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="cardShell"
              style={{ '--accent': card.color } as React.CSSProperties}
            >
              <Link href={card.href} className="cardInner">
                <div className="iconBox">
                  <Icon size={34} />
                </div>

                <div className="cardText">
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>

                <div className="arrow">
                  <ChevronRight size={22} />
                </div>
              </Link>
            </div>
          );
        })}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 5% 15%, rgba(36,228,155,.16), transparent 30%),
            radial-gradient(circle at 82% 18%, rgba(59,130,246,.16), transparent 34%),
            linear-gradient(135deg, #031226 0%, #061a35 42%, #07152f 100%);
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          padding-bottom: 80px;
        }

        .navbar {
          height: 92px;
          padding: 0 72px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,.08);
          background: rgba(3,18,38,.78);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #fff;
          text-decoration: none;
          width: fit-content;
        }

        .brandIcon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #24e49b, #14b8a6);
          color: #031226;
          box-shadow: 0 0 36px rgba(36,228,155,.34);
        }

        .brand strong {
          display: block;
          font-size: 28px;
          letter-spacing: -.8px;
        }

        .brand span,
        .userText span {
          color: #9fb3d1;
          font-size: 13px;
        }

        nav {
          display: flex;
          gap: 34px;
        }

        nav a {
          color: #dce8ff;
          text-decoration: none;
          font-weight: 800;
          padding: 34px 0 26px;
          border-bottom: 3px solid transparent;
          transition: .22s ease;
        }

        nav a:hover,
        nav a.active {
          color: #24e49b;
          border-bottom-color: #24e49b;
        }

        .userBox {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
        }

        .iconButton,
        .logout {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          border: 0;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(255,255,255,.07);
          cursor: pointer;
          position: relative;
        }

        .iconButton i {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #24e49b;
          box-shadow: 0 0 12px rgba(36,228,155,.9);
        }

        .avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #24e49b, #facc15);
          color: #031226;
          font-weight: 900;
          font-size: 20px;
        }

        .dashboardHero {
          max-width: 1580px;
          margin: 0 auto;
          padding: 54px 72px 36px;
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          gap: 48px;
          align-items: center;
        }

        .intro span {
          display: inline-block;
          color: #24e49b;
          text-transform: uppercase;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .intro h1 {
          margin: 0;
          font-size: clamp(42px,4vw,64px);
          line-height: .98;
          letter-spacing: -2.2px;
        }

        .intro h1 b {
          color: #24e49b;
        }

        .intro p {
          max-width: 560px;
          margin-top: 24px;
          color: #bcd0ec;
          font-size: 18px;
          line-height: 1.55;
        }

        .summary {
          border-radius: 28px;
          padding: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.92), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 26px 90px rgba(0,0,0,.28);
        }

        .summaryTop {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 24px;
          align-items: center;
          padding-bottom: 26px;
          border-bottom: 1px solid rgba(255,255,255,.12);
        }

        .circle {
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at center,#07152f 54%,transparent 56%),
            conic-gradient(#24e49b 0 78%,rgba(255,255,255,.12) 78% 100%);
        }

        .circle strong {
          font-size: 26px;
        }

        .summary h2 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .summary p {
          margin: 0;
          color: #bcd0ec;
        }

        .reportButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 48px;
          padding: 0 20px;
          border-radius: 14px;
          color: #fff;
          text-decoration: none;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.05);
        }

        .summaryCards {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
          padding-top: 24px;
        }

        .metric {
          min-height: 112px;
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
          transition: .25s ease;
        }

        .metric:hover {
          transform: translateY(-4px);
        }

        .metric div {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
        }

        .metric strong {
          display: block;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .metric.green div { background: rgba(36,228,155,.12); color: #24e49b; }
        .metric.blue div { background: rgba(59,130,246,.12); color: #3b82f6; }
        .metric.purple div { background: rgba(168,85,247,.12); color: #a855f7; }

        .cards {
          max-width: 1580px;
          margin: 0 auto;
          padding: 0 72px;
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 22px;
        }

        .cardShell {
          position: relative;
          border-radius: 24px;
          transform: translateY(0) scale(1);
          transition: transform .32s cubic-bezier(.2,.8,.2,1), filter .32s ease;
          will-change: transform;
          cursor: pointer;
        }

        .cardShell:hover {
          transform: translateY(-18px) scale(1.045);
          z-index: 5;
          filter: drop-shadow(0 35px 55px rgba(0,0,0,.45));
        }

        .cardInner {
          position: relative;
          min-height: 142px;
          padding: 26px 70px 26px 24px;
          border-radius: 24px;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 20px;
          align-items: center;
          background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent), transparent 80%), transparent 55%),
            linear-gradient(145deg, rgba(13,42,82,.94), rgba(7,24,52,.98));
          border: 1px solid color-mix(in srgb, var(--accent), rgba(255,255,255,.08) 60%);
          box-shadow: 0 14px 40px rgba(0,0,0,.24);
          display: grid;
        }

        .cardInner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent), transparent 88%), transparent 48%);
          opacity: .65;
          transition: opacity .28s ease;
          pointer-events: none;
        }

        .cardInner::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          border: 1px solid transparent;
          background: linear-gradient(135deg, var(--accent), transparent 40%, rgba(255,255,255,.14)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .28s ease;
          pointer-events: none;
        }

        .cardShell:hover .cardInner {
          border-color: var(--accent);
          box-shadow:
            0 0 65px color-mix(in srgb, var(--accent), transparent 58%),
            0 30px 80px rgba(0,0,0,.4);
        }

        .cardShell:hover .cardInner::before,
        .cardShell:hover .cardInner::after {
          opacity: 1;
        }

        .iconBox {
          position: relative;
          z-index: 1;
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent), transparent 84%);
          border: 1px solid color-mix(in srgb, var(--accent), transparent 52%);
          box-shadow: 0 0 26px color-mix(in srgb, var(--accent), transparent 80%);
          transition: transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease;
        }

        .cardShell:hover .iconBox {
          transform: translateY(-4px) scale(1.16) rotate(-4deg);
          box-shadow: 0 0 42px color-mix(in srgb, var(--accent), transparent 54%);
        }

        .cardText {
          position: relative;
          z-index: 1;
        }

        .cardText h3 {
          margin: 0 0 10px;
          font-size: 18px;
        }

        .cardText p {
          margin: 0;
          color: #c3d4ed;
          line-height: 1.45;
          font-size: 14px;
        }

        .arrow {
          position: absolute;
          z-index: 1;
          right: 22px;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.12);
          transition: transform .28s cubic-bezier(.2,.8,.2,1), background .28s ease;
        }

        .cardShell:hover .arrow {
          transform: translateY(-50%) translateX(10px);
          background: color-mix(in srgb, var(--accent), transparent 70%);
        }

        @media (max-width: 1250px) {
          .navbar { padding: 0 28px; }
          .dashboardHero { grid-template-columns: 1fr; padding: 44px 28px 36px; }
          .cards { grid-template-columns: repeat(2,1fr); padding: 0 28px; }
        }

        @media (max-width: 860px) {
          .navbar {
            height: auto;
            min-height: 88px;
            grid-template-columns: 1fr auto;
            gap: 16px;
            padding: 18px;
          }

          nav {
            grid-column: 1 / -1;
            overflow-x: auto;
            justify-content: flex-start;
          }

          .userText { display: none; }
          .summaryTop { grid-template-columns: 1fr; }
          .summaryCards { grid-template-columns: 1fr; }
        }

        @media (max-width: 680px) {
          .dashboardHero { padding: 34px 18px 28px; }
          .cards { grid-template-columns: 1fr; padding: 0 18px; }

          .cardInner {
            min-height: 126px;
            padding: 22px 64px 22px 18px;
            grid-template-columns: 58px 1fr;
          }

          .iconBox {
            width: 58px;
            height: 58px;
          }
        }
      `}</style>
    </main>
  );
}

