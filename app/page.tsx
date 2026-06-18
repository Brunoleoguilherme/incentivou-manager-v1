import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, ShieldCheck, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f5f9ff] px-4 py-4 text-[#061b3a] md:flex md:items-center md:justify-center md:px-6 md:py-0">
      <Image
  src="/bg-acesso2.png"
  alt=""
  fill
  priority
className="object-cover opacity-200"
/>

      <div className="absolute inset-0 bg-white/00" />
      
<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.55)_45%,rgba(245,249,255,0.30)_100%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-start py-3 min-h-screen md:h-screen md:justify-center md:py-0 md:-translate-y-8">
        <div className="flex justify-center -mb-3 md:-mb-10">
          <Image
            src="/incentivou-logo.png"
            alt="IncentiVou"
            width={420}
            height={120}
            priority
            className="h-auto w-[190px] object-contain drop-shadow-[0_18px_40px_rgba(6,27,58,0.12)] md:w-[430px]"
          />
        </div>

        <section className="-mt-15 text-center md:-mt -2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#16c784] md:text-[18px]">
           
          </p>

          <h1 className="mx-auto mt-10
           max-w-4xl text-3xl font-black leading-tight tracking-[-0.06em] text-[#061b3a] md:text-4xl">
            Escolha seu portal
          </h1>

          <p className="mx-auto mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-[#40516b] md:text-base">
            Acesse o ambiente correto para gerenciar projetos, captação,
            execução e prestação de contas.
          </p>
        </section>

        <section className="mt-4 grid gap-3 md:mt-3 md:grid-cols-3 md:gap-4">
          <PortalCard
            href="/login?portal=admin"
            icon={<ShieldCheck size={25} />}
            title="Admin"
            description="Colaborades IncentiVou."
          />

          <PortalCard
            href="/login?portal=executor"
            icon={<Users size={25} />}
            title="Executores"
            description="Executores, Proponentes."
          />

          <PortalCard
            href="/login?portal=empresa"
            icon={<Building2 size={25} />}
            title="Empresas"
            description="Empresas beneficiárias."
          />
        </section>

        <p className="mt-2 text-center text-xs font-bold text-[#40516b]">
          Segurança, transparência e impacto real para o esporte e a sociedade.
        </p>
      </div>
    </main>
  );
}

function PortalCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[180px] flex-col rounded-[1.45rem] border border-white bg-white/92 p-4 md:p-6 shadow-[0_20px_55px_rgba(6,27,58,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#16c784]/60 hover:shadow-[0_26px_75px_rgba(22,199,132,0.18)] md:min-h-[225px] md:p-6"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#16c784]/20 bg-[#e9fff7] text-[#16c784] shadow-[0_14px_30px_rgba(22,199,132,0.13)] transition group-hover:bg-[#16c784] group-hover:text-white md:h-13 md:w-13">
        {icon}
      </div>

      <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#061b3a]">
        {title}
      </h2>

      <p className="mt-2 min-h-[42px] text-sm font-semibold leading-relaxed text-[#40516b] md:min-h-[50px]">
        {description}
      </p>

      <div className="mt-auto flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(19,184,166,0.25)] transition group-hover:scale-[1.01] md:h-12">
        Acessar portal
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/18 text-white md:h-8 md:w-8">
          <ArrowRight size={17} />
        </span>
      </div>
    </Link>
  );
}