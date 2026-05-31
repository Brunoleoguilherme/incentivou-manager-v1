import PortalShell from '@/components/PortalShell';
import { CheckCircle2, Clock, FileUp, ShieldCheck, UploadCloud } from 'lucide-react';

const checklist = [
  { item: 'Estatuto Social atualizado', status: 'Aprovado' },
  { item: 'Ata de eleição da diretoria', status: 'Pendente' },
  { item: 'Certidão Federal', status: 'Vencendo' },
  { item: 'Certidão Estadual', status: 'Aprovado' },
  { item: 'Comprovante bancário', status: 'Em análise' },
];

function statusClass(status) {
  if (status === 'Aprovado') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Vencendo') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (status === 'Pendente') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-sky-50 text-sky-700 border-sky-100';
}

export default function ExecutorCompliancePage() {
  return (
    <PortalShell portal="executor">
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                Compliance do executor
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Sua documentação técnica
              </h2>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                Envie documentos, acompanhe pendências e mantenha seu projeto apto para aprovação, captação e execução.
              </p>
            </div>

            <div className="rounded-[1.6rem] bg-[#061b3a] p-5 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-[#061b3a]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Score documental</p>
                  <p className="text-3xl font-black">76%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-emerald-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Aprovados</p>
            <p className="mt-1 text-3xl font-black text-slate-950">2</p>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Clock className="text-amber-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Em análise</p>
            <p className="mt-1 text-3xl font-black text-slate-950">1</p>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <FileUp className="text-rose-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Pendentes</p>
            <p className="mt-1 text-3xl font-black text-slate-950">2</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Checklist obrigatório</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Documentos necessários para manter o projeto em conformidade.
            </p>

            <div className="mt-5 space-y-3">
              {checklist.map((doc) => (
                <div key={doc.item} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-black text-slate-800">{doc.item}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid min-h-72 place-items-center rounded-[1.6rem] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-white">
                  <UploadCloud size={25} />
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">Enviar documento</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                  Área preparada para upload via Supabase Storage no próximo passo.
                </p>
                <button className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
                  Selecionar arquivo
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </PortalShell>
  );
}