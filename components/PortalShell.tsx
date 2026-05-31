'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, Sparkles } from 'lucide-react';
import { portalConfig, portalMenus, PortalType } from '@/lib/kanbanData';

export default function PortalShell({ portal, children }: { portal: PortalType; children: React.ReactNode }) {
  const config = portalConfig[portal];
  const menu = portalMenus[portal];
  const pathname = usePathname();
  const router = useRouter();

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-950">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200/80 bg-white/95 shadow-[18px_0_60px_rgba(15,23,42,0.05)] backdrop-blur xl:flex xl:flex-col">
        <div className="flex h-28 items-center border-b border-slate-100 px-7">
          <Link href={config.href} className="flex items-center gap-4">
            <Image src="/incentivou-logo.png" alt="IncentiVou" width={172} height={62} priority className="h-auto w-44 object-contain" />
          </Link>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-[1.6rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">{config.label}</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">Transformando imposto em legado.</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-5">
          <div className="space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-650 hover:bg-slate-100 hover:text-emerald-700'}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-[1.6rem] bg-[#061b3a] p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-[#061b3a]"><Sparkles size={18} /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Operação 360°</p>
                <p className="text-sm font-bold">Compliance + CRM + Prestação</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 px-5 py-4 backdrop-blur-xl lg:px-9">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white xl:hidden"><Menu size={20} /></button>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{config.label}</p>
                <h1 className="text-xl font-black text-slate-950 md:text-2xl">IncentiVou Manager</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm md:block">
                <p className="text-sm font-black text-slate-900">{config.userName}</p>
                <p className="text-xs font-bold text-slate-500">{config.badge}</p>
              </div>
              <button onClick={sair} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-7 lg:px-9 xl:px-12">{children}</main>
      </div>
    </div>
  );
}
