'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Building2, CheckCircle2, Download,
  FileText, Leaf, Sparkles, Target, TrendingUp, Users,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string;
  nome: string;
  esfera: string | null;
  status: string | null;
  valor_aprovado: number | null;
  valor_captado: number | null;
  tipo_projeto: string | null;
  ods_tags: number[] | null;
};

function moeda(v?: number | null) {
  if (!v) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} mil`;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusCls(s?: string | null) {
  if (s === 'Aprovado' || s === 'Em execução') return 'bg-emerald-50 text-emerald-700';
  if (s === 'Captacao' || s === 'Captação')    return 'bg-blue-50 text-blue-700';
  if (s === 'Concluído')                        return 'bg-teal-50 text-teal-700';
  return 'bg-slate-100 text-slate-500';
}

function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
          {sub && <p className="mt-1 text-xs font-bold text-slate-400">{sub}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color.replace('text-', 'bg-').replace('-700', '-50').replace('-600', '-50')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const RELATORIOS = [
  { icon: <FileText size={20} className="text-blue-600" />, title: 'Relatório Executivo', sub: 'Portfólio de projetos apoiados', bg: 'bg-blue-50' },
  { icon: <Leaf size={20} className="text-emerald-600" />, title: 'Relatório ESG', sub: 'ODS, impacto e beneficiários', bg: 'bg-emerald-50' },
  { icon: <TrendingUp size={20} className="text-violet-600" />, title: 'Benefício Fiscal', sub: 'Valores investidos e abatimentos', bg: 'bg-violet-50' },
  { icon: <Download size={20} className="text-orange-500" />, title: 'Exportar Excel', sub: 'Todos os projetos em .xlsx', bg: 'bg-orange-50' },
];

export default function EmpresaRelatoriosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('manager_projetos')
      .select('id,nome,esfera,status,valor_aprovado,valor_captado,tipo_projeto,ods_tags')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProjetos((data || []) as Projeto[]); setLoading(false); });
  }, []);

  const kpis = useMemo(() => ({
    total:    projetos.length,
    aprovado: projetos.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0),
    captado:  projetos.reduce((s, p) => s + Number(p.valor_captado  || 0), 0),
    ods:      new Set(projetos.flatMap(p => p.ods_tags || [])).size,
  }), [projetos]);

  return (
    <PortalShell>
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Empresa</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Relatórios</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Visão consolidada dos projetos apoiados, impacto ESG e benefício fiscal.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI label="Projetos"       value={String(kpis.total)}    icon={<Building2 size={20} />}    color="text-slate-800" />
            <KPI label="Valor aprovado" value={moeda(kpis.aprovado)}  icon={<Target size={20} />}       color="text-blue-700" />
            <KPI label="Valor captado"  value={moeda(kpis.captado)}   icon={<TrendingUp size={20} />}   color="text-emerald-700" />
            <KPI label="ODS cobertos"   value={String(kpis.ods)}      icon={<Leaf size={20} />}         color="text-violet-700" />
          </div>
        </section>

        {/* TIPOS DE RELATÓRIO */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="mb-5 text-lg font-black text-slate-950">Tipos de relatório</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {RELATORIOS.map(r => (
              <button
                key={r.title}
                type="button"
                className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${r.bg}`}>{r.icon}</div>
                <div>
                  <p className="text-sm font-black text-slate-950">{r.title}</p>
                  <p className="text-xs font-bold text-slate-500">{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* TABELA DE PROJETOS */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="mb-5 text-lg font-black text-slate-950">Projetos — visão geral</h2>

          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : projetos.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 py-12 text-center">
              <Sparkles size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-black text-slate-400">Nenhum projeto encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Projeto', 'Esfera', 'Status', 'Valor aprovado', 'Captado'].map(h => (
                      <th key={h} className="pb-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projetos.map(p => (
                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                      <td className="py-3 font-black text-slate-950">{p.nome}</td>
                      <td className="py-3 font-bold text-slate-500">{p.esfera || '—'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusCls(p.status)}`}>
                          {p.status || '—'}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-blue-700">{moeda(p.valor_aprovado)}</td>
                      <td className="py-3 font-bold text-emerald-700">{moeda(p.valor_captado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
