'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: string;
  status: string;
}

const perfilLabel: Record<string, string> = {
  admin: 'Admin',
  executor: 'Executor',
  empresa: 'Empresa',
};

const usuarioInicial = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'executor',
  status: 'ativo',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(usuarioInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarUsuarios() {
    setLoading(true);

    const { data, error } = await supabase
      .from('manager_usuarios')
      .select('*')
      .order('nome');

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    setUsuarios(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function abrirNovoUsuario() {
    setUsuarioEditando(null);
    setForm(usuarioInicial);
    setErro('');
    setModalAberto(true);
  }

  function abrirEditarUsuario(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setForm({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: usuario.senha || '',
      perfil: usuario.perfil || 'executor',
      status: usuario.status || 'ativo',
    });
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setUsuarioEditando(null);
    setForm(usuarioInicial);
    setErro('');
  }

  async function salvarUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    if (!form.nome.trim() || !form.email.trim()) {
      setErro('Preencha nome e e-mail.');
      setSalvando(false);
      return;
    }

    if (!usuarioEditando && !form.senha.trim()) {
      setErro('Preencha a senha do novo usuário.');
      setSalvando(false);
      return;
    }

    if (usuarioEditando) {
      const payload: any = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        perfil: form.perfil,
        status: form.status,
      };

      if (form.senha.trim()) {
        payload.senha = form.senha.trim();
      }

      const { error } = await supabase
        .from('manager_usuarios')
        .update(payload)
        .eq('id', usuarioEditando.id);

      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from('manager_usuarios').insert({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha.trim(),
        perfil: form.perfil,
        status: form.status,
      });

      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
    }

    await carregarUsuarios();
    setSalvando(false);
    fecharModal();
  }

  async function excluirUsuario(usuario: Usuario) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o usuário ${usuario.nome}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from('manager_usuarios')
      .delete()
      .eq('id', usuario.id);

    if (error) {
      setErro(error.message);
      return;
    }

    await carregarUsuarios();
  }

  const resumo = useMemo(() => {
    return {
      total: usuarios.length,
      admin: usuarios.filter((u) => u.perfil === 'admin').length,
      executor: usuarios.filter((u) => u.perfil === 'executor').length,
      empresa: usuarios.filter((u) => u.perfil === 'empresa').length,
      ativos: usuarios.filter((u) => u.status === 'ativo').length,
    };
  }, [usuarios]);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.perfil.toLowerCase().includes(busca.toLowerCase()) ||
      u.status.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <PortalShell>
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-[#d8e6f5] bg-white/90 p-7 shadow-[0_24px_70px_rgba(11,31,63,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#16c784]">
              Controle de acesso
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#061b3a]">
              Usuários
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[#40516b]">
              Gerencie acessos, perfis e permissões dos portais Admin,
              Executores e Empresas.
            </p>
          </div>

          <div className="flex flex-col gap-3">
  <Link
    href="/admin"
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8e6f5] bg-white px-5 py-3 text-sm font-black text-[#061b3a] shadow-sm transition hover:bg-[#f5f9ff]"
  >
    <ArrowLeft size={16} />
    Voltar ao Dashboard
  </Link>

  <button
    type="button"
    onClick={abrirNovoUsuario}
    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] transition hover:-translate-y-0.5"
  >
    <Plus size={18} />
    Novo usuário
  </button>
</div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-5">
          <MetricCard label="Total" value={resumo.total} icon={<Users size={20} />} />
          <MetricCard label="Admins" value={resumo.admin} icon={<ShieldCheck size={20} />} />
          <MetricCard label="Executores" value={resumo.executor} icon={<UserCog size={20} />} />
          <MetricCard label="Empresas" value={resumo.empresa} icon={<Building2 size={20} />} />
          <MetricCard label="Ativos" value={resumo.ativos} icon={<CheckCircle2 size={20} />} />
        </div>
      </section>

      {erro && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">
          {erro}
        </div>
      )}

      <section className="rounded-[2rem] border border-[#d8e6f5] bg-white/92 p-6 shadow-[0_24px_70px_rgba(11,31,63,0.08)] backdrop-blur-xl">
        <div className="relative mb-6">
          <Search
            size={19}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7b8ba3]"
          />

          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, perfil ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-14 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] pl-13 pr-4 text-sm font-bold text-[#061b3a] outline-none transition placeholder:text-[#7b8ba3] focus:border-[#16c784]/60 focus:bg-white"
          />
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-[#d8e6f5]">
          <div className="hidden grid-cols-[1.5fr_1.6fr_0.8fr_0.8fr_0.7fr] bg-[#f5f9ff] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#60708a] md:grid">
            <span>Nome</span>
            <span>E-mail</span>
            <span>Perfil</span>
            <span>Status</span>
            <span className="text-center">Ações</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm font-black text-[#60708a]">
              Carregando usuários...
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-sm font-black text-[#60708a]">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="divide-y divide-[#e8f0f8]">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="grid gap-3 px-5 py-5 transition hover:bg-[#f8fbff] md:grid-cols-[1.5fr_1.6fr_0.8fr_0.8fr_0.7fr] md:items-center"
                >
                  <div>
                    <p className="text-base font-black text-[#061b3a]">
                      {usuario.nome}
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#7b8ba3] md:hidden">
                      {usuario.email}
                    </p>
                  </div>

                  <p className="hidden text-sm font-semibold text-[#40516b] md:block">
                    {usuario.email}
                  </p>

                  <div>
                    <PerfilBadge perfil={usuario.perfil} />
                  </div>

                  <div>
                    <StatusBadge status={usuario.status} />
                  </div>

                  <div className="flex justify-start gap-2 md:justify-center">
                    <button
                      type="button"
                      onClick={() => abrirEditarUsuario(usuario)}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eef7ff] text-[#061b3a] transition hover:bg-[#16c784] hover:text-white"
                      title="Editar usuário"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => excluirUsuario(usuario)}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                      title="Excluir usuário"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16c784]">
                  {usuarioEditando ? 'Editar acesso' : 'Novo acesso'}
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#061b3a]">
                  {usuarioEditando ? 'Editar usuário' : 'Novo usuário'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5f9ff] text-[#061b3a]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvarUsuario} className="mt-6 space-y-4">
              <input
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="h-13 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] px-4 text-sm font-bold outline-none focus:border-[#16c784]"
              />

              <input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-13 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] px-4 text-sm font-bold outline-none focus:border-[#16c784]"
              />

              <input
                type="text"
                placeholder={
                  usuarioEditando
                    ? 'Nova senha (opcional)'
                    : 'Senha de acesso'
                }
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="h-13 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] px-4 text-sm font-bold outline-none focus:border-[#16c784]"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={form.perfil}
                  onChange={(e) =>
                    setForm({ ...form, perfil: e.target.value })
                  }
                  className="h-13 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] px-4 text-sm font-bold outline-none focus:border-[#16c784]"
                >
                  <option value="admin">Admin</option>
                  <option value="executor">Executor</option>
                  <option value="empresa">Empresa</option>
                </select>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="h-13 w-full rounded-2xl border border-[#d8e6f5] bg-[#f8fbff] px-4 text-sm font-bold outline-none focus:border-[#16c784]"
                >
                  <option value="ativo">Ativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {erro && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] disabled:opacity-60"
              >
                {salvando
                  ? 'Salvando...'
                  : usuarioEditando
                    ? 'Salvar alterações'
                    : 'Criar usuário'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </PortalShell>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#d8e6f5] bg-[#f8fbff] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7b8ba3]">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-[#061b3a]">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9fff7] text-[#16c784]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PerfilBadge({ perfil }: { perfil: string }) {
  const isAdmin = perfil === 'admin';
  const isExecutor = perfil === 'executor';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${
        isAdmin
          ? 'bg-blue-50 text-[#0068ff]'
          : isExecutor
            ? 'bg-emerald-50 text-[#079b6f]'
            : 'bg-purple-50 text-purple-600'
      }`}
    >
      {perfilLabel[perfil] || perfil}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${
        status === 'ativo'
          ? 'bg-emerald-50 text-[#079b6f]'
          : status === 'pendente'
            ? 'bg-amber-50 text-amber-600'
            : 'bg-red-50 text-red-600'
      }`}
    >
      {status}
    </span>
  );
}