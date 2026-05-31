import PortalShell from '@/components/PortalShell';
import { Building2, Landmark, Target } from 'lucide-react';

const empresas = [
  ['Empresa Apoiadora A', 'Lucro Real', 'R$ 850 mil', 'Match alto'],
  ['Grupo Patrocinador B', 'Lei Federal', 'R$ 1,4 mi', 'Em negociação'],
  ['Indústria C', 'ESG/Comunidade', 'R$ 620 mil', 'Prospecção'],
];

export default function EmpresasPage() {
  return <PortalShell portal="admin">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">CRM de empresas</p><h2 className="mt-2 text-3xl font-black text-slate-950">Empresas apoiadoras</h2><p className="mt-3 max-w-3xl font-semibold text-slate-600">Base para simulador fiscal, marketplace, matching ESG e histórico comercial.</p></section>
    <section className="mt-6 grid gap-4 md:grid-cols-3">{empresas.map(([nome,tipo,valor,status]) => <div key={nome} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700"><Building2 /></div><h3 className="mt-4 font-black text-slate-950">{nome}</h3><p className="mt-1 text-sm font-bold text-slate-500">{tipo}</p><div className="mt-4 space-y-2 text-sm font-black"><p className="inline-flex items-center gap-2"><Landmark size={16}/>{valor}</p><p className="inline-flex items-center gap-2 text-emerald-700"><Target size={16}/>{status}</p></div></div>)}</section>
  </PortalShell>;
}
