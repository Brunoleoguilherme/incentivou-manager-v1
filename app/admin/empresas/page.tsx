'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2, CheckCircle2, Leaf, Mail,
  MoreHorizontal, Search, Target, X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Empresa = {
  id: string;
  nome: string;
  email: string;
  status: string;
  created_at: string | null;
};

type Perfil = {
  faixa_valor: string | null;
  tipos_projeto: string[] | null;
  ods: number[] | null;
  estados: string[] | null;
};

function statusCls(s: string) {
  if (s === 'ativo')    return 'bg-emerald-50 text-emerald-700';
  if (s === 'pendente') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-600';
}

function faixaLabel(f?: string | null) {
  const m: Record<string, string> = {
    ate_100k: 'Até R$ 100 mil', '100k_500k': 'R$ 100–500 mil',
    '500k_1m': 'R$ 500 mil–1 mi', acima_1m: 'Acima de R$ 1 mi',
  };
  return f ? (m[f] || f) : '—';
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas]   = useState<Empresa[]>([]);
  const [perfis, setPerfis]       = useState<Record<string, Perfil>>({});
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [detalhe, setDetalhe]     = useState<Empresa | null>(null);

  async function carregar() {
    if (!supabase) return;
    setLoading(true);

    const { data: emps } = await supabase
      .from('manager_usuarios')
      .select('id,nome,email,status,created_at')
      .eq('perfil', 'empresa')
      .order('nome');

    if (!emps) { setLoading(false); return; }
    setEmpresas(emps as Empresa[]);

    // Busca perfis ESG/preferências
    const emails = emps.map(e => e.email);
    if (emails.length > 0) {
      const { data: prefs } = await supabase
        .from('manager_empresa_perfil')
        .select('empresa_email,faixa_valor,tipos_projeto,ods,estados')
        .in('empresa_email', emails);

      if (prefs) {
        const map: Record<string, Perfil> = {};
        for (const p of prefs) map[p.empresa_email] = p;
        setPerfis(map);
      }
    }

    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtradas = useMemo(() =>
    empresas.filter(e =>
      `${e.nome} ${e.email}`.toLowerCase().includes(busca.toLowerCase())
    ), [empresas, busca]);

  const kpis = useMemo(() => ({
    total:      empresas.length,
    ativas:     empresas.filter(e => e.status === 'ativo').length,
    comPerfil:  empresas.filter(e => perfis[e.email]).length,
  }), [empresas, perfis]);

  return (
    <PortalShell>
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Empresas apoiadoras</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Base de empresas cadastradas — perfil fiscal, preferências ESG e histórico de apoio.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total de empresas', value: kpis.total,     color: 'text-slate-800' },
              { label: 'Ativas',            value: kpis.ativas,    color: 'text-emerald-700' },
              { label: 'Com perfil ESG',    value: kpis.comPerfil, color: 'text-violet-700' },
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
          <div className="mb-5 relative w-full md:max-w-sm">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar empresa..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none focus:border-[#0068ff]"
            />
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">Carregando empresas...</p>
          ) : filtradas.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 py-14 text-center">
              <Building2 size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-black text-slate-400">Nenhuma empresa encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtradas.map(emp => {
                const perfil = perfis[emp.email];
                return (
                  <div
                    key={emp.id}
                    className="group rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0068ff]/10 text-[#0068ff]">
                        <Building2 size={22} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusCls(emp.status)}`}>
                          {emp.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDetalhe(emp)}
                          className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-4 font-black text-slate-950">{emp.nome}</h3>
                    <p className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-500">
                      <Mail size={12} /> {emp.email}
                    </p>

                    <div className="mt-4 space-y-2">
                      {perfil ? (
                        <>
                          {perfil.faixa_valor && (
                            <p className="flex items-center gap-2 text-xs font-bold text-blue-700">
                              <Target size={13} /> {faixaLabel(perfil.faixa_valor)}
                            </p>
                          )}
                          {perfil.tipos_projeto && perfil.tipos_projeto.length > 0 && (
                            <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              {perfil.tipos_projeto.slice(0, 2).join(', ')}
                              {perfil.tipos_projeto.length > 2 && ` +${perfil.tipos_projeto.length - 2}`}
                            </p>
                          )}
                          {perfil.ods && perfil.ods.length > 0 && (
                            <p className="flex items-center gap-2 text-xs font-bold text-violet-700">
                              <Leaf size={13} /> {perfil.ods.length} ODS monitorado{perfil.ods.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 italic">Perfil ESG não preenchido</p>
                      )}
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
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0068ff]">Empresa</p>
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
                <div className={`flex items-center gap-3 rounded-2xl p-4 ${statusCls(detalhe.status)}`}>
                  <CheckCircle2 size={16} />
                  <p className="text-sm font-bold capitalize">{detalhe.status}</p>
                </div>
                {perfis[detalhe.email] ? (
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Perfil ESG</p>
                    <p className="text-sm font-bold text-slate-700">
                      Faixa: <span className="text-blue-700">{faixaLabel(perfis[detalhe.email].faixa_valor)}</span>
                    </p>
                    {perfis[detalhe.email].tipos_projeto?.length ? (
                      <p className="text-sm font-bold text-slate-700">
                        Tipos: <span className="text-emerald-700">{perfis[detalhe.email].tipos_projeto!.join(', ')}</span>
                      </p>
                    ) : null}
                    {perfis[detalhe.email].ods?.length ? (
                      <p className="text-sm font-bold text-slate-700">
                        ODS: <span className="text-violet-700">{perfis[detalhe.email].ods!.map(o => `ODS ${o}`).join(', ')}</span>
                      </p>
                    ) : null}
                    {perfis[detalhe.email].estados?.length ? (
                      <p className="text-sm font-bold text-slate-700">
                        Estados: <span className="text-slate-600">{perfis[detalhe.email].estados!.join(', ')}</span>
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
                    Empresa ainda não preencheu o perfil ESG.
                  </p>
                )}
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
