import PortalShell from '@/components/PortalShell';
import { BarChart3, Download, Handshake } from 'lucide-react';

export default function EmpresaProjetosPage() {
  return <PortalShell portal="empresa">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Empresa apoiadora</p><h2 className="mt-2 text-3xl font-black text-slate-950">Projetos apoiados</h2><p className="mt-3 max-w-3xl font-semibold text-slate-600">Acompanhamento dos aportes, impacto, relatórios, comprovantes e histórico ESG.</p></section>
    <section className="mt-6 grid gap-4 md:grid-cols-3">{[['Projetos apoiados','4',Handshake],['Relatórios ESG','7',BarChart3],['Downloads','12',Download]].map(([label,value,Icon]: any) => <div key={label} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon /></div><p className="mt-5 text-sm font-black text-slate-500">{label}</p><h3 className="text-3xl font-black text-slate-950">{value}</h3></div>)}</section>
  </PortalShell>;
}
