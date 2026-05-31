// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Bell, LogOut, ArrowLeft, Plus, Search, Filter, Target,
  CheckCircle2, Upload, Download, Pencil, Trash2,
  X, Save, Mail, Phone, Building2, Wallet, Handshake, Calendar,
  UserRound, FileText, TrendingUp,
} from 'lucide-react';


const STORAGE_KEY = 'incentivou_captacao';

const statusOptions = [
  'Lead novo',
  'Contato feito',
  'Proposta enviada',
  'Em negociação',
  'Contrato enviado',
  'Fechado',
  'Perdido',
];

const origemOptions = [
  'Indicação',
  'Site',
  'Simulador',
  'LinkedIn',
  'Evento',
  'Prospecção ativa',
  'Outro',
];

const iniciais = [
  {
    id: '1',
    empresa: 'Apoio Brasil',
    contato: 'Mariana Silva',
    email: 'marketing@apoiobrasil.com.br',
    telefone: '(31) 99999-9999',
    projeto: 'Projeto Esporte para Todos',
    origem: 'Indicação',
    status: 'Em negociação',
    valorPrevisto: 650000,
    probabilidade: 70,
    proximoFollowup: '2026-06-12',
    observacoes: 'Empresa interessada em impacto social e ESG.',
  },
  {
    id: '2',
    empresa: 'Grupo Incentivo Nacional',
    contato: 'Roberto Lima',
    email: 'patrocinios@grupo.com.br',
    telefone: '(11) 99999-9999',
    projeto: 'Formação Olímpica Comunitária',
    origem: 'Prospecção ativa',
    status: 'Proposta enviada',
    valorPrevisto: 350000,
    probabilidade: 45,
    proximoFollowup: '2026-06-18',
    observacoes: 'Aguardando retorno da diretoria fiscal.',
  },
];

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function dataBR(data) {
  if (!data) return '-';
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function CaptacaoPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    empresa: '',
    contato: '',
    email: '',
    telefone: '',
    projeto: '',
    origem: 'Prospecção ativa',
    status: 'Lead novo',
    valorPrevisto: '',
    probabilidade: 10,
    proximoFollowup: '',
    observacoes: '',
  });

  useEffect(() => {
    const salvo = localStorage.getItem('incentivou_usuario');

    if (!salvo) {
      router.push('/login');
      return;
    }

    setUsuario(JSON.parse(salvo));

    const salvos = localStorage.getItem(STORAGE_KEY);

    if (salvos) {
      setDados(JSON.parse(salvos));
    } else {
      setDados(iniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    }
  }, [router]);

  useEffect(() => {
    if (dados.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
  }, [dados]);

  const filtrados = useMemo(() => {
    return dados.filter((item) => {
      const texto = `${item.empresa} ${item.contato} ${item.email} ${item.projeto} ${item.origem} ${item.status}`.toLowerCase();
      const buscaOk = texto.includes(busca.toLowerCase());
      const statusOk = filtroStatus === 'Todos' || item.status === filtroStatus;
      return buscaOk && statusOk;
    });
  }, [dados, busca, filtroStatus]);

  const metricas = useMemo(() => ({
    leads: dados.length,
    propostas: dados.filter((p) =>
      ['Proposta enviada', 'Em negociação', 'Contrato enviado', 'Fechado'].includes(p.status)
    ).length,
    negociacoes: dados.filter((p) => p.status === 'Em negociação').length,
    fechados: dados.filter((p) => p.status === 'Fechado').length,
    valorPrevisto: dados.reduce((acc, p) => acc + Number(p.valorPrevisto || 0), 0),
    valorPonderado: dados.reduce(
      (acc, p) => acc + (Number(p.valorPrevisto || 0) * Number(p.probabilidade || 0)) / 100,
      0
    ),
  }), [dados]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  function limparForm() {
    setForm({
      empresa: '',
      contato: '',
      email: '',
      telefone: '',
      projeto: '',
      origem: 'Prospecção ativa',
      status: 'Lead novo',
      valorPrevisto: '',
      probabilidade: 10,
      proximoFollowup: '',
      observacoes: '',
    });
    setEditandoId(null);
  }

  function abrirNovo() {
    limparForm();
    setModalAberto(true);
  }

  function abrirEditar(item) {
    setEditandoId(item.id);
    setForm({ ...item });
    setModalAberto(true);
  }

  function salvar(e) {
    e.preventDefault();

    if (!form.empresa || !form.contato) {
      alert('Preencha a empresa e o contato.');
      return;
    }

    const payload = {
      ...form,
      valorPrevisto: Number(form.valorPrevisto || 0),
      probabilidade: Number(form.probabilidade || 0),
    };

    if (editandoId) {
      setDados((prev) =>
        prev.map((p) => (p.id === editandoId ? { ...p, ...payload } : p))
      );
    } else {
      setDados((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev]);
    }

    setModalAberto(false);
    limparForm();
  }

  function excluir(id) {
    if (!confirm('Deseja excluir esta oportunidade?')) return;
    setDados((prev) => prev.filter((p) => p.id !== id));
  }

  function baixarModelo() {
    const csv = [
      'Empresa;Contato;Email;Telefone;Projeto;Origem;Status;Valor Previsto;Probabilidade;Proximo Followup;Observacoes',
      'Empresa Exemplo;Contato Exemplo;contato@exemplo.com.br;(31) 99999-9999;Projeto Exemplo;Prospecção ativa;Lead novo;100000;10;2026-12-31;Observações',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'modelo-captacao-incentivou.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function importarPlanilha(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    alert(`Arquivo selecionado para importação: ${file.name}`);

    e.target.value = '';
  }

  if (!usuario) return null;

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/dashboard" className="brand">
          <div className="brandIcon"><Trophy size={24} /></div>
          <div>
            <strong>IncentiVou</strong>
            <span>Manager</span>
          </div>
        </Link>

        <nav>
          <Link href="/dashboard">Início</Link>
          <Link href="/simulacoes">Simulações</Link>
          <Link href="/site-publico">Site Público</Link>
          <Link href="/simulador">Simulador</Link>
        </nav>

        <div className="userBox">
          <button className="iconButton"><Bell size={19} /><i /></button>
          <div className="avatar">B</div>
          <div className="userText">
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>
          <button onClick={sair} className="logout"><LogOut size={18} /></button>
        </div>
      </header>

      <section className="hero">
        <div>
          <Link href="/dashboard" className="backLink">
            <ArrowLeft size={17} />
            Voltar ao dashboard
          </Link>

          <span>CRM e pipeline comercial</span>
          <h1>Captação Inteligente</h1>
          <p>
            Transforme projetos aprovados em patrocínio incentivado com funil comercial,
            leads, propostas, follow-ups, contratos em negociação e previsão de receita.
          </p>

          <div className="actions">
            <button type="button" onClick={abrirNovo} className="primary">
              <Plus size={19} />
              Novo lead
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Importar planilha
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={importarPlanilha}
            />

            <button type="button" onClick={baixarModelo} className="secondary">
              <Download size={18} />
              Baixar modelo
            </button>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelItem">
            <Target size={24} />
            <strong>{metricas.leads}</strong>
            <span>Leads cadastrados</span>
          </div>

          <div className="panelItem">
            <Wallet size={24} />
            <strong>{moeda(metricas.valorPrevisto)}</strong>
            <span>Valor previsto</span>
          </div>

          <div className="panelItem">
            <TrendingUp size={24} />
            <strong>{moeda(metricas.valorPonderado)}</strong>
            <span>Forecast ponderado</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div className="metricCard" style={{ '--accent': '#24E49B' } as React.CSSProperties}>
          <div><span>Leads</span><strong>{metricas.leads}</strong></div>
          <Target size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#3B82F6" } as React.CSSProperties}>
          <div><span>Propostas</span><strong>{metricas.propostas}</strong></div>
          <FileText size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#FB923C" } as React.CSSProperties}>
          <div><span>Negociações</span><strong>{metricas.negociacoes}</strong></div>
          <Handshake size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#22C55E" } as React.CSSProperties}>
          <div><span>Fechados</span><strong>{metricas.fechados}</strong></div>
          <CheckCircle2 size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Pipeline de captação</h2>
            <p>Pesquise, filtre e acompanhe oportunidades comerciais e follow-ups.</p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar lead..."
              />
            </label>

            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option>Todos</option>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>

            <button type="button" className="filterBtn">
              <Filter size={18} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="projectGrid">
          {filtrados.map((item) => {
            const cor =
              item.status === 'Fechado' ? '#22C55E' :
              item.status === 'Perdido' ? '#F43F5E' :
              item.status === 'Em negociação' ? '#FB923C' :
              '#24E49B';

            return (
              <div key={item.id} className="projectShell" style={{ "--accent": cor } as React.CSSProperties}>
                <div className="projectInner">
                  <div className="projectTop">
                    <div>
                      <span className="status">{item.status}</span>
                      <h3>{item.empresa}</h3>
                      <p>{item.projeto || 'Projeto não vinculado'}</p>
                    </div>

                    <div className="projectActions">
                      <button type="button" onClick={() => abrirEditar(item)}>
                        <Pencil size={17} />
                      </button>

                      <button type="button" onClick={() => excluir(item.id)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="infoList">
                    <span><UserRound size={15} /> {item.contato || '-'}</span>
                    <span><Mail size={15} /> {item.email || '-'}</span>
                    <span><Phone size={15} /> {item.telefone || '-'}</span>
                    <span><Building2 size={15} /> Origem: {item.origem || '-'}</span>
                    <span><Calendar size={15} /> Próximo follow-up: {dataBR(item.proximoFollowup)}</span>
                  </div>

                  <div className="values">
                    <div>
                      <span>Valor previsto</span>
                      <strong>{moeda(item.valorPrevisto)}</strong>
                    </div>

                    <div>
                      <span>Probabilidade</span>
                      <strong>{item.probabilidade || 0}%</strong>
                    </div>
                  </div>

                  <div className="progressArea">
                    <div>
                      <span>Chance de fechamento</span>
                      <b>{item.probabilidade || 0}%</b>
                    </div>

                    <div className="bar">
                      <i style={{ width: `${item.probabilidade || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div className="empty">
              Nenhuma oportunidade encontrada com os filtros selecionados.
            </div>
          )}
        </div>
      </section>

      {modalAberto && (
        <div className="modalOverlay">
          <form className="modal" onSubmit={salvar}>
            <div className="modalHeader">
              <div>
                <span>{editandoId ? 'Editar oportunidade' : 'Nova oportunidade'}</span>
                <h2>{editandoId ? 'Atualizar captação' : 'Cadastrar lead'}</h2>
              </div>

              <button type="button" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="formGrid">
              <label>
                Empresa *
                <input
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                />
              </label>

              <label>
                Contato *
                <input
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                />
              </label>

              <label>
                E-mail
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>

              <label>
                Telefone
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </label>

              <label>
                Projeto vinculado
                <input
                  value={form.projeto}
                  onChange={(e) => setForm({ ...form, projeto: e.target.value })}
                />
              </label>

              <label>
                Origem
                <select
                  value={form.origem}
                  onChange={(e) => setForm({ ...form, origem: e.target.value })}
                >
                  {origemOptions.map((origem) => <option key={origem}>{origem}</option>)}
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>

              <label>
                Valor previsto
                <input
                  type="number"
                  value={form.valorPrevisto}
                  onChange={(e) => setForm({ ...form, valorPrevisto: e.target.value })}
                />
              </label>

              <label>
                Probabilidade (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.probabilidade}
                  onChange={(e) => setForm({ ...form, probabilidade: Number(e.target.value) })}
                />
              </label>

              <label>
                Próximo follow-up
                <input
                  type="date"
                  value={form.proximoFollowup}
                  onChange={(e) => setForm({ ...form, proximoFollowup: e.target.value })}
                />
              </label>

              <label className="full">
                Observações
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
              </label>
            </div>

            <div className="modalFooter">
              <button type="button" className="cancel" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>

              <button type="submit" className="save">
                <Save size={18} />
                Salvar oportunidade
              </button>
            </div>
          </form>
        </div>
      )}

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

        nav a:hover {
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

        .hero {
          max-width: 1580px;
          margin: 0 auto;
          padding: 54px 72px 36px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 42px;
          align-items: stretch;
        }

        .backLink {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #bcd0ec;
          text-decoration: none;
          font-weight: 800;
          margin-bottom: 22px;
        }

        .hero > div:first-child {
          border-radius: 28px;
          padding: 42px;
          background:
            radial-gradient(circle at top left, rgba(36,228,155,.24), transparent 35%),
            linear-gradient(135deg, rgba(13,42,82,.92), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 26px 90px rgba(0,0,0,.28);
        }

        .hero span {
          display: inline-block;
          color: #24e49b;
          text-transform: uppercase;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 14px;
          letter-spacing: 2px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(42px,4vw,64px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .hero p {
          max-width: 850px;
          color: #bcd0ec;
          font-size: 19px;
          line-height: 1.55;
          margin: 22px 0 0;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 30px;
        }

        .primary,
        .secondary,
        .filterBtn,
        .save,
        .cancel {
          border: 0;
          border-radius: 15px;
          min-height: 50px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 900;
          cursor: pointer;
          transition: .22s ease;
        }

        .primary,
        .save {
          color: #031226;
          background: linear-gradient(135deg, #24e49b, #14b8a6);
        }

        .secondary,
        .filterBtn,
        .cancel {
          color: #fff;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        .primary:hover,
        .secondary:hover,
        .filterBtn:hover,
        .save:hover,
        .cancel:hover {
          transform: translateY(-3px);
        }

        .heroPanel {
          border-radius: 28px;
          padding: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.92), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
          display: grid;
          gap: 18px;
        }

        .panelItem {
          border-radius: 20px;
          padding: 22px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
        }

        .panelItem svg {
          color: #24e49b;
          margin-bottom: 14px;
        }

        .panelItem strong {
          display: block;
          font-size: 28px;
          color: #24e49b;
          margin-bottom: 6px;
        }

        .panelItem span {
          color: #bcd0ec;
        }

        .metricsGrid {
          max-width: 1580px;
          margin: 0 auto;
          padding: 0 72px 26px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .metricCard {
          border-radius: 22px;
          padding: 24px;
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent), transparent 78%), transparent 42%),
            linear-gradient(145deg, rgba(13,42,82,.88), rgba(7,24,52,.96));
          border: 1px solid color-mix(in srgb, var(--accent), rgba(255,255,255,.08) 65%);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metricCard span {
          display: block;
          color: #bcd0ec;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .metricCard strong {
          font-size: 36px;
        }

        .metricCard svg {
          color: var(--accent);
        }

        .listCard {
          max-width: 1580px;
          margin: 0 auto;
          padding: 30px;
          width: calc(100% - 144px);
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.92), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 26px 90px rgba(0,0,0,.24);
        }

        .listHeader {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          align-items: center;
          margin-bottom: 24px;
        }

        .listHeader h2 {
          margin: 0 0 8px;
          font-size: 32px;
        }

        .listHeader p {
          margin: 0;
          color: #bcd0ec;
        }

        .filters {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .searchBox {
          height: 52px;
          min-width: 280px;
          border-radius: 15px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          color: #bcd0ec;
        }

        .searchBox input,
        .filters select,
        .modal input,
        .modal select,
        .modal textarea {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: #fff;
          font-weight: 700;
        }

        .searchBox input,
        .filters select,
        .modal input,
        .modal select {
          height: 52px;
        }

        .modal textarea {
          min-height: 110px;
          resize: vertical;
          padding-top: 14px;
        }

        .filters select,
        .modal select {
          border-radius: 15px;
          padding: 0 16px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        .projectGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .projectShell {
          border-radius: 24px;
          transform: translateY(0) scale(1);
          transition: transform .32s cubic-bezier(.2,.8,.2,1), filter .32s ease;
          cursor: pointer;
        }

        .projectShell:hover {
          transform: translateY(-14px) scale(1.025);
          z-index: 5;
          filter: drop-shadow(0 30px 50px rgba(0,0,0,.45));
        }

        .projectInner {
          min-height: 340px;
          border-radius: 24px;
          padding: 24px;
          background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent), transparent 82%), transparent 50%),
            linear-gradient(145deg, rgba(13,42,82,.94), rgba(7,24,52,.98));
          border: 1px solid color-mix(in srgb, var(--accent), rgba(255,255,255,.08) 60%);
          box-shadow: 0 14px 40px rgba(0,0,0,.24);
        }

        .projectShell:hover .projectInner {
          border-color: var(--accent);
          box-shadow:
            0 0 55px color-mix(in srgb, var(--accent), transparent 62%),
            0 30px 80px rgba(0,0,0,.4);
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .status {
          display: inline-flex;
          color: #031226;
          background: #24e49b;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .projectTop h3 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .projectTop p {
          margin: 0;
          color: #bcd0ec;
        }

        .projectActions {
          display: flex;
          gap: 8px;
        }

        .projectActions button {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.06);
          color: #fff;
          cursor: pointer;
        }

        .infoList {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .infoList span {
          color: #bcd0ec;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          line-height: 1.35;
        }

        .values {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-top: 22px;
        }

        .values div {
          flex: 1;
          border-radius: 16px;
          padding: 16px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
        }

        .values span,
        .progressArea span {
          display: block;
          color: #bcd0ec;
          margin-bottom: 8px;
        }

        .values strong {
          font-size: 20px;
        }

        .progressArea {
          margin-top: 22px;
        }

        .progressArea > div:first-child {
          display: flex;
          justify-content: space-between;
        }

        .bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.09);
          overflow: hidden;
        }

        .bar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #24e49b, #14b8a6);
        }

        .empty {
          grid-column: 1 / -1;
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          background: rgba(255,255,255,.05);
          color: #bcd0ec;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(10px);
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .modal {
          width: 100%;
          max-width: 920px;
          border-radius: 28px;
          padding: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.98), rgba(7,24,52,.98));
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 40px 120px rgba(0,0,0,.55);
        }

        .modalHeader,
        .modalFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .modalHeader span {
          color: #24e49b;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 13px;
        }

        .modalHeader h2 {
          margin: 6px 0 0;
          font-size: 30px;
        }

        .modalHeader button {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.06);
          color: #fff;
          cursor: pointer;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin: 26px 0;
        }

        .modal label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 900;
          color: #dce8ff;
        }

        .modal input,
        .modal textarea {
          border-radius: 15px;
          padding-left: 16px;
          padding-right: 16px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        .modalFooter {
          justify-content: flex-end;
        }

        .full {
          grid-column: 1 / -1;
        }

        @media (max-width: 1250px) {
          .navbar { padding: 0 28px; }
          .hero { grid-template-columns: 1fr; padding: 44px 28px 36px; }
          .metricsGrid { grid-template-columns: repeat(2, 1fr); padding: 0 28px 26px; }
          .listCard { width: calc(100% - 56px); }
          .projectGrid { grid-template-columns: repeat(2, 1fr); }
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
          .listHeader { flex-direction: column; align-items: stretch; }
          .filters { flex-direction: column; align-items: stretch; }
          .searchBox { min-width: 100%; }
          .formGrid { grid-template-columns: 1fr; }
          .projectGrid { grid-template-columns: 1fr; }
          .full { grid-column: auto; }
        }

        @media (max-width: 680px) {
          .hero { padding: 34px 18px 28px; }
          .hero > div:first-child { padding: 26px; }
          .metricsGrid { grid-template-columns: 1fr; padding: 0 18px 22px; }
          .listCard { width: calc(100% - 36px); padding: 20px; }
        }
      `}</style>
    </main>
  );
}

