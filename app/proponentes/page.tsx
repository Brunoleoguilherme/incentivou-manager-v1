// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Bell, LogOut, ArrowLeft, Plus, Search, Filter, Users,
  CheckCircle2, AlertTriangle, Upload, Download, Pencil, Trash2,
  X, Save, FileText, Building2, Mail, Phone, MapPin, BadgeCheck,
} from 'lucide-react';

const STORAGE_KEY = 'incentivou_proponentes';

const statusOptions = ['Ativo', 'Em análise', 'Com pendência', 'Inativo'];
const tipoOptions = ['Associação', 'Clube', 'Instituto', 'Federação', 'OSC', 'Entidade pública', 'Outro'];

const iniciais = [
  {
    id: '1',
    nome: 'Instituto Esporte Brasil',
    tipo: 'Instituto',
    cnpj: '00.000.000/0001-00',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    email: 'contato@instituto.com.br',
    telefone: '(31) 99999-9999',
    responsavel: 'Bruno Guilherme',
    status: 'Ativo',
    projetos: 3,
    pendencias: 0,
  },
  {
    id: '2',
    nome: 'Associação Atletas do Futuro',
    tipo: 'Associação',
    cnpj: '11.111.111/0001-11',
    cidade: 'São Paulo',
    estado: 'SP',
    email: 'atletas@exemplo.com.br',
    telefone: '(11) 99999-9999',
    responsavel: 'Equipe Comercial',
    status: 'Com pendência',
    projetos: 1,
    pendencias: 2,
  },
];

export default function ProponentesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nome: '',
    tipo: 'Associação',
    cnpj: '',
    cidade: '',
    estado: '',
    email: '',
    telefone: '',
    responsavel: '',
    status: 'Ativo',
    projetos: 0,
    pendencias: 0,
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
    if (dados.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }, [dados]);

  const filtrados = useMemo(() => {
    return dados.filter((item) => {
      const texto = `${item.nome} ${item.tipo} ${item.cnpj} ${item.cidade} ${item.estado} ${item.email} ${item.responsavel} ${item.status}`.toLowerCase();
      const buscaOk = texto.includes(busca.toLowerCase());
      const statusOk = filtroStatus === 'Todos' || item.status === filtroStatus;
      return buscaOk && statusOk;
    });
  }, [dados, busca, filtroStatus]);

  const metricas = useMemo(() => ({
    total: dados.length,
    ativos: dados.filter((p) => p.status === 'Ativo').length,
    pendencias: dados.reduce((acc, p) => acc + Number(p.pendencias || 0), 0),
    novos: dados.filter((p) => p.status === 'Em análise').length,
    projetos: dados.reduce((acc, p) => acc + Number(p.projetos || 0), 0),
  }), [dados]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  function limparForm() {
    setForm({
      nome: '',
      tipo: 'Associação',
      cnpj: '',
      cidade: '',
      estado: '',
      email: '',
      telefone: '',
      responsavel: '',
      status: 'Ativo',
      projetos: 0,
      pendencias: 0,
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

    if (!form.nome || !form.cnpj) {
      alert('Preencha o nome e o CNPJ do proponente.');
      return;
    }

    if (editandoId) {
      setDados((prev) =>
        prev.map((p) =>
          p.id === editandoId
            ? { ...p, ...form, projetos: Number(form.projetos || 0), pendencias: Number(form.pendencias || 0) }
            : p
        )
      );
    } else {
      setDados((prev) => [
        {
          id: crypto.randomUUID(),
          ...form,
          projetos: Number(form.projetos || 0),
          pendencias: Number(form.pendencias || 0),
        },
        ...prev,
      ]);
    }

    setModalAberto(false);
    limparForm();
  }

  function excluir(id) {
    if (!confirm('Deseja excluir este proponente?')) return;
    setDados((prev) => prev.filter((p) => p.id !== id));
  }

  function baixarModelo() {
    const csv = [
      'Nome;Tipo;CNPJ;Cidade;Estado;Email;Telefone;Responsavel;Status;Projetos;Pendencias',
      'Instituto Exemplo;Instituto;00.000.000/0001-00;Belo Horizonte;MG;contato@exemplo.com.br;(31) 99999-9999;Responsável;Ativo;0;0',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'modelo-proponentes-incentivou.csv';
    link.click();
    URL.revokeObjectURL(url);
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

          <span>Gestão institucional</span>
          <h1>Proponentes</h1>
          <p>
            Cadastre associações, clubes, institutos, federações e entidades sociais,
            acompanhe documentos, responsáveis, pendências e projetos vinculados.
          </p>

          <div className="actions">
            <button onClick={abrirNovo} className="primary"><Plus size={19} /> Novo cadastro</button>
            <button className="secondary"><Upload size={18} /> Importar planilha</button>
            <button onClick={baixarModelo} className="secondary"><Download size={18} /> Baixar modelo</button>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelItem">
            <Users size={24} />
            <strong>{metricas.total}</strong>
            <span>Proponentes cadastrados</span>
          </div>

          <div className="panelItem">
            <FileText size={24} />
            <strong>{metricas.projetos}</strong>
            <span>Projetos vinculados</span>
          </div>

          <div className="panelItem">
            <AlertTriangle size={24} />
            <strong>{metricas.pendencias}</strong>
            <span>Pendências abertas</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div className="metricCard" style={{ "--accent": "#24E49B" } as React.CSSProperties}>
          <div><span>Proponentes</span><strong>{metricas.total}</strong></div>
          <Users size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#22C55E" } as React.CSSProperties}>
          <div><span>Ativos</span><strong>{metricas.ativos}</strong></div>
          <CheckCircle2 size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#F43F5E" } as React.CSSProperties}>
          <div><span>Com pendências</span><strong>{metricas.pendencias}</strong></div>
          <AlertTriangle size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#3B82F6" } as React.CSSProperties}>
          <div><span>Em análise</span><strong>{metricas.novos}</strong></div>
          <BadgeCheck size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Lista de proponentes</h2>
            <p>Pesquise, filtre e acompanhe todas as entidades cadastradas.</p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar proponente..."
              />
            </label>

            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option>Todos</option>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>

            <button className="filterBtn"><Filter size={18} /> Filtrar</button>
          </div>
        </div>

        <div className="projectGrid">
          {filtrados.map((item) => (
            <div
              key={item.id}
              className="projectShell"
              style={{ "--accent": item.status === 'Com pendência' ? '#F43F5E' : '#24E49B' } as React.CSSProperties}
            >
              <div className="projectInner">
                <div className="projectTop">
                  <div>
                    <span className="status">{item.status}</span>
                    <h3>{item.nome}</h3>
                    <p>{item.tipo} · {item.cnpj}</p>
                  </div>

                  <div className="projectActions">
                    <button onClick={() => abrirEditar(item)}><Pencil size={17} /></button>
                    <button onClick={() => excluir(item.id)}><Trash2 size={17} /></button>
                  </div>
                </div>

                <div className="infoList">
                  <span><MapPin size={15} /> {item.cidade || '-'} / {item.estado || '-'}</span>
                  <span><Mail size={15} /> {item.email || '-'}</span>
                  <span><Phone size={15} /> {item.telefone || '-'}</span>
                  <span><Building2 size={15} /> Responsável: {item.responsavel || '-'}</span>
                </div>

                <div className="values">
                  <div>
                    <span>Projetos</span>
                    <strong>{item.projetos || 0}</strong>
                  </div>

                  <div>
                    <span>Pendências</span>
                    <strong>{item.pendencias || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtrados.length === 0 && (
            <div className="empty">Nenhum proponente encontrado com os filtros selecionados.</div>
          )}
        </div>
      </section>

      {modalAberto && (
        <div className="modalOverlay">
          <form className="modal" onSubmit={salvar}>
            <div className="modalHeader">
              <div>
                <span>{editandoId ? 'Editar proponente' : 'Novo proponente'}</span>
                <h2>{editandoId ? 'Atualizar cadastro' : 'Cadastrar proponente'}</h2>
              </div>

              <button type="button" onClick={() => setModalAberto(false)}><X size={20} /></button>
            </div>

            <div className="formGrid">
              <label>Nome da entidade *<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>

              <label>Tipo
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {tipoOptions.map((tipo) => <option key={tipo}>{tipo}</option>)}
                </select>
              </label>

              <label>CNPJ *<input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></label>

              <label>Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>

              <label>Cidade<input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></label>
              <label>Estado<input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></label>
              <label>E-mail<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label>Telefone<input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></label>
              <label>Responsável legal<input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></label>
              <label>Projetos vinculados<input type="number" value={form.projetos} onChange={(e) => setForm({ ...form, projetos: Number(e.target.value) })} /></label>
              <label>Pendências<input type="number" value={form.pendencias} onChange={(e) => setForm({ ...form, pendencias: Number(e.target.value) })} /></label>
            </div>

            <div className="modalFooter">
              <button type="button" className="cancel" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="save"><Save size={18} /> Salvar proponente</button>
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
        .modal select {
          width: 100%;
          height: 52px;
          border: 0;
          outline: none;
          background: transparent;
          color: #fff;
          font-weight: 700;
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
          min-height: 270px;
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

        .values span {
          display: block;
          color: #bcd0ec;
          margin-bottom: 8px;
        }

        .values strong {
          font-size: 24px;
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

        .modal input {
          border-radius: 15px;
          padding: 0 16px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        .modalFooter {
          justify-content: flex-end;
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

