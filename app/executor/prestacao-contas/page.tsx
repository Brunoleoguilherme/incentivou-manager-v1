'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock3, Download, FileText,
  Plus, Search, UploadCloud, X, Trash2, ExternalLink,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Doc = {
  id: string; projeto_id: string | null; tipo: string; descricao: string | null;
  responsavel: string | null; fornecedor: string | null; status: string | null;
  valor: number | null; prazo: string | null; observacoes: string | null; url: string | null;
};
type Projeto = { id: string; nome: string };

type Form = {
  projeto_id: string; tipo: string; descricao: string; responsavel: string;
  fornecedor: string; status: string; valor: string; prazo: string; observacoes: string;
};

const TIPOS   = ['Nota fiscal','Comprovante bancario','Relatorio de execucao','Foto/evidencia','Contrato','Recibo','Documento complementar'];
const STATUSS = ['pendente','em_andamento','em_analise','aprovado','risco_glosa','reprovado'];

const STATUS_META: Record<string,{ label: string; cls: string; dot: string }> = {
  pendente:    { label: 'Pendente',       cls: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400'   },
  em_andamento:{ label: 'Em andamento',   cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'    },
  em_analise:  { label: 'Em analise',     cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400'   },
  aprovado:    { label: 'Aprovado',       cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  risco_glosa: { label: 'Risco de glosa', cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500'     },
  reprovado:   { label: 'Reprovado',      cls: 'bg-rose-100 text-rose-700',     dot: 'bg-rose-500'    },
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const diasRestantes = (prazo?: string | null) => {
  if (!prazo) return null;
  return Math.ceil((new Date(prazo).getTime() - Date.now()) / 86400000);
};

const FORM0: Form = {
  projeto_id: '', tipo: 'Nota fiscal', descricao: '', responsavel: '',
  fornecedor: '', status: 'pendente', valor: '', prazo: '', observacoes: '',
};

export default function PrestacaoContasPage() {
  const [docs, setDocs]           = useState<Doc[]>([]);
  const [projetos, setProjetos]   = useState<Projeto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [filtroStatus, setFiltroStatus]   = useState('todos');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando]   = useState<Doc | null>(null);
  const [salvando, setSalvando]   = useState(false);
  const [form, setForm]           = useState<Form>(FORM0);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  async function carregar() {
    if (!supabase) { setLoading(false); return; }
    const [dRes, pRes] = await Promise.all([
      supabase.from('manager_prestacao_docs')
        .select('id,projeto_id,tipo,descricao,responsavel,fornecedor,status,valor,prazo,observacoes,url')
        .order('created_at', { ascending: false }),
      supabase.from('manager_projetos').select('id,nome').order('nome'),
    ]);
    setDocs((dRes.data || []) as Doc[]);
    setProjetos(pRes.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => docs.filter((d) => {
    const proj = projetos.find((p) => p.id === d.projeto_id)?.nome || '';
    const txt  = `${d.tipo} ${d.descricao} ${d.responsavel} ${d.fornecedor} ${proj}`.toLowerCase();
    const bOk  = txt.includes(busca.toLowerCase());
    const sOk  = filtroStatus === 'todos' || d.status === filtroStatus;
    const pOk  = !filtroProjeto || d.projeto_id === filtroProjeto;
    return bOk && sOk && pOk;
  }), [docs, busca, filtroStatus, filtroProjeto, projetos]);

  const totalValor    = filtrados.reduce((s, d) => s + Number(d.valor || 0), 0);
  const aprovados     = filtrados.filter((d) => d.status === 'aprovado');
  const riscos        = filtrados.filter((d) => d.status === 'risco_glosa' || d.status === 'reprovado');
  const pendentes     = filtrados.filter((d) => d.status === 'pendente');
  const vencendo      = filtrados.filter((d) => { const dias = diasRestantes(d.prazo); return dias !== null && dias <= 7 && dias >= 0; });
  const vencidos      = filtrados.filter((d) => { const dias = diasRestantes(d.prazo); return dias !== null && dias < 0 && d.status !== 'aprovado'; });

  function abrirNovo()     { setEditando(null); setForm(FORM0); setUploadUrl(''); setShowModal(true); }
  function abrirEditar(d: Doc) {
    setEditando(d);
    setForm({
      projeto_id: d.projeto_id || '', tipo: d.tipo, descricao: d.descricao || '',
      responsavel: d.responsavel || '', fornecedor: d.fornecedor || '',
      status: d.status || 'pendente', valor: String(d.valor || ''),
      prazo: d.prazo || '', observacoes: d.observacoes || '',
    });
    setUploadUrl(d.url || '');
    setShowModal(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    const path = `prestacao/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('documentos').upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: pub } = supabase.storage.from('documentos').getPublicUrl(data.path);
      setUploadUrl(pub.publicUrl);
    }
    setUploading(false);
  }

  // Mapeamento: tipo do doc de PC → palavras-chave no título das entregas de Execução Segura
  const TIPO_KEYWORDS: Record<string, string[]> = {
    'Comprovante bancario': ['extrato bancário', 'extrato'],
    'Foto/evidencia':       ['fotográfico', 'foto'],
    'Relatorio de execucao':['relatório técnico', 'relatório'],
    'Nota fiscal':          ['nota fiscal'],
    'Lista de presença':    ['lista de presença', 'presença'],
  };

  async function syncEntregaStatus(projId: string | null, tipo: string, novoStatus: string) {
    if (!supabase || !projId) return;
    const keywords = TIPO_KEYWORDS[tipo];
    if (!keywords) return;
    const { data: entregas } = await supabase
      .from('manager_entregas')
      .select('id,titulo,status')
      .eq('projeto_id', projId);
    if (!entregas) return;
    const matching = entregas.filter(e =>
      keywords.some(kw => e.titulo.toLowerCase().includes(kw)) &&
      e.status !== 'concluido'
    );
    for (const entrega of matching) {
      await supabase.from('manager_entregas').update({ status: novoStatus }).eq('id', entrega.id);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !form.tipo) return;
    setSalvando(true);
    const payload = {
      projeto_id: form.projeto_id || null, tipo: form.tipo,
      descricao: form.descricao || null, responsavel: form.responsavel || null,
      fornecedor: form.fornecedor || null, status: form.status,
      valor: form.valor ? Number(form.valor) : 0,
      prazo: form.prazo || null, observacoes: form.observacoes || null,
      url: uploadUrl || null,
    };
    if (editando) {
      await supabase.from('manager_prestacao_docs').update(payload).eq('id', editando.id);
      if (form.status === 'aprovado') {
        await syncEntregaStatus(form.projeto_id || null, form.tipo, 'concluido');
      }
    } else {
      await supabase.from('manager_prestacao_docs').insert(payload);
      // Novo doc enviado → entrega correspondente vai para "aguardando aprovação"
      await syncEntregaStatus(form.projeto_id || null, form.tipo, 'aguardando aprovacao');
    }
    setSalvando(false);
    setShowModal(false);
    setEditando(null);
    setForm(FORM0);
    setUploadUrl('');
    carregar();
  }

  async function excluir(id: string) {
    if (!supabase || !window.confirm('Excluir este documento?')) return;
    await supabase.from('manager_prestacao_docs').delete().eq('id', id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  async function atualizarStatus(id: string, status: string) {
    if (!supabase) return;
    await supabase.from('manager_prestacao_docs').update({ status }).eq('id', id);
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    // Se aprovado → marca entrega correspondente como concluída
    if (status === 'aprovado') {
      const doc = docs.find(d => d.id === id);
      if (doc) await syncEntregaStatus(doc.projeto_id, doc.tipo, 'concluido');
    }
  }

  const projetoNome = (id?: string | null) => projetos.find((p) => p.id === id)?.nome || '—';

  return (
    <PortalShell portal="executor">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-600">Fase Final</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Prestacao de Contas</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Comprovantes, notas fiscais, relatorios e status de aprovacao por projeto.
              </p>
            </div>
            <button onClick={abrirNovo}
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5">
              <Plus size={16} /> Adicionar Documento
            </button>
          </div>

          {/* METRICAS */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Documentos',  value: String(filtrados.length), cls: '' },
              { label: 'Valor Total',       value: fmt(totalValor),          cls: 'text-slate-950' },
              { label: 'Aprovados',         value: String(aprovados.length), cls: 'text-emerald-700' },
              { label: 'Risco / Reprovado', value: String(riscos.length),    cls: riscos.length > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map((m) => (
              <div key={m.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
                <p className={`mt-1 text-2xl font-black ${m.cls || 'text-slate-950'}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ALERTAS */}
        {(riscos.length > 0 || vencidos.length > 0 || vencendo.length > 0) && (
          <section className="space-y-3">
            {riscos.length > 0 && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-red-200 bg-red-50 p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-black text-red-800">
                    {riscos.length} documento(s) em risco de glosa ou reprovado
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-red-600">
                    {riscos.map((d) => d.tipo).join(' · ')}
                  </p>
                </div>
              </div>
            )}
            {vencidos.length > 0 && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-rose-200 bg-rose-50 p-4">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <p className="text-sm font-black text-rose-800">
                    {vencidos.length} documento(s) com prazo vencido
                  </p>
                </div>
              </div>
            )}
            {vencendo.length > 0 && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-amber-200 bg-amber-50 p-4">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-black text-amber-800">
                    {vencendo.length} documento(s) vencendo nos proximos 7 dias
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* FILTROS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por tipo, fornecedor, responsavel..."
              value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold outline-none focus:border-purple-400" />
          </div>
          <select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}
            className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-purple-400">
            <option value="">Todos os projetos</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-purple-400">
            <option value="todos">Todos os status</option>
            {STATUSS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
          {(busca || filtroStatus !== 'todos' || filtroProjeto) && (
            <button onClick={() => { setBusca(''); setFiltroStatus('todos'); setFiltroProjeto(''); }}
              className="rounded-[1.1rem] border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
          <span className="text-xs font-black text-slate-400">{filtrados.length} doc(s)</span>
        </div>

        {/* LISTA */}
        {loading ? (
          <p className="py-12 text-center text-sm font-bold text-slate-400">Carregando documentos...</p>
        ) : filtrados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 py-16 text-center">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-black text-slate-400">Nenhum documento encontrado.</p>
            <button onClick={abrirNovo}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50">
              <Plus size={14} /> Adicionar primeiro documento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((d) => {
              const st   = STATUS_META[d.status || 'pendente'] || STATUS_META.pendente;
              const dias = diasRestantes(d.prazo);
              const atrasado = dias !== null && dias < 0 && d.status !== 'aprovado';
              return (
                <div key={d.id}
                  className={`rounded-[1.6rem] border bg-white p-5 shadow-sm transition hover:shadow-md ${atrasado ? 'border-rose-200' : 'border-slate-200'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${atrasado ? 'bg-rose-50 text-rose-600' : 'bg-purple-50 text-purple-700'}`}>
                        <FileText size={18}/>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-950">{d.tipo}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${st.cls}`}>{st.label}</span>
                          {atrasado && <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-700">Vencido</span>}
                          {dias !== null && dias >= 0 && dias <= 7 && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">{dias}d</span>}
                        </div>
                        {d.descricao && <p className="mt-0.5 text-xs font-bold text-slate-500">{d.descricao}</p>}
                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                          {projetoNome(d.projeto_id)}
                          {d.fornecedor ? ` · ${d.fornecedor}` : ''}
                          {d.responsavel ? ` · ${d.responsavel}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-base font-black text-slate-950">{fmt(Number(d.valor || 0))}</p>
                        <p className="text-[10px] font-bold text-slate-400">Prazo: {fmtDate(d.prazo)}</p>
                      </div>
                      <select
                        value={d.status || 'pendente'}
                        onChange={(e) => atualizarStatus(d.id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1.5 text-[10px] font-black outline-none cursor-pointer ${st.cls}`}>
                        {STATUSS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* acoes */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(d)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-50 transition">
                        Editar
                      </button>
                      {d.url && (
                        <a href={d.url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-50 transition">
                          <ExternalLink size={12}/> Ver arquivo
                        </a>
                      )}
                    </div>
                    <button onClick={() => excluir(d.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition">
                      <Trash2 size={13}/>
                    </button>
                  </div>

                  {d.observacoes && (
                    <p className="mt-3 rounded-[.8rem] bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">{d.observacoes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-lg font-black text-slate-950">
                {editando ? 'Editar Documento' : 'Adicionar Documento'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditando(null); setForm(FORM0); setUploadUrl(''); }}
                className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
                <X size={15}/>
              </button>
            </div>

            <form onSubmit={salvar} className="space-y-3 p-6">
              <select required value={form.projeto_id} onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400">
                <option value="">Projeto (opcional)</option>
                {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <select required value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400">
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <textarea placeholder="Descricao" value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400 min-h-[70px]" />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Responsavel" value={form.responsavel}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400" />
                <input type="text" placeholder="Fornecedor" value={form.fornecedor}
                  onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="0" placeholder="Valor (R$)" value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400" />
                <input type="date" value={form.prazo}
                  onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400" />
              </div>

              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400">
                {STATUSS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
              </select>

              <textarea placeholder="Observacoes" value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                className="w-full rounded-[1.1rm] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-purple-400 min-h-[60px]" />

              {/* upload */}
              <div className={`rounded-[1.1rem] border-2 border-dashed p-4 text-center ${uploadUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                {uploadUrl ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600"/>
                    <span className="text-xs font-black text-emerald-700">Arquivo enviado</span>
                    <button type="button" onClick={() => setUploadUrl('')}
                      className="ml-2 text-slate-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={20} className="mx-auto text-slate-400"/>
                    <p className="mt-1 text-xs font-bold text-slate-500">Enviar comprovante (PDF, imagem)</p>
                    <label className="mt-2 inline-block cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50">
                      {uploading ? 'Enviando...' : 'Escolher arquivo'}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleUpload} disabled={uploading} />
                    </label>
                  </>
                )}
              </div>

              <button type="submit" disabled={salvando}
                className="w-full rounded-[1.1rem] bg-purple-600 py-3 text-sm font-black text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : editando ? 'Salvar alteracoes' : 'Adicionar documento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
