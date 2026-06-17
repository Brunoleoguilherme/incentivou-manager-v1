'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Download, FileText,
  Handshake, Plus, Search, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Patrocinio = {
  id: string; projeto_id: string; empresa_nome: string;
  valor: number | null; data_aporte: string | null;
  status: string | null; beneficio_fiscal: number | null;
  manager_projetos: {
    nome: string; modalidade: string | null; esfera: string | null;
    municipio: string | null; objetivo: string | null;
    valor_captado: number | null; valor_aprovado: number | null;
  } | null;
};

type NovoAporte = {
  empresa_nome: string; projeto_id: string;
  valor: string; data_aporte: string; beneficio_fiscal: string;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

const STATUS_CLS: Record<string, string> = {
  pendente:   'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  liberado:   'bg-emerald-100 text-emerald-700',
  concluido:  'bg-teal-100 text-teal-700',
};

const STATUS_OPTS = ['pendente', 'confirmado', 'liberado', 'concluido'];

export default function EmpresaProjetosPage() {
  const [patrocinios, setPatrocinios] = useState<Patrocinio[]>([]);
  const [projetos, setProjetos]       = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading]         = useState(true);
  const [busca, setBusca]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [salvando, setSalvando]       = useState(false);
  const [form, setForm]               = useState<NovoAporte>({
    empresa_nome: '', projeto_id: '', valor: '', data_aporte: '', beneficio_fiscal: '',
  });

  async function carregar() {
    if (!supabase) { setLoading(false); return; }
    const [patRes, projRes] = await Promise.all([
      supabase
        .from('manager_patrocinios')
        .select('id,projeto_id,empresa_nome,valor,data_aporte,status,beneficio_fiscal,manager_projetos(nome,modalidade,esfera,municipio,objetivo,valor_captado,valor_aprovado)')
        .order('created_at', { ascending: false }),
      supabase.from('manager_projetos').select('id,nome').order('nome'),
    ]);
    setPatrocinios((patRes.data || []) as unknown as Patrocinio[]);
    setProjetos(projRes.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = patrocinios.filter((p) => {
    const txt = `${p.manager_projetos?.nome} ${p.empresa_nome} ${p.status}`.toLowerCase();
    return txt.includes(busca.toLowerCase());
  });

  async function salvarAporte(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !form.empresa_nome || !form.projeto_id || !form.valor) return;
    setSalvando(true);
    await supabase.from('manager_patrocinios').insert({
      empresa_nome: form.empresa_nome,
      projeto_id: form.projeto_id,
      valor: Number(form.valor),
      data_aporte: form.data_aporte || null,
      beneficio_fiscal: form.beneficio_fiscal ? Number(form.beneficio_fiscal) : 0,
      status: 'pendente',
    });
    setSalvando(false);
    setShowModal(false);
    setForm({ empresa_nome: '', projeto_id: '', valor: '', data_aporte: '', beneficio_fiscal: '' });
    carregar();
  }

  async function atualizarStatus(id: string, status: string) {
    if (!supabase) return;
    await supabase.from('manager_patrocinios').update({ status }).eq('id', id);
    setPatrocinios((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
  }

  const totalAportado  = filtrados.reduce((s, p) => s + Number(p.valor || 0), 0);
  const totalBeneficio = filtrados.reduce((s, p) => s + Number(p.beneficio_fiscal || 0), 0);

  return (
    <PortalShell portal="empresa">
      <div className="space-y-6">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Empresa Apoiadora</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Projetos Apoiados</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">Aportes realizados, beneficio fiscal e impacto ESG.</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0068ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:-translate-y-0.5">
              <Plus size={16} /> Registrar Aporte
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total Aportado',   value: fmt(totalAportado)  },
              { label: 'Beneficio Fiscal', value: fmt(totalBeneficio) },
              { label: 'Projetos',         value: String(new Set(filtrados.map((p) => p.projeto_id)).size) },
            ].map((m) => (
              <div key={m.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{m.label}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{m.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FILTRO */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por projeto ou empresa..."
              value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-[1.1rem] border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-[#0068ff]" />
          </div>
          {busca && (
            <button onClick={() => setBusca('')}
              className="rounded-[1.1rem] border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
          <span className="text-xs font-black text-slate-400">{filtrados.length} aporte(s)</span>
        </div>

        {/* LISTA */}
        {loading ? (
          <p className="py-12 text-center text-sm font-bold text-slate-400">Carregando aportes...</p>
        ) : filtrados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 py-16 text-center">
            <Handshake size={32} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-black text-slate-400">Nenhum aporte encontrado.</p>
            <button onClick={() => setShowModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50">
              <Plus size={14} /> Registrar primeiro aporte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtrados.map((p) => {
              const proj = p.manager_projetos;
              const aprov = Number(proj?.valor_aprovado || 0);
              const capt  = Number(proj?.valor_captado  || 0);
              const pct   = aprov > 0 ? Math.round((capt / aprov) * 100) : 0;

              return (
                <div key={p.id} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Handshake size={22} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-950">{proj?.nome || 'Projeto'}</p>
                        <p className="mt-0.5 text-xs font-bold text-slate-500">{p.empresa_nome}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {proj?.esfera && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black capitalize text-blue-700">{proj.esfera}</span>
                          )}
                          {proj?.modalidade && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">{proj.modalidade}</span>
                          )}
                          {proj?.municipio && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">{proj.municipio}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={p.status || 'pendente'}
                        onChange={(e) => atualizarStatus(p.id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1.5 text-[10px] font-black capitalize outline-none ${STATUS_CLS[p.status || 'pendente'] || 'bg-slate-100 text-slate-500'}`}
                      >
                        {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:text-[#0068ff]">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Valor Aportado</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{fmt(Number(p.valor || 0))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Beneficio Fiscal</p>
                      <p className="mt-1 text-lg font-black text-emerald-700">{fmt(Number(p.beneficio_fiscal || 0))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Data do Aporte</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{fmtDate(p.data_aporte)}</p>
                    </div>
                  </div>

                  {aprov > 0 && (
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-[10px] font-black text-slate-400">
                        <span>Captacao do projeto</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#0068ff]' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL NOVO APORTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-950">Registrar Aporte</h2>
              <button onClick={() => setShowModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={salvarAporte} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Empresa</label>
                <input required type="text" value={form.empresa_nome}
                  onChange={(e) => setForm((f) => ({ ...f, empresa_nome: e.target.value }))}
                  placeholder="Nome da empresa patrocinadora"
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Projeto</label>
                <select required value={form.projeto_id}
                  onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]">
                  <option value="">Selecione...</option>
                  {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Valor (R$)</label>
                  <input required type="number" min="0" value={form.valor}
                    onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                    className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Beneficio Fiscal (R$)</label>
                  <input type="number" min="0" value={form.beneficio_fiscal}
                    onChange={(e) => setForm((f) => ({ ...f, beneficio_fiscal: e.target.value }))}
                    className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Data do Aporte</label>
                <input type="date" value={form.data_aporte}
                  onChange={(e) => setForm((f) => ({ ...f, data_aporte: e.target.value }))}
                  className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]" />
              </div>
              <button type="submit" disabled={salvando}
                className="mt-2 w-full rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white shadow-lg shadow-[#0068ff]/20 transition hover:bg-[#0050d0] disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Registrar Aporte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
