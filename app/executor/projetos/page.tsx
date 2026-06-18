'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarClock, FolderKanban, Plus, Search, Target, Trash2, Wallet } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string; nome: string; status: string | null; esfera: string | null;
  lei_incentivo: string | null; modalidade: string | null; cidade: string | null;
  estado: string | null; valor_aprovado: number | null; valor_captado: number | null;
  proximo_prazo: string | null; created_at: string | null;
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem prazo';

function statusLabel(s?: string | null) {
  const m: Record<string,string> = { diagnostico:'Diagnóstico', diagnóstico:'Diagnóstico', captacao:'Captação', captação:'Captação', aprovado:'Aprovado', execucao:'Execução', execução:'Execução', prestacao:'Prestação', prestação:'Prestação', finalizado:'Finalizado', ativo:'Ativo' };
  return m[(s||'').toLowerCase()] || s || 'Diagnóstico';
}
function statusColor(s?: string | null) {
  const v = (s||'').toLowerCase();
  if (['aprovado','finalizado'].includes(v))  return 'bg-emerald-50 text-emerald-700';
  if (['execucao','execução'].includes(v))    return 'bg-blue-50 text-blue-700';
  if (['captacao','captação'].includes(v))    return 'bg-amber-50 text-amber-700';
  if (['prestacao','prestação'].includes(v))  return 'bg-purple-50 text-purple-700';
  return 'bg-slate-100 text-slate-600';
}
function esferaLabel(e?: string | null) { return e ? e.charAt(0).toUpperCase()+e.slice(1) : '—'; }
function esferaColor(e?: string | null) {
  if (e === 'federal')   return 'bg-blue-100 text-blue-700';
  if (e === 'estadual')  return 'bg-indigo-100 text-indigo-700';
  if (e === 'municipal') return 'bg-teal-100 text-teal-700';
  return 'bg-slate-100 text-slate-500';
}

const ESFERAS = ['todos','federal','estadual','municipal'] as const;
type EsferaFiltro = typeof ESFERAS[number];

export default function ExecutorProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [busca, setBusca]       = useState('');
  const [esfera, setEsfera]     = useState<EsferaFiltro>('todos');
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState('');
  const [excluindo, setExcluindo] = useState<Projeto | null>(null);
  const [senha, setSenha]         = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [deletando, setDeletando] = useState(false);

  async function carregar() {
    if (!supabase) return;
    setLoading(true); setErro('');
    const { data, error } = await supabase
      .from('manager_projetos')
      .select('id,nome,status,esfera,lei_incentivo,modalidade,cidade,estado,valor_aprovado,valor_captado,proximo_prazo,created_at')
      .order('created_at', { ascending: false });
    if (error) { setErro(error.message); setLoading(false); return; }
    setProjetos(data || []); setLoading(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => projetos.filter((p) => {
    const okEsfera = esfera === 'todos' || p.esfera === esfera;
    const t = busca.toLowerCase();
    const okBusca = !busca || [p.nome, p.status, p.modalidade, p.cidade].some(f => f?.toLowerCase().includes(t));
    return okEsfera && okBusca;
  }), [projetos, esfera, busca]);

  const resumo = useMemo(() => ({
    total: projetos.length,
    federal: projetos.filter(p => p.esfera === 'federal').length,
    estadual: projetos.filter(p => p.esfera === 'estadual').length,
    municipal: projetos.filter(p => p.esfera === 'municipal').length,
    valorAprovado: projetos.reduce((t,p) => t + Number(p.valor_aprovado||0), 0),
    valorCaptado:  projetos.reduce((t,p) => t + Number(p.valor_captado||0),  0),
    emCaptacao: projetos.filter(p => ['captacao','captação'].includes((p.status||'').toLowerCase())).length,
  }), [projetos]);

  async function confirmarExclusao() {
    if (!supabase || !excluindo) return;
    setDeletando(true);
    const usuarioSalvo = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
    const emailAtual = usuarioSalvo?.email || '';
    const { data } = await supabase
      .from('manager_usuarios')
      .select('id')
      .eq('email', emailAtual)
      .eq('senha', senha)
      .eq('status', 'ativo')
      .single();
    if (!data) {
      setSenhaErro(true);
      setDeletando(false);
      return;
    }
    await supabase.from('manager_projetos').delete().eq('id', excluindo.id);
    setDeletando(false);
    setExcluindo(null);
    setSenha('');
    setSenhaErro(false);
    carregar();
  }

  return (
    <PortalShell portal="executor">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">Portal Executor</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Meus Projetos</h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Diagnóstico, captação, execução e prestação de contas por esfera de governo.
              </p>
            </div>
            <Link href="/executor/projetos/nova"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">
              <Plus size={16} /> Inscrever Projeto
            </Link>
          </div>

          {/* MÉTRICAS */}
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total de Projetos', value: String(resumo.total),            icon: <FolderKanban size={20}/> },
              { label: 'Em Captação',       value: String(resumo.emCaptacao),       icon: <Target size={20}/> },
              { label: 'Valor Aprovado',    value: fmt(resumo.valorAprovado),        icon: <Wallet size={20}/> },
              { label: 'Valor Captado',     value: fmt(resumo.valorCaptado),         icon: <Wallet size={20}/> },
            ].map(m => (
              <div key={m.label} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{m.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{m.value}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">{m.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* BADGES ESFERA */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label:'Federal',   count: resumo.federal,   cls:'bg-blue-50 text-blue-700 border-blue-200' },
              { label:'Estadual',  count: resumo.estadual,  cls:'bg-indigo-50 text-indigo-700 border-indigo-200' },
              { label:'Municipal', count: resumo.municipal, cls:'bg-teal-50 text-teal-700 border-teal-200' },
            ].map(b => (
              <span key={b.label} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black ${b.cls}`}>
                {b.label} <span className="rounded-full bg-white/60 px-2 py-0.5">{b.count}</span>
              </span>
            ))}
          </div>
        </section>

        {erro && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>}

        {/* LISTA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          {/* TABS + BUSCA */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {ESFERAS.map(e => (
              <button key={e} onClick={() => setEsfera(e)}
                className={`rounded-2xl px-5 py-2 text-sm font-black transition ${esfera===e ? 'bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase()+e.slice(1)}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${esfera===e ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {e === 'todos' ? projetos.length : projetos.filter(p => p.esfera===e).length}
                </span>
              </button>
            ))}
            <div className="relative ml-auto w-full md:w-64">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-emerald-400 focus:bg-white"/>
            </div>
          </div>

          {/* TABELA */}
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="hidden grid-cols-[1.4fr_.65fr_.65fr_.8fr_.8fr_.7fr_.7fr] bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.13em] text-slate-500 md:grid">
              <span>Projeto</span><span>Esfera</span><span>Status</span>
              <span>Aprovado</span><span>Captado</span><span>Prazo</span>
              <span className="text-center">Ação</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">Carregando...</div>
            ) : filtrados.length === 0 ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">
                {esfera !== 'todos' ? `Nenhum projeto ${esfera} encontrado.` : 'Nenhum projeto encontrado.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtrados.map(p => (
                  <div key={p.id} className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.4fr_.65fr_.65fr_.8fr_.8fr_.7fr_.7fr] md:items-center">
                    <div>
                      <p className="font-black text-slate-950">{p.nome}</p>
                      {p.modalidade && <p className="text-xs font-bold text-slate-400">{p.modalidade}</p>}
                      {(p.cidade||p.estado) && (
                        <p className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          <CalendarClock size={11}/> {[p.cidade,p.estado].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${esferaColor(p.esfera)}`}>{esferaLabel(p.esfera)}</span>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
                    <p className="text-sm font-bold text-slate-700">{fmt(Number(p.valor_aprovado||0))}</p>
                    <p className="text-sm font-bold text-slate-700">{fmt(Number(p.valor_captado||0))}</p>
                    <p className="text-sm font-bold text-slate-500">{fmtDate(p.proximo_prazo)}</p>
                    <div className="flex items-center justify-start gap-2 md:justify-center">
                      <Link href={`/executor/projetos/${p.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-4 text-xs font-black text-white">
                        Abrir <ArrowRight size={13}/>
                      </Link>
                      <button onClick={() => { setExcluindo(p); setSenha(''); setSenhaErro(false); }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

        {/* MODAL DE EXCLUSÃO */}
        {excluindo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-[1.8rem] bg-white p-7 shadow-2xl">
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={24}/>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950">Excluir projeto?</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Você está prestes a excluir <span className="font-black text-slate-950">"{excluindo.nome}"</span>. Esta ação não pode ser desfeita.
              </p>
              <div className="mt-5">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Digite a senha para confirmar
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setSenhaErro(false); }}
                  placeholder="••••••••"
                  className={`w-full rounded-[1rem] border px-4 py-3 text-sm font-bold outline-none transition ${senhaErro ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 focus:border-red-400 focus:bg-white'}`}
                />
                {senhaErro && (
                  <p className="mt-1.5 text-xs font-black text-red-500">Senha incorreta. Tente novamente.</p>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => { setExcluindo(null); setSenha(''); setSenhaErro(false); }}
                  className="flex-1 rounded-[1.1rem] border border-slate-200 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={!senha || deletando}
                  className="flex-1 rounded-[1.1rem] bg-red-500 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-40 transition">
                  {deletando ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

    </PortalShell>
  );
}
