'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, BarChart3, Building2, ClipboardCheck,
  FileText, GraduationCap, Scale, ShieldCheck, ShoppingCart,
  Target, Trophy, UploadCloud, Users, Wallet,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type KPI = { label: string; value: string; sub?: string; cor: string };

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

const MODULOS = [
  { label: 'Projetos',            href: '/executor/projetos',      icon: FileText,      cor: 'bg-blue-50 text-blue-700',     bordaCor: 'border-blue-200'    },
  { label: 'Proponentes',         href: '/proponentes',            icon: Users,         cor: 'bg-violet-50 text-violet-700', bordaCor: 'border-violet-200'  },
  { label: 'Patrocinadores',      href: '/empresa',                icon: Building2,     cor: 'bg-purple-50 text-purple-700', bordaCor: 'border-purple-200'  },
  { label: 'Captação',            href: '/captacao',               icon: Target,        cor: 'bg-orange-50 text-orange-700', bordaCor: 'border-orange-200'  },
  { label: 'Execução Segura',     href: '/executor/execucao',      icon: ShieldCheck,   cor: 'bg-emerald-50 text-emerald-700', bordaCor: 'border-emerald-200'},
  { label: 'Prestação de Contas', href: '/executor/prestacao-contas',       icon: ClipboardCheck,cor: 'bg-teal-50 text-teal-700',     bordaCor: 'border-teal-200'    },
  { label: 'Financeiro',          href: '/financeiro',             icon: Wallet,        cor: 'bg-yellow-50 text-yellow-700', bordaCor: 'border-yellow-200'  },
  { label: 'Downloads',           href: '/documentos',             icon: UploadCloud,   cor: 'bg-pink-50 text-pink-700',     bordaCor: 'border-pink-200'    },
  { label: 'Academy',             href: '/academy',                icon: GraduationCap, cor: 'bg-indigo-50 text-indigo-700', bordaCor: 'border-indigo-200'  },
  { label: 'Marketplace',         href: '/empresa/marketplace',            icon: ShoppingCart,  cor: 'bg-lime-50 text-lime-700',     bordaCor: 'border-lime-200'    },
  { label: 'ESG e Impacto',       href: '/esg',                    icon: BarChart3,     cor: 'bg-green-50 text-green-700',   bordaCor: 'border-green-200'   },
  { label: 'Jurídico',            href: '/juridico',               icon: Scale,         cor: 'bg-rose-50 text-rose-700',     bordaCor: 'border-rose-200'    },
];

export default function DashboardPage() {
  const [kpis, setKpis]       = useState<KPI[]>([]);
  const [alertas, setAlertas] = useState<{ id: string; nome: string; dias: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    Promise.all([
      supabase.from('manager_projetos').select('id,nome,valor_aprovado,valor_captado,proximo_prazo,status'),
      supabase.from('manager_beneficiarios').select('id', { count: 'exact', head: true }),
      supabase.from('manager_patrocinios').select('valor', { count: 'exact' }),
    ]).then(([projRes, beneRes, patrRes]) => {
      const projs   = projRes.data || [];
      const total   = projs.length;
      const aprov   = projs.reduce((s, p) => s + Number(p.valor_aprovado || 0), 0);
      const capt    = projs.reduce((s, p) => s + Number(p.valor_captado  || 0), 0);
      const benes   = beneRes.count || 0;

      setKpis([
        { label: 'Projetos ativos',    value: String(total),    sub: 'cadastrados',   cor: 'text-[#0068ff]'  },
        { label: 'Valor aprovado',     value: fmt(aprov),       sub: 'total portfólio',cor: 'text-emerald-600'},
        { label: 'Captado',            value: fmt(capt),        sub: 'realizado',      cor: 'text-teal-600'   },
        { label: 'Beneficiários',      value: String(benes),    sub: 'cadastrados',    cor: 'text-violet-600' },
      ]);

      const hoje = Date.now();
      const urgentes = projs
        .filter((p) => p.proximo_prazo)
        .map((p) => ({ id: p.id, nome: p.nome, dias: Math.ceil((new Date(p.proximo_prazo!).getTime() - hoje) / 86400000) }))
        .filter((p) => p.dias <= 15 && p.dias >= 0)
        .sort((a, b) => a.dias - b.dias)
        .slice(0, 5);
      setAlertas(urgentes);
      setLoading(false);
    });
  }, []);

  return (
    <PortalShell portal="admin">
      <div className="space-y-7">

        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#061b3a] to-[#0068ff] p-8 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
              <Trophy size={22}/>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/60">Sistema IncentiVou</p>
              <h1 className="text-2xl font-black tracking-[-0.03em]">Painel Administrativo</h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm font-bold text-white/70">
            Visão geral de todos os projetos, captações, execuções e prestações de contas em tempo real.
          </p>

          {/* KPIs */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-[1.3rem] bg-white/10"/>
                ))
              : kpis.map((k) => (
                  <div key={k.label} className="rounded-[1.3rem] bg-white/10 px-5 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">{k.label}</p>
                    <p className="mt-1 text-2xl font-black text-white">{k.value}</p>
                    {k.sub && <p className="text-[11px] font-bold text-white/40">{k.sub}</p>}
                  </div>
                ))}
          </div>
        </section>

        {/* ALERTAS DE PRAZO */}
        {alertas.length > 0 && (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-600"/>
              <h2 className="font-black text-amber-900">Prazos nos próximos 15 dias</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {alertas.map((a) => (
                <Link key={a.id} href={`/executor/projetos/${a.id}`}
                  className="flex items-center justify-between rounded-[1.2rem] border border-amber-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
                  <p className="truncate text-sm font-black text-slate-950">{a.nome}</p>
                  <span className={`ml-3 shrink-0 rounded-xl px-3 py-1 text-xs font-black ${a.dias <= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.dias}d
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PORTAIS */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Portais de acesso</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Portal Executor',    href: '/executor',   desc: 'Gerenciar projetos, metas e execução', cor: 'border-[#0068ff]/30 bg-[#0068ff]/5 text-[#0068ff]' },
              { label: 'Portal Patrocinador',href: '/empresa',    desc: 'Projetos apoiados, aportes, benefício fiscal', cor: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
              { label: 'Portal Admin',       href: '/admin',      desc: 'CRM, leads, usuários e compliance', cor: 'border-violet-200 bg-violet-50 text-violet-700' },
            ].map((p) => (
              <Link key={p.label} href={p.href}
                className={`flex items-center justify-between rounded-[1.4rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${p.cor}`}>
                <div>
                  <p className="font-black">{p.label}</p>
                  <p className="mt-0.5 text-xs font-bold opacity-60">{p.desc}</p>
                </div>
                <ArrowRight size={16} className="ml-3 shrink-0 opacity-50"/>
              </Link>
            ))}
          </div>
        </section>

        {/* MÓDULOS */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Todos os módulos</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MODULOS.map((m) => (
              <Link key={m.label} href={m.href}
                className={`flex items-center gap-4 rounded-[1.4rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${m.bordaCor} bg-white`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.cor.split(' ').filter(c=>c.startsWith('bg')).join(' ')}`}>
                  <m.icon size={18} className={m.cor.split(' ').filter(c=>c.startsWith('text')).join(' ')}/>
                </div>
                <p className="font-black text-slate-950">{m.label}</p>
                <ArrowRight size={14} className="ml-auto text-slate-300"/>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </PortalShell>
  );
}
