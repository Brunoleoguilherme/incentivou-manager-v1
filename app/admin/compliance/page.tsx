import PortalShell from '@/components/PortalShell';
import { AlertTriangle, CheckCircle2, Clock, FileCheck2, FileText, ShieldCheck } from 'lucide-react';

const documentos = [
  { nome: 'Estatuto Social', projeto: 'Instituto Esporte Futuro', status: 'Aprovado', prazo: 'Válido', risco: 'baixo' },
  { nome: 'Certidão Federal', projeto: 'BH Esporte Social', status: 'Vencendo', prazo: '7 dias', risco: 'medio' },
  { nome: 'Ata de Eleição', projeto: 'Clube Formação Olímpica', status: 'Pendente', prazo: 'Aguardando', risco: 'alto' },
  { nome: 'Comprovante Bancário', projeto: 'Projeto Quadra Viva', status: 'Em análise', prazo: '2 dias', risco: 'medio' },
];

const pendencias = [
  '3 projetos com documentos pendentes',
  '1 certidão vence nos próximos 7 dias',
  '2 documentos aguardando validação técnica',
  '1 projeto com risco documental alto',
];

function statusClass(status: string) {
  if (status === 'Aprovado') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Vencendo') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (status === 'Pendente') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-sky-50 text-sky-700 border-sky-100';
}

export default function AdminCompliancePage() {
  return (
    <PortalShell portal="admin">
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                Compliance documental
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Central de validação técnica
              </h2>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                Acompanhe documentos, certidões, pendências, riscos e validações dos projetos em andamento.
              </p>
            </div>

            <div className="rounded-[1.6rem] bg-[#061b3a] p-5 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-[#061b3a]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Score geral</p>
                  <p className="text-3xl font-black">84%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <FileCheck2 className="text-emerald-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Documentos aprovados</p>
            <p className="mt-1 text-3xl font-black text-slate-950">18</p>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Clock className="text-amber-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Em análise</p>
            <p className="mt-1 text-3xl font-black text-slate-950">6</p>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <AlertTriangle className="text-rose-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Pendências críticas</p>
            <p className="mt-1 text-3xl font-black text-slate-950">4</p>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="text-sky-600" />
            <p className="mt-4 text-sm font-bold text-slate-500">Projetos monitorados</p>
            <p className="mt-1 text-3xl font-black text-slate-950">12</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">Documentos em acompanhamento</h3>
                <p className="text-sm font-medium text-slate-500">Fila de validação técnica dos projetos.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Documento</th>
                    <th className="px-5 py-4">Projeto</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documentos.map((doc) => (
                    <tr key={`${doc.nome}-${doc.projeto}`} className="bg-white">
                      <td className="px-5 py-4 font-black text-slate-900">{doc.nome}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{doc.projeto}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-600">{doc.prazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Pendências prioritárias</h3>
            <div className="mt-5 space-y-3">
              {pendencias.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <AlertTriangle size={18} className="mt-0.5 text-amber-600" />
                  <p className="text-sm font-bold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </PortalShell>
  );
}