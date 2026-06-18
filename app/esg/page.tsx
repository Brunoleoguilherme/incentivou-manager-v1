'use client';
import { useEffect, useState } from 'react';
import { BarChart3, Leaf, Target, Users } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

export default function ESGPage() {
  const [benes, setBenes] = useState(0);
  const [projs, setProjs] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('manager_beneficiarios').select('id', { count: 'exact', head: true }).then(r => setBenes(r.count || 0));
    supabase.from('manager_projetos').select('id', { count: 'exact', head: true }).then(r => setProjs(r.count || 0));
  }, []);

  const ODS = [
    { num: 3,  label: 'Saúde e bem-estar',           cor: 'bg-green-100 text-green-800'  },
    { num: 4,  label: 'Educação de qualidade',        cor: 'bg-red-100 text-red-800'      },
    { num: 10, label: 'Redução das desigualdades',    cor: 'bg-pink-100 text-pink-800'    },
    { num: 11, label: 'Cidades sustentáveis',         cor: 'bg-orange-100 text-orange-800'},
    { num: 16, label: 'Paz e instituições',           cor: 'bg-blue-100 text-blue-800'    },
    { num: 17, label: 'Parcerias e meios',            cor: 'bg-indigo-100 text-indigo-800'},
  ];

  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Impacto Social</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">ESG e Impacto</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Indicadores sociais, ODS vinculados, beneficiários e relatórios para empresas apoiadoras.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Beneficiários', value: String(benes), icon: <Users size={18}/>, cor: 'text-blue-600'   },
              { label: 'Projetos ESG',  value: String(projs), icon: <BarChart3 size={18}/>, cor: 'text-emerald-600' },
              { label: 'ODS ativos',    value: '6',           icon: <Target size={18}/>, cor: 'text-violet-600' },
              { label: 'Relatórios',    value: '—',           icon: <Leaf size={18}/>,   cor: 'text-teal-600'   },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-white ${m.cor}`}>{m.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{m.label}</p>
                  <p className={`text-xl font-black ${m.cor}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">ODS Vinculados</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ODS.map(o => (
              <div key={o.num} className={`flex items-center gap-3 rounded-[1.2rem] border p-4 ${o.cor.replace('text-','border-').replace('-800','-200').replace('-100','50')} ${o.cor.split(' ')[0]}`}>
                <span className={`text-2xl font-black ${o.cor.split(' ')[1]}`}>{o.num}</span>
                <p className={`text-sm font-black ${o.cor.split(' ')[1]}`}>{o.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
          <BarChart3 size={32} className="mx-auto text-slate-300"/>
          <p className="mt-3 text-sm font-black text-slate-400">Relatórios ESG e mapa de impacto em desenvolvimento</p>
          <p className="mt-1 text-xs font-bold text-slate-300">Disponível na próxima fase</p>
        </section>
      </div>
    </PortalShell>
  );
}
