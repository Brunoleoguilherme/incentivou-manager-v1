'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, CheckCircle2, Edit3, Eye, FileText, Plus, RefreshCw, Search, Trash2, Wallet } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { PortalType } from '@/lib/kanbanData';

type Projeto = {
  id: string;
  nome: string;
  descricao?: string | null;
  lei_incentivo?: string | null;
  area?: string | null;
  cidade?: string | null;
  estado?: string | null;
  valor_total?: number | null;
  valor_aprovado?: number | null;
  valor_captado?: number | null;
  status?: string | null;
  risco?: string | null;
  data_inicio?: string | null;
  data_limite?: string | null;
  created_at?: string | null;
};

const emptyForm = {
  nome: '',
  descricao: '',
  lei_incentivo: 'Lei Federal de Incentivo ao Esporte',
  area: 'Esporte',
  cidade: '',
  estado: '',
  valor_total: '',
  valor_aprovado: '',
  valor_captado: '',
  status: 'diagnostico',
  risco: 'baixo',
  data_inicio: '',
  data_limite: '',
};

function currency(value?: number | null) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusLabel(status?: string | null) {
  const map: Record<string, string> = {
    diagnostico: 'Diagnóstico',
    projeto: 'Projeto',
    aprovado: 'Aprovado',
    captacao: 'Captação',
    execucao: 'Execução',
    prestacao: 'Prestação',
    concluido: 'Concluído',
  };
  return map[status || ''] || status || 'Sem status';
}

function statusClass(status?: string | null) {
  if (status === 'concluido') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'captacao') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (status === 'execucao') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (status === 'prestacao') return 'bg-purple-50 text-purple-700 border-purple-100';
  return 'bg-slate-50 text-slate-700 border-slate-100';
}

function riscoClass(risco?: string | null) {
  if (risco === 'alto') return 'bg-red-50 text-red-700 border-red-100';
  if (risco === 'medio') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}

export default function ProjectsManager({ portal = 'admin' }: { portal?: PortalType }) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadProjetos() {
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase ainda não configurado. Confira o arquivo .env.local.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    setProjetos((data || []) as Projeto[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProjetos();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return projetos;
    return projetos.filter((p) => [p.nome, p.lei_incentivo, p.area, p.cidade, p.estado, p.status].join(' ').toLowerCase().includes(search));
  }, [projetos, query]);

  const kpis = useMemo(() => {
    const total = projetos.length;
    const aprovado = projetos.reduce((sum, p) => sum + Number(p.valor_aprovado || 0), 0);
    const captado = projetos.reduce((sum, p) => sum + Number(p.valor_captado || 0), 0);
    const criticos = projetos.filter((p) => p.risco === 'alto').length;
    return { total, aprovado, captado, criticos };
  }, [projetos]);

  function editProjeto(projeto: Projeto) {
    setEditingId(projeto.id);
    setForm({
      nome: projeto.nome || '',
      descricao: projeto.descricao || '',
      lei_incentivo: projeto.lei_incentivo || 'Lei Federal de Incentivo ao Esporte',
      area: projeto.area || 'Esporte',
      cidade: projeto.cidade || '',
      estado: projeto.estado || '',
      valor_total: String(projeto.valor_total || ''),
      valor_aprovado: String(projeto.valor_aprovado || ''),
      valor_captado: String(projeto.valor_captado || ''),
      status: projeto.status || 'diagnostico',
      risco: projeto.risco || 'baixo',
      data_inicio: projeto.data_inicio || '',
      data_limite: projeto.data_limite || '',
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function saveProjeto(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!form.nome.trim()) {
      setError('Informe o nome do projeto.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      lei_incentivo: form.lei_incentivo,
      area: form.area,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      valor_total: Number(form.valor_total || 0),
      valor_aprovado: Number(form.valor_aprovado || 0),
      valor_captado: Number(form.valor_captado || 0),
      status: form.status,
      risco: form.risco,
      data_inicio: form.data_inicio || null,
      data_limite: form.data_limite || null,
      updated_at: new Date().toISOString(),
    };

    const response = editingId
      ? await supabase.from('projetos').update(payload).eq('id', editingId)
      : await supabase.from('projetos').insert(payload);

    if (response.error) setError(response.error.message);
    else {
      resetForm();
      await loadProjetos();
    }

    setSaving(false);
  }

  async function deleteProjeto(id: string) {
    if (!supabase) return;
    const ok = window.confirm('Deseja realmente excluir este projeto? Esta ação remove o dossiê e vínculos relacionados.');
    if (!ok) return;
    const { error } = await supabase.from('projetos').delete().eq('id', id);
    if (error) setError(error.message);
    else await loadProjetos();
  }

  return (
    <PortalShell portal={portal}>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Dossiê único</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">Projetos IncentiVou</h2>
            <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-slate-600">
              Cadastre, acompanhe e organize diagnóstico, captação, execução, documentos, histórico e prestação de contas em uma única base.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadProjetos} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
              <RefreshCw size={17} /> Atualizar
            </button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
              <Plus size={18} /> Novo projeto
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Projetos cadastrados', String(kpis.total), FileText, 'Base operacional'],
          ['Valor aprovado', currency(kpis.aprovado), Wallet, 'Projetos com autorização'],
          ['Valor captado', currency(kpis.captado), CheckCircle2, 'Recursos confirmados'],
          ['Riscos críticos', String(kpis.criticos), AlertCircle, 'Exigem acompanhamento'],
        ].map(([label, value, Icon, desc]: any) => (
          <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={22} /></div>
            <p className="text-sm font-black text-slate-500">{label}</p>
            <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</h3>
            <p className="mt-2 text-sm font-bold text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, lei, cidade, status..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-emerald-300 focus:bg-white" />
          </div>
          <p className="text-sm font-bold text-slate-500">{filtered.length} resultado(s)</p>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</div>}

        {showForm && (
          <form onSubmit={saveProjeto} className="mb-6 rounded-[1.6rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950">{editingId ? 'Editar projeto' : 'Novo projeto'}</h3>
              <button type="button" onClick={resetForm} className="text-sm font-black text-slate-500">Cancelar</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="xl:col-span-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Nome</span><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Lei</span><input value={form.lei_incentivo} onChange={(e) => setForm({ ...form, lei_incentivo: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Área</span><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Cidade</span><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Estado</span><input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Valor total</span><input type="number" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Valor aprovado</span><input type="number" value={form.valor_aprovado} onChange={(e) => setForm({ ...form, valor_aprovado: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Valor captado</span><input type="number" value={form.valor_captado} onChange={(e) => setForm({ ...form, valor_captado: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none"><option value="diagnostico">Diagnóstico</option><option value="projeto">Projeto</option><option value="aprovado">Aprovado</option><option value="captacao">Captação</option><option value="execucao">Execução</option><option value="prestacao">Prestação</option><option value="concluido">Concluído</option></select></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Risco</span><select value={form.risco} onChange={(e) => setForm({ ...form, risco: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none"><option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option></select></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Início</span><input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Prazo limite</span><input type="date" value={form.data_limite} onChange={(e) => setForm({ ...form, data_limite: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
              <label className="md:col-span-2 xl:col-span-4"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Descrição</span><textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 font-bold outline-none" /></label>
            </div>
            <button disabled={saving} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar projeto'}</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                <th className="px-4">Projeto</th><th className="px-4">Status</th><th className="px-4">Valores</th><th className="px-4">Prazo</th><th className="px-4">Risco</th><th className="px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-500">Carregando projetos...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-500">Nenhum projeto encontrado. Cadastre o primeiro projeto.</td></tr> : filtered.map((p) => (
                <tr key={p.id} className="rounded-2xl bg-white shadow-sm">
                  <td className="rounded-l-2xl border-y border-l border-slate-100 px-4 py-4"><h4 className="font-black text-slate-950">{p.nome}</h4><p className="mt-1 text-sm font-bold text-slate-500">{p.lei_incentivo || 'Lei não informada'} • {p.cidade || 'Cidade'} / {p.estado || 'UF'}</p></td>
                  <td className="border-y border-slate-100 px-4 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(p.status)}`}>{statusLabel(p.status)}</span></td>
                  <td className="border-y border-slate-100 px-4 py-4"><p className="text-sm font-black text-slate-900">Aprovado: {currency(p.valor_aprovado)}</p><p className="text-sm font-bold text-emerald-700">Captado: {currency(p.valor_captado)}</p></td>
                  <td className="border-y border-slate-100 px-4 py-4"><p className="inline-flex items-center gap-2 text-sm font-black text-slate-700"><CalendarClock size={16}/>{p.data_limite ? new Date(p.data_limite + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem prazo'}</p></td>
                  <td className="border-y border-slate-100 px-4 py-4"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${riscoClass(p.risco)}`}>{p.risco || 'baixo'}</span></td>
                  <td className="rounded-r-2xl border-y border-r border-slate-100 px-4 py-4"><div className="flex justify-end gap-2"><Link href={`/projetos/${p.id}`} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-700"><Eye size={17}/></Link><button onClick={() => editProjeto(p)} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-700"><Edit3 size={17}/></button><button onClick={() => deleteProjeto(p.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-700"><Trash2 size={17}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PortalShell>
  );
}
