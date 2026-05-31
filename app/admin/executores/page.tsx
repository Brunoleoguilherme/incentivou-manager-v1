import PortalShell from '@/components/PortalShell';
import { UserRound, ShieldCheck, Mail, MoreHorizontal } from 'lucide-react';

const executores = [
  ['Ester', 'Gestora de Projetos', '12 projetos', 'Ativo'],
  ['Equipe Técnica', 'Redação e enquadramento', '8 projetos', 'Ativo'],
  ['Compliance', 'Checklist legal', '6 alertas', 'Atenção'],
];

export default function ExecutoresPage() {
  return <PortalShell portal="admin">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Administração</p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">Executores e responsáveis</h2>
      <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-slate-600">Controle de usuários internos, responsáveis por etapa, permissões e carga operacional por projeto.</p>
    </section>
    <section className="mt-6 grid gap-4">
      {executores.map(([nome, cargo, projetos, status]) => <div key={nome} className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><UserRound /></div><div><h3 className="text-lg font-black text-slate-950">{nome}</h3><p className="text-sm font-bold text-slate-500">{cargo}</p></div></div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-black"><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"><ShieldCheck size={16}/>{projetos}</span><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700"><Mail size={16}/>{status}</span><button className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100"><MoreHorizontal size={18}/></button></div>
      </div>)}
    </section>
  </PortalShell>;
}
