'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Sparkles } from 'lucide-react';
import { portalConfig, portalMenus, PortalType } from '@/lib/kanbanData';

export default function PortalShell({
  portal,
  children,
}: {
  portal: PortalType;
  children: React.ReactNode;
}) {
  const config = portalConfig[portal];
  const menu = portalMenus[portal];
  const pathname = usePathname();
  const router = useRouter();

  function sair() {
    localStorage.removeItem('incentivou_usuario');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-[#061b3a]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-[#d8e6f5] bg-white shadow-[18px_0_60px_rgba(11,31,63,0.06)] xl:flex xl:flex-col">
        <div className="flex h-24 items-center px-7">
          <Link href={config.href} className="flex items-center gap-4">
            <Image
              src="/incentivou-logo.png"
              alt="IncentiVou"
              width={220}
              height={72}
              priority
              className="h-auto w-48 object-contain"
            />
          </Link>
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-[1.6rem] border border-[#d8e6f5] bg-gradient-to-br from-white via-[#f5fbff] to-[#eafff7] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#079b6f]">
              {config.label}
            </p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-[#40516b]">
              Transformando imposto em legado.
            </p>
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
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                    active
                      ? 'bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] text-white shadow-lg shadow-emerald-600/20'
                      : 'text-[#40516b] hover:bg-[#eef7ff] hover:text-[#061b3a]'
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#e8f0f9] p-4">
          <div className="rounded-[1.6rem] bg-[#061b3a] p-4 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#16c784] text-[#061b3a]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                  Operação 360°
                </p>
                <p className="text-sm font-bold">
                  Compliance + CRM + Prestação
                </p>
              </div>
            </div>

            <button
              onClick={sair}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <main className="px-4 py-5 md:px-6 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}