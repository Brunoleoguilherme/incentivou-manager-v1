// @ts-nocheck
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, Bell, LogOut, ArrowLeft, Plus, Search, Filter,
  Wallet, CheckCircle2, AlertTriangle, Upload, Download,
  Pencil, Trash2, X, Save, Calendar, FileText, Building2,
  UserRound, ReceiptText, TrendingUp, TrendingDown, Landmark,
} from 'lucide-react';

const STORAGE_KEY = 'incentivou_financeiro';

const statusOptions = [
  'Previsto',
  'Realizado',
  'Pago',
  'Pendente',
  'Atrasado',
  'Cancelado',
];

const tipoOptions = [
  'Entrada incentivada',
  'Pagamento',
  'Nota fiscal',
  'Comprovante',
  'Repasse',
  'Centro de custo',
  'Despesa operacional',
];

const iniciais = [
  {
    id: '1',
    projeto: 'Projeto Esporte para Todos',
    tipo: 'Entrada incentivada',
    descricao: 'Entrada de patrocínio incentivado.',
    responsavel: 'Financeiro',
    favorecido: 'Instituto Esporte Brasil',
    status: 'Realizado',
    valor: 320000,
    vencimento: '2026-06-20',
    observacoes: 'Valor captado via patrocinador master.',
  },
  {
    id: '2',
    projeto: 'Formação Olímpica Comunitária',
    tipo: 'Pagamento',
    descricao: 'Pagamento de materiais esportivos.',
    responsavel: 'Operações',
    favorecido: 'Fornecedor Alpha',
    status: 'Pendente',
    valor: 45000,
    vencimento: '2026-06-18',
    observacoes: 'Aguardando nota fiscal.',
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

export default function FinanceiroPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    projeto: '',
    tipo: 'Entrada incentivada',
    descricao: '',
    responsavel: '',
    favorecido: '',
    status: 'Previsto',
    valor: '',
    vencimento: '',
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
      const texto = `${item.projeto} ${item.tipo} ${item.descricao} ${item.responsavel} ${item.favorecido} ${item.status}`.toLowerCase();
      const buscaOk = texto.includes(busca.toLowerCase());
      const statusOk = filtroStatus === 'Todos' || item.status === filtroStatus;
      return buscaOk && statusOk;
    });
  }, [dados, busca, filtroStatus]);

  const metricas = useMemo(() => {
    const entradas = dados
      .filter((p) => p.tipo === 'Entrada incentivada' || p.tipo === 'Repasse')
      .reduce((acc, p) => acc + Number(p.valor || 0), 0);

    const saidas = dados
      .filter((p) => !['Entrada incentivada', 'Repasse'].includes(p.tipo))
      .reduce((acc, p) => acc + Number(p.valor || 0), 0);

    return {
      aprovado: 12400000,
      captado: entradas,
      executado: saidas,
      saldo: entradas - saidas,
      pendentes: dados.filter((p) => p.status === 'Pendente' || p.status === 'Atrasado').length,
      realizados: dados.filter((p) => p.status === 'Realizado' || p.status === 'Pago').length,
    };
  }, [dados]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  function limparForm() {
    setForm({
      projeto: '',
      tipo: 'Entrada incentivada',
      descricao: '',
      responsavel: '',
      favorecido: '',
      status: 'Previsto',
      valor: '',
      vencimento: '',
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

    if (!form.projeto || !form.descricao) {
      alert('Preencha o projeto e a descrição.');
      return;
    }

    const payload = {
      ...form,
      valor: Number(form.valor || 0),
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
    if (!confirm('Deseja excluir este lançamento financeiro?')) return;
    setDados((prev) => prev.filter((p) => p.id !== id));
  }

  function baixarModelo() {
    const csv = [
      'Projeto;Tipo;Descricao;Responsavel;Favorecido;Status;Valor;Vencimento;Observacoes',
      'Projeto Exemplo;Entrada incentivada;Descrição do lançamento;Responsável;Favorecido;Previsto;100000;2026-12-31;Observações',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'modelo-financeiro-incentivou.csv';
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

          <span>Controle de entradas, saídas e fluxo de caixa</span>
          <h1>Financeiro</h1>
          <p>
            Gerencie plano de aplicação, entradas incentivadas, pagamentos, notas fiscais,
            comprovantes, centro de custo, saldo por projeto e fluxo de caixa.
          </p>

          <div className="actions">
            <button type="button" onClick={abrirNovo} className="primary">
              <Plus size={19} />
              Novo lançamento
            </button>

            <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>
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
            <Landmark size={24} />
            <strong>{moeda(metricas.aprovado)}</strong>
            <span>Valor aprovado</span>
          </div>

          <div className="panelItem">
            <TrendingUp size={24} />
            <strong>{moeda(metricas.captado)}</strong>
            <span>Total captado</span>
          </div>

          <div className="panelItem">
            <Wallet size={24} />
            <strong>{moeda(metricas.saldo)}</strong>
            <span>Saldo financeiro</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div className="metricCard" style={{ "--accent": "#24E49B" } as React.CSSProperties}>
          <div><span>Aprovado</span><strong>{moeda(metricas.aprovado)}</strong></div>
          <Landmark size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#22C55E" } as React.CSSProperties}>
          <div><span>Captado</span><strong>{moeda(metricas.captado)}</strong></div>
          <TrendingUp size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": "#FB923C" } as React.CSSProperties}>
          <div><span>Executado</span><strong>{moeda(metricas.executado)}</strong></div>
          <TrendingDown size={30} />
        </div>

        <div className="metricCard" style={{ "--accent": metricas.saldo < 0 ? '#F43F5E' : '#3B82F6' } as React.CSSProperties}>
          <div><span>Saldo</span><strong>{moeda(metricas.saldo)}</strong></div>
          <Wallet size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Controle financeiro</h2>
            <p>Pesquise, filtre e acompanhe entradas, pagamentos, comprovantes e centro de custo.</p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar lançamento..."
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
            const entrada = item.tipo === 'Entrada incentivada' || item.tipo === 'Repasse';
            const cor =
              item.status === 'Pago' || item.status === 'Realizado' ? '#22C55E' :
              item.status === 'Atrasado' || item.status === 'Cancelado' ? '#F43F5E' :
              item.status === 'Pendente' ? '#FB923C' :
              entrada ? '#24E49B' :
              '#3B82F6';

            return (
              <div key={item.id} className="projectShell" style={{ "--accent": cor } as React.CSSProperties}>
                <div className="projectInner">
                  <div className="projectTop">
                    <div>
                      <span className="status">{item.status}</span>
                      <h3>{item.projeto}</h3>
                      <p>{item.tipo}</p>
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
                    <span><ReceiptText size={15} /> {item.descricao || '-'}</span>
                    <span><UserRound size={15} /> Responsável: {item.responsavel || '-'}</span>
                    <span><Building2 size={15} /> Favorecido: {item.favorecido || '-'}</span>
                    <span><Calendar size={15} /> Vencimento: {dataBR(item.vencimento)}</span>
                    <span><FileText size={15} /> Comprovantes e notas fiscais vinculados</span>
                  </div>

                  <div className="values">
                    <div>
                      <span>{entrada ? 'Entrada' : 'Saída'}</span>
                      <strong>{moeda(item.valor)}</strong>
                    </div>

                    <div>
                      <span>Centro de custo</span>
                      <strong>{item.tipo}</strong>
                    </div>
                  </div>

                  <div className="progressArea">
                    <div>
                      <span>Status financeiro</span>
                      <b>{item.status}</b>
                    </div>
                    <div className="bar">
                      <i style={{
                        width:
                          item.status === 'Pago' || item.status === 'Realizado' ? '100%' :
                          item.status === 'Pendente' ? '45%' :
                          item.status === 'Atrasado' ? '25%' :
                          '60%'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <div className="empty">
              Nenhum lançamento financeiro encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </section>

      {modalAberto && (
        <div className="modalOverlay">
          <form className="modal" onSubmit={salvar}>
            <div className="modalHeader">
              <div>
                <span>{editandoId ? 'Editar lançamento' : 'Novo lançamento financeiro'}</span>
                <h2>{editandoId ? 'Atualizar financeiro' : 'Cadastrar lançamento'}</h2>
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
                Tipo
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {tipoOptions.map((tipo) => <option key={tipo}>{tipo}</option>)}
                </select>
              </label>

              <label className="full">
                Descrição *
                <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </label>

              <label>
                Responsável
                <input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </label>

              <label>
                Favorecido / Pagador
                <input value={form.favorecido} onChange={(e) => setForm({ ...form, favorecido: e.target.value })} />
              </label>

              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>

              <label>
                Valor
                <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              </label>

              <label>
                Vencimento
                <input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
              </label>

              <label className="full">
                Observações
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </label>
            </div>

            <div className="modalFooter">
              <button type="button" className="cancel" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>

              <button type="submit" className="save">
                <Save size={18} />
                Salvar financeiro
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
          font-size: 28px;
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
          font-size: 18px;
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

