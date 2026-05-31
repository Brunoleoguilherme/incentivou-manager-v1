// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  GraduationCap,
  BookOpen,
  Download,
  Star,
  Search,
  Filter,
  PlayCircle,
  FileText,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Trophy,
  BadgeCheck,
  Bell,
  LogOut,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';

const STORAGE_KEY = 'incentivou_academy';

type Produto = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: string;
  preco: number;
  destaque: boolean;
};

const iniciais: Produto[] = [
  {
    id: '1',
    titulo: 'Como aprovar seu primeiro projeto na LIE',
    descricao: 'Passo a passo completo para estruturar e aprovar projetos incentivados.',
    categoria: 'Captação',
    tipo: 'Gratuito',
    preco: 0,
    destaque: true,
  },
  {
    id: '2',
    titulo: 'Guia ESG para empresas apoiadoras',
    descricao: 'Como conectar incentivo fiscal, impacto social e ESG.',
    categoria: 'ESG',
    tipo: 'Premium',
    preco: 297,
    destaque: true,
  },
  {
    id: '3',
    titulo: 'Prestação de contas sem risco de glosa',
    descricao: 'Checklist jurídico, financeiro e documental.',
    categoria: 'Prestação',
    tipo: 'Premium',
    preco: 197,
    destaque: false,
  },
];

export default function AcademyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [usuario, setUsuario] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    tipo: 'Gratuito',
    preco: 0,
    destaque: false,
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
      setProdutos(JSON.parse(salvos));
    } else {
      setProdutos(iniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    }
  }, [router]);

  useEffect(() => {
    if (produtos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
    }
  }, [produtos]);

  const filtrados = useMemo(() => {
    return produtos.filter((item) => {
      const texto =
        `${item.titulo} ${item.descricao} ${item.categoria} ${item.tipo}`.toLowerCase();

      return texto.includes(busca.toLowerCase());
    });
  }, [produtos, busca]);

  const metricas = useMemo(() => {
    return {
      total: produtos.length,
      gratuitos: produtos.filter((p) => p.tipo === 'Gratuito').length,
      premium: produtos.filter((p) => p.tipo === 'Premium').length,
      destaque: produtos.filter((p) => p.destaque).length,
    };
  }, [produtos]);

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  function limparForm() {
    setForm({
      titulo: '',
      descricao: '',
      categoria: '',
      tipo: 'Gratuito',
      preco: 0,
      destaque: false,
    });

    setEditandoId(null);
  }

  function abrirNovo() {
    limparForm();
    setModalAberto(true);
  }

  function abrirEditar(item: Produto) {
    setEditandoId(item.id);

    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria,
      tipo: item.tipo,
      preco: item.preco,
      destaque: item.destaque,
    });

    setModalAberto(true);
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.titulo) {
      alert('Preencha o título.');
      return;
    }

    const payload: Produto = {
      id: editandoId || crypto.randomUUID(),
      ...form,
      preco: Number(form.preco || 0),
    };

    if (editandoId) {
      setProdutos((prev) =>
        prev.map((p) => (p.id === editandoId ? payload : p))
      );
    } else {
      setProdutos((prev) => [payload, ...prev]);
    }

    setModalAberto(false);
    limparForm();
  }

  function excluir(id: string) {
    if (!confirm('Deseja excluir este produto?')) return;

    setProdutos((prev) => prev.filter((p) => p.id !== id));
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
            <span>Academy</span>
          </div>
        </Link>

        <nav>
          <Link href="/dashboard">Início</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/impacto-esg">Impacto ESG</Link>
          <Link href="/juridico">Jurídico</Link>
        </nav>

        <div className="userBox">
          <button className="iconButton">
            <Bell size={18} />
            <i />
          </button>

          <div className="avatar">B</div>

          <div className="userText">
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>

          <button className="logout" onClick={sair}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span>Biblioteca premium IncentiVou</span>

          <h1>IncentiVou Academy</h1>

          <p>
            Gerencie e-books, cursos, materiais gratuitos, produtos premium,
            downloads e geração de leads.
          </p>

          <div className="actions">
            <button className="primary" onClick={abrirNovo}>
              <Plus size={18} />
              Novo produto
            </button>

            <button
              className="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Download size={18} />
              Importar materiais
            </button>

            <button className="secondary">
              <Sparkles size={18} />
              Automação CRM
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
          />
        </div>

        <div className="heroPanel">
          <div className="panelItem">
            <GraduationCap size={24} />
            <strong>{metricas.total}</strong>
            <span>Produtos cadastrados</span>
          </div>

          <div className="panelItem">
            <BookOpen size={24} />
            <strong>{metricas.gratuitos}</strong>
            <span>Materiais gratuitos</span>
          </div>

          <div className="panelItem">
            <Star size={24} />
            <strong>{metricas.premium}</strong>
            <span>Produtos premium</span>
          </div>
        </div>
      </section>

      <section className="metricsGrid">
        <div
          className="metricCard"
          style={{ '--accent': '#24E49B' } as React.CSSProperties}
        >
          <div>
            <span>Total</span>
            <strong>{metricas.total}</strong>
          </div>

          <GraduationCap size={30} />
        </div>

        <div
          className="metricCard"
          style={{ '--accent': '#3B82F6' } as React.CSSProperties}
        >
          <div>
            <span>Gratuitos</span>
            <strong>{metricas.gratuitos}</strong>
          </div>

          <BookOpen size={30} />
        </div>

        <div
          className="metricCard"
          style={{ '--accent': '#A855F7' } as React.CSSProperties}
        >
          <div>
            <span>Premium</span>
            <strong>{metricas.premium}</strong>
          </div>

          <ShoppingCart size={30} />
        </div>

        <div
          className="metricCard"
          style={{ '--accent': '#FACC15' } as React.CSSProperties}
        >
          <div>
            <span>Destaques</span>
            <strong>{metricas.destaque}</strong>
          </div>

          <BadgeCheck size={30} />
        </div>
      </section>

      <section className="listCard">
        <div className="listHeader">
          <div>
            <h2>Produtos Academy</h2>
            <p>Gerencie materiais, cursos e conteúdos premium.</p>
          </div>

          <div className="filters">
            <label className="searchBox">
              <Search size={18} />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto..."
              />
            </label>

            <button className="filterBtn">
              <Filter size={18} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="projectGrid">
          {filtrados.map((item) => (
            <div
              key={item.id}
              className="projectShell"
              style={{
                '--accent':
                  item.tipo === 'Premium'
                    ? '#A855F7'
                    : '#24E49B',
              } as React.CSSProperties}
            >
              <div className="projectInner">
                <div className="projectTop">
                  <div>
                    <span className="status">{item.tipo}</span>

                    <h3>{item.titulo}</h3>

                    <p>{item.categoria}</p>
                  </div>

                  <div className="projectActions">
                    <button>
                      <Eye size={16} />
                    </button>

                    <button onClick={() => abrirEditar(item)}>
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => excluir(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="description">
                  {item.descricao}
                </p>

                <div className="bottomRow">
                  <div>
                    <strong>
                      {item.preco > 0
                        ? `R$ ${item.preco}`
                        : 'Gratuito'}
                    </strong>
                  </div>

                  <button className="accessButton">
                    Acessar
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {modalAberto && (
        <div className="modalOverlay">
          <form className="modal" onSubmit={salvar}>
            <div className="modalHeader">
              <div>
                <span>
                  {editandoId
                    ? 'Editar produto'
                    : 'Novo produto'}
                </span>

                <h2>
                  {editandoId
                    ? 'Atualizar academy'
                    : 'Cadastrar academy'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="formGrid">
              <label className="full">
                Título
                <input
                  value={form.titulo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      titulo: e.target.value,
                    })
                  }
                />
              </label>

              <label className="full">
                Descrição
                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descricao: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Categoria
                <input
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoria: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Tipo
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value,
                    })
                  }
                >
                  <option>Gratuito</option>
                  <option>Premium</option>
                </select>
              </label>

              <label>
                Preço
                <input
                  type="number"
                  value={form.preco}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preco: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label>
                Destaque
                <select
                  value={form.destaque ? 'Sim' : 'Não'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      destaque: e.target.value === 'Sim',
                    })
                  }
                >
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </label>
            </div>

            <div className="modalFooter">
              <button
                type="button"
                className="cancel"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>

              <button type="submit" className="save">
                <Save size={18} />
                Salvar
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
          padding-bottom: 80px;
          font-family: Arial, Helvetica, sans-serif;
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
        }

        .brandIcon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#24e49b,#14b8a6);
          color: #031226;
        }

        nav {
          display: flex;
          gap: 28px;
        }

        nav a {
          color: #dce8ff;
          text-decoration: none;
          font-weight: 800;
        }

        .userBox {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .iconButton,
        .logout {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 0;
          background: rgba(255,255,255,.08);
          color: #fff;
          display: grid;
          place-items: center;
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
        }

        .avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#24e49b,#facc15);
          color: #031226;
          font-weight: 900;
        }

        .hero {
          max-width: 1550px;
          margin: 0 auto;
          padding: 56px 72px 36px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 36px;
        }

        .hero > div:first-child,
        .heroPanel,
        .listCard {
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.92), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 26px 90px rgba(0,0,0,.28);
        }

        .hero > div:first-child {
          padding: 42px;
        }

        .hero h1 {
          margin: 10px 0 14px;
          font-size: 60px;
        }

        .hero p {
          color: #bcd0ec;
          font-size: 18px;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .primary,
        .secondary,
        .filterBtn,
        .save,
        .cancel,
        .accessButton {
          border: 0;
          border-radius: 14px;
          min-height: 50px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 900;
        }

        .primary,
        .save,
        .accessButton {
          background: linear-gradient(135deg,#24e49b,#14b8a6);
          color: #031226;
        }

        .secondary,
        .filterBtn,
        .cancel {
          background: rgba(255,255,255,.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,.12);
        }

        .heroPanel {
          padding: 24px;
          display: grid;
          gap: 16px;
        }

        .panelItem {
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,.05);
        }

        .panelItem strong {
          display: block;
          font-size: 28px;
          margin-top: 12px;
          color: #24e49b;
        }

        .metricsGrid {
          max-width: 1550px;
          margin: 0 auto;
          padding: 0 72px 26px;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 18px;
        }

        .metricCard {
          border-radius: 22px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent), transparent 80%), transparent 42%),
            linear-gradient(145deg, rgba(13,42,82,.88), rgba(7,24,52,.96));
          border: 1px solid rgba(255,255,255,.1);
        }

        .metricCard strong {
          font-size: 32px;
        }

        .metricCard span {
          color: #bcd0ec;
        }

        .listCard {
          max-width: 1550px;
          margin: 0 auto;
          width: calc(100% - 144px);
          padding: 30px;
        }

        .listHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          margin-bottom: 24px;
        }

        .filters {
          display: flex;
          gap: 12px;
        }

        .searchBox {
          height: 52px;
          min-width: 260px;
          border-radius: 14px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,.08);
        }

        .searchBox input,
        .modal input,
        .modal textarea,
        .modal select {
          width: 100%;
          border: 0;
          background: transparent;
          outline: none;
          color: #fff;
        }

        .projectGrid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
        }

        .projectShell {
          border-radius: 24px;
          transition: .3s ease;
        }

        .projectShell:hover {
          transform: translateY(-14px) scale(1.02);
        }

        .projectInner {
          min-height: 320px;
          border-radius: 24px;
          padding: 24px;
          background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent), transparent 82%), transparent 50%),
            linear-gradient(145deg, rgba(13,42,82,.94), rgba(7,24,52,.98));
          border: 1px solid rgba(255,255,255,.1);
        }

        .projectTop {
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .status {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #24e49b;
          color: #031226;
          font-size: 12px;
          font-weight: 900;
        }

        .projectActions {
          display: flex;
          gap: 8px;
        }

        .projectActions button {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: rgba(255,255,255,.08);
          color: #fff;
          cursor: pointer;
        }

        .description {
          margin-top: 22px;
          color: #bcd0ec;
          line-height: 1.6;
        }

        .bottomRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 28px;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.72);
          display: grid;
          place-items: center;
          padding: 24px;
          z-index: 50;
        }

        .modal {
          width: 100%;
          max-width: 920px;
          border-radius: 28px;
          padding: 28px;
          background: linear-gradient(145deg, rgba(12,37,76,.98), rgba(7,24,52,.98));
          border: 1px solid rgba(255,255,255,.12);
        }

        .modalHeader,
        .modalFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modalHeader button {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 0;
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 16px;
          margin: 26px 0;
        }

        .full {
          grid-column: 1 / -1;
        }

        .modal label {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .modal input,
        .modal textarea,
        .modal select {
          min-height: 52px;
          border-radius: 14px;
          padding: 0 16px;
          background: rgba(255,255,255,.08);
        }

        .modal textarea {
          min-height: 120px;
          padding-top: 14px;
          resize: vertical;
        }

        @media (max-width: 1200px) {
          .hero,
          .metricsGrid {
            padding-left: 28px;
            padding-right: 28px;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .metricsGrid {
            grid-template-columns: repeat(2,1fr);
          }

          .listCard {
            width: calc(100% - 56px);
          }

          .projectGrid {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media (max-width: 860px) {
          .navbar {
            grid-template-columns: 1fr;
            height: auto;
            padding: 18px;
            gap: 18px;
          }

          nav {
            overflow-x: auto;
          }

          .metricsGrid,
          .projectGrid,
          .formGrid {
            grid-template-columns: 1fr;
          }

          .listCard {
            width: calc(100% - 36px);
            padding: 20px;
          }

          .hero {
            padding: 34px 18px 28px;
          }

          .hero h1 {
            font-size: 42px;
          }
        }
      `}</style>
    </main>
  );
}

