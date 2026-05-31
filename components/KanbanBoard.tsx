'use client';

import PortalShell from '@/components/PortalShell';
import { operationalBoards, PortalType } from '@/lib/kanbanData';
import { CalendarClock, CheckCircle2, GripVertical, Plus, UserRound } from 'lucide-react';

export default function KanbanBoard({ portal }: { portal: PortalType }) {
  return (
    <PortalShell portal={portal}>
      <section className="mb-7 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Fluxos operacionais integrados</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Kanban estilo Trello</h2>
            <p className="mt-3 max-w-4xl text-base font-semibold leading-relaxed text-slate-600">Boards com responsáveis, prazos, SLAs, checklists, histórico e alertas para não esquecer etapas, proteger tecnicamente a operação e padronizar a entrega.</p>
          </div>
          <button className="inline-flex w-fit items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
            <Plus size={18} /> Novo card
          </button>
        </div>
      </section>

      <div className="space-y-8">
        {operationalBoards.map((board) => (
          <section key={board.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className={`mb-3 h-2 w-48 rounded-full bg-gradient-to-r ${board.color}`} />
                <h3 className="text-2xl font-black text-slate-950">{board.title}</h3>
                <p className="mt-1 text-sm font-bold text-slate-600">{board.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600">{board.columns.length} colunas</span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Automação ativa</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              {board.columns.map((column) => (
                <div key={column.title} className="min-h-[260px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 rounded-[1.2rem] bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black leading-snug text-slate-950">{column.title}</h4>
                      <GripVertical size={17} className="text-slate-300" />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs font-black text-slate-500">
                      <span className="inline-flex items-center gap-2"><UserRound size={14} /> {column.owner}</span>
                      <span className="inline-flex items-center gap-2"><CalendarClock size={14} /> SLA: {column.sla}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {column.cards.map((card) => (
                      <div key={card} className="rounded-[1.1rem] border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                          <p className="text-sm font-bold leading-relaxed text-slate-700">{card}</p>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PortalShell>
  );
}
