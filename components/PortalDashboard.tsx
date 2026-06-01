'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { adminMetrics, alerts, empresaMetrics, executorMetrics, operationalBoards, portalConfig, PortalType } from '@/lib/kanbanData';

const metricsByPortal = {
  admin: adminMetrics,
  executor: executorMetrics,
  empresa: empresaMetrics,
};

export default function PortalDashboard({ portal }: { portal: PortalType }) {
  const config = portalConfig[portal];
  const metrics = metricsByPortal[portal];
  const kanbanHref = portal === 'empresa' ? '/marketplace' : `/${portal}/kanban`;

  return (
    <PortalShell portal={portal}>
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_18%_20%,rgba(64,184,106,.18),transparent_28%),linear-gradient(135deg,#ffffff_0%,#eef7ff_100%)] p-6 md:p-9 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700 shadow-sm">
              Gestão SaaS/GovTech Premium
            </div>
            <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">{config.headline}</h2>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-600 md:text-lg">{config.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={kanbanHref} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5">
                Ver operação <ArrowRight size={18} />
              </Link>
              <Link href="/simulador" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5">
                Simular incentivo
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Status geral</p>
                <h3 className="text-2xl font-black text-slate-950">Operação saudável</h3>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={26} /></div>
            </div>
            <div className="mt-5 space-y-4">
              {['Diagnóstico e compliance conectados', 'Kanban com responsáveis e SLAs', 'Histórico e alertas por projeto'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <Clock3 size={18} className="text-emerald-600" />
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={23} /></div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Live</span>
              </div>
              <p className="text-sm font-black text-slate-500">{metric.label}</p>
              <h3 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">{metric.value}</h3>
              <p className="mt-2 text-sm font-bold text-emerald-700">{metric.change}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700"></p>
              <h3 className="text-2xl font-black text-slate-950">Boards integrados</h3>
            </div>
            <Link href={kanbanHref} className="text-sm font-black text-emerald-700">Abrir board</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operationalBoards.slice(0, portal === 'empresa' ? 3 : 5).map((board) => (
              <div key={board.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${board.color}`} />
                <h4 className="text-lg font-black text-slate-950">{board.title}</h4>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{board.subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <span>{board.columns.length} etapas</span>
                  <span>SLA ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Alertas inteligentes</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">Prioridades</h3>
          <div className="mt-5 space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.title} className="rounded-[1.3rem] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm"><Icon size={18} /></div>
                    <div>
                      <h4 className="font-black text-slate-950">{alert.title}</h4>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{alert.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </PortalShell>
  );
}
