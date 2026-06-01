'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { demoUsers } from '@/lib/kanbanData';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const usuario = demoUsers.find(
      (u) => u.email === email && u.senha === senha
    );

    if (!usuario) {
      setErro('E-mail ou senha inválidos.');
      return;
    }

    localStorage.setItem(
      'incentivou_usuario',
      JSON.stringify(usuario)
    );

    router.push(`/${usuario.portal}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#061b3a,#0a234d)] p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <Image
            src="/incentivou-logo.png"
            alt="IncentiVou"
            width={220}
            height={70}
            priority
          />
        </div>

        <h1 className="text-center text-4xl font-black text-[#061b3a]">
          Login
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Acesso ao sistema IncentiVou
        </p>

        <form onSubmit={entrar} className="mt-8 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
            <Mail size={18} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full outline-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 w-full outline-none"
            />
          </div>

          {erro && (
            <p className="text-sm font-bold text-red-500">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#16c784] font-black text-white"
          >
            Entrar
          </button>
        </form>

        <div className="my-8 border-t" />

        <h3 className="text-center text-2xl font-black text-[#061b3a]">
          Não possui acesso?
        </h3>

        <Link
          href="/solicitar-acesso"
          className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#061b3a] font-black text-white"
        >
          Solicitar acesso
        </Link>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sua solicitação será analisada pela equipe da IncentiVou.
        </p>
      </div>
    </main>
  );
}