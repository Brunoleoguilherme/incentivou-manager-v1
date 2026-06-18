'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CalendarClock, CheckCircle2,
  Clock3, FileText, Target, UploadCloud, Wallet,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string; nome: string; status: string | null; esfera: string | null;
  valor_aprovado: number | null; valor_captado: number | null;
  proximo_prazo: string | null; inscricao_status: string | null;
};

const FASES = [
  { key: 'diagnostico', label: 'Diagnostico',        cor: 'bg-slate-400',   corLight: 'bg-slate-50',   corText: 'text-slate-600',   corBorder: 'border-slate-200'  },
  { key: 'aprovado',    label: 'Aprovacao',           cor: 'bg-amber-400',   corLight: 'bg-amber-50',   corText: 'text-amber-700',   corBorder: 'border-amber-200'  },
  { key: 'captacao',    label: 'Captacao',            cor: 'bg-blue-500',    corLight: 'bg-blue-50',    corText: 'text-blue-700',    corBorder: 'border-blue-200'   },
  { key: 'execucao',    label: 'Execucao',            cor: 'bg-emerald-500', corLight: 'bg-emerald-50', corText: 'text-emerald-700', corBorder: 'border-emerald-200'},
  { key: 'prestacao',   label: 'Prestacao de Contas', cor: 'bg-purple-500',  corLight: 'bg-purple-50',  corText: 'text-purple-700',  corBorder: 'border-purple-200' },
  { key: 'finalizado',  label: 'Finalizado',          cor: 'bg-teal-500',    corLight: 'bg-teal-50',    corText: 'text-teal-700',    corBorder: 'border-teal-200'   },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

function faseDoStatus(status?: string | null) {
  const s = (status || '').toLowerCase();
  const f = FASES.find((f) => s.includes(f.key));
  return f || FASES[0];
}

function diasParaPrazo(prazo?: string | null) {
  if (!prazo) return null;
  return Math.ceil((new Date(prazo).getTime() - Date.now()) / 86400000);
}

export default function ExecutorOverviewPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from('manager_projetos')
      .select('id,nome,status,esfera,valor_aprovado,valor_captado,proximo_prazo,inscricao_status')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProjetos((data || []) as Projeto[]); setLoading(false); });
  }, []);

  const totalAprovado = projetos.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
  const totalCaptado  = projetos.reduce((s, p) => s + Number(p.valor_captado  || 0), 0);
  const comPrazo      = projetos.filter((p) => { const d = diasParaPrazo(p.proximo_prazo); return d !== null && d <= 7; });

  const porFase: Record<string, Projeto[]> = {};
  FASES.forEach((f) => { porFase[f.key] = []; });
  projetos.forEach((p) => { porFase[faseDoStatus(p.status).key].push(p); });

  return (
    <PortalShell portal="executor">
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Portal Executor</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Visao Geral</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Acompanhe todos os projetos por fase — aprovacao, captacao, execucao e prestacao de contas.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total de Projetos', value: String(projetos.length), icon: <FileText size={18} />, cls: '' },
              { label: 'Valor Aprovado',    value: fmt(totalAprovado),       icon: <CheckCircle2 size={18} />, cls: 'text-emerald-700' },
              { label: 'Valor Captado',     value: fmt(totalCaptado),        icon: <Target size={18} />, cls: 'text-blue-700' },
              { label: 'Prazos em 7 dias',  value: String(comPrazo.length),  icon: <AlertTriangle size={18} />, cls: comPrazo.length > 0 ? 'text-amber-700' : '' },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 ${m.cls}`}>{m.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
                  <p className={`text-xl font-black ${m.cls || 'text-slate-950'}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PAINEL DE ACOMPANHAMENTO */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Painel de Acompanhamento</h2>
              <p className="text-xs font-bold text-slate-400">Projetos agrupados por fase atual</p>
            </div>
            <Link href="/executor/projetos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando projetos...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {FASES.map((fase) => {
                const lista = porFase[fase.key] || [];
                return (
                  <div key={fase.key} className={`rounded-[1.6rem] border ${fase.corBorder} ${fase.corLight} p-5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${fase.cor}`} />
                        <span className={`text-xs font-black uppercase tracking-[0.14em] ${fase.corText}`}>{fase.label}</span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${fase.corLight} ${fase.corText} ${fase.corBorder}`}>
                        {lista.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {lista.length === 0 && (
                        <p className="py-3 text-center text-xs font-bold text-slate-400">Nenhum projeto</p>
                      )}
                      {lista.slice(0, 4).map((p) => {
                        const dias = diasParaPrazo(p.proximo_prazo);
                        const alerta = dias !== null && dias <= 7;
                        return (
                          <Link key={p.id} href={`/executor/projetos/${p.id}`}
                            className="flex items-center justify-between rounded-[1.1rem] border border-white/80 bg-white/80 p-3 shadow-sm transition hover:shadow-md">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-slate-950">{p.nome}</p>
                              {p.esfera && <p className="mt-0.5 text-[10px] font-bold capitalize text-slate-400">{p.esfera}</p>}
                            </div>
                            {alerta && (
                              <span className="ml-2 flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">
                                <Clock3 size={10} /> {dias}d
                              </span>
                            )}
                          </Link>
                        );
                      })}
                      {lista.length > 4 && (
                        <p className={`text-center text-[10px] font-black ${fase.corText}`}>+{lista.length - 4} projeto(s)</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ALERTAS DE PRAZO */}
        {comPrazo.length > 0 && (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <h2 className="text-lg font-black text-amber-900">Prazos criticos — proximos 7 dias</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {comPrazo.map((p) => {
                const dias = diasParaPrazo(p.proximo_prazo)!;
                return (
                  <Link key={p.id} href={`/executor/projetos/${p.id}`}
                    className="flex items-center justify-between rounded-[1.3rem] border border-amber-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{p.nome}</p>
                      <p className="mt-0.5 text-xs font-bold capitalize text-slate-400">{faseDoStatus(p.status).label}</p>
                    </div>
                    <div className={`ml-3 shrink-0 rounded-xl px-3 py-1.5 text-center ${dias <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      <p className="text-xs font-black">{dias <= 0 ? 'Vencido' : `${dias}d`}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* DISTRIBUICAO POR FASE */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Distribuicao por Fase</h2>
          <div className="space-y-3">
            {FASES.map((fase) => {
              const count = (porFase[fase.key] || []).length;
              const pct   = projetos.length > 0 ? Math.round((count / projetos.length) * 100) : 0;
              return (
                <div key={fase.key} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <span className={`text-xs font-black ${fase.corText}`}>{fase.label}</span>
                  </div>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                    <div className={`h-2.5 rounded-full transition-all ${fase.cor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-black text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACESSO RAPIDO */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Inscrever Projeto', href: '/executor/projetos/nova', icon: <FileText size={20} />,    desc: 'Iniciar nova inscricao' },
            { label: 'Documentos',        href: '/executor/documentos',    icon: <UploadCloud size={20} />, desc: 'Enviar e gerenciar arquivos' },
            { label: 'Execucao Segura',   href: '/executor/execucao',      icon: <Wallet size={20} />,      desc: 'Acompanhar execucao e checklists' },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">{a.icon}</div>
              <div>
                <p className="font-black text-slate-950">{a.label}</p>
                <p className="text-xs font-bold text-slate-400">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300" />
            </Link>
          ))}
        </section>

      </div>
    </PortalShell>
  );
}
