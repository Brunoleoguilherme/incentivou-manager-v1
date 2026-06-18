'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Documento = {
  id: string;
  projeto_id: string | null;
  nome: string;
  categoria: string;
  tipo: string | null;
  status: string;
  data_vencimento: string | null;
  url: string | null;
  observacao: string | null;
  created_at: string;
  manager_projetos?: { nome: string } | null;
};

type Projeto = { id: string; nome: string };

const STATUS_LABELS: Record<string, string> = {
  pendente:   'Pendente',
  em_analise: 'Em analise',
  aprovado:   'Aprovado',
  vencendo:   'Vencendo',
  vencido:    'Vencido',
};

const CATEGORIA_LABELS: Record<string, string> = {
  certidao:   'Certidao',
  juridico:   'Juridico',
  financeiro: 'Financeiro',
  tecnico:    'Tecnico',
  outro:      'Outro',
};

function statusCls(s: string) {
  if (s === 'aprovado')   return 'bg-emerald-50 text-emerald-700';
  if (s === 'em_analise') return 'bg-blue-50 text-blue-700';
  if (s === 'vencendo')   return 'bg-amber-50 text-amber-700';
  if (s === 'vencido')    return 'bg-red-50 text-red-600';
  return 'bg-slate-100 text-slate-600';
}

function diasRestantes(data: string | null): number | null {
  if (!data) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(data + 'T00:00:00');
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
}

function fmtData(data: string | null) {
  if (!data) return '-';
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function CompliancePage() {
  const [docs, setDocs]         = useState<Documento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busca, setBusca]       = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modal, setModal]       = useState<'novo' | 'editar' | null>(null);
  const [selecionado, setSelecionado] = useState<Documento | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    projeto_id: '',
    nome: '',
    categoria: 'certidao',
    tipo: '',
    status: 'pendente',
    data_vencimento: '',
    url: '',
    observacao: '',
  });

  async function carregar() {
    if (!supabase) return;
    setLoading(true);
    const [docsRes, projRes] = await Promise.all([
      supabase
        .from('manager_documentos')
        .select('*, manager_projetos(nome)')
        .order('created_at', { ascending: false }),
      supabase
        .from('manager_projetos')
        .select('id,nome')
        .order('nome'),
    ]);
    setDocs((docsRes.data as Documento[]) || []);
    setProjetos((projRes.data as Projeto[]) || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const kpis = useMemo(() => {
    const aprovados = docs.filter(d => d.status === 'aprovado').length;
    const emAnalise = docs.filter(d => d.status === 'em_analise').length;
    const alertas   = docs.filter(d => d.status === 'vencendo' || d.status === 'vencido').length;
    const score     = docs.length ? Math.round((aprovados / docs.length) * 100) : 0;
    return { total: docs.length, aprovados, emAnalise, alertas, score };
  }, [docs]);

  const alertas = useMemo(() =>
    docs
      .filter(d => d.data_vencimento !== null)
      .map(d => ({ ...d, dias: diasRestantes(d.data_vencimento) }))
      .filter(d => d.dias !== null && d.dias <= 30 && d.dias >= -7)
      .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0)),
    [docs]
  );

  const docsFiltrados = useMemo(() =>
    docs.filter(d => {
      const texto = (d.nome + ' ' + (d.tipo ?? '') + ' ' + (d.manager_projetos?.nome ?? '')).toLowerCase();
      return texto.includes(busca.toLowerCase()) && (!filtroStatus || d.status === filtroStatus);
    }),
    [docs, busca, filtroStatus]
  );

  function abrirNovo() {
    setForm({ projeto_id: '', nome: '', categoria: 'certidao', tipo: '', status: 'pendente', data_vencimento: '', url: '', observacao: '' });
    setSelecionado(null);
    setModal('novo');
  }

  function abrirEditar(doc: Documento) {
    setForm({
      projeto_id:      doc.projeto_id ?? '',
      nome:            doc.nome,
      categoria:       doc.categoria,
      tipo:            doc.tipo ?? '',
      status:          doc.status,
      data_vencimento: doc.data_vencimento ?? '',
      url:             doc.url ?? '',
      observacao:      doc.observacao ?? '',
    });
    setSelecionado(doc);
    setModal('editar');
  }

  async function salvar() {
    if (!supabase || !form.nome.trim()) return;
    setSalvando(true);
    const payload = {
      ...form,
      projeto_id:      form.projeto_id || null,
      tipo:            form.tipo || null,
      data_vencimento: form.data_vencimento || null,
      url:             form.url || null,
      observacao:      form.observacao || null,
    };
    if (modal === 'novo') {
      await supabase.from('manager_documentos').insert(payload);
    } else if (selecionado) {
      await supabase.from('manager_documentos').update(payload).eq('id', selecionado.id);
    }
    setSalvando(false);
    setModal(null);
    carregar();
  }

  async function excluir() {
    if (!supabase || !selecionado) return;
    await supabase.from('manager_documentos').delete().eq('id', selecionado.id);
    setModal(null);
    carregar();
  }

  return (
    <PortalShell portal="admin">
      <div className="space-y-7">

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Compliance Documental
              </p>
              <h2 className="mt-2 text-5xl font-black text-slate-950">
                Central de validacao tecnica
              </h2>
              <p className="mt-3 max-w-2xl text-lg font-semibold text-slate-500">
                Gerencie documentos, certidoes, vencimentos e status dos projetos em andamento.
              </p>
            </div>
            <div className="shrink-0 rounded-3xl bg-[#041b43] p-6 text-center text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Score Geral</p>
              <h3 className="text-5xl font-black">{kpis.score}%</h3>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={<FileCheck2 />}    label="Documentos" value={kpis.total} />
          <KpiCard icon={<Clock3 />}        label="Em analise" value={kpis.emAnalise}  color="blue" />
          <KpiCard icon={<AlertTriangle />} label="Alertas"    value={kpis.alertas}    color="amber" />
          <KpiCard icon={<ShieldCheck />}   label="Aprovados"  value={kpis.aprovados}  color="emerald" />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar documento ou projeto..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 rounded-xl bg-[#041b43] px-5 py-2.5 text-sm font-black text-white hover:bg-[#072260] transition-colors"
          >
            <Plus className="h-4 w-4" /> Novo documento
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">Documentos</h3>
            {loading ? (
              <p className="mt-6 text-sm text-slate-400">Carregando...</p>
            ) : docsFiltrados.length === 0 ? (
              <div className="mt-10 flex flex-col items-center gap-3 text-slate-400">
                <FileText className="h-10 w-10" />
                <p className="font-semibold">Nenhum documento encontrado</p>
                <button onClick={abrirNovo} className="text-emerald-600 font-black text-sm hover:underline">
                  + Adicionar primeiro documento
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {docsFiltrados.map(doc => {
                  const dias = diasRestantes(doc.data_vencimento);
                  return (
                    <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-900 truncate">{doc.nome}</h4>
                          <span className={'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black ' + statusCls(doc.status)}>
                            {STATUS_LABELS[doc.status] ?? doc.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {CATEGORIA_LABELS[doc.categoria] ?? doc.categoria}
                          {doc.tipo ? ' - ' + doc.tipo : ''}
                          {doc.manager_projetos?.nome ? ' - ' + doc.manager_projetos.nome : ''}
                        </p>
                        {doc.data_vencimento && (
                          <p className={'mt-1 text-xs font-bold ' + (dias !== null && dias <= 7 ? 'text-red-600' : dias !== null && dias <= 30 ? 'text-amber-600' : 'text-slate-400')}>
                            Vence: {fmtData(doc.data_vencimento)}
                            {dias !== null && dias >= 0 ? ' (' + dias + 'd)' : dias !== null ? ' (vencido)' : ''}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => abrirEditar(doc)}
                        className="ml-4 shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">Alertas de vencimento</h3>
            {alertas.length === 0 ? (
              <div className="mt-8 flex flex-col items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <p className="text-sm font-semibold text-center">Nenhum vencimento nos proximos 30 dias</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {alertas.map(doc => (
                  <div
                    key={doc.id}
                    className={'rounded-2xl border p-4 ' + ((doc.dias ?? 0) <= 7 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50')}
                  >
                    <h4 className="font-black text-sm text-slate-900">{doc.nome}</h4>
                    {doc.manager_projetos?.nome && (
                      <p className="mt-0.5 text-xs text-slate-500">{doc.manager_projetos.nome}</p>
                    )}
                    <p className={'mt-2 text-xs font-bold ' + ((doc.dias ?? 0) < 0 ? 'text-red-700' : (doc.dias ?? 0) <= 7 ? 'text-red-600' : 'text-amber-700')}>
                      {(doc.dias ?? 0) < 0
                        ? 'Vencido ha ' + Math.abs(doc.dias ?? 0) + ' dia(s)'
                        : (doc.dias ?? 0) === 0
                        ? 'Vence hoje!'
                        : 'Vence em ' + doc.dias + ' dia(s) - ' + fmtData(doc.data_vencimento)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">
                {modal === 'novo' ? 'Novo documento' : 'Editar documento'}
              </h3>
              <button onClick={() => setModal(null)} className="rounded-xl p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Certidao Federal, Ata de Eleicao..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Tipo</label>
                  <input
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    placeholder="Federal, Estadual..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={form.data_vencimento}
                    onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Projeto vinculado</label>
                <select
                  value={form.projeto_id}
                  onChange={e => setForm(f => ({ ...f, projeto_id: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Nenhum</option>
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">URL do arquivo</label>
                <input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Observacao</label>
                <textarea
                  value={form.observacao}
                  onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {modal === 'editar' && (
                <button
                  onClick={excluir}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-600 hover:bg-red-50 transition-colors"
                >
                  Excluir
                </button>
              )}
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={salvando || !form.nome.trim()}
                  className="rounded-xl bg-[#041b43] px-6 py-2.5 text-sm font-black text-white hover:bg-[#072260] disabled:opacity-50 transition-colors"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function KpiCard({ icon, label, value, color = 'slate' }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: 'slate' | 'blue' | 'amber' | 'emerald';
}) {
  const colors: Record<string, string> = {
    slate:   'text-slate-500',
    blue:    'text-blue-600',
    amber:   'text-amber-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={colors[color]}>{icon}</div>
      <p className="mt-4 text-sm font-black text-slate-500">{label}</p>
      <h3 className="text-4xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
