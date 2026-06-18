'use client';
import { FileCheck, FileText, Scale, Shield } from 'lucide-react';
import PortalShell from '@/components/PortalShell';

const DOCS = [
  { titulo:'Contrato de Patrocínio Esportivo',  tipo:'Contrato',    status:'Modelo disponível', cor:'text-blue-700 bg-blue-50'    },
  { titulo:'Termo de Cooperação Técnica',        tipo:'Termo',       status:'Modelo disponível', cor:'text-emerald-700 bg-emerald-50'},
  { titulo:'Procuração para captação',           tipo:'Procuração',  status:'Modelo disponível', cor:'text-violet-700 bg-violet-50' },
  { titulo:'LGPD — Política de privacidade',     tipo:'LGPD',        status:'Modelo disponível', cor:'text-amber-700 bg-amber-50'   },
  { titulo:'Termo de Uso da Plataforma',         tipo:'Termo',       status:'Modelo disponível', cor:'text-teal-700 bg-teal-50'     },
  { titulo:'Acordo de Confidencialidade (NDA)',  tipo:'Contrato',    status:'Modelo disponível', cor:'text-rose-700 bg-rose-50'     },
  { titulo:'Relatório de Conformidade Legal',    tipo:'Relatório',   status:'Em desenvolvimento', cor:'text-slate-500 bg-slate-100'  },
  { titulo:'Assinatura digital ZapSign',         tipo:'Integração',  status:'Em desenvolvimento', cor:'text-slate-500 bg-slate-100'  },
];

export default function JuridicoPage() {
  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Jurídico</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Contratos, termos, LGPD e modelos jurídicos para projetos esportivos.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label:'Contratos',   value:'6',  icon:<FileText size={18}/>,  cor:'text-blue-600 bg-blue-50'    },
              { label:'Modelos',     value:'8',  icon:<FileCheck size={18}/>, cor:'text-emerald-600 bg-emerald-50'},
              { label:'Conformidade',value:'LGPD',icon:<Shield size={18}/>,  cor:'text-violet-600 bg-violet-50' },
            ].map(k=>(
              <div key={k.label} className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.cor.split(' ')[1]}`}>
                  <span className={k.cor.split(' ')[0]}>{k.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{k.label}</p>
                  <p className="text-xl font-black text-slate-950">{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Documentos e modelos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {DOCS.map(d=>(
              <div key={d.titulo} className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${d.cor.split(' ')[1]}`}>
                    <Scale size={16} className={d.cor.split(' ')[0]}/>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{d.titulo}</p>
                    <p className="text-xs font-bold text-slate-400">{d.tipo}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${d.status==='Modelo disponível' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {d.status==='Modelo disponível' ? 'Disponível' : 'Em breve'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
