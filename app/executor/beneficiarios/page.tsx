'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Search, Users, X, Trash2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Beneficiario = {
  id: string; projeto_id: string | null; nome: string;
  cpf: string | null; data_nascimento: string | null;
  categoria: string | null; ativo: boolean | null; observacoes: string | null;
};
type Projeto = { id: string; nome: string };

type Form = {
  projeto_id: string; nome: string; cpf: string;
  data_nascimento: string; categoria: string; observacoes: string;
};

const CATS = ['aluno', 'atleta'];
const CAT_CLS: Record<string,string> = {
  aluno:  'bg-emerald-100 text-emerald-700',
  atleta: 'bg-blue-100 text-blue-700',
};
const CAT_LABEL: Record<string,string> = {
  aluno:  'Aluno',
  atleta: 'Atleta',
};
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const FORM0: Form = { projeto_id: '', nome: '', cpf: '', data_nascimento: '', categoria: 'aluno', observacoes: '' };

export default function BeneficiariosPage() {
  const [lista, setLista]       = useState<Beneficiario[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busca, setBusca]       = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroCateg, setFiltroCateg]     = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [form, setForm]           = useState<Form>(FORM0);

  async function carregar() {
    if (!supabase) { setLoading(false); return; }
    const [bRes, pRes] = await Promise.all([
      supabase.from('manager_beneficiarios')
        .select('id,projeto_id,nome,cpf,data_nascimento,categoria,ativo,observacoes')
        .order('nome'),
      supabase.from('manager_projetos').select('id,nome').order('nome'),
    ]);
    setLista((bRes.data || []) as Beneficiario[]);
    setProjetos(pRes.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = lista.filter((b) => {
    const txt = `${b.nome} ${b.cpf}`.toLowerCase();
    const bOk = txt.includes(busca.toLowerCase());
    const pOk = !filtroProjeto || b.projeto_id === filtroProjeto;
    const cOk = filtroCateg === 'Todos' || b.categoria === filtroCateg;
    return bOk && pOk && cOk;
  });

  const ativos    = filtrados.filter((b) => b.ativo !== false).length;
  const inativos  = filtrados.filter((b) => b.ativo === false).length;
  const porCateg  = CATS.reduce<Record<string,number>>((acc, c) => {
    acc[c] = filtrados.filter((b) => b.categoria === c).length; return acc;
  }, {});

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !form.nome || !form.projeto_id) return;
    setSalvando(true);
    await supabase.from('manager_beneficiarios').insert({
      projeto_id: form.projeto_id, nome: form.nome,
      cpf: form.cpf || null, data_nascimento: form.data_nascimento || null,
      categoria: form.categoria, observacoes: form.observacoes || null,
    });
    setSalvando(false);
    setShowModal(false);
    setForm(FORM0);
    carregar();
  }

  async function toggleAtivo(b: Beneficiario) {
    if (!supabase) return;
    await supabase.from('manager_beneficiarios').update({ ativo: !b.ativo }).eq('id', b.id);
    setLista((prev) => prev.map((x) => x.id === b.id ? { ...x, ativo: !b.ativo } : x));
  }

  async function excluir(id: string) {
    if (!supabase || !window.confirm('Excluir beneficiário?')) return;
    await supabase.from('manager_beneficiarios').delete().eq('id', id);
    setLista((prev) => prev.filter((b) => b.id !== id));
  }

  function gerarRelacao() {
    const nomeProjeto = filtroProjeto
      ? (projetos.find(p => p.id === filtroProjeto)?.nome || 'Projeto')
      : 'Todos os Projetos';
    const header = ['Nº','Nome','CPF','Data de Nascimento','Categoria','Projeto','Observações'].join(';');
    const rows = filtrados.map((b, i) => [
      i + 1,
      `"${b.nome}"`,
      b.cpf || '',
      b.data_nascimento ? fmtDate(b.data_nascimento) : '',
      CAT_LABEL[b.categoria || ''] || b.categoria || '',
      `"${projetoNome(b.projeto_id)}"`,
      `"${b.observacoes || ''}"`,
    ].join(';'));
    const csv = ['﻿' + header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nomeArquivo = `relacao-beneficiarios-${nomeProjeto.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.href = url; a.download = nomeArquivo; a.click();
    URL.revokeObjectURL(url);
  }

  const projetoNome = (id?: string | null) => projetos.find((p) => p.id === id)?.nome || '—';

  return (
    <PortalShell portal="executor">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Execução</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Beneficiários</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">Cadastro dos beneficiários atendidos pelo projeto (alunos e atletas).</p>
            </div>
            <div className="flex gap-2">
              <button onClick={gerarRelacao}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
                ↓ Gerar Relação
              </button>
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:-translate-y-0.5">
                <Plus size={16} /> Cadastrar
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{filtrados.length}</p>
            </div>
            <div className="rounded-[1.3rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">Ativos</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{ativos}</p>
            </div>
            <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Inativos</p>
              <p className="mt-1 text-2xl font-black text-slate-500">{inativos}</p>
            </div>
            <div className="rounded-[1.3rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">Alunos</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{porCateg.aluno || 0}</p>
            </div>
            <div className="rounded-[1.3rem] border border-blue-200 bg-blue-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">Atletas</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{porCateg.atleta || 0}</p>
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por nome ou CPF..."
              value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold outline-none focus:border-[#0068ff]" />
          </div>
          <select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}
            className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0068ff]">
            <option value="">Todos os projetos</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select value={filtroCateg} onChange={(e) => setFiltroCateg(e.target.value)}
            className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0068ff]">
            <option value="Todos">Todas as categorias</option>
            {CATS.map((c) => <option key={c} value={c}>{CAT_LABEL[c] || c}</option>)}
          </select>
          <span className="text-xs font-black text-slate-400">{filtrados.length} resultado(s)</span>
        </div>

        {/* TABELA */}
        {loading ? (
          <p className="py-12 text-center text-sm font-bold text-slate-400">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 py-16 text-center">
            <Users size={32} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-black text-slate-400">Nenhum beneficiário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.5fr_1fr_.8fr_.8fr_.6fr_.5fr] bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 md:grid">
              <span>Nome</span><span>Projeto</span><span>Categoria</span>
              <span>Nascimento</span><span>Status</span><span className="text-center">Ação</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filtrados.map((b) => (
                <div key={b.id} className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.5fr_1fr_.8fr_.8fr_.6fr_.5fr] md:items-center">
                  <div>
                    <p className="text-sm font-black text-slate-950">{b.nome}</p>
                    {b.cpf && <p className="text-[11px] font-bold text-slate-400">CPF: {b.cpf}</p>}
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{projetoNome(b.projeto_id)}</p>
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-black ${CAT_CLS[b.categoria||'aluno'] || 'bg-slate-100 text-slate-500'}`}>
                    {CAT_LABEL[b.categoria||''] || b.categoria || '—'}
                  </span>
                  <p className="text-sm font-bold text-slate-600">{fmtDate(b.data_nascimento)}</p>
                  <button onClick={() => toggleAtivo(b)}
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black transition ${b.ativo !== false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {b.ativo !== false ? <CheckCircle2 size={11}/> : <AlertCircle size={11}/>}
                    {b.ativo !== false ? 'Ativo' : 'Inativo'}
                  </button>
                  <div className="flex justify-center">
                    <button onClick={() => excluir(b.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-950">Cadastrar Beneficiário</h2>
              <button onClick={() => { setShowModal(false); setForm(FORM0); }}
                className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
                <X size={15}/>
              </button>
            </div>
            <form onSubmit={salvar} className="space-y-3 p-6">
              <select required value={form.projeto_id} onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]">
                <option value="">Selecione o projeto *</option>
                {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input required type="text" placeholder="Nome completo *" value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="CPF (opcional)" value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                <input type="date" value={form.data_nascimento}
                  onChange={(e) => setForm((f) => ({ ...f, data_nascimento: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              </div>
              <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]">
                {CATS.map((c) => <option key={c} value={c}>{CAT_LABEL[c] || c}</option>)}
              </select>
              <textarea placeholder="Observações" value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff] min-h-[80px]" />
              <button type="submit" disabled={salvando}
                className="w-full rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:bg-[#0050d0] disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
