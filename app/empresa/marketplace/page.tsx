'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BadgeCheck, FileText, Heart, MapPin,
  Search, Sparkles, Target, Users, Wallet, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string;
  nome: string;
  status: string | null;
  esfera: string | null;
  modalidade: string | null;
  objetivo: string | null;
  publico_alvo: string | null;
  publico_alvo_faixa: string[] | null;
  ods_tags: number[] | null;
  tipo_projeto: string | null;
  num_beneficiarios: number | null;
  municipio: string | null;
  estado: string | null;
  valor_aprovado: number | null;
  valor_captado: number | null;
  data_fim: string | null;
  responsavel_tecnico: string | null;
  inscricao_status: string | null;
  score_diagnostico: number | null;
};

type EmpresaPerfil = {
  tipos_projeto: string[] | null;
  modalidades: string[] | null;
  esferas: string[] | null;
  publico_alvo: string[] | null;
  estados: string[] | null;
  ods: number[] | null;
  faixa_valor: string | null;
};

function calcMatchScore(p: Projeto, perfil: EmpresaPerfil | null): number {
  // Se não há perfil de empresa, usa score_diagnostico ou estimativa básica
  if (!perfil) {
    if (p.score_diagnostico && p.score_diagnostico > 0) return p.score_diagnostico;
    let s = 50;
    const aprov = Number(p.valor_aprovado || 0);
    const capt  = Number(p.valor_captado  || 0);
    if (aprov > 0) s += Math.round((capt / aprov) * 20);
    if (Number(p.num_beneficiarios || 0) > 200) s += 15;
    if (Number(p.num_beneficiarios || 0) > 1000) s += 10;
    if (p.objetivo && p.objetivo.length > 50) s += 5;
    return Math.min(99, s);
  }

  // Score personalizado por empresa (max 100)
  let score = 0;

  // Tipo de projeto — 25 pts
  if (perfil.tipos_projeto?.length && p.tipo_projeto && perfil.tipos_projeto.includes(p.tipo_projeto)) score += 25;
  else if (perfil.tipos_projeto?.length === 0 || !perfil.tipos_projeto) score += 15; // bônus neutro

  // Modalidade — 20 pts
  if (perfil.modalidades?.length && p.modalidade) {
    const pMod = p.modalidade.toLowerCase();
    const match = perfil.modalidades.some(m => pMod.includes(m.toLowerCase()) || m.toLowerCase().includes(pMod));
    if (match) score += 20;
  } else if (!perfil.modalidades?.length) score += 10;

  // Esfera — 15 pts
  if (perfil.esferas?.length && p.esfera && perfil.esferas.includes(p.esfera)) score += 15;
  else if (!perfil.esferas?.length) score += 8;

  // Público-alvo faixa — 15 pts
  if (perfil.publico_alvo?.length && p.publico_alvo_faixa?.length) {
    const overlap = (p.publico_alvo_faixa || []).filter(v => (perfil.publico_alvo || []).includes(v));
    if (overlap.length > 0) score += 15;
  } else if (!perfil.publico_alvo?.length) score += 8;

  // Estado/região — 10 pts
  if (perfil.estados?.length && p.estado && perfil.estados.includes(p.estado)) score += 10;
  else if (!perfil.estados?.length) score += 5;

  // ODS — até 15 pts (5 por ODS compartilhado, máx 3)
  if (perfil.ods?.length && p.ods_tags?.length) {
    const overlap = (p.ods_tags || []).filter(o => (perfil.ods || []).includes(o));
    score += Math.min(15, overlap.length * 5);
  } else if (!perfil.ods?.length) score += 5;

  return Math.max(10, Math.min(100, score));
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';



function esferaCls(e?: string | null) {
  if (e === 'federal')   return 'bg-blue-100 text-blue-700';
  if (e === 'estadual')  return 'bg-indigo-100 text-indigo-700';
  if (e === 'municipal') return 'bg-teal-100 text-teal-700';
  return 'bg-slate-100 text-slate-500';
}

function scoreCls(s: number) {
  if (s >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (s >= 65) return { bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   };
  return         { bar: 'bg-slate-300',         text: 'text-slate-500',   bg: 'bg-slate-50'   };
}

const MODALIDADES = ['Todos', 'Futebol', 'Volei', 'Basquete', 'Atletismo', 'Artes Marciais', 'Multiesportivo', 'Futebol Americano', 'Natacao', 'Outro'];
const ESFERAS     = ['Todos', 'federal', 'estadual', 'municipal'];

export default function MarketplacePage() {
  const [projetos, setProjetos]         = useState<Projeto[]>([]);
  const [empresaPerfil, setEmpresaPerfil] = useState<EmpresaPerfil | null>(null);
  const [loading, setLoading]           = useState(true);
  const [busca, setBusca]               = useState('');
  const [esfera, setEsfera]             = useState('Todos');
  const [modalidade, setModalidade]     = useState('Todos');
  const [favoritos, setFavoritos]       = useState<Set<string>>(new Set());
  const [soFavoritos, setSoFavoritos]   = useState(false);
  const [detalhe, setDetalhe]           = useState<Projeto | null>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    const u = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
    const email = u?.email || '';

    Promise.all([
      supabase
        .from('manager_projetos')
        .select('id,nome,status,esfera,modalidade,objetivo,publico_alvo,publico_alvo_faixa,ods_tags,tipo_projeto,num_beneficiarios,municipio,estado,valor_aprovado,valor_captado,data_fim,responsavel_tecnico,inscricao_status,score_diagnostico')
        .order('created_at', { ascending: false }),
      email
        ? supabase.from('manager_empresa_perfil').select('*').eq('empresa_email', email).single()
        : Promise.resolve({ data: null }),
    ]).then(([projetosRes, perfilRes]) => {
      setProjetos((projetosRes.data || []) as Projeto[]);
      if (perfilRes.data) setEmpresaPerfil(perfilRes.data as EmpresaPerfil);
      setLoading(false);
    });
  }, []);

  const filtrados = useMemo(() => {
    return projetos.filter((p) => {
      const txt = `${p.nome} ${p.modalidade} ${p.municipio} ${p.objetivo} ${p.responsavel_tecnico}`.toLowerCase();
      const buscaOk     = txt.includes(busca.toLowerCase());
      const esferaOk    = esfera === 'Todos' || p.esfera === esfera;
      const modalOk     = modalidade === 'Todos' || p.modalidade === modalidade;
      const favOk       = !soFavoritos || favoritos.has(p.id);
      return buscaOk && esferaOk && modalOk && favOk;
    });
  }, [projetos, busca, esfera, modalidade, soFavoritos, favoritos]);

  const totalAprovado = projetos.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
  const totalCaptado  = projetos.reduce((s, p) => s + Number(p.valor_captado  || 0), 0);
  const pctGeral      = totalAprovado > 0 ? Math.round((totalCaptado / totalAprovado) * 100) : 0;

  function toggleFav(id: string) {
    setFavoritos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <PortalShell portal="empresa">
      <div className="space-y-7">
        {!empresaPerfil && !loading && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#0068ff]/30 bg-[#0068ff]/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="shrink-0 text-[#0068ff]" />
              <p className="text-sm font-black text-[#061b3a]">
                Complete seu <span className="text-[#0068ff]">Perfil de Empresa</span> para ver um Match Score personalizado com cada projeto.
              </p>
            </div>
            <a href="/empresa/perfil" className="shrink-0 rounded-2xl bg-[#0068ff] px-5 py-2.5 text-xs font-black text-white transition hover:bg-[#0055d4]">
              Completar perfil →
            </a>
          </div>
        )}

        {/* HERO */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#0068ff]/5 to-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                <Sparkles size={12} /> Marketplace de Projetos
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                Projetos Incentivados
              </h1>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Encontre projetos esportivos aprovados e conecte sua empresa como patrocinadora.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Projetos',       value: String(projetos.length) },
                { label: 'Valor Aprovado', value: totalAprovado > 0 ? fmt(totalAprovado) : '—' },
                { label: 'Captado',        value: `${pctGeral}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-[1.3rem] border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-xl font-black text-[#0068ff]">{m.value}</p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar projeto, modalidade, cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-[#0068ff] focus:ring-2 focus:ring-[#0068ff]/10"
              />
            </div>

            {/* esfera */}
            <select
              value={esfera}
              onChange={(e) => setEsfera(e.target.value)}
              className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0068ff]"
            >
              {ESFERAS.map((e) => (
                <option key={e} value={e}>{e === 'Todos' ? 'Todas as esferas' : e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>

            {/* modalidade */}
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0068ff]"
            >
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>{m === 'Todos' ? 'Todas as modalidades' : m}</option>
              ))}
            </select>

            {/* favoritos toggle */}
            <button
              onClick={() => setSoFavoritos((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-[1.1rem] border px-4 py-2.5 text-sm font-black transition ${soFavoritos ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-rose-200 hover:text-rose-500'}`}
            >
              <Heart size={15} fill={soFavoritos ? 'currentColor' : 'none'} />
              Favoritos {favoritos.size > 0 && `(${favoritos.size})`}
            </button>

            {(busca || esfera !== 'Todos' || modalidade !== 'Todos') && (
              <button
                onClick={() => { setBusca(''); setEsfera('Todos'); setModalidade('Todos'); }}
                className="inline-flex items-center gap-1 rounded-[1.1rem] border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-400 hover:text-slate-700"
              >
                <X size={13} /> Limpar
              </button>
            )}

            <span className="ml-auto text-xs font-black text-slate-400">{filtrados.length} projeto(s)</span>
          </div>
        </section>

        {/* CARDS */}
        {loading ? (
          <p className="py-16 text-center text-sm font-bold text-slate-400">Carregando projetos...</p>
        ) : filtrados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 p-16 text-center">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-black text-slate-400">Nenhum projeto encontrado.</p>
            <Link href="/executor/projetos/nova"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50">
              Inscrever projeto <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((p) => {
              const aprov = Number(p.valor_aprovado || 0);
              const capt  = Number(p.valor_captado  || 0);
              const pct   = aprov > 0 ? Math.round((capt / aprov) * 100) : 0;
              const score = calcMatchScore(p, empresaPerfil);
              const sc    = scoreCls(score);
              const fav   = favoritos.has(p.id);

              return (
                <div key={p.id}
                  className="flex flex-col rounded-[1.8rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/8">

                  {/* topo colorido */}
                  <div className="rounded-t-[1.8rem] bg-gradient-to-r from-[#0068ff]/10 to-[#16c784]/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {p.esfera && (
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black capitalize ${esferaCls(p.esfera)}`}>
                            {p.esfera}
                          </span>
                        )}
                        {p.modalidade && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {p.modalidade}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleFav(p.id)}
                        className={`transition ${fav ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}
                        aria-label="Favoritar"
                      >
                        <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <h3 className="mt-3 text-base font-black leading-snug text-slate-950">{p.nome}</h3>
                    {p.responsavel_tecnico && (
                      <p className="mt-1 text-xs font-bold text-slate-500">{p.responsavel_tecnico}</p>
                    )}
                    {p.municipio && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <MapPin size={11} /> {p.municipio}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5">

                    {/* match score */}
                    <div className={`flex items-center justify-between rounded-[1.1rem] border ${sc.bg} px-4 py-2.5`}>
                      <div className="flex items-center gap-2">
                        <BadgeCheck size={15} className={sc.text} />
                        <span className={`text-xs font-black ${sc.text}`}>Match Score</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-slate-200">
                          <div className={`h-1.5 rounded-full ${sc.bar}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-sm font-black ${sc.text}`}>{score}</span>
                      </div>
                    </div>

                    {/* valores */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">Captado</span>
                        <span className="font-black text-slate-950">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#0068ff]' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{fmt(capt)} captado</span>
                        <span>{fmt(aprov)} aprovado</span>
                      </div>
                    </div>

                    {/* metricas */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[1rem] bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-slate-500"><Users size={12} /><span className="text-[10px] font-black uppercase">Beneficiários</span></div>
                        <p className="mt-1 text-sm font-black text-slate-950">{p.num_beneficiarios || '—'}</p>
                      </div>
                      <div className="rounded-[1rem] bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-slate-500"><Target size={12} /><span className="text-[10px] font-black uppercase">Prazo final</span></div>
                        <p className="mt-1 text-sm font-black text-slate-950">{fmtDate(p.data_fim)}</p>
                      </div>
                    </div>

                    {/* acao */}
                    <button
                      onClick={() => setDetalhe(p)}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:bg-[#0050d0]"
                    >
                      Ver detalhes <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES */}
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <button
              onClick={() => setDetalhe(null)}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              <X size={15} />
            </button>

            <div className="rounded-t-[2rem] bg-gradient-to-br from-[#0068ff]/8 to-white p-7">
              <div className="flex flex-wrap gap-2">
                {detalhe.esfera && (
                  <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${esferaCls(detalhe.esfera)}`}>{detalhe.esfera}</span>
                )}
                {detalhe.modalidade && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{detalhe.modalidade}</span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{detalhe.nome}</h2>
              {detalhe.responsavel_tecnico && (
                <p className="mt-1 text-sm font-bold text-slate-500">{detalhe.responsavel_tecnico}</p>
              )}
            </div>

            <div className="space-y-4 p-7 pt-4">
              {[
                { label: 'Objetivo',         value: detalhe.objetivo },
                { label: 'Público-Alvo',     value: detalhe.publico_alvo },
                { label: 'Localização',      value: detalhe.municipio },
                { label: 'Beneficiários',    value: detalhe.num_beneficiarios ? String(detalhe.num_beneficiarios) : null },
                { label: 'Valor Aprovado',   value: detalhe.valor_aprovado ? fmt(Number(detalhe.valor_aprovado)) : null },
                { label: 'Valor Captado',    value: detalhe.valor_captado  ? fmt(Number(detalhe.valor_captado))  : null },
                { label: 'Prazo Final',      value: fmtDate(detalhe.data_fim) },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex justify-between rounded-[1.1rem] bg-slate-50 px-4 py-3">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{r.label}</span>
                  <span className="max-w-[60%] text-right text-sm font-bold text-slate-800">{r.value}</span>
                </div>
              ))}

              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => { toggleFav(detalhe.id); setDetalhe(null); }}
                  className={`flex-1 rounded-[1.1rem] border py-3 text-sm font-black transition ${favoritos.has(detalhe.id) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-rose-200 hover:text-rose-500'}`}
                >
                  <Heart size={15} className="mr-2 inline" fill={favoritos.has(detalhe.id) ? 'currentColor' : 'none'} />
                  {favoritos.has(detalhe.id) ? 'Remover favorito' : 'Favoritar'}
                </button>
                <button className="flex-1 rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 hover:bg-[#0050d0] transition">
                  Quero patrocinar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
