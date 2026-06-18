'use client';
import { Bell, Globe, Lock, Palette, User } from 'lucide-react';
import PortalShell from '@/components/PortalShell';

const SECOES = [
  { icon: <User size={18}/>,    label: 'Perfil',            desc: 'Nome, e-mail, cargo e foto',      cor: 'bg-blue-50 text-blue-700'    },
  { icon: <Lock size={18}/>,    label: 'Segurança',         desc: 'Senha e autenticação',             cor: 'bg-red-50 text-red-700'      },
  { icon: <Bell size={18}/>,    label: 'Notificações',      desc: 'E-mail, WhatsApp e alertas',      cor: 'bg-amber-50 text-amber-700'  },
  { icon: <Palette size={18}/>, label: 'Aparência',         desc: 'Tema e preferências visuais',     cor: 'bg-violet-50 text-violet-700'},
  { icon: <Globe size={18}/>,   label: 'Integrações',       desc: 'Supabase, Resend e APIs',         cor: 'bg-emerald-50 text-emerald-700'},
];

export default function ConfiguracoesPage() {
  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Configurações</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Perfil, segurança, notificações e integrações do sistema.</p>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {SECOES.map(s => (
              <button key={s.label}
                className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${s.cor.split(' ')[0]}`}>
                  <span className={s.cor.split(' ')[1]}>{s.icon}</span>
                </div>
                <div>
                  <p className="font-black text-slate-950">{s.label}</p>
                  <p className="text-xs font-bold text-slate-400">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-black text-slate-400">Configurações avançadas em desenvolvimento</p>
        </section>
      </div>
    </PortalShell>
  );
}
