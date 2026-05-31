'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { demoUsers } from '@/lib/kanbanData';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@incentivou.com.br');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');

  function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');

    const usuario = demoUsers.find((item) => item.email === email && item.senha === senha);

    if (!usuario) {
      setErro('E-mail ou senha inválidos. Use um dos acessos de demonstração abaixo.');
      return;
    }

    localStorage.setItem('incentivou_usuario', JSON.stringify(usuario));
    router.push(`/${usuario.portal}`);
  }

  function usarAcesso(emailDemo: string, senhaDemo: string) {
    setEmail(emailDemo);
    setSenha(senhaDemo);
    setErro('');
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,rgba(64,184,106,.18),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(7,103,199,.16),transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_100%)] px-5 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:block">
          <div className="mb-8 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-700 shadow-sm">
            IncentiVou Manager
          </div>
          <h1 className="max-w-3xl text-6xl font-black leading-[0.95] tracking-[-0.06em] text-slate-950">
            Três portais. Uma operação integrada.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-slate-600">
            Admin, Executor e Empresa com gestão de projetos, Kanban operacional, compliance, captação, execução e prestação de contas no padrão premium IncentiVou.
          </p>
          <div className="mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
            {[['Admin', ShieldCheck, 'Controle total'], ['Executor', UserRound, 'Operação técnica'], ['Empresa', Building2, 'Decisão ESG']].map(([label, Icon, desc]: any) => (
              <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white/86 p-5 shadow-sm backdrop-blur">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={22} /></div>
                <h3 className="mt-4 font-black text-slate-950">{label}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,.12)] md:p-8">
          <div className="mb-7 flex justify-center">
            <Image src="/incentivou-logo.png" alt="IncentiVou" width={190} height={76} priority className="h-auto w-48 object-contain" />
          </div>
          <h2 className="text-center text-3xl font-black tracking-[-0.04em] text-slate-950">Acessar sistema</h2>
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">Escolha um perfil de demonstração e entre no portal correto.</p>

          <form onSubmit={entrar} className="mt-7 space-y-4">
            <label className="block text-sm font-black text-slate-700">
              E-mail
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <Mail size={18} className="text-slate-400" />
                <input className="h-12 w-full bg-transparent text-sm font-bold outline-none" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>

            <label className="block text-sm font-black text-slate-700">
              Senha
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <Lock size={18} className="text-slate-400" />
                <input className="h-12 w-full bg-transparent text-sm font-bold outline-none" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </label>

            {erro && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{erro}</div>}

            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5">
              Entrar no portal <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            {demoUsers.map((user) => (
              <button key={user.email} onClick={() => usarAcesso(user.email, user.senha)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50">
                <p className="text-sm font-black text-slate-950">{user.perfil}</p>
                <p className="mt-0.5 text-xs font-bold text-slate-500">{user.email} / {user.senha}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
