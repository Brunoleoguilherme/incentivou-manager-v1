'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Target, TrendingUp } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

const fmt = (v:number) =>
  new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(v);

export default function CaptacaoPage() {
  const [projs, setProjs] = useState<any[]>([]);
  const [pats,  setPats]  = useState<any[]>([]);
  const [load,  setLoad]  = useState(true);

  useEffect(()=>{
    if(!supabase){setLoad(false);return;}
    Promise.all([
      supabase.from('manager_projetos').select('id,nome,valor_aprovado,valor_captado,status').order('nome'),
      supabase.from('manager_patrocinios').select('id,empresa_nome,valor,status,projeto_id').order('created_at',{ascending:false}).limit(10),
    ]).then(([pRes,aRes])=>{
      setProjs(pRes.data||[]);
      setPats(aRes.data||[]);
      setLoad(false);
    });
  },[]);

  const totalAprov = projs.reduce((s,p)=>s+Number(p.valor_aprovado||0),0);
  const totalCapt  = projs.reduce((s,p)=>s+Number(p.valor_captado||0),0);
  const pct        = totalAprov > 0 ? Math.round((totalCapt/totalAprov)*100) : 0;

  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Captação Inteligente</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Pipeline de captação, aportes e patrocinadores por projeto.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label:'Valor aprovado', value:fmt(totalAprov), icon:<Target size={18}/>,   cor:'text-blue-600 bg-blue-50'    },
              { label:'Valor captado',  value:fmt(totalCapt),  icon:<TrendingUp size={18}/>,cor:'text-emerald-600 bg-emerald-50'},
              { label:'% captado',      value:`${pct}%`,       icon:<Building2 size={18}/>, cor:'text-violet-600 bg-violet-50' },
            ].map(k=>(
              <div key={k.label} className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.cor.split(' ')[1]}`}>
                  <span className={k.cor.split(' ')[0]}>{k.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{k.label}</p>
                  <p className={`text-xl font-black ${k.cor.split(' ')[0]}`}>{load?'...':k.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-slate-950">Captação por projeto</h2>
              <Link href="/executor/projetos" className="text-xs font-black text-[#0068ff] hover:underline flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link>
            </div>
            {load ? <p className="py-4 text-center text-sm font-bold text-slate-400">Carregando...</p> : (
              <div className="space-y-3">
                {projs.map(p=>{
                  const aprov = Number(p.valor_aprovado||0);
                  const capt  = Number(p.valor_captado||0);
                  const pctP  = aprov > 0 ? Math.min(100, Math.round((capt/aprov)*100)) : 0;
                  return (
                    <div key={p.id}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span className="truncate text-slate-950">{p.nome}</span>
                        <span className="ml-2 shrink-0 text-slate-500">{pctP}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full transition-all ${pctP>=80?'bg-emerald-500':pctP>=40?'bg-blue-500':'bg-amber-400'}`}
                          style={{width:`${pctP}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-slate-950">Últimos aportes</h2>
              <Link href="/empresa/projetos" className="text-xs font-black text-[#0068ff] hover:underline flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link>
            </div>
            {load ? <p className="py-4 text-center text-sm font-bold text-slate-400">Carregando...</p> :
             pats.length === 0 ? <p className="py-4 text-center text-sm font-bold text-slate-400">Nenhum aporte registrado.</p> : (
              <div className="space-y-2">
                {pats.map(a=>(
                  <div key={a.id} className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-black text-slate-950">{a.empresa_nome}</p>
                      <p className="text-xs font-bold text-slate-400">{a.status}</p>
                    </div>
                    <span className="font-black text-emerald-700">{fmt(Number(a.valor||0))}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
