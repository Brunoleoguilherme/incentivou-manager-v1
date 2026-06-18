'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, CalendarClock, CheckCircle2, Clock3, FileText,
  Target, UploadCloud, Wallet, AlertTriangle, Building2,
  Pencil, ArrowRight, Loader2,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string; nome: string; status: string | null; esfera: string | null;
  lei_incentivo: string | null; modalidade: string | null;
  objetivo: string | null; publico_alvo: string | null;
  num_beneficiarios: number | null; descricao: string | null;
  cidade: string | null; estado: string | null;
  data_inicio: string | null; data_fim: string | null;
  valor_aprovado: number | null; valor_captado: number | null;
  valor_total: number | null; valor_solicitado: number | null;
  proximo_prazo: string | null; responsavel_tecnico: string | null;
  inscricao_status: string | null;
};

type Documento = { id: string; nome: string | null; categoria: string | null; url: string | null };

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const STATUS_TIMELINE = [
  { key: 'diagnostico',  label: 'Diagnóstico',       icon: FileText,     desc: 'Análise inicial e viabilidade técnica' },
  { key: 'aprovado',     label: 'Aprovação',          icon: CheckCircle2, desc: 'Aprovação pelo órgão responsável' },
  { key: 'captacao',     label: 'Captação',           icon: Target,       desc: 'Prospecção e fechamento de patrocinadores' },
  { key: 'execucao',     label: 'Execução',           icon: Building2,    desc: 'Realização das atividades do projeto' },
  { key: 'prestacao',    label: 'Prestação de Contas',icon: UploadCloud,  desc: 'Entrega de documentação e relatórios finais' },
  { key: 'finalizado',   label: 'Finalizado',         icon: CheckCircle2, desc: 'Projeto concluído com êxito' },
];

function statusIndex(status?: string | null) {
  const s = (status || '').toLowerCase();
  const i = STATUS_TIMELINE.findIndex(t => t.key === s || s.includes(t.key));
  return i >= 0 ? i : 0;
}

function esferaLabel(e?: string | null) {
  if (e === 'federal')   return { label: 'Federal',   cls: 'bg-blue-100 text-blue-700' };
  if (e === 'estadual')  return { label: 'Estadual',  cls: 'bg-indigo-100 text-indigo-700' };
  if (e === 'municipal') return { label: 'Municipal', cls: 'bg-teal-100 text-teal-700' };
  return { label: '—', cls: 'bg-slate-100 text-slate-500' };
}

function categoriaLabel(c?: string | null) {
  const m: Record<string,string> = {
    estatuto: 'Estatuto', certidao_federal: 'Cert. Federal',
    certidao_estadual: 'Cert. Estadual', certidao_municipal: 'Cert. Municipal',
    plano_trabalho: 'Plano de Trabalho', outro: 'Outro',
  };
  return m[c||''] || c || 'Documento';
}

export default function ExecutorProjetoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [projeto, setProjeto]       = useState<Projeto | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState('');
  const [avancando, setAvancando]   = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function carregar() {
    if (!supabase || !id) return;
    setLoading(true); setErro('');

    const [projRes, docsRes] = await Promise.all([
      supabase.from('manager_projetos')
        .select('id,nome,status,esfera,lei_incentivo,modalidade,objetivo,publico_alvo,num_beneficiarios,descricao,cidade,estado,data_inicio,data_fim,valor_aprovado,valor_captado,valor_total,valor_solicitado,proximo_prazo,responsavel_tecnico,inscricao_status')
        .eq('id', id).single(),
      supabase.from('manager_documentos_inscricao')
        .select('id,nome,categoria,url').eq('projeto_id', id),
    ]);

    if (projRes.error) { setErro(projRes.error.message); setLoading(false); return; }
    setProjeto(projRes.data as Projeto);
    setDocumentos(docsRes.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [id]);

  // Transições permitidas pelo executor
  const TRANSICOES_EXECUTOR: Record<string, { proximo: string; label: string; desc: string }> = {
    diagnostico: { proximo: 'aprovado',   label: 'Enviar para Aprovação',  desc: 'Declara que o projeto está pronto para análise do órgão responsável.' },
    captacao:    { proximo: 'execucao',   label: 'Iniciar Execução',       desc: 'Confirma que a captação foi concluída e o projeto entra em execução.' },
    execucao:    { proximo: 'prestacao',  label: 'Iniciar Prestação de Contas', desc: 'Confirma que as atividades foram concluídas.' },
  };

  async function avancarStatus() {
    if (!supabase || !projeto) return;
    const transicao = TRANSICOES_EXECUTOR[(projeto.status || '').toLowerCase()];
    if (!transicao) return;
    setAvancando(true);
    const { error } = await supabase
      .from('manager_projetos')
      .update({ status: transicao.proximo })
      .eq('id', id);

    if (!error) {
      setProjeto(prev => prev ? { ...prev, status: transicao.proximo } : prev);

      // Ao entrar em execução: criar entregas padrão mensais automaticamente
      if (transicao.proximo === 'execucao') {
        await gerarEntregasPadrao(id, projeto.data_inicio, projeto.data_fim, projeto.responsavel_tecnico);
      }
    }
    setAvancando(false);
    setConfirmando(false);
  }

  async function gerarEntregasPadrao(
    projId: string,
    dataInicio: string | null,
    dataFim: string | null,
    responsavel: string | null,
  ) {
    if (!supabase) return;

    // Checa se já existem entregas para não duplicar
    const { data: existing } = await supabase
      .from('manager_entregas')
      .select('id')
      .eq('projeto_id', projId)
      .limit(1);
    if (existing && existing.length > 0) return;

    const inicio = dataInicio ? new Date(dataInicio) : new Date();
    const fim    = dataFim    ? new Date(dataFim)    : new Date(inicio.getFullYear(), inicio.getMonth() + 3, 0);

    // Gera lista de meses entre início e fim
    const meses: Date[] = [];
    const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    const fimMes = new Date(fim.getFullYear(), fim.getMonth(), 1);
    while (cur <= fimMes) {
      meses.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }

    const nomesMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const entregas: object[] = [];

    for (const mes of meses) {
      const label = `${nomesMes[mes.getMonth()]}/${mes.getFullYear()}`;
      const prazoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 5)
        .toISOString().split('T')[0];

      entregas.push(
        { projeto_id: projId, titulo: `Extrato Bancário — ${label}`,      descricao: 'Extrato bancário do mês de referência.',           responsavel, prazo: prazoMes, status: 'pendente' },
        { projeto_id: projId, titulo: `Lista de Presença — ${label}`,      descricao: 'Lista de presença das atividades do mês.',         responsavel, prazo: prazoMes, status: 'pendente' },
        { projeto_id: projId, titulo: `Registro Fotográfico — ${label}`,   descricao: 'Fotos das atividades realizadas no mês.',          responsavel, prazo: prazoMes, status: 'pendente' },
      );
    }

    // Entregas únicas (não mensais)
    entregas.push(
      { projeto_id: projId, titulo: 'Nota Fiscal — Prestação Final',       descricao: 'Nota(s) fiscal(is) referente à execução do projeto.', responsavel, prazo: dataFim, status: 'pendente' },
      { projeto_id: projId, titulo: 'Relatório Técnico Final',              descricao: 'Relatório descritivo das atividades e resultados.', responsavel, prazo: dataFim, status: 'pendente' },
    );

    await supabase.from('manager_entregas').insert(entregas);
  }

  if (loading) {
    return (
      <PortalShell portal="executor">
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-black text-slate-400">
          Carregando projeto...
        </div>
      </PortalShell>
    );
  }

  if (!projeto) {
    return (
      <PortalShell portal="executor">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-black text-red-600">
          {erro || 'Projeto não encontrado.'}
        </div>
      </PortalShell>
    );
  }

  const esf   = esferaLabel(projeto.esfera);
  const stepI = statusIndex(projeto.status);
  const prazoProximo = projeto.proximo_prazo
    ? Math.ceil((new Date(projeto.proximo_prazo).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <PortalShell portal="executor">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/executor/projetos"
                className="mt-1 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-50">
                <ArrowLeft size={13}/> Voltar
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${esf.cls}`}>{esf.label}</span>
                  {projeto.modalidade && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{projeto.modalidade}</span>
                  )}
                  {projeto.lei_incentivo && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{projeto.lei_incentivo.split('–')[0].trim()}</span>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{projeto.nome}</h1>
                {(projeto.cidade||projeto.estado) && (
                  <p className="mt-1 text-sm font-bold text-slate-500">{[projeto.cidade,projeto.estado].filter(Boolean).join(' · ')}</p>
                )}
              </div>
            </div>

            {/* AÇÕES */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
            <Link href={`/executor/projetos/${id}/editar`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
              <Pencil size={14}/> Editar projeto
            </Link>
            {(() => {
              const transicao = TRANSICOES_EXECUTOR[(projeto.status || '').toLowerCase()];
              if (!transicao) return null;
              return confirmando ? (
                <div className="rounded-2xl border border-[#0068ff]/30 bg-blue-50 p-4 text-sm">
                  <p className="mb-1 font-black text-slate-950">{transicao.label}</p>
                  <p className="mb-3 text-xs font-bold text-slate-500">{transicao.desc}</p>
                  <div className="flex gap-2">
                    <button onClick={avancarStatus} disabled={avancando}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-4 py-2 text-xs font-black text-white disabled:opacity-60">
                      {avancando ? <Loader2 size={13} className="animate-spin"/> : <ArrowRight size={13}/>}
                      Confirmar
                    </button>
                    <button onClick={() => setConfirmando(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmando(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] to-[#16c784] px-4 py-2 text-sm font-black text-white shadow-md hover:-translate-y-0.5 transition">
                  <ArrowRight size={14}/> {transicao.label}
                </button>
              );
            })()}
          </div>

          {prazoProximo !== null && prazoProximo <= 15 && (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle size={16} className="text-amber-600"/>
                <div>
                  <p className="text-xs font-black uppercase text-amber-700">Prazo próximo</p>
                  <p className="text-sm font-black text-amber-800">
                    {prazoProximo <= 0 ? 'Vencido' : `${prazoProximo} dia(s)`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MÉTRICAS */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label:'Valor Total',      value: fmt(Number(projeto.valor_total||0)),      icon:<Wallet size={18}/>,       cls:'bg-slate-50' },
              { label:'Valor Aprovado',   value: fmt(Number(projeto.valor_aprovado||0)),   icon:<CheckCircle2 size={18}/>, cls:'bg-emerald-50 text-emerald-700' },
              { label:'Valor Captado',    value: fmt(Number(projeto.valor_captado||0)),    icon:<Target size={18}/>,       cls:'bg-blue-50 text-blue-700' },
              { label:'Beneficiários',    value: String(projeto.num_beneficiarios||0),     icon:<FileText size={18}/>,     cls:'bg-purple-50 text-purple-700' },
            ].map(m => (
              <div key={m.label} className={`rounded-[1.4rem] border border-slate-200 p-4 shadow-sm ${m.cls}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 shadow-sm">{m.icon}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{m.label}</p>
                    <p className="text-xl font-black text-slate-950">{m.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE DE STATUS — HORIZONTAL */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-8 text-lg font-black text-slate-950">Acompanhamento do Projeto</h2>

          <div className="overflow-x-auto pb-2">
            <div className="relative flex min-w-max items-start gap-0">

              {STATUS_TIMELINE.map((s, i) => {
                const done    = i < stepI;
                const current = i === stepI;
                const last    = i === STATUS_TIMELINE.length - 1;
                const Icon    = s.icon;

                return (
                  <div key={s.key} className="flex items-start">
                    {/* Etapa */}
                    <div className="flex w-36 flex-col items-center gap-3">
                      {/* Dot */}
                      <div className={`relative z-10 grid h-11 w-11 place-items-center rounded-full border-2 shadow-sm transition ${
                        done    ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200' :
                        current ? 'border-[#0068ff] bg-[#0068ff] text-white shadow-blue-200' :
                                  'border-slate-300 bg-white text-slate-400'
                      }`}>
                        {done ? <CheckCircle2 size={18}/> : <Icon size={18}/>}
                      </div>

                      {/* Card */}
                      <div className={`w-full rounded-[1.2rem] border p-3 text-center shadow-sm transition ${
                        current ? 'border-[#0068ff]/30 bg-blue-50' :
                        done    ? 'border-emerald-200 bg-emerald-50/60' :
                                  'border-slate-200 bg-slate-50'
                      }`}>
                        <p className={`text-xs font-black leading-tight ${current ? 'text-[#0068ff]' : done ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {s.label}
                        </p>
                        <p className="mt-1 text-[10px] font-bold leading-tight text-slate-400">{s.desc}</p>
                        {done    && <span className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">Concluído</span>}
                        {current && <span className="mt-1.5 inline-block animate-pulse rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase text-[#0068ff]">Em andamento</span>}
                        {current && projeto.proximo_prazo && (
                          <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-black text-amber-600">
                            <Clock3 size={10}/>
                            {fmtDate(projeto.proximo_prazo)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conector */}
                    {!last && (
                      <div className="mt-[22px] flex items-center">
                        <div className={`h-0.5 w-6 transition ${done ? 'bg-emerald-400' : 'bg-slate-200'}`}/>
                        <div className={`h-2 w-2 rotate-45 border-r-2 border-t-2 transition ${done ? 'border-emerald-400' : 'border-slate-300'}`}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DETALHES E DOCUMENTOS */}
        <div className="grid gap-6 xl:grid-cols-2">

          {/* DETALHES DO PROJETO */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-950">Informações do Projeto</h2>
            <dl className="space-y-4 text-sm">
              {[
                { label:'Responsável Técnico', value: projeto.responsavel_tecnico },
                { label:'Público-Alvo',        value: projeto.publico_alvo },
                { label:'Período',             value: projeto.data_inicio ? `${fmtDate(projeto.data_inicio)} → ${fmtDate(projeto.data_fim)}` : null },
                { label:'Objetivo',            value: projeto.objetivo },
                { label:'Contrapartidas',      value: null },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="rounded-[1.1rem] bg-slate-50 p-3">
                  <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{r.label}</dt>
                  <dd className="mt-1 font-bold text-slate-800">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* DOCUMENTOS */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Documentos</h2>
              <Link href="/executor/documentos"
                className="text-xs font-black text-emerald-600 hover:underline">
                Ver todos
              </Link>
            </div>

            {documentos.length === 0 ? (
              <div className="rounded-[1.3rem] border border-dashed border-slate-200 p-8 text-center">
                <UploadCloud size={28} className="mx-auto text-slate-300"/>
                <p className="mt-3 text-sm font-black text-slate-400">Nenhum documento enviado</p>
                <Link href="/executor/projetos/nova"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                  Enviar documentos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FileText size={16}/>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-950">{doc.nome || 'Documento'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{categoriaLabel(doc.categoria)}</p>
                      </div>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-50">
                        Baixar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* PERÍODO E PRAZOS */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Datas e Prazos</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label:'Início do Projeto',     value: fmtDate(projeto.data_inicio),    icon:<CalendarClock size={18}/>, cls:'' },
              { label:'Término Previsto',      value: fmtDate(projeto.data_fim),       icon:<CalendarClock size={18}/>, cls:'' },
              { label:'Próximo Prazo Interno', value: fmtDate(projeto.proximo_prazo),  icon:<AlertTriangle size={18}/>, cls: prazoProximo !== null && prazoProximo <= 7 ? 'border-amber-200 bg-amber-50' : '' },
            ].map(d => (
              <div key={d.label} className={`flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4 ${d.cls}`}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm text-slate-500">{d.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{d.label}</p>
                  <p className="mt-1 text-base font-black text-slate-950">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PortalShell>
  );
}
