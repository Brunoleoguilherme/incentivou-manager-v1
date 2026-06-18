'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BarChart3, Building2, Calendar,
  CheckCircle2, FileText, Leaf, MapPin, Pencil,
  Plus, Save, Search, Sparkles, Target, Trash2,
  Users, X, AlertTriangle,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

/* ── tipos ───────────────────────────────────────── */
type Indicador = {
  id: string;
  projeto_nome: string | null;
  eixo: string | null;
  ods: string | null;
  indicador: string;
  beneficiarios: number | null;
  cidade: string | null;
  estado: string | null;
  patrocinador: string | null;
  status: string | null;
  impacto: string | null;
  resultado: string | null;
  prazo: string | null;
};

type FormData = {
  projeto_nome: string;
  eixo: string;
  ods: string;
  indicador: string;
  beneficiarios: string;
  cidade: string;
  estado: string;
  patrocinador: string;
  status: string;
  impacto: string;
  resultado: string;
  prazo: string;
};

const FORM_VAZIO: FormData = {
  projeto_nome: '', eixo: 'Social', ods: '', indicador: '',
  beneficiarios: '', cidade: '', estado: '', patrocinador: '',
  status: 'Planejado', impacto: '', resultado: '', prazo: '',
};

const STATUS_OPTS = ['Planejado', 'Em execução', 'Concluído', 'Em análise', 'Risco'];
const EIXO_OPTS   = ['ODS', 'Social', 'Educação', 'Saúde', 'Meio ambiente', 'Diversidade', 'Comunidade'];
const ODS_OPTS    = [
  'ODS 1 - Erradicação da Pobreza', 'ODS 3 - Saúde e Bem-Estar',
  'ODS 4 - Educação de Qualidade', 'ODS 5 - Igualdade de Gênero',
  'ODS 8 - Trabalho Decente', 'ODS 10 - Redução das Desigualdades',
  'ODS 11 - Cidades Sustentáveis', 'ODS 16 - Paz e Justiça', 'ODS 17 - Parcerias',
];

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR');
}

function statusCls(s?: string | null) {
  if (s === 'Concluído')    return 'bg-emerald-50 text-emerald-700';
  if (s === 'Em execução')  return 'bg-blue-50 text-blue-700';
  if (s === 'Risco')        return 'bg-red-50 text-red-600';
  if (s === 'Em análise')   return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

const inputCls = 'h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white';

/* ── componentes ─────────────────────────────────── */
function KPI({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color.replace('text-', 'bg-').replace('-700','-50').replace('-600','-50')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── página ──────────────────────────────────────── */
export default function ImpactoESGPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState('');

  const [busca, setBusca]             = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroEixo, setFiltroEixo]   = useState('Todos');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [form, setForm]               = useState<FormData>(FORM_VAZIO);
  const [salvando, setSalvando]       = useState(false);
  const [excluindo, setExcluindo]     = useState<Indicador | null>(null);

  async function carregar() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('manager_esg_indicadores')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setErro(error.message);
    setIndicadores((data || []) as Indicador[]);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    return indicadores.filter(i => {
      const txt = `${i.projeto_nome} ${i.eixo} ${i.ods} ${i.indicador} ${i.cidade} ${i.estado} ${i.patrocinador} ${i.status}`.toLowerCase();
      return txt.includes(busca.toLowerCase())
        && (filtroStatus === 'Todos' || i.status === filtroStatus)
        && (filtroEixo   === 'Todos' || i.eixo   === filtroEixo);
    });
  }, [indicadores, busca, filtroStatus, filtroEixo]);

  const kpis = useMemo(() => ({
    total:        indicadores.length,
    beneficiarios: indicadores.reduce((s, i) => s + Number(i.beneficiarios || 0), 0),
    ods:          new Set(indicadores.map(i => i.ods).filter(Boolean)).size,
    concluidos:   indicadores.filter(i => i.status === 'Concluído').length,
    patrocinadores: new Set(indicadores.map(i => i.patrocinador).filter(Boolean)).size,
  }), [indicadores]);

  function abrirNovo() {
    setForm(FORM_VAZIO); setEditandoId(null); setErro(''); setModalAberto(true);
  }

  function abrirEditar(i: Indicador) {
    setEditandoId(i.id);
    setForm({
      projeto_nome: i.projeto_nome || '', eixo: i.eixo || 'Social', ods: i.ods || '',
      indicador: i.indicador, beneficiarios: String(i.beneficiarios || ''),
      cidade: i.cidade || '', estado: i.estado || '', patrocinador: i.patrocinador || '',
      status: i.status || 'Planejado', impacto: i.impacto || '',
      resultado: i.resultado || '', prazo: i.prazo || '',
    });
    setErro(''); setModalAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!form.indicador.trim()) { setErro('Informe o indicador.'); return; }
    setSalvando(true); setErro('');
    const payload = { ...form, beneficiarios: Number(form.beneficiarios || 0), prazo: form.prazo || null };
    const { error } = editandoId
      ? await supabase.from('manager_esg_indicadores').update(payload).eq('id', editandoId)
      : await supabase.from('manager_esg_indicadores').insert(payload);
    if (error) { setErro(error.message); setSalvando(false); return; }
    await carregar();
    setSalvando(false); setModalAberto(false);
  }

  async function confirmarExcluir() {
    if (!supabase || !excluindo) return;
    await supabase.from('manager_esg_indicadores').delete().eq('id', excluindo.id);
    await carregar();
    setExcluindo(null);
  }

  return (
    <PortalShell portal="empresa">
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">Portal Empresa</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Impacto e ESG</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
                Mensure beneficiários, indicadores sociais, ODS, impacto territorial e contrapartidas ESG dos projetos apoiados.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={abrirNovo}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(0,104,255,0.25)] transition hover:-translate-y-0.5"
              >
                <Plus size={16} /> Novo indicador
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI label="Projetos monitorados" value={kpis.total}        icon={<Target size={20} />}        color="text-blue-700" />
            <KPI label="Beneficiários"         value={kpis.beneficiarios.toLocaleString('pt-BR')} icon={<Users size={20} />} color="text-emerald-700" />
            <KPI label="ODS monitorados"       value={kpis.ods}          icon={<Leaf size={20} />}          color="text-violet-700" />
            <KPI label="Concluídos"            value={kpis.concluidos}   icon={<BadgeCheck size={20} />}    color="text-teal-700" />
          </div>
        </section>

        {/* FILTROS + LISTA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar indicador..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none focus:border-emerald-400" />
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none">
                <option value="Todos">Todos os status</option>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filtroEixo} onChange={e => setFiltroEixo(e.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none">
                <option value="Todos">Todos os eixos</option>
                {EIXO_OPTS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="py-10 text-center text-sm font-bold text-slate-400">Carregando indicadores...</p>
            ) : filtrados.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 py-14 text-center">
                <Sparkles size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-black text-slate-400">Nenhum indicador ESG cadastrado.</p>
                <button type="button" onClick={abrirNovo} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-2.5 text-sm font-black text-white">
                  <Plus size={15} /> Adicionar primeiro indicador
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtrados.map(item => (
                  <div key={item.id} className="group rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
                    {/* topo */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusCls(item.status)}`}>
                          {item.status || 'Planejado'}
                        </span>
                        <h3 className="mt-2 truncate text-base font-black text-slate-950">{item.projeto_nome || 'Sem projeto'}</h3>
                        <p className="text-xs font-bold text-slate-500">{item.eixo} · {item.ods || 'ODS não informado'}</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button type="button" onClick={() => abrirEditar(item)} className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition">
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setExcluindo(item)} className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* beneficiários */}
                    <div className="mt-4 flex items-center gap-3 rounded-[1.2rem] bg-emerald-50 px-4 py-3">
                      <Users size={18} className="shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xl font-black text-emerald-700">{Number(item.beneficiarios || 0).toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Beneficiários</p>
                      </div>
                    </div>

                    {/* detalhes */}
                    <div className="mt-4 space-y-2">
                      {item.indicador && (
                        <p className="flex items-start gap-2 text-xs font-bold text-slate-600">
                          <FileText size={13} className="mt-0.5 shrink-0 text-slate-400" /> {item.indicador}
                        </p>
                      )}
                      {(item.cidade || item.estado) && (
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <MapPin size={13} className="shrink-0 text-slate-400" /> {[item.cidade, item.estado].filter(Boolean).join(' / ')}
                        </p>
                      )}
                      {item.patrocinador && (
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Building2 size={13} className="shrink-0 text-slate-400" /> {item.patrocinador}
                        </p>
                      )}
                      {item.prazo && (
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar size={13} className="shrink-0 text-slate-400" /> Prazo: {fmtDate(item.prazo)}
                        </p>
                      )}
                      {item.resultado && (
                        <p className="flex items-start gap-2 text-xs font-bold text-slate-500">
                          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" /> {item.resultado}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MODAL CRIAR/EDITAR */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    {editandoId ? 'Editar indicador' : 'Novo indicador ESG'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {editandoId ? 'Atualizar impacto' : 'Cadastrar impacto'}
                  </h2>
                </div>
                <button type="button" onClick={() => setModalAberto(false)} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={salvar} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Projeto</label>
                    <input value={form.projeto_nome} onChange={e => setForm(p => ({...p, projeto_nome: e.target.value}))} placeholder="Nome do projeto" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Eixo</label>
                    <select value={form.eixo} onChange={e => setForm(p => ({...p, eixo: e.target.value}))} className={inputCls}>
                      {EIXO_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">ODS</label>
                    <select value={form.ods} onChange={e => setForm(p => ({...p, ods: e.target.value}))} className={inputCls}>
                      <option value="">Selecione</option>
                      {ODS_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Indicador *</label>
                    <input value={form.indicador} onChange={e => setForm(p => ({...p, indicador: e.target.value}))} placeholder="Ex: Crianças e adolescentes atendidos" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Beneficiários</label>
                    <input type="number" min="0" value={form.beneficiarios} onChange={e => setForm(p => ({...p, beneficiarios: e.target.value}))} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className={inputCls}>
                      {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Cidade</label>
                    <input value={form.cidade} onChange={e => setForm(p => ({...p, cidade: e.target.value}))} placeholder="Cidade" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Estado</label>
                    <input value={form.estado} onChange={e => setForm(p => ({...p, estado: e.target.value}))} placeholder="UF" maxLength={2} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Patrocinador</label>
                    <input value={form.patrocinador} onChange={e => setForm(p => ({...p, patrocinador: e.target.value}))} placeholder="Empresa apoiadora" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Prazo</label>
                    <input type="date" value={form.prazo} onChange={e => setForm(p => ({...p, prazo: e.target.value}))} className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Impacto</label>
                    <textarea value={form.impacto} onChange={e => setForm(p => ({...p, impacto: e.target.value}))} rows={2} placeholder="Descrição do impacto social" className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-emerald-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Resultado</label>
                    <textarea value={form.resultado} onChange={e => setForm(p => ({...p, resultado: e.target.value}))} rows={2} placeholder="Resultados alcançados até o momento" className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-emerald-400" />
                  </div>
                </div>

                {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{erro}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalAberto(false)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-100">
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] py-3.5 text-sm font-black text-white disabled:opacity-60">
                    <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar indicador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EXCLUIR */}
        {excluindo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">Atenção</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Excluir indicador</h2>
                </div>
                <button type="button" onClick={() => setExcluindo(null)} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={16} />
                  <p className="text-sm font-black">Esta ação não pode ser desfeita</p>
                </div>
                <p className="mt-1 text-xs font-bold text-red-600">Indicador: <strong>{excluindo.indicador}</strong></p>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setExcluindo(null)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-100 transition">
                  Cancelar
                </button>
                <button type="button" onClick={confirmarExcluir} className="flex-1 rounded-2xl bg-red-600 py-3.5 text-sm font-black text-white hover:bg-red-700 transition">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
