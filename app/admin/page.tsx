'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3,
  ClipboardCheck, FileText, ShieldCheck, Target, Trophy, Wallet,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

type Alerta = { titulo: string; desc: string; tipo: 'critico' | 'aviso' | 'ok' };

export default function AdminPage() {
  const [projs,    setProjs]   = useState<any[]>([]);
  const [benes,    setBenes]   = useState(0);
  const [patros,   setPatros]  = useState<any[]>([]);
  const [prestDocs,setPrest]   = useState<any[]>([]);
  const [loading,  setLoad]    = useState(true);

  useEffect(() => {
    if (!supabase) { setLoad(false); return; }
    Promise.all([
      supabase.from('manager_projetos').select('id,nome,status,valor_aprovado,valor_captado,proximo_prazo'),
      supabase.from('manager_beneficiarios').select('id', { count: 'exact', head: true }),
      supabase.from('manager_patrocinios').select('id,valor,status'),
      supabase.from('manager_prestacao_docs').select('id,status,prazo'),
    ]).then(([pR, bR, aR, dR]) => {
      setProjs(pR.data || []);
      setBenes(bR.count || 0);
      setPatros(aR.data || []);
      setPrest(dR.data || []);
      setLoad(false);
    });
  }, []);

  const totalAprov   = projs.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
  const totalCapt    = projs.reduce((s, p) => s + Number(p.valor_captado || 0), 0);
  const totalAportes = patros.reduce((s, a) => s + Number(a.valor || 0), 0);

  const hoje = Date.now();
  const projsPrazo = projs.filter(p => {
    if (!p.proximo_prazo) return false;
    const d = Math.ceil((new Date(p.proximo_prazo).getTime() - hoje) / 86400000);
    return d >= 0 && d <= 15;
  });
  const prestVencendo = prestDocs.filter(d => {
    if (!d.prazo) return false;
    const diff = Math.ceil((new Date(d.prazo).getTime() - hoje) / 86400000);
    return diff >= 0 && diff <= 7 && d.status !== 'aprovado';
  });
  const prestCriticos = prestDocs.filter(d => d.status === 'risco_glosa' || d.status === 'reprovado');

  const alertasBase: Alerta[] = [
    ...(projsPrazo.length > 0    ? [{ titulo: `${projsPrazo.length} projeto(s) com prazo em 15 dias`,  desc: projsPrazo.map(p=>p.nome).slice(0,2).join(', '), tipo: 'aviso'   as const }] : []),
    ...(prestCriticos.length > 0 ? [{ titulo: `${prestCriticos.length} doc(s) em risco ou reprovados`, desc: 'Verificar prestação de contas',                  tipo: 'critico' as const }] : []),
    ...(prestVencendo.length > 0  ? [{ titulo: `${prestVencendo.length} comprovante(s) vencendo`,       desc: 'Prazo em até 7 dias',                            tipo: 'aviso'   as const }] : []),
  ];
  const alertas: Alerta[] = alertasBase.length === 0 && !loading
    ? [{ titulo: 'Operação em dia', desc: 'Nenhum alerta crítico no momento', tipo: 'ok' as const }]
    : alertasBase;

  const pctCapt = totalAprov > 0 ? Math.round((totalCapt / totalAprov) * 100) : 0;

  const kpis = [
    { label: 'Projetos ativos',  value: loading ? '...' : String(projs.length),   sub: 'cadastrados',           icon: FileText,      cor: 'text-blue-600 bg-blue-50'     },
    { label: 'Valor aprovado',   value: loading ? '...' : fmt(totalAprov),         sub: 'total do portfólio',    icon: Target,        cor: 'text-emerald-600 bg-emerald-50'},
    { label: 'Captado',          value: loading ? '...' : fmt(totalCapt),          sub: `${pctCapt}% do aprov.`, icon: Wallet,        cor: 'text-teal-600 bg-teal-50'     },
    { label: 'Beneficiários',    value: loading ? '...' : String(benes),           sub: 'cadastrados',           icon: ShieldCheck,   cor: 'text-violet-600 bg-violet-50'  },
    { label: 'Total aportes',    value: loading ? '...' : fmt(totalAportes),       sub: 'de patrocinadores',     icon: ClipboardCheck,cor: 'text-amber-600 bg-amber-50'   },
    { label: 'Prazos urgentes',  value: loading ? '...' : String(projsPrazo.length), sub: 'próximos 15 dias',   icon: AlertTriangle, cor: projsPrazo.length > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-100' },
  ];

  const statusOperacao = prestCriticos.length > 0 || projsPrazo.length > 3
    ? { label: 'Atenção necessária', cor: 'text-amber-700', bg: 'bg-amber-50', icone: <AlertTriangle size={26} className="text-amber-600"/> }
    : { label: 'Operação saudável',  cor: 'text-emerald-700', bg: 'bg-emerald-50', icone: <CheckCircle2 size={26} className="text-emerald-600"/> };

  return (
    <PortalShell portal="admin">
      <div className="space-y-7">

        {/* HERO */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-7 xl:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                Gestão SaaS/GovTech Premium
              </div>
              <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-4xl">
                Controle executivo da operação IncentiVou
              </h2>
              <p className="mt-4 max-w-xl text-sm font-bold leading-relaxed text-slate-500">
                Acompanhe projetos, captação, execução, compliance e prestação de contas em tempo real.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/admin/kanban"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:-translate-y-0.5">
                  Ver operação <ArrowRight size={16}/>
                </Link>
                <Link href="/executor/diagnostico"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5">
                  Diagnóstico
                </Link>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Status geral</p>
                  <h3 className={`text-xl font-black ${statusOperacao.cor}`}>{loading ? 'Carregando...' : statusOperacao.label}</h3>
                </div>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${statusOperacao.bg}`}>
                  {statusOperacao.icone}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: `${projs.length} projetos cadastrados`,         ok: projs.length > 0 },
                  { label: `${benes} beneficiários ativos`,                ok: benes > 0        },
                  { label: `${patros.length} aportes registrados`,         ok: patros.length > 0 },
                  { label: `${prestDocs.filter(d=>d.status==='aprovado').length} docs aprovados na prestação`, ok: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-[1.1rem] bg-white p-3">
                    {item.ok
                      ? <CheckCircle2 size={16} className="shrink-0 text-emerald-500"/>
                      : <Clock3 size={16} className="shrink-0 text-slate-400"/>}
                    <span className="text-xs font-bold text-slate-700">{loading ? '...' : item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPIs REAIS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${k.cor.split(' ')[1]}`}>
                    <Icon size={20} className={k.cor.split(' ')[0]}/>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Live</span>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{k.label}</p>
                <p className={`mt-1 text-3xl font-black ${k.cor.split(' ')[0]}`}>{k.value}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{k.sub}</p>
              </div>
            );
          })}
        </section>

        {/* ALERTAS REAIS */}
        <section className="grid gap-6 xl:grid-cols-[1fr_.45fr]">
          {/* Projetos com prazo */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-950">Projetos — prazos próximos</h3>
              <Link href="/executor/projetos" className="text-xs font-black text-[#0068ff] hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12}/>
              </Link>
            </div>
            {loading ? (
              <p className="py-6 text-center text-sm font-bold text-slate-400">Carregando...</p>
            ) : projs.length === 0 ? (
              <p className="py-6 text-center text-sm font-bold text-slate-400">Nenhum projeto cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {projs.slice(0, 6).map(p => {
                  const dias = p.proximo_prazo
                    ? Math.ceil((new Date(p.proximo_prazo).getTime() - hoje) / 86400000)
                    : null;
                  return (
                    <Link key={p.id} href={`/executor/projetos/${p.id}`}
                      className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#0068ff]/30 hover:bg-[#0068ff]/5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">{p.nome}</p>
                        <p className="text-[10px] font-bold capitalize text-slate-400">{p.status || 'sem status'}</p>
                      </div>
                      {dias !== null ? (
                        <span className={`ml-3 shrink-0 rounded-xl px-2.5 py-1 text-xs font-black ${dias <= 7 ? 'bg-red-100 text-red-700' : dias <= 15 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {dias <= 0 ? 'Vencido' : `${dias}d`}
                        </span>
                      ) : (
                        <span className="ml-3 shrink-0 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-400">—</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alertas inteligentes */}
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0068ff]">Alertas inteligentes</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">Prioridades</h3>
            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="py-4 text-center text-sm font-bold text-slate-400">Carregando...</p>
              ) : alertas.length === 0 ? (
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600"/>
                  <div>
                    <p className="font-black text-emerald-800">Operação em dia</p>
                    <p className="text-xs font-bold text-emerald-600">Nenhum alerta crítico</p>
                  </div>
                </div>
              ) : alertas.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-[1.2rem] border p-4 ${a.tipo === 'critico' ? 'border-red-200 bg-red-50' : a.tipo === 'aviso' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <div className={`mt-0.5 shrink-0 ${a.tipo === 'critico' ? 'text-red-500' : a.tipo === 'aviso' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {a.tipo === 'ok' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${a.tipo === 'critico' ? 'text-red-900' : a.tipo === 'aviso' ? 'text-amber-900' : 'text-emerald-900'}`}>{a.titulo}</p>
                    <p className={`mt-0.5 text-xs font-bold ${a.tipo === 'critico' ? 'text-red-700' : a.tipo === 'aviso' ? 'text-amber-700' : 'text-emerald-700'}`}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              {[
                { label: 'Admin CRM', href: '/admin/kanban' },
                { label: 'Prestação de Contas', href: '/executor/prestacao-contas' },
                { label: 'Diagnóstico', href: '/executor/diagnostico' },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50">
                  {l.label} <ArrowRight size={12} className="text-slate-400"/>
                </Link>
              ))}
            </div>
          </aside>
        </section>

      </div>
    </PortalShell>
  );
}
