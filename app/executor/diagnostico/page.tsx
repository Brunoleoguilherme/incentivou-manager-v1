'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  FileText, RefreshCw, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

/* ─── tipos ─────────────────────────────────────────────── */
type Projeto = {
  id: string; nome: string; esfera: string | null; lei_especifica: string | null;
  modalidade: string | null; objetivo: string | null; responsavel_tecnico: string | null;
  data_inicio: string | null; data_fim: string | null; valor_total: number | null;
  valor_solicitado: number | null; valor_aprovado: number | null; valor_captado: number | null;
  num_beneficiarios: number | null; municipio: string | null; score_diagnostico: number | null;
};
type CheckItem = { label: string; ok: boolean; link?: string; critico?: boolean };
type Fase = { titulo: string; pontos: number; maximo: number; cor: string; itens: CheckItem[] };

/* ─── helpers ────────────────────────────────────────────── */
function scoreColor(s: number) {
  if (s >= 80) return { ring: '#16c784', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excelente' };
  if (s >= 60) return { ring: '#0068ff', text: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Bom' };
  if (s >= 40) return { ring: '#f59e0b', text: 'text-amber-600',   bg: 'bg-amber-50',   label: 'Regular' };
  return              { ring: '#ef4444', text: 'text-red-600',      bg: 'bg-red-50',     label: 'Critico' };
}

/* ─── diagnóstico ────────────────────────────────────────── */
async function diagnosticar(
  proj: Projeto,
  docs: { categoria: string }[],
  benes: { id: string }[],
  metas: { id: string }[],
  entregas: { id: string }[],
  prestacao: { id: string; status: string }[],
): Promise<Fase[]> {
  const temDoc = (cat: string) => docs.some((d) =>
    (d.categoria || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim().replace(/\s+/g, '_') === cat.toLowerCase()
  );

  const fases: Fase[] = [
    {
      titulo: 'Dados de Inscricao',
      maximo: 20,
      pontos: 0,
      cor: 'blue',
      itens: [
        { label: 'Nome do projeto',           ok: !!proj.nome,                 critico: true  },
        { label: 'Esfera de governo',          ok: !!proj.esfera,               critico: true,  link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Lei de incentivo',           ok: !!proj.lei_especifica,       critico: true,  link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Modalidade esportiva',       ok: !!proj.modalidade,           link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Objetivo do projeto',        ok: !!proj.objetivo,             link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Responsavel tecnico',        ok: !!proj.responsavel_tecnico,  link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Datas de inicio e fim',      ok: !!(proj.data_inicio && proj.data_fim), link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Valores (total/solicitado)', ok: !!(proj.valor_total && proj.valor_solicitado), link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Municipio/localizacao',      ok: !!proj.municipio,            link: `/executor/projetos/${proj.id}/editar` },
        { label: 'Numero de beneficiarios',    ok: Number(proj.num_beneficiarios) > 0, link: `/executor/projetos/${proj.id}/editar` },
      ],
    },
    {
      titulo: 'Documentos Obrigatorios',
      maximo: 20,
      pontos: 0,
      cor: 'purple',
      itens: [
        { label: 'Estatuto social',           ok: temDoc('estatuto'),           critico: true,  link: '/executor/documentos' },
        { label: 'Certidao federal',          ok: temDoc('certidao_federal'),   critico: true,  link: '/executor/documentos' },
        { label: 'Certidao estadual',         ok: temDoc('certidao_estadual'),  link: '/executor/documentos' },
        { label: 'Certidao municipal',        ok: temDoc('certidao_municipal'), link: '/executor/documentos' },
        { label: 'Plano de trabalho',         ok: temDoc('plano_trabalho'),     critico: true,  link: '/executor/documentos' },
        { label: 'CAGEC (Estadual)',          ok: temDoc('cagec'),              critico: true,  link: '/executor/documentos' },
        { label: 'CADIN',                     ok: temDoc('cadin'),              critico: true,  link: '/executor/documentos' },
      ],
    },
    {
      titulo: 'Valores e Captacao',
      maximo: 15,
      pontos: 0,
      cor: 'amber',
      itens: [
        { label: 'Valor aprovado registrado', ok: Number(proj.valor_aprovado) > 0, critico: true },
        { label: 'Captacao iniciada',         ok: Number(proj.valor_captado)  > 0 },
        { label: '> 50% captado',             ok: Number(proj.valor_captado)  >= Number(proj.valor_aprovado || 1) * 0.5 },
      ],
    },
    {
      titulo: 'Execucao do Projeto',
      maximo: 25,
      pontos: 0,
      cor: 'emerald',
      itens: [
        { label: 'Beneficiarios cadastrados', ok: benes.length > 0,   critico: true, link: '/executor/beneficiarios' },
        { label: '+ de 10 beneficiarios',    ok: benes.length >= 10,              link: '/executor/beneficiarios' },
        { label: 'Metas definidas',           ok: metas.length > 0,   critico: true, link: '/executor/metas'         },
        { label: '+ de 3 metas cadastradas', ok: metas.length >= 3,              link: '/executor/metas'           },
        { label: 'Entregas registradas',      ok: entregas.length > 0, critico: true, link: '/executor/execucao'     },
      ],
    },
    {
      titulo: 'Prestacao de Contas',
      maximo: 20,
      pontos: 0,
      cor: 'rose',
      itens: [
        { label: 'Documentos de prestacao enviados', ok: prestacao.length > 0,                              critico: true, link: '/executor/prestacao-contas' },
        { label: '+ de 3 comprovantes enviados',     ok: prestacao.length >= 3,                                           link: '/executor/prestacao-contas' },
        { label: 'Nota fiscal presente',             ok: prestacao.some((d) => d.status !== 'reprovado'),   link: '/executor/prestacao-contas' },
        { label: 'Documento aprovado',               ok: prestacao.some((d) => d.status === 'aprovado'),                 link: '/executor/prestacao-contas' },
      ],
    },
  ];

  // calcular pontos por fase proporcional
  fases.forEach((fase) => {
    const ok = fase.itens.filter((i) => i.ok).length;
    fase.pontos = Math.round((ok / fase.itens.length) * fase.maximo);
  });

  return fases;
}

/* ─── componentes internos ───────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const sc  = scoreColor(score);
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={140} height={140} className="-rotate-90">
        <circle cx={70} cy={70} r={r} stroke="#e2e8f0" strokeWidth={10} fill="none"/>
        <circle cx={70} cy={70} r={r} stroke={sc.ring} strokeWidth={10} fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .6s ease' }}/>
      </svg>
      <div className="absolute text-center">
        <p className={`text-3xl font-black ${sc.text}`}>{score}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest ${sc.text}`}>{sc.label}</p>
      </div>
    </div>
  );
}

const COR: Record<string, string> = {
  blue:    'border-blue-200 bg-blue-50 text-blue-700',
  purple:  'border-purple-200 bg-purple-50 text-purple-700',
  amber:   'border-amber-200 bg-amber-50 text-amber-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rose:    'border-rose-200 bg-rose-50 text-rose-700',
};

/* ─── página ────────────────────────────────────────────── */
export default function DiagnosticoPage() {
  const [projetos, setProjetos]     = useState<Projeto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fases, setFases]           = useState<Fase[]>([]);
  const [score, setScore]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [running, setRunning]       = useState(false);
  const [salvando, setSalvando]     = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('manager_projetos')
      .select('id,nome,esfera,lei_especifica,modalidade,objetivo,responsavel_tecnico,data_inicio,data_fim,valor_total,valor_solicitado,valor_aprovado,valor_captado,num_beneficiarios,municipio,score_diagnostico')
      .order('nome')
      .then(({ data }) => { setProjetos((data || []) as Projeto[]); setLoading(false); });
  }, []);

  async function rodarDiagnostico(projId: string) {
    if (!supabase) return;
    setRunning(true);
    const proj = projetos.find((p) => p.id === projId)!;

    const [docsRes, docsGeralRes, benesRes, metasRes, entregasRes, prestRes] = await Promise.all([
      supabase.from('manager_documentos_inscricao').select('categoria').eq('projeto_id', projId),
      supabase.from('manager_documentos').select('categoria').eq('projeto_id', projId),
      supabase.from('manager_beneficiarios').select('id').eq('projeto_id', projId).eq('ativo', true),
      supabase.from('manager_metas').select('id').eq('projeto_id', projId),
      supabase.from('manager_entregas').select('id').eq('projeto_id', projId),
      supabase.from('manager_prestacao_docs').select('id,status').eq('projeto_id', projId),
    ]);

    // Combina documentos de inscrição + documentos gerais (normalizado para minúsculas sem espaço)
    const todosDocs = [
      ...(docsRes.data || []),
      ...(docsGeralRes.data || []).map(d => ({
        categoria: (d.categoria || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim().replace(/\s+/g, '_'),
      })),
    ];

    const f = await diagnosticar(
      proj,
      todosDocs,
      benesRes.data || [],
      metasRes.data || [],
      entregasRes.data || [],
      (prestRes.data || []) as { id: string; status: string }[],
    );
    const total = f.reduce((s, fase) => s + fase.pontos, 0);
    setFases(f);
    setScore(total);
    setRunning(false);
  }

  async function selectProjeto(id: string) {
    setSelectedId(id);
    setFases([]);
    setScore(0);
    await rodarDiagnostico(id);
  }

  async function salvarScore() {
    if (!supabase || !selectedId) return;
    setSalvando(true);
    await supabase.from('manager_projetos').update({ score_diagnostico: score }).eq('id', selectedId);
    setProjetos((prev) => prev.map((p) => p.id === selectedId ? { ...p, score_diagnostico: score } : p));
    setSalvando(false);
  }

  const projSelecionado = projetos.find((p) => p.id === selectedId);
  const totalPendencias = fases.flatMap((f) => f.itens).filter((i) => !i.ok && i.critico).length;

  return (
    <PortalShell portal="executor">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Portal Executor</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Diagnostico de Projetos</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Selecione um projeto para verificar completude de dados, documentos e compliance por fase.
            O score gerado alimenta o marketplace.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">

          {/* LISTA DE PROJETOS */}
          <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Projetos</p>
            {loading ? (
              <p className="py-6 text-center text-xs font-bold text-slate-400">Carregando...</p>
            ) : projetos.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs font-bold text-slate-400">Nenhum projeto encontrado.</p>
                <Link href="/executor/projetos/nova"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#0068ff]">
                  Inscrever projeto <ArrowRight size={12}/>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {projetos.map((p) => {
                  const sc = p.score_diagnostico || 0;
                  const active = p.id === selectedId;
                  return (
                    <button key={p.id} onClick={() => selectProjeto(p.id)}
                      className={`w-full rounded-[1.1rem] border px-4 py-3 text-left transition ${active ? 'border-[#0068ff]/30 bg-[#0068ff]/5' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-slate-950">{p.nome}</p>
                        {sc > 0 && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${scoreColor(sc).bg} ${scoreColor(sc).text}`}>
                            {sc}
                          </span>
                        )}
                      </div>
                      {p.esfera && (
                        <p className="mt-0.5 text-[10px] font-bold capitalize text-slate-400">{p.esfera}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* PAINEL DE DIAGNOSTICO */}
          <div className="space-y-5">
            {!selectedId ? (
              <div className="flex h-64 items-center justify-center rounded-[1.8rem] border border-dashed border-slate-200 bg-white">
                <div className="text-center">
                  <FileText size={32} className="mx-auto text-slate-300"/>
                  <p className="mt-3 text-sm font-black text-slate-400">Selecione um projeto para iniciar o diagnostico</p>
                </div>
              </div>
            ) : running ? (
              <div className="flex h-64 items-center justify-center rounded-[1.8rem] border border-slate-200 bg-white">
                <div className="text-center">
                  <RefreshCw size={28} className="mx-auto animate-spin text-[#0068ff]"/>
                  <p className="mt-3 text-sm font-black text-slate-400">Analisando projeto...</p>
                </div>
              </div>
            ) : fases.length > 0 && (
              <>
                {/* SCORE + RESUMO */}
                <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <ScoreRing score={score}/>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Score de Maturidade</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-950">{projSelecionado?.nome}</h2>
                      {totalPendencias > 0 ? (
                        <div className="mt-3 flex items-center gap-2 rounded-[1rem] border border-amber-200 bg-amber-50 px-3 py-2">
                          <AlertTriangle size={15} className="text-amber-600"/>
                          <p className="text-xs font-black text-amber-700">
                            {totalPendencias} pendencia(s) critica(s) bloqueando o progresso
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <CheckCircle2 size={15} className="text-emerald-600"/>
                          <p className="text-xs font-black text-emerald-700">Sem pendencias criticas</p>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => rodarDiagnostico(selectedId)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 transition">
                          <RefreshCw size={13}/> Reanalisar
                        </button>
                        <button onClick={salvarScore} disabled={salvando}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-4 py-2 text-xs font-black text-white shadow shadow-[#0068ff]/20 hover:bg-[#0050d0] transition disabled:opacity-50">
                          {salvando ? 'Salvando...' : 'Salvar score no projeto'}
                        </button>
                      </div>
                    </div>

                    {/* barra por fase */}
                    <div className="w-full sm:w-48 space-y-2">
                      {fases.map((f) => (
                        <div key={f.titulo}>
                          <div className="mb-0.5 flex justify-between text-[10px] font-black">
                            <span className="text-slate-500 truncate">{f.titulo.split(' ')[0]}</span>
                            <span className="text-slate-700">{f.pontos}/{f.maximo}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full transition-all ${COR[f.cor].split(' ')[2].replace('text','bg')}`}
                              style={{ width: `${Math.round((f.pontos/f.maximo)*100)}%` }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* FASES DETALHADAS */}
                {fases.map((fase) => {
                  const pct = Math.round((fase.pontos / fase.maximo) * 100);
                  const pendCriticas = fase.itens.filter((i) => !i.ok && i.critico).length;
                  return (
                    <section key={fase.titulo} className={`rounded-[1.8rem] border p-6 shadow-sm ${fase.pontos === fase.maximo ? 'border-emerald-200 bg-emerald-50/30' : pendCriticas > 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white'}`}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full px-3 py-1 text-[10px] font-black border ${COR[fase.cor]}`}>
                            {fase.titulo}
                          </div>
                          {pendCriticas > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-red-600">
                              <X size={11}/> {pendCriticas} critica(s)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200">
                            <div className={`h-1.5 rounded-full ${fase.pontos === fase.maximo ? 'bg-emerald-500' : 'bg-[#0068ff]'}`}
                              style={{ width: `${pct}%` }}/>
                          </div>
                          <span className="text-xs font-black text-slate-600">{fase.pontos}/{fase.maximo}</span>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {fase.itens.map((item) => (
                          <div key={item.label}
                            className={`flex items-center justify-between rounded-[1rem] border px-3 py-2.5 ${item.ok ? 'border-emerald-200 bg-emerald-50' : item.critico ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.ok
                                ? <CheckCircle2 size={14} className="shrink-0 text-emerald-600"/>
                                : item.critico
                                  ? <X size={14} className="shrink-0 text-red-500"/>
                                  : <AlertTriangle size={14} className="shrink-0 text-amber-500"/>
                              }
                              <span className={`text-xs font-bold truncate ${item.ok ? 'text-emerald-800' : item.critico ? 'text-red-800' : 'text-slate-600'}`}>
                                {item.label}
                              </span>
                            </div>
                            {!item.ok && item.link && (
                              <Link href={item.link}
                                className="ml-2 shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-[#0068ff] hover:bg-slate-50 transition">
                                Corrigir <ChevronRight size={10} className="inline"/>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
