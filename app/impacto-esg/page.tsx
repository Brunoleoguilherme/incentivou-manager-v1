// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Bell, LogOut, ArrowLeft, Plus, Search, Filter,
  Leaf, Users, Target, HeartHandshake, Pencil, Trash2,
  X, Save, Calendar, MapPin, FileText, BadgeCheck, Sparkles,
  BarChart3, Eye, Building2,
} from 'lucide-react';

const STORAGE_KEY = 'incentivou_impacto_esg';

const statusOptions = ['Planejado', 'Em execução', 'Concluído', 'Em análise', 'Risco'];
const eixoOptions = ['ODS', 'Social', 'Educação', 'Saúde', 'Meio ambiente', 'Diversidade', 'Comunidade'];

const iniciais = [
  {
    id: '1',
    projeto: 'Esporte para Todos',
    eixo: 'Social',
    ods: 'ODS 3 - Saúde e Bem-estar',
    indicador: 'Crianças e adolescentes atendidos',
    beneficiarios: 600,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    patrocinador: 'Empresa Apoio Brasil',
    status: 'Em execução',
    impacto: 'Atendimento esportivo e educacional em comunidades vulneráveis.',
    resultado: '420 beneficiários já impactados diretamente.',
    prazo: '2026-12-31',
  },
  {
    id: '2',
    projeto: 'Flag Football nas Escolas',
    eixo: 'Educação',
    ods: 'ODS 4 - Educação de qualidade',
    indicador: 'Escolas participantes',
    beneficiarios: 1200,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    patrocinador: 'Grupo Incentivo Nacional',
    status: 'Planejado',
    impacto: 'Introdução do esporte como ferramenta de educação e inclusão.',
    resultado: 'Projeto em fase de implantação.',
    prazo: '2026-09-30',
  },
];

function dataBR(data) {
  if (!data) return '-';
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function ImpactoESGPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroEixo, setFiltroEixo] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    projeto: '',
    eixo: 'Social',
    ods: '',
    indicador: '',
    beneficiarios: '',
    cidade: '',
    estado: '',
    patrocinador: '',
    status: 'Planejado',
    impacto: '',
    resultado: '',
    prazo: '',
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
      const texto = `${item.projeto} ${item.eixo} ${item.ods} ${item.indicador} ${item.cidade} ${item.estado} ${item.patrocinador} ${item.status}`.toLowerCase();
      const buscaOk = texto.includes(busca.toLowerCase());
      const statusOk = filtroStatus === 'Todos' || item.status === filtroStatus;
      const eixoOk = filtroEixo === 'Todos' || item.eixo === filtroEixo;
      return buscaOk && statusOk && eixoOk;
    });
  }, [dados, busca, filtroStatus, filtroEixo]);

  const metricas = useMemo(() => ({
    projetos: dados.length,
    beneficiarios: dados.reduce((acc, p) => acc + Number(p.beneficiarios || 0), 0),
    concluidos: dados.filter((p) => p.status === 'Concluído').length,
    ods: new Set(dados.map((p) => p.ods).filter(Boolean)).size,
    patrocinadores: new Set(dados.map((p) => p.patrocinador).filter(Boolean)).size,
  }), [dados]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  function limparForm() {
    setForm({
      projeto: '',
      eixo: 'Social',
      ods: '',
      indicador: '',
      beneficiarios: '',
      cidade: '',
      estado: '',
      patrocinador: '',
      status: 'Planejado',
      impacto: '',
      resultado: '',
      prazo: '',
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

    if (!form.projeto || !form.indicador) {
      alert('Preencha o projeto e o indicador.');
      return;
    }

    const payload = {
      ...form,
      beneficiarios: Number(form.beneficiarios || 0),
    };

    if (editandoId) {
      setDados((prev) => prev.map((p) => (p.id === editandoId ? { ...p, ...payload } : p)));
    } else {
      setDados((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev]);
    }

    setModalAberto(false);
    limparForm();
  }

  function excluir(id) {
    if (!confirm('Deseja excluir este indicador de impacto?')) return;
    setDados((prev) => prev.filter((p) => p.id !== id));
  }

  function verRelatorio(item) {
    alert(
      `Relatório ESG\n\nProjeto: ${item.projeto}\nEixo: ${item.eixo}\nODS: ${item.ods}\nBeneficiários: ${item.beneficiarios}\nImpacto: ${item.impacto}`
    );
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

          <span>Impacto social, ODS e ESG</span>
          <h1>Impacto e ESG</h1>
          <p>
            Mensure beneficiários, indicadores sociais, ODS, impacto territorial,
            contrapartidas ESG e relatórios para empresas apoiadoras.
          </p>

          <div className="actions">
            <button type="button" onClick={abrirNovo} className="primary">
              <Plus size={19} />
              Novo indicador
            </button>

            <button type="button" className="secondary" onClick={() => alert('Relatório ESG consolidado será gerado na próxima etapa.')}>
              <BarChart3 size={18} />
              Gerar relatório ESG
            </button>

            <button type="button" className="secondary" onClick={() => alert('Dashboard público de impacto em preparação.')}>
              <Sparkles size={18} />
              Dashboard de impacto
            </button>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelItem">
            <Users size={24} />
            <strong>{metricas.beneficiarios.toLocaleString('pt-BR')}</strong>
            <span>Beneficiários impactados</span>
          </div>

          <div className="panelItem">
            <Leaf size={24} />
            <strong>{metricas.ods}</strong>
            <span>ODS monitorados</span>
          </div>

          <div className="panelItem">
            <Building2 size={24} />
            <strong>{metricas.patrocinadores}</strong>
            <span>Empresas com impacto vinculado</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div className="metricCard" style={{ "--accent": "#24E49B" } as React.CSSProperties}>
          <div><span>Projetos monitorados</span><strong>{metricas.projetos}</strong></div>
          <Target size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#22C55E" } as React.CSSProperties}>
          <div><span>Beneficiários</span><strong>{metricas.beneficiarios.toLocaleString('pt-BR')}</strong></div>
          <Users size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#A855F7" } as React.CSSProperties}>
          <div><span>ODS</span><strong>{metricas.ods}</strong></div>
          <Leaf size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#3B82F6" } as React.CSSProperties}>
          <div><span>Concluídos</span><strong>{metricas.concluidos}</strong></div>
          <BadgeCheck size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Indicadores de impacto</h2>
            <p>Pesquise, filtre e acompanhe métricas sociais, ODS, ESG e resultados por projeto.</p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar impacto..."
              />
            </label>

            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option>Todos</option>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>

            <select value={filtroEixo} onChange={(e) => setFiltroEixo(e.target.value)}>
              <option>Todos</option>
              {eixoOptions.map((eixo) => <option key={eixo}>{eixo}</option>)}
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
              item.status === 'Concluído' ? '#22C55E' :
              item.status === 'Risco' ? '#F43F5E' :
              item.status === 'Em análise' ? '#FB923C' :
              item.eixo === 'Meio ambiente' ? '#24E49B' :
              '#3B82F6';

            return (
              <div key={item.id} className="projectShell" style={{ "--accent": cor } as React.CSSProperties}>
                <div className="projectInner">
                  <div className="projectTop">
                    <div>
                      <span className="status">{item.status}</span>
                      <h3>{item.projeto}</h3>
                      <p>{item.eixo} · {item.ods || 'ODS não informado'}</p>
                    </div>

                    <div className="projectActions">
                      <button type="button" onClick={() => verRelatorio(item)}>
                        <Eye size={17} />
                      </button>

                      <button type="button" onClick={() => abrirEditar(item)}>
                        <Pencil size={17} />
                      </button>

                      <button type="button" onClick={() => excluir(item.id)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="impactBox">
                    <div>
                      <Users size={22} />
                      <strong>{Number(item.beneficiarios || 0).toLocaleString('pt-BR')}</strong>
                    </div>
                    <span>Beneficiários</span>
                  </div>

                  <div className="infoList">
                    <span><FileText size={15} /> Indicador: {item.indicador || '-'}</span>
                    <span><MapPin size={15} /> {item.cidade || '-'} / {item.estado || '-'}</span>
                    <span><Building2 size={15} /> Patrocinador: {item.patrocinador || '-'}</span>
                    <span><Calendar size={15} /> Prazo: {dataBR(item.prazo)}</span>
                    <span><Sparkles size={15} /> Impacto: {item.impacto || '-'}</span>
                    <span><BadgeCheck size={15} /> Resultado: {item.resultado || '-'}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div className="empty">
              Nenhum indicador ESG encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </section>

      {modalAberto && (
        <div className="modalOverlay">
          <form className="modal" onSubmit={salvar}>
            <div className="modalHeader">
              <div>
                <span>{editandoId ? 'Editar indicador' : 'Novo indicador ESG'}</span>
                <h2>{editandoId ? 'Atualizar impacto' : 'Cadastrar impacto'}</h2>
              </div>

              <button type="button" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="formGrid">
              <label>
                Projeto *
                <input value={form.projeto} onChange={(e) => setForm({ ...form, projeto: e.target.value })} />
              </label>

              <label>
                Eixo
                <select value={form.eixo} onChange={(e) => setForm({ ...form, eixo: e.target.value })}>
                  {eixoOptions.map((eixo) => <option key={eixo}>{eixo}</option>)}
                </select>
              </label>

              <label>
                ODS
                <input value={form.ods} onChange={(e) => setForm({ ...form, ods: e.target.value })} placeholder="Ex: ODS 3 - Saúde e Bem-estar" />
              </label>

              <label>
                Indicador *
                <input value={form.indicador} onChange={(e) => setForm({ ...form, indicador: e.target.value })} />
              </label>

              <label>
                Beneficiários
                <input type="number" value={form.beneficiarios} onChange={(e) => setForm({ ...form, beneficiarios: e.target.value })} />
              </label>

              <label>
                Patrocinador
                <input value={form.patrocinador} onChange={(e) => setForm({ ...form, patrocinador: e.target.value })} />
              </label>

              <label>
                Cidade
                <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </label>

              <label>
                Estado
                <input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
              </label>

              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>

              <label>
                Prazo
                <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
              </label>

              <label className="full">
                Impacto
                <textarea value={form.impacto} onChange={(e) => setForm({ ...form, impacto: e.target.value })} />
              </label>

              <label className="full">
                Resultado
                <textarea value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value })} />
              </label>
            </div>

            <div className="modalFooter">
              <button type="button" className="cancel" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>

              <button type="submit" className="save">
                <Save size={18} />
                Salvar impacto
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
          font-size: 27px;
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
          font-size: 32px;
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
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: flex-end;
        }

        .searchBox {
          height: 52px;
          min-width: 260px;
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
          min-width: 150px;
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
          min-height: 400px;
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

        .impactBox {
          margin-top: 22px;
          border-radius: 20px;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,.045);
          border: 1px solid color-mix(in srgb, var(--accent), transparent 62%);
        }

        .impactBox div {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--accent);
        }

        .impactBox strong {
          font-size: 30px;
        }

        .impactBox span {
          color: #bcd0ec;
          font-weight: 800;
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
          max-width: 980px;
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

