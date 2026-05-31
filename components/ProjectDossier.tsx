'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, FileText, History, MessageSquare, UploadCloud, Wallet } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

type Projeto = any;
type Documento = { id: string; nome: string; tipo?: string; status?: string; validade?: string; url?: string; created_at?: string };
type Historico = { id: string; acao: string; detalhe?: string; created_at?: string };
type Alerta = { id: string; titulo: string; mensagem?: string; tipo?: string; lido?: boolean; prazo?: string };

function currency(value?: number | null) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProjectDossier({ projetoId }: { projetoId: string }) {
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Documento básico');

  async function load() {
    setLoading(true);
    setError('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase ainda não configurado.');
      setLoading(false);
      return;
    }

    const [projectRes, docsRes, histRes, alertsRes] = await Promise.all([
      supabase.from('projetos').select('*').eq('id', projetoId).single(),
      supabase.from('documentos').select('*').eq('projeto_id', projetoId).order('created_at', { ascending: false }),
      supabase.from('historico').select('*').eq('projeto_id', projetoId).order('created_at', { ascending: false }).limit(20),
      supabase.from('alertas').select('*').eq('projeto_id', projetoId).order('created_at', { ascending: false }),
    ]);

    if (projectRes.error) setError(projectRes.error.message);
    setProjeto(projectRes.data);
    setDocumentos((docsRes.data || []) as Documento[]);
    setHistorico((histRes.data || []) as Historico[]);
    setAlertas((alertsRes.data || []) as Alerta[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [projetoId]);

  const progress = useMemo(() => {
    if (!projeto?.valor_aprovado) return 0;
    return Math.min(100, Math.round((Number(projeto.valor_captado || 0) / Number(projeto.valor_aprovado || 1)) * 100));
  }, [projeto]);

  async function addDocumento(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !docName.trim()) return;
    const { error } = await supabase.from('documentos').insert({ projeto_id: projetoId, nome: docName.trim(), tipo: docType, status: 'pendente' });
    if (error) setError(error.message);
    else {
      await supabase.from('historico').insert({ projeto_id: projetoId, acao: 'Documento cadastrado', detalhe: docName.trim() });
      setDocName('');
      await load();
    }
  }

  if (loading) return <PortalShell portal="admin"><div className="rounded-[2rem] bg-white p-8 font-bold text-slate-500">Carregando dossiê...</div></PortalShell>;

  if (!projeto) return <PortalShell portal="admin"><div className="rounded-[2rem] bg-white p-8 font-bold text-red-600">Projeto não encontrado. {error}</div></PortalShell>;

  return (
    <PortalShell portal="admin">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link href="/projetos" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700"><ArrowLeft size={17} /> Voltar para projetos</Link>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Dossiê único do projeto</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">{projeto.nome}</h2>
            <p className="mt-4 max-w-3xl font-semibold leading-relaxed text-slate-600">{projeto.descricao || 'Sem descrição cadastrada.'}</p>
          </div>
          <div className="rounded-[1.8rem] border border-slate-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Captação</p>
            <div className="mt-3 flex items-end justify-between gap-3"><h3 className="text-3xl font-black text-slate-950">{progress}%</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{projeto.status || 'diagnóstico'}</span></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} /></div>
            <p className="mt-4 text-sm font-bold text-slate-600">{currency(projeto.valor_captado)} captados de {currency(projeto.valor_aprovado)} aprovados.</p>
          </div>
        </div>
      </section>

      {error && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</div>}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Lei', projeto.lei_incentivo || 'Não informada', FileText],
          ['Valor total', currency(projeto.valor_total), Wallet],
          ['Prazo limite', projeto.data_limite ? new Date(projeto.data_limite + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem prazo', Clock3],
          ['Risco', projeto.risco || 'baixo', AlertTriangle],
        ].map(([label, value, Icon]: any) => <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={20} /></div><p className="text-sm font-black text-slate-500">{label}</p><h3 className="mt-1 text-xl font-black text-slate-950">{value}</h3></div>)}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Documentos</p><h3 className="text-2xl font-black text-slate-950">Arquivos e pendências</h3></div><UploadCloud className="text-emerald-700" /></div>
          <form onSubmit={addDocumento} className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]"><input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Nome do documento" className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none" /><select value={docType} onChange={(e) => setDocType(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none"><option>Documento básico</option><option>Certidão</option><option>Contrato</option><option>Orçamento</option><option>Prestação</option></select><button className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">Adicionar</button></form>
          <div className="space-y-3">{documentos.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Nenhum documento cadastrado ainda.</p> : documentos.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"><div><h4 className="font-black text-slate-950">{doc.nome}</h4><p className="text-sm font-bold text-slate-500">{doc.tipo || 'Documento'} • {doc.status || 'pendente'}</p></div><CheckCircle2 className="text-emerald-600" size={20}/></div>)}</div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex items-center gap-3"><History className="text-emerald-700"/><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Histórico</p><h3 className="text-2xl font-black text-slate-950">Linha do tempo</h3></div></div><div className="space-y-3">{historico.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Sem histórico registrado.</p> : historico.map((h) => <div key={h.id} className="rounded-2xl bg-slate-50 p-4"><h4 className="font-black text-slate-950">{h.acao}</h4><p className="text-sm font-bold text-slate-500">{h.detalhe || 'Atualização operacional'} • {h.created_at ? new Date(h.created_at).toLocaleString('pt-BR') : ''}</p></div>)}</div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex items-center gap-3"><MessageSquare className="text-emerald-700"/><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Alertas</p><h3 className="text-2xl font-black text-slate-950">Riscos e avisos</h3></div></div><div className="space-y-3">{alertas.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Nenhum alerta para este projeto.</p> : alertas.map((a) => <div key={a.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><h4 className="font-black text-amber-900">{a.titulo}</h4><p className="text-sm font-bold text-amber-700">{a.mensagem || 'Acompanhar pendência.'}</p></div>)}</div></div>
        </div>
      </section>
    </PortalShell>
  );
}
