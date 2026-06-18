'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  KeyRound,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = { id: string; nome: string };

type Entrega = {
  id: string;
  projeto_id: string | null;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  prazo: string | null;
  status: string | null;
  created_at?: string | null;
};

const statusOptions = ['pendente', 'em andamento', 'aguardando aprovacao', 'concluido'];

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  'em andamento': 'Em andamento',
  'aguardando aprovacao': 'Aguardando aprovação',
  concluido: 'Concluído',
};

function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
}

export default function ExecucaoSeguraPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // modal editar
  const [modalAberto, setModalAberto] = useState(false);
  const [entregaEditando, setEntregaEditando] = useState<Entrega | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    projeto_id: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    prazo: '',
    status: 'pendente',
  });

  // modal nova entrega
  const [modalNova, setModalNova] = useState(false);
  const [salvandoNova, setSalvandoNova] = useState(false);
  const [formNova, setFormNova] = useState({
    projeto_id: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    prazo: '',
    status: 'pendente',
  });

  // modal excluir com senha
  const [excluindo, setExcluindo] = useState<Entrega | null>(null);
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [deletando, setDeletando] = useState(false);

  async function carregarDados() {
    if (!supabase) return;
    setLoading(true);
    setErro('');
    const [{ data: projetosData }, { data: entregasData, error }] = await Promise.all([
      supabase.from('manager_projetos').select('id,nome').order('nome'),
      supabase
        .from('manager_entregas')
        .select('id,projeto_id,titulo,descricao,responsavel,prazo,status,created_at')
        .order('created_at', { ascending: false }),
    ]);
    if (error) { setErro(error.message); setLoading(false); return; }
    setProjetos(projetosData || []);
    setEntregas(entregasData || []);
    setLoading(false);
  }

  useEffect(() => { carregarDados(); }, []);

  const resumo = useMemo(() => ({
    total: entregas.length,
    pendentes: entregas.filter((e) => e.status === 'pendente').length,
    andamento: entregas.filter((e) => e.status === 'em andamento').length,
    concluidas: entregas.filter((e) => e.status === 'concluido').length,
  }), [entregas]);

  const entregasFiltradas = entregas.filter((e) => {
    const termo = busca.toLowerCase();
    const projeto = projetos.find((p) => p.id === e.projeto_id)?.nome || '';
    return (
      e.titulo?.toLowerCase().includes(termo) ||
      e.responsavel?.toLowerCase().includes(termo) ||
      e.status?.toLowerCase().includes(termo) ||
      projeto.toLowerCase().includes(termo)
    );
  });

  // ---- EDITAR ----
  function abrirEditar(entrega: Entrega) {
    setEntregaEditando(entrega);
    setForm({
      projeto_id: entrega.projeto_id || '',
      titulo: entrega.titulo || '',
      descricao: entrega.descricao || '',
      responsavel: entrega.responsavel || '',
      prazo: entrega.prazo || '',
      status: entrega.status || 'pendente',
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEntregaEditando(null);
    setForm({ projeto_id: '', titulo: '', descricao: '', responsavel: '', prazo: '', status: 'pendente' });
    setErro('');
  }

  async function salvarEdicao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !entregaEditando) return;
    if (!form.projeto_id) { setErro('Selecione um projeto.'); return; }
    if (!form.titulo.trim()) { setErro('Informe o título.'); return; }
    setSalvando(true);
    setErro('');
    const { error } = await supabase
      .from('manager_entregas')
      .update({
        projeto_id: form.projeto_id,
        titulo: form.titulo.trim(),
        descricao: form.descricao,
        responsavel: form.responsavel,
        prazo: form.prazo || null,
        status: form.status,
      })
      .eq('id', entregaEditando.id);
    if (error) { setErro(error.message); setSalvando(false); return; }
    await carregarDados();
    setSalvando(false);
    fecharModal();
  }

  // ---- NOVA ENTREGA ----
  function fecharModalNova() {
    setModalNova(false);
    setFormNova({ projeto_id: '', titulo: '', descricao: '', responsavel: '', prazo: '', status: 'pendente' });
    setErro('');
  }

  async function salvarNova(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    if (!formNova.projeto_id) { setErro('Selecione um projeto.'); return; }
    if (!formNova.titulo.trim()) { setErro('Informe o título.'); return; }
    setSalvandoNova(true);
    setErro('');
    const { error } = await supabase.from('manager_entregas').insert({
      projeto_id: formNova.projeto_id,
      titulo: formNova.titulo.trim(),
      descricao: formNova.descricao || null,
      responsavel: formNova.responsavel || null,
      prazo: formNova.prazo || null,
      status: formNova.status,
    });
    if (error) { setErro(error.message); setSalvandoNova(false); return; }
    await carregarDados();
    setSalvandoNova(false);
    fecharModalNova();
  }

  // ---- CONCLUIR ----
  async function concluirEntrega(entrega: Entrega) {
    if (!supabase) return;
    const { error } = await supabase
      .from('manager_entregas')
      .update({ status: 'concluido' })
      .eq('id', entrega.id);
    if (error) { setErro(error.message); return; }
    await carregarDados();
  }

  // ---- EXCLUIR COM SENHA ----
  function abrirExcluir(entrega: Entrega) {
    setExcluindo(entrega);
    setSenha('');
    setSenhaErro(false);
  }

  function fecharExcluir() {
    setExcluindo(null);
    setSenha('');
    setSenhaErro(false);
  }

  async function confirmarExclusao() {
    if (!supabase || !excluindo) return;
    setDeletando(true);
    setSenhaErro(false);
    const usuarioSalvo = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
    const emailAtual = usuarioSalvo?.email || '';
    const { data } = await supabase
      .from('manager_usuarios')
      .select('id')
      .eq('email', emailAtual)
      .eq('senha', senha)
      .eq('status', 'ativo')
      .single();
    if (!data) { setSenhaErro(true); setDeletando(false); return; }
    await supabase.from('manager_entregas').delete().eq('id', excluindo.id);
    await carregarDados();
    setDeletando(false);
    fecharExcluir();
  }

  return (
    <PortalShell portal="executor">
      <div className="space-y-7">
        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">Portal Executor</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Execução Segura</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                Controle operacional das entregas, cronogramas, responsáveis, prazos e evidências dos projetos.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <MetricCard label="Entregas" value={resumo.total} icon={<ClipboardList size={20} />} color="emerald" />
            <MetricCard label="Pendentes" value={resumo.pendentes} icon={<CalendarClock size={20} />} color="red" />
            <MetricCard label="Em andamento" value={resumo.andamento} icon={<Target size={20} />} color="blue" />
            <MetricCard label="Concluídas" value={resumo.concluidas} icon={<CheckCircle2 size={20} />} color="green" />
          </div>
        </section>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>
        )}

        {/* LISTA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar entrega..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => setModalNova(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Nova Entrega
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="hidden grid-cols-[1.2fr_1fr_.8fr_.7fr_.75fr_.9fr] bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
              <span>Título</span>
              <span>Projeto</span>
              <span>Responsável</span>
              <span>Prazo</span>
              <span>Status</span>
              <span className="text-center">Ações</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">Carregando entregas...</div>
            ) : entregasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">Nenhuma entrega encontrada.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {entregasFiltradas.map((entrega) => {
                  const projetoNome = projetos.find((p) => p.id === entrega.projeto_id)?.nome || '-';
                  const vencido = entrega.prazo && new Date(entrega.prazo) < new Date() && entrega.status !== 'concluido';
                  return (
                    <div
                      key={entrega.id}
                      className="grid gap-3 px-5 py-5 transition hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_.8fr_.7fr_.75fr_.9fr] md:items-center"
                    >
                      <div>
                        <p className="text-base font-black text-slate-950">{entrega.titulo}</p>
                        {entrega.descricao && (
                          <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{entrega.descricao}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-700">{projetoNome}</p>
                      <p className="text-sm font-bold text-slate-700">{entrega.responsavel || '-'}</p>
                      <div>
                        <p className={`text-sm font-bold ${vencido ? 'text-red-600' : 'text-slate-700'}`}>
                          {formatDate(entrega.prazo)}
                        </p>
                        {vencido && <p className="text-[10px] font-black text-red-500">VENCIDO</p>}
                      </div>
                      <StatusBadge status={entrega.status} />
                      <div className="flex flex-wrap justify-start gap-2 md:justify-center">
                        {entrega.status !== 'concluido' && (
                          <button
                            type="button"
                            onClick={() => concluirEntrega(entrega)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            title="Concluir"
                          >
                            <CheckCircle2 size={17} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => abrirEditar(entrega)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition hover:bg-blue-600 hover:text-white"
                          title="Editar"
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirExcluir(entrega)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* MODAL EDITAR */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Editar entrega</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Atualizar execução</h2>
                </div>
                <button type="button" onClick={fecharModal} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={salvarEdicao} className="mt-6 space-y-4">
                <select
                  value={form.projeto_id}
                  onChange={(e) => setForm({ ...form, projeto_id: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  <option value="">Selecione o projeto</option>
                  {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input
                  placeholder="Título da entrega"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                />
                <textarea
                  placeholder="Descrição"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-emerald-400"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="Responsável"
                    value={form.responsavel}
                    onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />
                  <input
                    type="date"
                    value={form.prazo}
                    onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />
                </div>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s] || s}</option>)}
                </select>
                {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{erro}</p>}
                <button
                  type="submit"
                  disabled={salvando}
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] disabled:opacity-60"
                >
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL NOVA ENTREGA */}
        {modalNova && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Nova entrega</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Registrar entrega</h2>
                </div>
                <button type="button" onClick={fecharModalNova} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={salvarNova} className="mt-6 space-y-4">
                <select
                  value={formNova.projeto_id}
                  onChange={(e) => setFormNova({ ...formNova, projeto_id: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  <option value="">Selecione o projeto</option>
                  {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input
                  placeholder="Título da entrega"
                  value={formNova.titulo}
                  onChange={(e) => setFormNova({ ...formNova, titulo: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={formNova.descricao}
                  onChange={(e) => setFormNova({ ...formNova, descricao: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-emerald-400"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="Responsável"
                    value={formNova.responsavel}
                    onChange={(e) => setFormNova({ ...formNova, responsavel: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />
                  <input
                    type="date"
                    value={formNova.prazo}
                    onChange={(e) => setFormNova({ ...formNova, prazo: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />
                </div>
                <select
                  value={formNova.status}
                  onChange={(e) => setFormNova({ ...formNova, status: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s] || s}</option>)}
                </select>
                {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{erro}</p>}
                <button
                  type="submit"
                  disabled={salvandoNova}
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] disabled:opacity-60"
                >
                  {salvandoNova ? 'Salvando...' : 'Criar entrega'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EXCLUIR COM SENHA */}
        {excluindo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Atenção</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Excluir entrega</h2>
                </div>
                <button type="button" onClick={fecharExcluir} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={16} />
                  <p className="text-sm font-black">Esta ação não pode ser desfeita</p>
                </div>
                <p className="mt-1 text-xs font-bold text-red-600">
                  Entrega: <span className="font-black">{excluindo.titulo}</span>
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Digite sua senha para confirmar
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setSenhaErro(false); }}
                    placeholder="Sua senha"
                    className={`h-14 w-full rounded-2xl border bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none transition ${senhaErro ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-red-400'}`}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarExclusao(); } }}
                  />
                </div>
                {senhaErro && (
                  <p className="text-xs font-black text-red-600">Senha incorreta. Tente novamente.</p>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={fecharExcluir}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarExclusao}
                  disabled={!senha || deletando}
                  className="flex-1 rounded-2xl bg-red-600 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deletando ? 'Verificando...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function MetricCard({
  label, value, icon, color,
}: {
  label: string; value: number; icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    red:     'bg-red-50 text-red-600',
    blue:    'bg-blue-50 text-blue-700',
    green:   'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${colors[color] || colors.emerald}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = status || 'pendente';
  const map: Record<string, { label: string; cls: string }> = {
    'concluido':              { label: 'Concluído',             cls: 'bg-emerald-50 text-emerald-700' },
    'em andamento':           { label: 'Em andamento',          cls: 'bg-blue-50 text-blue-700'       },
    'aguardando aprovacao':   { label: 'Aguard. aprovação',     cls: 'bg-amber-50 text-amber-700'     },
    'pendente':               { label: 'Pendente',              cls: 'bg-red-50 text-red-700'         },
  };
  const item = map[value] || { label: value, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${item.cls}`}>
      {item.label}
    </span>
  );
}
