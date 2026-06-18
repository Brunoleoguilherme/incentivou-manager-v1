'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarClock, FolderOpen, Search, Target, Trash2, Wallet,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string;
  nome: string;
  executor_nome: string | null;
  status: string | null;
  esfera: string | null;
  modalidade: string | null;
  cidade: string | null;
  estado: string | null;
  valor_aprovado: number | null;
  valor_captado: number | null;
  proximo_prazo: string | null;
  created_at: string | null;
};

const fmt     = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem prazo';
const nomeProjeto = (p: Projeto) => p.nome || '—';

function statusLabel(s?: string | null) {
  const m: Record<string, string> = {
    diagnostico: 'Diagnóstico', diagnóstico: 'Diagnóstico',
    captacao: 'Captação',       captação: 'Captação',
    aprovado: 'Aprovado',       execucao: 'Execução',
    execução: 'Execução',       prestacao: 'Prestação',
    prestação: 'Prestação',     finalizado: 'Finalizado', ativo: 'Ativo',
  };
  return m[(s || '').toLowerCase()] || s || '—';
}

function statusColor(s?: string | null) {
  const v = (s || '').toLowerCase();
  if (['aprovado', 'finalizado'].includes(v)) return 'bg-emerald-50 text-emerald-700';
  if (['execucao', 'execução'].includes(v))   return 'bg-blue-50 text-blue-700';
  if (['captacao', 'captação'].includes(v))   return 'bg-amber-50 text-amber-700';
  if (['prestacao', 'prestação'].includes(v)) return 'bg-purple-50 text-purple-700';
  return 'bg-slate-100 text-slate-600';
}

function esferaCls(e?: string | null) {
  if (e === 'federal')   return 'bg-blue-100 text-blue-700';
  if (e === 'estadual')  return 'bg-indigo-100 text-indigo-700';
  if (e === 'municipal') return 'bg-teal-100 text-teal-700';
  return 'bg-slate-100 text-slate-500';
}

const ESFERAS = ['todos', 'federal', 'estadual', 'municipal'] as const;
type Esfera   = typeof ESFERAS[number];

export default function AdminProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [busca, setBusca]       = useState('');
  const [esfera, setEsfera]     = useState<Esfera>('todos');
  const [loading, setLoading]   = useState(true);
  const [excluindo, setExcluindo] = useState<Projeto | null>(null);
  const [senha, setSenha]         = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [deletando, setDeletando] = useState(false);

  async function carregar() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('manager_projetos')
      .select('id,nome,executor_nome,status,esfera,modalidade,cidade,estado,valor_aprovado,valor_captado,proximo_prazo,created_at')
      .order('created_at', { ascending: false });
    if (error) console.error('admin/projetos:', error.message);
    setProjetos((data || []) as Projeto[]);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => projetos.filter(p => {
    const okEsfera = esfera === 'todos' || p.esfera === esfera;
    const t = busca.toLowerCase();
    const okBusca = !busca || [p.nome, p.status, p.modalidade, p.cidade].some(f => f?.toLowerCase().includes(t));
    return okEsfera && okBusca;
  }), [projetos, esfera, busca]);

  const kpis = useMemo(() => ({
    total:         projetos.length,
    emCaptacao:    projetos.filter(p => ['captacao','captação'].includes((p.status||'').toLowerCase())).length,
    valorAprovado: projetos.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0),
    valorCaptado:  projetos.reduce((s, p) => s + Number(p.valor_captado  || 0), 0),
    federal:   projetos.filter(p => p.esfera === 'federal').length,
    estadual:  projetos.filter(p => p.esfera === 'estadual').length,
    municipal: projetos.filter(p => p.esfera === 'municipal').length,
  }), [projetos]);

  async function confirmarExclusao() {
    if (!supabase || !excluindo) return;
    const raw = localStorage.getItem('incentivou_usuario');
    if (!raw) return;
    const { email } = JSON.parse(raw);
    setDeletando(true); setSenhaErro(false);
    const { data } = await supabase
      .from('manager_usuarios')
      .select('id')
      .eq('email', email)
      .eq('senha', senha)
      .single();
    if (!data) { setSenhaErro(true); setDeletando(false); return; }
    await supabase.from('manager_projetos').delete().eq('id', excluindo.id);
    await carregar();
    setExcluindo(null); setSenha(''); setDeletando(false);
  }

  return (
    <PortalShell>
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Admin</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Projetos</h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Todos os projetos cadastrados por executores — visão consolidada.
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total de projetos', value: kpis.total,               icon: <FolderOpen size={20} />,    color: 'text-slate-800',   bg: 'bg-slate-100' },
              { label: 'Em captação',       value: kpis.emCaptacao,          icon: <Target size={20} />,        color: 'text-amber-700',   bg: 'bg-amber-50' },
              { label: 'Valor aprovado',    value: fmt(kpis.valorAprovado),  icon: <Wallet size={20} />,        color: 'text-blue-700',    bg: 'bg-blue-50' },
              { label: 'Valor captado',     value: fmt(kpis.valorCaptado),   icon: <CalendarClock size={20} />, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            ].map(k => (
              <div key={k.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{k.label}</p>
                    <p className={`mt-2 text-2xl font-black ${k.color}`}>{k.value}</p>
                  </div>
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${k.bg} ${k.color}`}>{k.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* contagem por esfera */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: 'Federal',   v: kpis.federal,   cls: 'bg-blue-100 text-blue-700' },
              { label: 'Estadual',  v: kpis.estadual,  cls: 'bg-indigo-100 text-indigo-700' },
              { label: 'Municipal', v: kpis.municipal, cls: 'bg-teal-100 text-teal-700' },
            ].map(e => (
              <span key={e.label} className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black ${e.cls}`}>
                {e.label} <span className="rounded-full bg-white/60 px-2 py-0.5">{e.v}</span>
              </span>
            ))}
          </div>
        </section>

        {/* LISTA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">

          {/* filtros */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {ESFERAS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEsfera(e)}
                  className={`rounded-2xl px-4 py-2 text-xs font-black capitalize transition ${
                    esfera === e
                      ? 'bg-[#0068ff] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {e === 'todos' ? `Todos ${kpis.total}` : `${e.charAt(0).toUpperCase() + e.slice(1)} ${kpis[e as 'federal'|'estadual'|'municipal']}`}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar projeto..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none focus:border-[#0068ff]"
              />
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">Carregando projetos...</p>
          ) : filtrados.length === 0 ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">Nenhum projeto encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Executor', 'Projeto', 'Esfera', 'Status', 'Aprovado', 'Captado', 'Prazo', 'Ação'].map(h => (
                      <th key={h} className="pb-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map(p => (
                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                      <td className="py-3 pr-4 max-w-[160px]">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0068ff]/8 px-3 py-1 text-xs font-black text-[#0068ff]">
                          {p.executor_nome || <span className="text-slate-400 font-bold">—</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black text-slate-950 max-w-[220px] truncate">{nomeProjeto(p)}</td>
                      <td className="py-3 pr-4">
                        {p.esfera
                          ? <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${esferaCls(p.esfera)}`}>{p.esfera}</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusColor(p.status)}`}>
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-blue-700">{p.valor_aprovado ? fmt(p.valor_aprovado) : <span className="text-slate-400">R$ 0</span>}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-700">{p.valor_captado ? fmt(p.valor_captado) : <span className="text-slate-400">R$ 0</span>}</td>
                      <td className="py-3 pr-4 font-bold text-slate-500">{fmtDate(p.proximo_prazo)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/executor/projetos/${p.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0068ff] px-3 py-2 text-xs font-black text-white hover:bg-blue-700 transition"
                          >
                            Abrir <ArrowRight size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => { setExcluindo(p); setSenha(''); setSenhaErro(false); }}
                            className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MODAL EXCLUIR */}
        {excluindo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <h2 className="text-xl font-black text-slate-950">Excluir projeto</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Confirme sua senha de admin para excluir <strong>{nomeProjeto(excluindo)}</strong>.
              </p>
              <input
                type="password"
                value={senha}
                onChange={e => { setSenha(e.target.value); setSenhaErro(false); }}
                placeholder="Sua senha"
                className={`mt-4 h-14 w-full rounded-2xl border px-4 text-sm font-bold outline-none ${senhaErro ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-red-400'}`}
              />
              {senhaErro && <p className="mt-2 text-xs font-black text-red-600">Senha incorreta.</p>}
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setExcluindo(null)} className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="button" onClick={confirmarExclusao} disabled={!senha || deletando} className="flex-1 rounded-2xl bg-red-600 py-3.5 text-sm font-black text-white hover:bg-red-700 transition disabled:opacity-50">
                  {deletando ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
