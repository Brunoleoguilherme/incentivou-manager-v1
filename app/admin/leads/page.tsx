'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import {
  Edit,
  ExternalLink,
  Search,
  Trash2,
  Users,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';

const vazio = {
  empresa: '',
  contato: '',
  cargo_contato: '',
  telefone: '',
  email: '',
  cnpj: '',
  cidade: '',
  estado: '',
  origem: '',
  interesse: '',
  valor_estimado: '',
  responsavel: '',
  status: '',
  observacoes: '',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);

    const { data, error } = await supabase!
      .from('manager_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLeads(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase();

    return leads.filter((lead) =>
      [
        lead.empresa,
        lead.contato,
        lead.telefone,
        lead.email,
        lead.cnpj,
        lead.interesse,
        lead.status,
        lead.responsavel,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [leads, busca]);

  const total = leads.length;
  const convertidos = leads.filter((l) => l.convertido || l.status === 'convertido').length;
  const novos = leads.filter((l) => l.status === 'novo_lead' || !l.status).length;
  const emAndamento = total - convertidos - novos;

  async function excluirLead(lead: any) {
    if (!confirm(`Deseja excluir o lead "${lead.empresa}"?`)) return;

    if (lead.card_id) {
      await supabase!.from('manager_kanban_cards').delete().eq('id', lead.card_id);
    }

    await supabase!.from('manager_leads').delete().eq('id', lead.id);
    carregar();
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();

    await supabase!
      .from('manager_leads')
      .update({
        empresa: editando.empresa,
        contato: editando.contato,
        cargo_contato: editando.cargo_contato,
        telefone: editando.telefone,
        email: editando.email,
        cnpj: editando.cnpj,
        cidade: editando.cidade,
        estado: editando.estado,
        origem: editando.origem,
        interesse: editando.interesse,
        valor_estimado: Number(editando.valor_estimado || 0),
        responsavel: editando.responsavel,
        status: editando.status,
        observacoes: editando.observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editando.id);

    setEditando(null);
    carregar();
  }

  return (
    <PortalShell portal="admin">
      <div className="space-y-5">
        <section className="rounded-[1.6rem] border border-[#d8e6f5] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#16c784]">
            CRM Comercial
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#061b3a]">
            Leads
          </h1>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Pesquise, edite, exclua e acompanhe os leads criados no Kanban.
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <Kpi label="Total de Leads" value={total} icon={<Users size={20} />} />
          <Kpi label="Novos" value={novos} icon={<Users size={20} />} />
          <Kpi label="Em andamento" value={emAndamento} icon={<Phone size={20} />} />
          <Kpi label="Convertidos" value={convertidos} icon={<CheckCircle2 size={20} />} green />
        </section>

        <div className="flex items-center gap-3 rounded-2xl border border-[#d8e6f5] bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-[#13b8a6]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por empresa, contato, telefone, e-mail, CNPJ, interesse ou responsável..."
            className="w-full bg-transparent text-sm font-bold outline-none"
          />
        </div>

        <section className="overflow-hidden rounded-[1.6rem] border border-[#d8e6f5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f5f9ff] text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Interesse</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center font-bold text-slate-500">
                      Carregando leads...
                    </td>
                  </tr>
                )}

                {!loading && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center font-bold text-slate-500">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}

                {filtrados.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100 hover:bg-[#f8fbff]">
                    <td className="p-4">
                      <p className="font-black text-[#061b3a]">{lead.empresa}</p>
                      <p className="text-xs font-bold text-slate-500">{lead.cnpj || 'Sem CNPJ'}</p>
                    </td>

                    <td className="p-4 font-bold text-slate-600">
                      <p>{lead.contato || '-'}</p>
                      <p className="flex items-center gap-1 text-xs">
                        <Phone size={12} /> {lead.telefone || '-'}
                      </p>
                      <p className="flex items-center gap-1 text-xs">
                        <Mail size={12} /> {lead.email || '-'}
                      </p>
                    </td>

                    <td className="p-4 font-bold text-slate-600">
                      {lead.interesse || 'Não definido'}
                    </td>

                    <td className="p-4 font-black text-[#16c784]">
                      R$ {Number(lead.valor_estimado || 0).toLocaleString('pt-BR')}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-black text-[#061b3a]">
                        {lead.status || 'novo_lead'}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-600">
                      {lead.responsavel || '-'}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href="/admin/kanban"
                          className="rounded-xl border border-slate-200 p-2 text-[#061b3a] hover:bg-[#f5f9ff]"
                          title="Ver no Kanban"
                        >
                          <ExternalLink size={17} />
                        </Link>

                        <button
                          onClick={() => setEditando({ ...vazio, ...lead })}
                          className="rounded-xl border border-slate-200 p-2 text-[#061b3a] hover:bg-[#f5f9ff]"
                          title="Editar"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => excluirLead(lead)}
                          className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/60 p-5 backdrop-blur-sm">
          <form
            onSubmit={salvarEdicao}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-black text-[#061b3a]">
              Editar Lead
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                ['empresa', 'Empresa / Organização'],
                ['contato', 'Contato'],
                ['cargo_contato', 'Cargo'],
                ['telefone', 'Telefone / WhatsApp'],
                ['email', 'E-mail'],
                ['cnpj', 'CNPJ'],
                ['cidade', 'Cidade'],
                ['estado', 'Estado'],
                ['origem', 'Origem'],
                ['interesse', 'Interesse'],
                ['responsavel', 'Responsável'],
                ['status', 'Status'],
              ].map(([campo, label]) => (
                <input
                  key={campo}
                  value={editando[campo] || ''}
                  onChange={(e) =>
                    setEditando({ ...editando, [campo]: e.target.value })
                  }
                  placeholder={label}
                  className="rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-[#16c784]"
                />
              ))}

              <input
                type="number"
                value={editando.valor_estimado || ''}
                onChange={(e) =>
                  setEditando({ ...editando, valor_estimado: e.target.value })
                }
                placeholder="Valor estimado"
                className="rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-[#16c784]"
              />

              <textarea
                value={editando.observacoes || ''}
                onChange={(e) =>
                  setEditando({ ...editando, observacoes: e.target.value })
                }
                placeholder="Observações"
                className="min-h-28 rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-[#16c784] md:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-black"
              >
                Cancelar
              </button>

              <button className="rounded-2xl bg-gradient-to-r from-[#0068ff] to-[#16c784] px-5 py-3 font-black text-white">
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </PortalShell>
  );
}

function Kpi({
  label,
  value,
  icon,
  green,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  green?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#d8e6f5] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <div className="text-[#13b8a6]">{icon}</div>
      </div>

      <p className={`mt-2 text-3xl font-black ${green ? 'text-[#16c784]' : 'text-[#061b3a]'}`}>
        {value}
      </p>
    </div>
  );
}