'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Building2, Download,
  FileText, Leaf, Sparkles, Target, TrendingUp,
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

type VistaAtiva = 'executivo' | 'esg' | 'captacao';

function moeda(v?: number | null) {
  if (!v) return '—';
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} mil`;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusCls(s?: string | null) {
  const v = (s || '').toLowerCase();
  if (['aprovado', 'em execução', 'execucao', 'execução'].includes(v)) return 'bg-emerald-50 text-emerald-700';
  if (['captacao', 'captação'].includes(v))                             return 'bg-blue-50 text-blue-700';
  if (['concluído', 'concluido'].includes(v))                           return 'bg-teal-50 text-teal-700';
  return 'bg-slate-100 text-slate-500';
}

const ODS_LABELS: Record<number, string> = {
  1:'Sem Pobreza', 2:'Fome Zero', 3:'Saúde', 4:'Educação', 5:'Igualdade de Gênero',
  6:'Água Limpa', 7:'Energia Limpa', 8:'Trabalho Digno', 9:'Indústria', 10:'Desigualdades',
  11:'Cidades', 12:'Consumo', 13:'Clima', 14:'Vida na Água', 15:'Vida Terrestre',
  16:'Paz', 17:'Parcerias',
};

function KPI({ label, value, sub, icon, color }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; color: string;
}) {
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

function exportarCSV(projetos: Projeto[]) {
  const header = ['Projeto', 'Esfera', 'Status', 'Tipo', 'Valor Aprovado', 'Valor Captado', 'ODS'].join(';');
  const rows = projetos.map(p => [
    `"${p.nome}"`,
    p.esfera || '',
    p.status || '',
    p.tipo_projeto || '',
    String(p.valor_aprovado || ''),
    String(p.valor_captado || ''),
    (p.ods_tags || []).join(','),
  ].join(';'));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'relatorio-projetos.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function ExecutorRelatoriosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [vista, setVista]       = useState<VistaAtiva>('executivo');

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

  // Projetos filtrados conforme a vista ativa
  const projetosFiltrados = useMemo(() => {
    if (vista === 'captacao') {
      return projetos.filter(p => p.valor_aprovado || p.valor_captado);
    }
    if (vista === 'esg') {
      return projetos.filter(p => (p.ods_tags || []).length > 0);
    }
    return projetos; // executivo = todos
  }, [projetos, vista]);

  // ODS agrupados para a vista ESG
  const odsContagem = useMemo(() => {
    const map: Record<number, number> = {};
    projetos.forEach(p => (p.ods_tags || []).forEach(o => { map[o] = (map[o] || 0) + 1; }));
    return Object.entries(map)
      .map(([k, v]) => ({ ods: Number(k), count: v }))
      .sort((a, b) => b.count - a.count);
  }, [projetos]);

  const TIPOS = [
    {
      key: 'executivo' as VistaAtiva,
      icon: <FileText size={20} className="text-blue-600" />,
      title: 'Relatório Executivo',
      sub: 'Portfólio de projetos gerenciados',
      bg: 'bg-blue-50',
      activeBorder: 'border-blue-400',
    },
    {
      key: 'esg' as VistaAtiva,
      icon: <Leaf size={20} className="text-emerald-600" />,
      title: 'Relatório ESG',
      sub: 'ODS, impacto e beneficiários',
      bg: 'bg-emerald-50',
      activeBorder: 'border-emerald-400',
    },
    {
      key: 'captacao' as VistaAtiva,
      icon: <TrendingUp size={20} className="text-violet-600" />,
      title: 'Captação & Execução',
      sub: 'Projetos com valores registrados',
      bg: 'bg-violet-50',
      activeBorder: 'border-violet-400',
    },
  ];

  const vistaTitulo: Record<VistaAtiva, string> = {
    executivo: 'Todos os projetos',
    esg:       'Projetos com ODS vinculadas',
    captacao:  'Projetos com valores registrados',
  };

  return (
    <PortalShell>
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Executor</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Relatórios</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Visão consolidada dos projetos executados, impacto ESG e captação.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI label="Projetos"       value={String(kpis.total)}   icon={<Building2 size={20} />}    color="text-slate-800" />
            <KPI label="Valor aprovado" value={moeda(kpis.aprovado)} icon={<Target size={20} />}       color="text-blue-700"    />
            <KPI label="Valor captado"  value={moeda(kpis.captado)}  icon={<TrendingUp size={20} />}   color="text-emerald-700" />
            <KPI label="ODS cobertos"   value={String(kpis.ods)}     icon={<Leaf size={20} />}         color="text-violet-700"  />
          </div>
        </section>

        {/* TIPOS DE RELATÓRIO */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="mb-5 text-lg font-black text-slate-950">Tipos de relatório</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TIPOS.map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setVista(r.key)}
                className={`group flex items-center gap-4 rounded-[1.4rem] border-2 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  vista === r.key ? r.activeBorder + ' shadow-md' : 'border-slate-200'
                }`}
              >
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${r.bg}`}>{r.icon}</div>
                <div>
                  <p className="text-sm font-black text-slate-950">{r.title}</p>
                  <p className="text-xs font-bold text-slate-500">{r.sub}</p>
                </div>
              </button>
            ))}

            {/* Exportar CSV */}
            <button
              type="button"
              onClick={() => exportarCSV(projetos)}
              className="group flex items-center gap-4 rounded-[1.4rem] border-2 border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50">
                <Download size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">Exportar Excel</p>
                <p className="text-xs font-bold text-slate-500">Baixar todos em .csv</p>
              </div>
            </button>
          </div>
        </section>

        {/* VISTA ESG — ODS */}
        {vista === 'esg' && odsContagem.length > 0 && (
          <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <h2 className="mb-5 text-lg font-black text-slate-950">ODS vinculadas aos projetos</h2>
            <div className="flex flex-wrap gap-3">
              {odsContagem.map(({ ods, count }) => (
                <div key={ods} className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 shadow-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-[11px] font-black text-white">{ods}</span>
                  <span className="text-xs font-bold text-slate-700">{ODS_LABELS[ods] || `ODS ${ods}`}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TABELA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">{vistaTitulo[vista]}</h2>
              <p className="mt-0.5 text-xs font-bold text-slate-400">{projetosFiltrados.length} projeto(s)</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[#eef7ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0068ff]">
              <BarChart3 size={12} />
              BI em tempo real
            </span>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : projetosFiltrados.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 py-12 text-center">
              <Sparkles size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-black text-slate-400">Nenhum projeto nesta categoria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {vista === 'esg'
                      ? ['Projeto', 'Esfera', 'Status', 'ODS'].map(h => (
                          <th key={h} className="pb-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{h}</th>
                        ))
                      : ['Projeto', 'Esfera', 'Status', 'Valor aprovado', 'Captado'].map(h => (
                          <th key={h} className="pb-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{h}</th>
                        ))
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projetosFiltrados.map(p => (
                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                      <td className="py-3 font-black text-slate-950">{p.nome}</td>
                      <td className="py-3 font-bold text-slate-500">{p.esfera || '—'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusCls(p.status)}`}>
                          {p.status || '—'}
                        </span>
                      </td>
                      {vista === 'esg' ? (
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.ods_tags || []).map(o => (
                              <span key={o} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                ODS {o}
                              </span>
                            ))}
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="py-3 font-bold text-blue-700">{moeda(p.valor_aprovado)}</td>
                          <td className="py-3 font-bold text-emerald-700">{moeda(p.valor_captado)}</td>
                        </>
                      )}
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
