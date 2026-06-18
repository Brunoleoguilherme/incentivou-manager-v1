import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  ShieldCheck,
  ClipboardCheck,
  Wallet,
  FolderDown,
  GraduationCap,
  Store,
  FileText,
  Settings,
  Scale,
  BarChart3,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projetos", href: "/projetos", icon: FileText },
  { label: "Proponentes", href: "/proponentes", icon: Users },
  { label: "Patrocinadores", href: "/patrocinadores", icon: Building2 },
  { label: "Captação Inteligente", href: "/captacao", icon: Target },
  { label: "Execução Segura", href: "/execucao", icon: ShieldCheck },
  { label: "Prestação de Contas", href: "/prestacao", icon: ClipboardCheck },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Modelos e Downloads", href: "/documentos", icon: FolderDown },
  { label: "IncentiVou Academy", href: "/academy", icon: GraduationCap },
  {
  label: 'Documentos',
  href: '/executor/documentos',
  icon: FileText,
},
{
  label: 'Execução Segura',
  href: '/executor/execucao',
  icon: ShieldCheck,
},
  { label: "Marketplace", href: "/empresa/marketplace", icon: Store },
  { label: "ESG e Impacto", href: "/esg", icon: BarChart3 },
  { label: "Jurídico", href: "/juridico", icon: Scale },
  { label: "Relatórios", href: "/admin/relatorios", icon: FileText },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-28 items-center justify-center border-b border-slate-100 px-6">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image
              src="/incentivou-logo.png"
              alt="IncentiVou"
              width={190}
              height={80}
              priority
              className="h-auto w-44 object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              IncentiVou
            </p>
            <p className="mt-1 text-sm font-semibold">
              Transformando imposto em legado.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-700">
              Transformando imposto em legado
            </p>
            <h1 className="text-2xl font-black text-slate-950">
              Sistema IncentiVou
            </h1>
          </div>
        </header>

        <main className="min-h-screen px-5 py-8 lg:px-10 xl:px-14">
          {children}
        </main>
      </div>
    </div>
  );
}