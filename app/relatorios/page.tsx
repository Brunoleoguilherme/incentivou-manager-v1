'use client';
import { useEffect, useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

export default function RelatoriosPage() {
  const [projs, setProjs]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('manager_projetos')
      .select('id,nome,esfera,status,valor_aprovado,valor_captado,modalidade,executor_nome,manager_usuarios(nome)')
      .order('nome')
      .then(({ data }) => { setProjs(data || []); setLoading(false); });
  }, []);

  const totalAprov = projs.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
  const totalCapt  = projs.reduce((s, p) => s + Number(p.valor_captado  || 0), 0);

  const TIPOS = [
    { label: 'Relatorio Executivo',       icon: <FileText size={18}/>,        desc: 'Visao geral do portfolio',        cor: 'text-blue-600 bg-blue-50'     },
    { label: 'Relatorio para Patrocinador', icon: <BarChart3 size={18}/>,     desc: 'Captacao e impacto por empresa',  cor: 'text-emerald-600 bg-emerald-50'},
    { label: 'Relatorio Financeiro',       icon: <FileSpreadsheet size={18}/>, desc: 'Entradas, saidas e saldos',       cor: 'text-amber-600 bg-amber-50'   },
    { label: 'Relatorio de Prestacao',     icon: <Download size={18}/>,        desc: 'Documentos e comprovantes',       cor: 'text-violet-600 bg-violet-50'  },
    { label: 'Exportar Excel',             icon: <FileSpreadsheet size={18}/>, desc: 'Todos os projetos em .xlsx',      cor: 'text-teal-600 bg-teal-50'     },
    { label: 'Exportar PDF',               icon: <FileText size={18}/>,        desc: 'Portfolio completo em PDF',       cor: 'text-rose-600 bg-rose-50'     },
  ];

  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Relatorios</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Relatorios executivos, financeiros e de prestacao de contas.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Projetos',       value: String(projs.length), cor: 'text-slate-950'   },
              { label: 'Valor aprovado', value: fmt(totalAprov),      cor: 'text-emerald-600' },
              { label: 'Captado',        value: fmt(totalCapt),       cor: 'text-blue-600'    },
            ].map(k => (
              <div key={k.label} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{k.label}</p>
                <p className={`mt-1 text-2xl font-black ${k.cor}`}>{loading ? '...' : k.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Tipos de relatorio</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {TIPOS.map(t => (
              <button key={t.label}
                className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.cor.split(' ')[1]}`}>
                  <span className={t.cor.split(' ')[0]}>{t.icon}</span>
                </div>
                <div>
                  <p className="font-black text-slate-950">{t.label}</p>
                  <p className="text-xs font-bold text-slate-400">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-slate-950">Projetos - visao geral</h2>
          {loading ? (
            <p className="py-6 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : (
            <div className="overflow-x-auto rounded-[1.2rem] border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Projeto','Executor','Esfera','Status','Valor Aprovado','Captado'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projs.map((p, i) => {
                    const executor = p.executor_nome || p.manager_usuarios?.nome || '-';
                    return (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-4 py-3 font-black text-slate-950">{p.nome}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{executor}</td>
                        <td className="px-4 py-3 text-xs font-bold capitalize text-slate-500">{p.esfera || '-'}</td>
                        <td className="px-4 py-3 text-xs font-bold capitalize text-slate-500">{p.status || '-'}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{p.valor_aprovado ? fmt(Number(p.valor_aprovado)) : '-'}</td>
                        <td className="px-4 py-3 font-bold text-blue-700">{p.valor_captado ? fmt(Number(p.valor_captado)) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
