'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Lock, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const portalLabels: Record<string, string> = {
  admin: 'Portal Admin',
  executor: 'Portal Executor',
  empresa: 'Portal Empresa',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const portalParam = searchParams.get('portal') || 'admin';
  const portalAtual = ['admin', 'executor', 'empresa'].includes(portalParam)
    ? portalParam
    : 'admin';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const { data: usuario, error } = await supabase
      .from('manager_usuarios')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('senha', senha)
      .eq('status', 'ativo')
      .single();

    if (error || !usuario) {
      setErro('E-mail ou senha invalidos.');
      setLoading(false);
      return;
    }

    if (usuario.perfil !== portalAtual) {
      setErro(`Este usuario nao pertence ao ${portalLabels[portalAtual]}.`);
      setLoading(false);
      return;
    }

    localStorage.setItem(
      'incentivou_usuario',
      JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        portal: usuario.perfil,
        status: usuario.status,
      })
    );

    router.push(`/${usuario.perfil}`);
  }

  return (
    <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_30px_90px_rgba(6,27,58,0.18)] backdrop-blur-xl">
      <div className="mb-6 flex justify-center">
        <Image
          src="/incentivou-logo.png"
          alt="IncentiVou"
          width={260}
          height={80}
          priority
          className="h-auto w-[230px] object-contain"
        />
      </div>

      <p className="text-center text-xs font-black uppercase tracking-[0.28em] text-[#16c784]">
        {portalLabels[portalAtual]}
      </p>

      <h1 className="mt-3 text-center text-4xl font-black text-[#061b3a]">
        Login
      </h1>

      <p className="mt-2 text-center text-sm font-semibold text-[#40516b]">
        Acesso ao sistema IncentiVou Manager
      </p>

      <form onSubmit={entrar} className="mt-8 space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
          <Mail size={18} className="text-[#061b3a]" />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full bg-transparent font-semibold outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
          <Lock size={18} className="text-[#061b3a]" />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="h-12 w-full bg-transparent font-semibold outline-none"
            required
          />
        </div>

        {erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_16px_38px_rgba(19,184,166,0.25)] disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="my-7 border-t border-slate-200" />

      <h3 className="text-center text-xl font-black text-[#061b3a]">
        Nao possui acesso?
      </h3>

      <Link
        href="/solicitar-acesso"
        className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#061b3a] font-black text-white"
      >
        Solicitar acesso
      </Link>

      <Link
        href="/"
        className="mt-4 block text-center text-sm font-bold text-[#40516b] hover:text-[#16c784]"
      >
        Voltar para escolha de portal
      </Link>

      <p className="mt-8 text-center text-[10px] font-semibold text-slate-400">
        v4.0.0
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f9ff] px-4 py-6 text-[#061b3a]">
      <Image
        src="/bg-acesso2.png"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-white/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.70)_45%,rgba(245,249,255,0.48)_100%)]" />
      <Suspense fallback={<div className="text-sm font-bold text-slate-400">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
