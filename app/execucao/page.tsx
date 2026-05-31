// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Pencil,
  Trash2,
  ClipboardCheck,
  UserRound,
  Building2,
  Calendar,
  Wallet,
  Plus,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'incentivou_execucao';

const dadosIniciais = [
  {
    id: 1,
    projeto: 'Festival Esportivo Nacional',
    tipo: 'Checklist operacional',
    descricao: 'Contratação de estrutura',
    responsavel: 'Carlos Eduardo',
    fornecedor: 'Arena Brasil',
    prazo: '2026-06-20',
    valor: 85000,
    status: 'Em andamento',
  },
  {
    id: 2,
    projeto: 'Liga Escolar Incentivada',
    tipo: 'Prestação parcial',
    descricao: 'Envio de documentos',
    responsavel: 'Fernanda Lima',
    fornecedor: 'Documenta Fácil',
    prazo: '2026-06-12',
    valor: 12000,
    status: 'Pendente',
  },
  {
    id: 3,
    projeto: 'Circuito Social',
    tipo: 'Compliance',
    descricao: 'Revisão jurídica',
    responsavel: 'Rafael Souza',
    fornecedor: 'AA Advogados',
    prazo: '2026-05-30',
    valor: 34000,
    status: 'Em risco',
  },
  {
    id: 4,
    projeto: 'Copa Inclusiva',
    tipo: 'Entrega final',
    descricao: 'Conferência de notas',
    responsavel: 'Juliana Alves',
    fornecedor: 'Contábil Pro',
    prazo: '2026-06-28',
    valor: 15700,
    status: 'Concluído',
  },
];

const statusOptions = ['Em andamento', 'Pendente', 'Em risco', 'Concluído'];

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

export default function ExecucaoPage() {
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    projeto: '',
    tipo: '',
    descricao: '',
    responsavel: '',
    fornecedor: '',
    prazo: '',
    valor: 0,
    status: 'Em andamento',
  });

  const editando = useRef(false);

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (salvo) {
      setDados(JSON.parse(salvo));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
      setDados(dadosIniciais);
    }
  }, []);

  useEffect(() => {
    if (dados.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
  }, [dados]);

  const filtrados = useMemo(() => {
    return dados.filter((item) => {
      const texto = `${item.projeto} ${item.tipo} ${item.descricao} ${item.responsavel} ${item.fornecedor} ${item.status}`.toLowerCase();

      const matchBusca = texto.includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === 'Todos' ? true : item.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [dados, busca, filtroStatus]);

  const metricas = useMemo(() => {
    return {
      execucao: dados.filter((d) => d.status === 'Em andamento').length,
      pendencias: dados.filter((d) => d.status === 'Pendente').length,
      riscos: dados.filter((d) => d.status === 'Em risco').length,
      concluidos: dados.filter((d) => d.status === 'Concluído').length,
    };
  }, [dados]);

  function abrirNovo() {
    editando.current = false;

    setForm({
      id: 0,
      projeto: '',
      tipo: '',
      descricao: '',
      responsavel: '',
      fornecedor: '',
      prazo: '',
      valor: 0,
      status: 'Em andamento',
    });

    setModalOpen(true);
  }

  function abrirEditar(item) {
    editando.current = true;
    setForm(item);
    setModalOpen(true);
  }

  function salvar() {
    if (!form.projeto || !form.responsavel) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (editando.current) {
      setDados((prev) =>
        prev.map((item) => (item.id === form.id ? form : item))
      );
    } else {
      setDados((prev) => [
        {
          ...form,
          id: Date.now(),
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
  }

  function excluir(id) {
    const confirmar = confirm('Deseja realmente excluir este item?');

    if (!confirmar) return;

    setDados((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="execucaoPage">
      <section className="heroSection">
        <div className="heroLeft">
          <button
            className="backBtn"
            type="button"
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            ← Voltar ao dashboard
          </button>

          <span className="heroMini">GESTÃO OPERACIONAL</span>

          <h1>Execução Segura</h1>

          <p>
            Controle operacional completo dos projetos incentivados, compliance,
            checklist, fornecedores, documentos, entregas e riscos.
          </p>

          <div className="heroButtons">
            <button className="primaryBtn" onClick={abrirNovo}>
              <Plus size={18} />
              Novo item
            </button>

            <button className="secondaryBtn" type="button">
              <ClipboardCheck size={18} />
              Checklist
            </button>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroMetric">
            <ShieldCheck size={24} />
            <strong>{metricas.execucao}</strong>
            <span>EM EXECUÇÃO</span>
          </div>

          <div className="heroMetric">
            <Clock size={24} />
            <strong>{metricas.pendencias}</strong>
            <span>PENDÊNCIAS</span>
          </div>

          <div className="heroMetric">
            <AlertTriangle size={24} />
            <strong>{metricas.riscos}</strong>
            <span>RISCOS</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div className="metricCard green">
          <div>
            <span>Em execução</span>
            <strong>{metricas.execucao}</strong>
          </div>

          <ShieldCheck size={30} />
        </div>

        <div className="metricCard orange">
          <div>
            <span>Pendências</span>
            <strong>{metricas.pendencias}</strong>
          </div>

          <Clock size={30} />
        </div>

        <div className="metricCard red">
          <div>
            <span>Riscos</span>
            <strong>{metricas.riscos}</strong>
          </div>

          <AlertTriangle size={30} />
        </div>

        <div className="metricCard success">
          <div>
            <span>Concluídos</span>
            <strong>{metricas.concluidos}</strong>
          </div>

          <CheckCircle2 size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Controle de execução</h2>

            <p>
              Pesquise, filtre e acompanhe checklist, fornecedores, riscos e
              comprovações.
            </p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar item..."
              />
            </label>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option>Todos</option>

              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <button type="button" className="filterBtn">
              <Filter size={18} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="projectGrid">
          {filtrados.map((item) => {
            const statusClass =
              item.status === 'Concluído'
                ? 'success'
                : item.status === 'Em risco'
                  ? 'danger'
                  : item.status === 'Pendente'
                    ? 'warning'
                    : 'active';

            return (
              <div key={item.id} className={`cardShell ${statusClass}`}>
                <div className="cardInner">
                  <div className="projectTop">
                    <div>
                      <span className={`status ${statusClass}`}>
                        {item.status}
                      </span>

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
                    <span>
                      <ClipboardCheck size={15} />
                      {item.descricao || '-'}
                    </span>

                    <span>
                      <UserRound size={15} />
                      Responsável: {item.responsavel || '-'}
                    </span>

                    <span>
                      <Building2 size={15} />
                      Fornecedor: {item.fornecedor || '-'}
                    </span>

                    <span>
                      <Calendar size={15} />
                      Prazo: {dataBR(item.prazo)}
                    </span>

                    <span>
                      <Wallet size={15} />
                      Valor: {moeda(item.valor)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {modalOpen && (
        <div className="modalOverlay">
          <div className="modalCard">
            <div className="modalHeader">
              <h2>{editando.current ? 'Editar item' : 'Novo item'}</h2>

              <button onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modalGrid">
              <input
                placeholder="Projeto"
                value={form.projeto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    projeto: e.target.value,
                  })
                }
              />

              <input
                placeholder="Tipo"
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value,
                  })
                }
              />

              <input
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    descricao: e.target.value,
                  })
                }
              />

              <input
                placeholder="Responsável"
                value={form.responsavel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responsavel: e.target.value,
                  })
                }
              />

              <input
                placeholder="Fornecedor"
                value={form.fornecedor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fornecedor: e.target.value,
                  })
                }
              />

              <input
                type="date"
                value={form.prazo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prazo: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Valor"
                value={form.valor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    valor: Number(e.target.value),
                  })
                }
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="modalActions">
              <button
                className="cancelBtn"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>

              <button className="saveBtn" onClick={salvar}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .execucaoPage {
          min-height: 100vh;
          padding: 48px;
          background:
            radial-gradient(circle at 0% 0%, rgba(36, 228, 155, 0.14), transparent 32%),
            radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.14), transparent 34%),
            linear-gradient(135deg, #031226 0%, #061a35 46%, #07152f 100%);
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        }

        .heroSection {
          display: grid;
          grid-template-columns: 1.35fr 0.95fr;
          gap: 48px;
          padding: 56px;
          border-radius: 34px;
          background:
            radial-gradient(circle at top left, rgba(36, 228, 155, 0.18), transparent 35%),
            linear-gradient(135deg, rgba(7, 20, 38, 0.98), rgba(8, 26, 51, 0.98) 50%, rgba(10, 34, 68, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 20px 70px rgba(0, 0, 0, 0.46),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .backBtn {
          width: fit-content;
          border: none;
          background: transparent;
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 34px;
          cursor: pointer;
        }

        .heroMini {
          color: #24e49b;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 5px;
          margin-bottom: 18px;
          display: block;
        }

        .heroLeft h1 {
          font-size: 72px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -3px;
          margin: 0 0 26px;
        }

        .heroLeft p {
          max-width: 780px;
          font-size: 22px;
          line-height: 1.7;
          color: #b8c7db;
          margin: 0;
        }

        .heroButtons {
          margin-top: 38px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .primaryBtn,
        .secondaryBtn {
          height: 58px;
          padding: 0 28px;
          border-radius: 18px;
          font-weight: 900;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .primaryBtn {
          border: none;
          background: linear-gradient(135deg, #24e49b, #0ea5e9);
          color: #03111f;
        }

        .secondaryBtn {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }

        .heroRight {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .heroMetric {
          flex: 1;
          border-radius: 26px;
          padding: 30px;
          background: rgba(18, 43, 80, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .heroMetric svg {
          color: #ffffff;
          margin-bottom: 18px;
        }

        .heroMetric strong {
          display: block;
          font-size: 42px;
          color: #24e49b;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .heroMetric span {
          color: #d7e4f5;
          font-size: 13px;
          letter-spacing: 4px;
          font-weight: 900;
        }

        .metricsGrid {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .metricCard {
          min-height: 150px;
          border-radius: 28px;
          padding: 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(
            145deg,
            rgba(13, 42, 82, 0.94),
            rgba(7, 24, 52, 0.98)
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .metricCard:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.42);
        }

        .metricCard.green {
          border-top: 4px solid #24e49b;
        }

        .metricCard.orange {
          border-top: 4px solid #fb923c;
        }

        .metricCard.red {
          border-top: 4px solid #f43f5e;
        }

        .metricCard.success {
          border-top: 4px solid #22c55e;
        }

        .metricCard span {
          color: #b8c7db;
          font-size: 15px;
        }

        .metricCard strong {
          display: block;
          margin-top: 12px;
          font-size: 44px;
          font-weight: 900;
        }

        .listCard {
          margin-top: 32px;
          border-radius: 34px;
          padding: 34px;
          background: linear-gradient(
            145deg,
            rgba(13, 42, 82, 0.94),
            rgba(7, 24, 52, 0.98)
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
        }

        .listHeader {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .listHeader h2 {
          font-size: 38px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -1px;
        }

        .listHeader p {
          margin-top: 8px;
          color: #b8c7db;
          font-size: 17px;
        }

        .filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .searchBox {
          height: 54px;
          min-width: 300px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .searchBox input,
        .filters select {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-weight: 700;
        }

        .searchBox input::placeholder {
          color: #9fb0c7;
        }

        .filters select {
          height: 54px;
          min-width: 160px;
          padding: 0 16px;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filterBtn {
          height: 54px;
          padding: 0 20px;
          border-radius: 17px;
          border: none;
          background: linear-gradient(135deg, #24e49b, #0ea5e9);
          color: #03111f;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }

        .projectGrid {
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .cardShell {
          border-radius: 28px;
          transform: translateY(0) scale(1);
          transition:
            transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1),
            filter 0.32s ease;
        }

        .cardShell:hover {
          transform: translateY(-18px) scale(1.045);
          z-index: 5;
          filter: drop-shadow(0 34px 58px rgba(0, 0, 0, 0.48));
        }

        .cardInner {
          min-height: 315px;
          border-radius: 28px;
          padding: 28px;
          background:
            radial-gradient(circle at top left, rgba(36, 228, 155, 0.12), transparent 52%),
            linear-gradient(145deg, rgba(13, 42, 82, 0.94), rgba(7, 24, 52, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
        }

        .cardShell.active .cardInner {
          border-color: rgba(36, 228, 155, 0.38);
        }

        .cardShell.warning .cardInner {
          border-color: rgba(251, 146, 60, 0.42);
        }

        .cardShell.danger .cardInner {
          border-color: rgba(244, 63, 94, 0.42);
        }

        .cardShell.success .cardInner {
          border-color: rgba(34, 197, 94, 0.42);
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .projectTop h3 {
          margin: 18px 0 8px;
          font-size: 24px;
          font-weight: 900;
          line-height: 1.15;
        }

        .projectTop p {
          color: #b8c7db;
          margin: 0;
        }

        .status {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .status.active {
          background: rgba(36, 228, 155, 0.12);
          color: #24e49b;
        }

        .status.warning {
          background: rgba(251, 146, 60, 0.12);
          color: #fb923c;
        }

        .status.danger {
          background: rgba(244, 63, 94, 0.12);
          color: #f43f5e;
        }

        .status.success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
        }

        .projectActions {
          display: flex;
          gap: 10px;
        }

        .projectActions button {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          border: none;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .projectActions button:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.14);
        }

        .infoList {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .infoList span {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #d6e3f4;
          font-size: 15px;
        }

        .infoList svg {
          color: #24e49b;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 24px;
        }

        .modalCard {
          width: 100%;
          max-width: 820px;
          border-radius: 30px;
          background: linear-gradient(180deg, #0f172a, #07111f);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modalHeader h2 {
          font-size: 30px;
          font-weight: 900;
          margin: 0;
        }

        .modalHeader button {
          border: none;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 14px;
        }

        .modalGrid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .modalGrid input,
        .modalGrid select {
          width: 100%;
          padding: 16px;
          border-radius: 17px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          outline: none;
          font-weight: 700;
        }

        .modalActions {
          margin-top: 26px;
          display: flex;
          justify-content: flex-end;
          gap: 14px;
        }

        .cancelBtn,
        .saveBtn {
          border: none;
          padding: 15px 24px;
          border-radius: 17px;
          font-weight: 900;
          cursor: pointer;
        }

        .cancelBtn {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .saveBtn {
          background: linear-gradient(135deg, #24e49b, #0ea5e9);
          color: #03111f;
        }

        @media (max-width: 1180px) {
          .execucaoPage {
            padding: 28px;
          }

          .heroSection {
            grid-template-columns: 1fr;
            padding: 38px;
          }

          .metricsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .projectGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .execucaoPage {
            padding: 18px;
          }

          .heroSection {
            padding: 28px;
          }

          .heroLeft h1 {
            font-size: 46px;
          }

          .heroLeft p {
            font-size: 18px;
          }

          .metricsGrid,
          .projectGrid,
          .modalGrid {
            grid-template-columns: 1fr;
          }

          .searchBox,
          .filters select,
          .filterBtn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}