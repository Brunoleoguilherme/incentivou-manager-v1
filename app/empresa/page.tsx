'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, BarChart3, CheckCircle2, Download,
  Handshake, LineChart, Sparkles, Target, Wallet,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Patrocinio = {
  id: string; projeto_id: string; empresa_nome: string;
  valor: number | null; data_aporte: string | null;
  status: string | null; beneficio_fiscal: number | null;
  manager_projetos: { nome: string; modalidade: string | null; esfera: string | null } | null;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const STATUS_CLS: Record<string, string> = {
  pendente:   'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  liberado:   'bg-emerald-100 text-emerald-700',
  concluido:  'bg-teal-100 text-teal-700',
};

export default function EmpresaDashboard() {
  const [patrocinios, setPatrocinios] = useState<Patrocinio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from('manager_patrocinios')
      .select('id,projeto_id,empresa_nome,valor,data_aporte,status,beneficio_fiscal,manager_projetos(nome,modalidade,esfera)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPatrocinios((data || []) as unknown as Patrocinio[]); setLoading(false); });
  }, []);

  const totalAportado   = patrocinios.reduce((s, p) => s + Number(p.valor || 0), 0);
  const totalBeneficio  = patrocinios.reduce((s, p) => s + Number(p.beneficio_fiscal || 0), 0);
  const confirmados     = patrocinios.filter((p) => p.status === 'confirmado' || p.status === 'liberado' || p.status === 'concluido');
  const projetosUnicos  = new Set(patrocinios.map((p) => p.projeto_id)).size;

  return (
    <PortalShell portal="empresa">
      <div className="space-y-7">

        {/* HERO */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-[#0068ff]/5 to-[#16c784]/5 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                <Sparkles size={12} /> Portal do Patrocinador
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                Visao Geral
              </h1>
              <p className="mt-1 max-w-xl text-sm font-bold text-slate-500">
                Acompanhe seus aportes, beneficio fiscal gerado, impacto ESG e projetos apoiados.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/empresa/marketplace"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:-translate-y-0.5">
                  Explorar projetos <ArrowRight size={16} />
                </Link>
                <Link href="/empresa/projetos"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5">
                  Ver meus aportes
                </Link>
              </div>
            </div>

            {/* RESUMO FISCAL */}
            <div className="w-full max-w-sm rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Resumo Fiscal</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{fmt(totalBeneficio)}</p>
              <p className="text-sm font-bold text-emerald-700">beneficio fiscal aproveitado</p>
              <div className="mt-4 h-px bg-slate-100" />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Total aportado</span>
                  <span className="font-black text-slate-950">{fmt(totalAportado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Projetos apoiados</span>
                  <span className="font-black text-slate-950">{projetosUnicos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Confirmados</span>
                  <span className="font-black text-emerald-700">{confirmados.length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICAS */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Aportado',    value: fmt(totalAportado),   icon: <Wallet size={20}/>,       cls: 'text-[#0068ff]',    bg: 'bg-blue-50'    },
            { label: 'Beneficio Fiscal',  value: fmt(totalBeneficio),  icon: <CheckCircle2 size={20}/>, cls: 'text-emerald-700',  bg: 'bg-emerald-50' },
            { label: 'Projetos Apoiados', value: String(projetosUnicos),icon: <Handshake size={20}/>,   cls: 'text-purple-700',   bg: 'bg-purple-50'  },
            { label: 'Aportes Ativos',    value: String(confirmados.length), icon: <Target size={20}/>, cls: 'text-amber-700',    bg: 'bg-amber-50'   },
          ].map((m) => (
            <div key={m.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${m.bg} ${m.cls}`}>{m.icon}</div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
              <p className={`mt-1 text-2xl font-black ${m.cls}`}>{m.value}</p>
            </div>
          ))}
        </section>

        {/* ULTIMOS APORTES */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Ultimos Aportes</h2>
            <Link href="/empresa/projetos"
              className="text-xs font-black text-emerald-600 hover:underline">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : patrocinios.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 py-10 text-center">
              <Handshake size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-black text-slate-400">Nenhum aporte registrado ainda.</p>
              <Link href="/empresa/marketplace"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                Explorar projetos <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {patrocinios.slice(0, 5).map((p) => {
                const proj = p.manager_projetos;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-[1.3rem] border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Handshake size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{proj?.nome || 'Projeto'}</p>
                        <p className="text-xs font-bold text-slate-400">
                          {fmtDate(p.data_aporte)} {proj?.modalidade ? `· ${proj.modalidade}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-950">{fmt(Number(p.valor || 0))}</p>
                        <p className="text-[10px] font-bold text-emerald-600">Beneficio: {fmt(Number(p.beneficio_fiscal || 0))}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black capitalize ${STATUS_CLS[p.status || 'pendente'] || 'bg-slate-100 text-slate-500'}`}>
                        {p.status || 'pendente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ATALHOS */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Marketplace',       href: '/empresa/marketplace',        icon: <Target size={20}/>,   desc: 'Encontrar novos projetos' },
            { label: 'Impacto ESG',       href: '/empresa/impacto-esg',        icon: <LineChart size={20}/>,desc: 'Relatorios de impacto social' },
            { label: 'Relatorios',        href: '/empresa/relatorios',         icon: <BarChart3 size={20}/>,desc: 'Downloads e comprovantes' },
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
