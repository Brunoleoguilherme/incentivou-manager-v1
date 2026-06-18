'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, FileText, Mail, MoreHorizontal,
  Plus, Search, ShieldAlert, UserRound, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Executor = {
  id: string;
  nome: string;
  email: string;
  status: string;
  created_at: string | null;
  projetos?: number;
};

function statusCls(s: string) {
  if (s === 'ativo')    return 'bg-emerald-50 text-emerald-700';
  if (s === 'pendente') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-600';
}

export default function AdminExecutoresPage() {
  const [executores, setExecutores] = useState<Executor[]>([]);
  const [contagens, setContagens]   = useState<Record<string, number>>({});
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState('');
  const [detalhe, setDetalhe]       = useState<Executor | null>(null);

  async function carregar() {
    if (!supabase) return;
    setLoading(true);

    // Busca executores
    const { data: execs } = await supabase
      .from('manager_usuarios')
      .select('id,nome,email,status,created_at')
      .eq('perfil', 'executor')
      .order('nome');

    if (!execs) { setLoading(false); return; }
    setExecutores(execs as Executor[]);

    // Conta projetos por executor
    const { data: projetos } = await supabase
      .from('manager_projetos')
      .select('usuario_id')
      .not('usuario_id', 'is', null);

    if (projetos) {
      const map: Record<string, number> = {};
      for (const p of projetos) {
        if (p.usuario_id) map[p.usuario_id] = (map[p.usuario_id] || 0) + 1;
      }
      setContagens(map);
    }

    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() =>
    executores.filter(e =>
      `${e.nome} ${e.email}`.toLowerCase().includes(busca.toLowerCase())
    ), [executores, busca]);

  const kpis = useMemo(() => ({
    total:    executores.length,
    ativos:   executores.filter(e => e.status === 'ativo').length,
    projetos: Object.values(contagens).reduce((s, v) => s + v, 0),
  }), [executores, contagens]);

  return (
    <PortalShell>
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Executores</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Usuários com perfil executor — gestão de acessos e carga operacional por projeto.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total de executores', value: kpis.total,    color: 'text-slate-800',   bg: 'bg-slate-100' },
              { label: 'Ativos',              value: kpis.ativos,   color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Projetos vinculados', value: kpis.projetos, color: 'text-blue-700',    bg: 'bg-blue-50' },
            ].map(k => (
              <div key={k.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{k.label}</p>
                <p className={`mt-2 text-3xl font-black ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar executor..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none focus:border-[#0068ff]"
              />
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">Carregando executores...</p>
          ) : filtrados.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 py-14 text-center">
              <UserRound size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-black text-slate-400">Nenhum executor encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtrados.map(exec => {
                const nProjetos = contagens[exec.id] || 0;
                return (
                  <div
                    key={exec.id}
                    className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    {/* avatar + info */}
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0068ff]/10 text-[#0068ff]">
                        <UserRound size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-950">{exec.nome}</h3>
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                          <Mail size={13} /> {exec.email}
                        </p>
                      </div>
                    </div>

                    {/* badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                        <FileText size={14} /> {nProjetos} projeto{nProjetos !== 1 ? 's' : ''}
                      </span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${statusCls(exec.status)}`}>
                        <CheckCircle2 size={14} /> {exec.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetalhe(exec)}
                        className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MODAL DETALHE */}
        {detalhe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0068ff]">Executor</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">{detalhe.nome}</h2>
                </div>
                <button type="button" onClick={() => setDetalhe(null)} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <Mail size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-700">{detalhe.email}</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <FileText size={16} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-700">{contagens[detalhe.id] || 0} projeto(s) vinculado(s)</p>
                </div>
                <div className={`flex items-center gap-3 rounded-2xl p-4 ${statusCls(detalhe.status)}`}>
                  <CheckCircle2 size={16} />
                  <p className="text-sm font-bold capitalize">{detalhe.status}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetalhe(null)}
                className="mt-5 w-full rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

      </div>
    </PortalShell>
  );
}
