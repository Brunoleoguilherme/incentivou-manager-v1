'use client';
import { useEffect, useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type Projeto = {
  id: string;
  nome: string;
  esfera: string | null;
  status: string | null;
  valor_aprovado: number | null;
  valor_captado: number | null;
  executor_nome: string | null;
  modalidade: string | null;
};

type ModalTipo = 'executivo' | 'patrocinador' | 'financeiro' | 'prestacao' | null;

export default function AdminRelatoriosPage() {
  const [projs, setProjs]           = useState<Projeto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalTipo, setModalTipo]   = useState<ModalTipo>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from('manager_projetos')
      .select('id,nome,esfera,status,valor_aprovado,valor_captado,executor_nome,modalidade')
      .order('nome')
      .then(({ data }) => { setProjs((data as Projeto[]) || []); setLoading(false); });
  }, []);

  const totalAprov = projs.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
  const totalCapt  = projs.reduce((s, p) => s + Number(p.valor_captado  || 0), 0);

  /* ── exportar CSV ── */
  function exportarCSV() {
    const header = ['Projeto','Executor','Esfera','Status','Valor Aprovado','Captado','Modalidade'];
    const rows = projs.map(p => [
      p.nome,
      p.executor_nome || '-',
      p.esfera || '-',
      p.status || '-',
      p.valor_aprovado ? fmtFull(Number(p.valor_aprovado)) : '-',
      p.valor_captado  ? fmtFull(Number(p.valor_captado))  : '-',
      p.modalidade || '-',
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'relatorio-projetos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── exportar PDF ── */
  function exportarPDF() {
    window.print();
  }

  const TIPOS: { label: string; icon: React.ReactNode; desc: string; cor: string; acao: () => void }[] = [
    { label: 'Relatorio Executivo',        icon: <FileText size={18}/>,        desc: 'Visao geral do portfolio',        cor: 'text-blue-600 bg-blue-50',      acao: () => setModalTipo('executivo')    },
    { label: 'Relatorio para Patrocinador', icon: <BarChart3 size={18}/>,       desc: 'Captacao e impacto por empresa',  cor: 'text-emerald-600 bg-emerald-50', acao: () => setModalTipo('patrocinador') },
    { label: 'Relatorio Financeiro',        icon: <FileSpreadsheet size={18}/>, desc: 'Entradas, saidas e saldos',       cor: 'text-amber-600 bg-amber-50',     acao: () => setModalTipo('financeiro')   },
    { label: 'Relatorio de Prestacao',      icon: <Download size={18}/>,        desc: 'Documentos e comprovantes',       cor: 'text-violet-600 bg-violet-50',   acao: () => setModalTipo('prestacao')    },
    { label: 'Exportar Excel (.csv)',        icon: <FileSpreadsheet size={18}/>, desc: 'Todos os projetos em planilha',   cor: 'text-teal-600 bg-teal-50',       acao: exportarCSV                        },
    { label: 'Exportar PDF',               icon: <FileText size={18}/>,        desc: 'Portfolio completo em PDF',       cor: 'text-rose-600 bg-rose-50',       acao: exportarPDF                        },
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
              <button
                key={t.label}
                onClick={t.acao}
                className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 hover:shadow-sm active:scale-[0.98]"
              >
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

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm print:break-before-page">
          <h2 className="mb-4 text-lg font-black text-slate-950">Projetos - visao geral</h2>
          {loading ? (
            <p className="py-6 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : projs.length === 0 ? (
            <p className="py-6 text-center text-sm font-bold text-slate-400">Nenhum projeto encontrado.</p>
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
                  {projs.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-3 font-black text-slate-950">{p.nome}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500">{p.executor_nome || '-'}</td>
                      <td className="px-4 py-3 text-xs font-bold capitalize text-slate-500">{p.esfera || '-'}</td>
                      <td className="px-4 py-3 text-xs font-bold capitalize text-slate-500">{p.status || '-'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{p.valor_aprovado ? fmt(Number(p.valor_aprovado)) : '-'}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">{p.valor_captado ? fmt(Number(p.valor_captado)) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* ── modais de relatório ── */}
      {modalTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <h3 className="text-xl font-black text-slate-900">
                {modalTipo === 'executivo'    && 'Relatorio Executivo'}
                {modalTipo === 'patrocinador' && 'Relatorio para Patrocinador'}
                {modalTipo === 'financeiro'   && 'Relatorio Financeiro'}
                {modalTipo === 'prestacao'    && 'Relatorio de Prestacao'}
              </h3>
              <button onClick={() => setModalTipo(null)} className="rounded-xl p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-8 space-y-5">

              {/* Executivo */}
              {modalTipo === 'executivo' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { l: 'Total projetos',  v: String(projs.length)     },
                      { l: 'Valor aprovado',  v: fmtFull(totalAprov)      },
                      { l: 'Total captado',   v: fmtFull(totalCapt)       },
                    ].map(k => (
                      <div key={k.l} className="rounded-2xl bg-slate-50 p-4 text-center">
                        <p className="text-xs font-black uppercase text-slate-400">{k.l}</p>
                        <p className="mt-1 text-lg font-black text-slate-900">{k.v}</p>
                      </div>
                    ))}
                  </div>
                  <table className="w-full text-sm border rounded-2xl overflow-hidden">
                    <thead><tr className="bg-slate-50 border-b">
                      {['Projeto','Status','Aprovado','Captado'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-black uppercase text-slate-400">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {projs.map(p => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-black text-slate-900">{p.nome}</td>
                          <td className="px-4 py-2 text-xs capitalize text-slate-500">{p.status || '-'}</td>
                          <td className="px-4 py-2 text-xs font-bold text-emerald-700">{p.valor_aprovado ? fmtFull(Number(p.valor_aprovado)) : '-'}</td>
                          <td className="px-4 py-2 text-xs font-bold text-blue-700">{p.valor_captado ? fmtFull(Number(p.valor_captado)) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Patrocinador */}
              {modalTipo === 'patrocinador' && (
                <table className="w-full text-sm border rounded-2xl overflow-hidden">
                  <thead><tr className="bg-slate-50 border-b">
                    {['Projeto','Modalidade','Captado','% da meta'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[10px] font-black uppercase text-slate-400">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {projs.map(p => {
                      const pct = p.valor_aprovado && Number(p.valor_aprovado) > 0
                        ? Math.round((Number(p.valor_captado || 0) / Number(p.valor_aprovado)) * 100)
                        : 0;
                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-black text-slate-900">{p.nome}</td>
                          <td className="px-4 py-2 text-xs capitalize text-slate-500">{p.modalidade || '-'}</td>
                          <td className="px-4 py-2 text-xs font-bold text-emerald-700">{p.valor_captado ? fmtFull(Number(p.valor_captado)) : '-'}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(pct,100)}%` }} />
                              </div>
                              <span className="text-xs font-black text-slate-600">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Financeiro */}
              {modalTipo === 'financeiro' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-black uppercase text-emerald-600">Total aprovado</p>
                      <p className="mt-1 text-2xl font-black text-emerald-700">{fmtFull(totalAprov)}</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase text-blue-600">Total captado</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">{fmtFull(totalCapt)}</p>
                    </div>
                  </div>
                  <table className="w-full text-sm border rounded-2xl overflow-hidden">
                    <thead><tr className="bg-slate-50 border-b">
                      {['Projeto','Aprovado','Captado','Saldo'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-black uppercase text-slate-400">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {projs.map(p => {
                        const aprov = Number(p.valor_aprovado || 0);
                        const capt  = Number(p.valor_captado  || 0);
                        const saldo = aprov - capt;
                        return (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="px-4 py-2 font-black text-slate-900">{p.nome}</td>
                            <td className="px-4 py-2 text-xs font-bold text-emerald-700">{aprov ? fmtFull(aprov) : '-'}</td>
                            <td className="px-4 py-2 text-xs font-bold text-blue-700">{capt ? fmtFull(capt) : '-'}</td>
                            <td className="px-4 py-2 text-xs font-bold text-amber-700">{aprov ? fmtFull(saldo) : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {/* Prestacao */}
              {modalTipo === 'prestacao' && (
                <div className="space-y-3">
                  {projs.map(p => (
                    <div key={p.id} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-900">{p.nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.executor_nome || 'Sem executor'} - {p.status || '-'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        p.status === 'aprovado' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'captacao' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div className="border-t border-slate-100 px-8 py-4 flex justify-end">
              <button
                onClick={() => setModalTipo(null)}
                className="rounded-xl bg-[#041b43] px-6 py-2.5 text-sm font-black text-white hover:bg-[#072260] transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </PortalShell>
  );
}
