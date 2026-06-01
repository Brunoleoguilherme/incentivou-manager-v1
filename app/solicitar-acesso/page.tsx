'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function SolicitarAcessoPage() {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setEnviando(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      nome: formData.get('nome'),
      empresa: formData.get('empresa'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      cidade: formData.get('cidade'),
      estado: formData.get('estado'),
      tipo_acesso: formData.get('tipo_acesso'),
      mensagem: formData.get('mensagem'),
    };

    const res = await fetch('/api/solicitar-acesso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.error || 'Erro ao enviar solicitação.');
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#061b3a,#0a234d)] p-6">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 font-bold text-[#061b3a]"
        >
          <ArrowLeft size={18} />
          Voltar ao login
        </Link>

        <div className="mb-6 flex justify-center">
          <Image
            src="/incentivou-logo.png"
            alt="IncentiVou"
            width={200}
            height={64}
            priority
          />
        </div>

        {enviado ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-[#16c784]" size={52} />

            <h1 className="mt-4 text-3xl font-black text-[#061b3a]">
              Solicitação enviada
            </h1>

            <p className="mt-2 text-slate-500">
              A equipe da IncentiVou irá analisar seus dados e entrar em contato.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#061b3a] px-6 font-black text-white"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-3xl font-black text-[#061b3a]">
              Solicitar acesso
            </h1>

            <p className="mt-2 text-center text-slate-500">
              Preencha seus dados para análise da equipe da IncentiVou.
            </p>

            <form onSubmit={enviar} className="mt-8 grid gap-4 md:grid-cols-2">
              <input
                name="nome"
                required
                placeholder="Nome completo"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <input
                name="empresa"
                required
                placeholder="Empresa / Instituição"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <input
                name="email"
                required
                placeholder="E-mail"
                type="email"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <input
                name="telefone"
                required
                placeholder="Telefone / WhatsApp"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <input
                name="cidade"
                placeholder="Cidade"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <input
                name="estado"
                placeholder="Estado"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784]"
              />

              <select
                name="tipo_acesso"
                required
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784] md:col-span-2"
              >
                <option value="">Tipo de acesso desejado</option>
                <option value="Administrador">Administrador</option>
                <option value="Executor / Proponente">Executor / Proponente</option>
                <option value="Empresa apoiadora">Empresa apoiadora</option>
                <option value="Outro">Outro</option>
              </select>

              <textarea
                name="mensagem"
                placeholder="Conte brevemente por que precisa de acesso"
                className="min-h-28 rounded-xl border border-slate-200 p-4 outline-none focus:border-[#16c784] md:col-span-2"
              />

              {erro && (
                <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 md:col-span-2">
                  {erro}
                </p>
              )}

              <button
                disabled={enviando}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#16c784] font-black text-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
              >
                {enviando && <Loader2 size={18} className="animate-spin" />}
                {enviando ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}