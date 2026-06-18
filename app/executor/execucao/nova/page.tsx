'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  ShieldCheck,
} from 'lucide-react';

import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string;
  nome: string;
};

export default function NovaEntregaPage() {
  const router = useRouter();

  const [projetos, setProjetos] = useState<Projeto[]>([]);

  const [form, setForm] = useState({
    projeto_id: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    prazo: '',
    status: 'pendente',
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarProjetos() {
    if (!supabase) return;

    const { data } = await supabase
      .from('manager_projetos')
      .select('id,nome')
      .order('nome');

    setProjetos(data || []);
  }

  useEffect(() => {
    carregarProjetos();
  }, []);

  async function salvarEntrega() {
    try {
      setErro('');
      setSucesso('');
      setSalvando(true);

      if (!form.projeto_id) {
        setErro('Selecione um projeto.');
        return;
      }

      if (!form.titulo.trim()) {
        setErro('Informe o título da entrega.');
        return;
      }

      const { error } = await supabase!
        .from('manager_entregas')
        .insert({
          projeto_id: form.projeto_id,
          titulo: form.titulo,
          descricao: form.descricao,
          responsavel: form.responsavel,
          prazo: form.prazo || null,
          status: form.status,
        });

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso('Entrega criada com sucesso.');

      setTimeout(() => {
        router.push('/executor/execucao');
      }, 1200);

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <PortalShell portal="executor">
      <div className="space-y-7">

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
                Execução Segura
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
                Nova Entrega
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                Cadastre uma nova atividade operacional do projeto.
              </p>
            </div>

            <Link
              href="/executor/execucao"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>

          </div>

        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">

          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="font-black text-slate-950">
                Cadastro de Entrega
              </h2>

              <p className="text-sm text-slate-500">
                Planejamento operacional e execução.
              </p>
            </div>
          </div>

          <div className="grid gap-5">

            <select
              value={form.projeto_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  projeto_id: e.target.value,
                })
              }
              className="h-14 rounded-2xl border border-slate-200 px-4 font-semibold"
            >
              <option value="">
                Selecione um projeto
              </option>

              {projetos.map((projeto) => (
                <option
                  key={projeto.id}
                  value={projeto.id}
                >
                  {projeto.nome}
                </option>
              ))}
            </select>

            <input
              placeholder="Título da entrega"
              value={form.titulo}
              onChange={(e) =>
                setForm({
                  ...form,
                  titulo: e.target.value,
                })
              }
              className="h-14 rounded-2xl border border-slate-200 px-4 font-semibold"
            />

            <textarea
              rows={5}
              placeholder="Descrição da atividade"
              value={form.descricao}
              onChange={(e) =>
                setForm({
                  ...form,
                  descricao: e.target.value,
                })
              }
              className="rounded-2xl border border-slate-200 p-4 font-semibold"
            />

            <div className="grid gap-4 md:grid-cols-2">

              <input
                placeholder="Responsável"
                value={form.responsavel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responsavel: e.target.value,
                  })
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 font-semibold"
              />

              <input
                type="date"
                value={form.prazo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prazo: e.target.value,
                  })
                }
                className="h-14 rounded-2xl border border-slate-200 px-4 font-semibold"
              />

            </div>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="h-14 rounded-2xl border border-slate-200 px-4 font-semibold"
            >
              <option value="pendente">
                Pendente
              </option>

              <option value="em andamento">
                Em andamento
              </option>

              <option value="aguardando aprovação">
                Aguardando aprovação
              </option>

              <option value="concluído">
                Concluído
              </option>
            </select>

            {erro && (
              <div className="rounded-2xl bg-red-50 p-4 font-bold text-red-600">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">
                {sucesso}
              </div>
            )}

            <button
              onClick={salvarEntrega}
              disabled={salvando}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white"
            >
              <Save size={18} />

              {salvando
                ? 'Salvando...'
                : 'Salvar entrega'}
            </button>

          </div>

        </section>

      </div>
    </PortalShell>
  );
}