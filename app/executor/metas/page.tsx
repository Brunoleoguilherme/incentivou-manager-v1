'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Plus, Target, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Meta = {
  id: string; projeto_id: string | null; indicador: string;
  unidade: string | null; meta_valor: number | null;
  realizado: number | null; periodo: string | null; observacao: string | null;
};
type Projeto = { id: string; nome: string };
type Form = {
  projeto_id: string; indicador: string; unidade: string;
  meta_valor: string; realizado: string; periodo: string; observacao: string;
};

const FORM0: Form = { projeto_id: '', indicador: '', unidade: 'un', meta_valor: '', realizado: '0', periodo: '', observacao: '' };

function pct(realizado?: number | null, meta?: number | null) {
  if (!meta || meta === 0) return 0;
  return Math.round((Number(realizado || 0) / Number(meta)) * 100);
}

function statusMeta(p: number) {
  if (p >= 100) return { cls: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Atingida' };
  if (p >= 60)  return { cls: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    label: 'Em progresso' };
  if (p >= 30)  return { cls: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',   label: 'Abaixo' };
  return               { cls: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50',     label: 'Critico' };
}

export default function MetasPage() {
  const [metas, setMetas]         = useState<Meta[]>([]);
  const [projetos, setProjetos]   = useState<Projeto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando]   = useState<Meta | null>(null);
  const [salvando, setSalvando]   = useState(false);
  const [form, setForm]           = useState<Form>(FORM0);

  async function carregar() {
    if (!supabase) { setLoading(false); return; }
    const [mRes, pRes] = await Promise.all([
      supabase.from('manager_metas').select('*').order('created_at', { ascending: false }),
      supabase.from('manager_projetos').select('id,nome').order('nome'),
    ]);
    setMetas((mRes.data || []) as Meta[]);
    setProjetos(pRes.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtradas = filtroProjeto
    ? metas.filter((m) => m.projeto_id === filtroProjeto)
    : metas;

  const atingidas   = filtradas.filter((m) => pct(m.realizado, m.meta_valor) >= 100).length;
  const criticas    = filtradas.filter((m) => pct(m.realizado, m.meta_valor) < 30).length;
  const mediaPct    = filtradas.length > 0
    ? Math.round(filtradas.reduce((s, m) => s + pct(m.realizado, m.meta_valor), 0) / filtradas.length)
    : 0;

  function abrirNova() { setEditando(null); setForm(FORM0); setShowModal(true); }
  function abrirEditar(m: Meta) {
    setEditando(m);
    setForm({
      projeto_id: m.projeto_id || '', indicador: m.indicador,
      unidade: m.unidade || 'un', meta_valor: String(m.meta_valor || ''),
      realizado: String(m.realizado || 0), periodo: m.periodo || '', observacao: m.observacao || '',
    });
    setShowModal(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !form.indicador || !form.projeto_id) return;
    setSalvando(true);
    const payload = {
      projeto_id: form.projeto_id, indicador: form.indicador,
      unidade: form.unidade, meta_valor: Number(form.meta_valor || 0),
      realizado: Number(form.realizado || 0), periodo: form.periodo || null,
      observacao: form.observacao || null,
    };
    if (editando) {
      await supabase.from('manager_metas').update(payload).eq('id', editando.id);
    } else {
      await supabase.from('manager_metas').insert(payload);
    }
    setSalvando(false);
    setShowModal(false);
    setForm(FORM0);
    carregar();
  }

  async function excluir(id: string) {
    if (!supabase || !window.confirm('Excluir meta?')) return;
    await supabase.from('manager_metas').delete().eq('id', id);
    setMetas((prev) => prev.filter((m) => m.id !== id));
  }

  async function ajustarRealizado(m: Meta, delta: number) {
    if (!supabase) return;
    const novo = Math.max(0, Number(m.realizado || 0) + delta);
    await supabase.from('manager_metas').update({ realizado: novo }).eq('id', m.id);
    setMetas((prev) => prev.map((x) => x.id === m.id ? { ...x, realizado: novo } : x));
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
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Metas e Indicadores</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">Acompanhe o percentual de atingimento de cada meta por projeto.</p>
            </div>
            <button onClick={abrirNova}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:-translate-y-0.5">
              <Plus size={16} /> Nova Meta
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total de Metas',    value: String(filtradas.length),  cls: '' },
              { label: 'Media Geral',       value: `${mediaPct}%`,            cls: 'text-[#0068ff]' },
              { label: 'Metas Atingidas',   value: String(atingidas),          cls: 'text-emerald-700' },
              { label: 'Metas Criticas',    value: String(criticas),           cls: criticas > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map((m) => (
              <div key={m.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
                <p className={`mt-1 text-2xl font-black ${m.cls || 'text-slate-950'}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FILTRO */}
        <div className="flex items-center gap-3">
          <select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}
            className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0068ff]">
            <option value="">Todos os projetos</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <span className="text-xs font-black text-slate-400">{filtradas.length} meta(s)</span>
        </div>

        {/* CARDS */}
        {loading ? (
          <p className="py-12 text-center text-sm font-bold text-slate-400">Carregando metas...</p>
        ) : filtradas.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 py-16 text-center">
            <Target size={32} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-black text-slate-400">Nenhuma meta cadastrada.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtradas.map((m) => {
              const p  = pct(m.realizado, m.meta_valor);
              const st = statusMeta(p);
              return (
                <div key={m.id} className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-950">{m.indicador}</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">{projetoNome(m.projeto_id)}</p>
                      {m.periodo && <p className="text-[10px] font-bold text-slate-400">{m.periodo}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* progress */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-black">
                      <span className="text-slate-500">{Number(m.realizado || 0)} / {Number(m.meta_valor || 0)} {m.unidade}</span>
                      <span className={st.text}>{p}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div className={`h-2.5 rounded-full transition-all ${st.cls}`}
                        style={{ width: `${Math.min(100, p)}%` }} />
                    </div>
                  </div>

                  {/* controles */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => ajustarRealizado(m, -1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition">
                        <ChevronDown size={14}/>
                      </button>
                      <span className="w-12 text-center text-sm font-black text-slate-950">{Number(m.realizado || 0)}</span>
                      <button onClick={() => ajustarRealizado(m, 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition">
                        <ChevronUp size={14}/>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(m)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-50 transition">
                        Editar
                      </button>
                      <button onClick={() => excluir(m.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-red-400 hover:bg-red-100 transition">
                        <X size={12}/>
                      </button>
                    </div>
                  </div>

                  {m.observacao && (
                    <p className="mt-3 rounded-[.8rem] bg-slate-50 p-2.5 text-[11px] font-bold text-slate-500">{m.observacao}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-950">{editando ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button onClick={() => { setShowModal(false); setEditando(null); setForm(FORM0); }}
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
              <input required type="text" placeholder="Indicador/Meta *" value={form.indicador}
                onChange={(e) => setForm((f) => ({ ...f, indicador: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">Meta</label>
                  <input type="number" min="0" value={form.meta_valor}
                    onChange={(e) => setForm((f) => ({ ...f, meta_valor: e.target.value }))}
                    className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">Realizado</label>
                  <input type="number" min="0" value={form.realizado}
                    onChange={(e) => setForm((f) => ({ ...f, realizado: e.target.value }))}
                    className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">Unidade</label>
                  <input type="text" value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                </div>
              </div>
              <input type="text" placeholder="Periodo (ex: Jan-Jun 2026)" value={form.periodo}
                onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              <textarea placeholder="Observacao" value={form.observacao}
                onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff] min-h-[70px]" />
              <button type="submit" disabled={salvando}
                className="w-full rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:bg-[#0050d0] disabled:opacity-50">
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
