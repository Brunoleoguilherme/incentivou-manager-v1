import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  leadForm: any;
  setLeadForm: (value: any) => void;
  saving: boolean;
};

export default function LeadModal({
  open,
  onClose,
  onSubmit,
  leadForm,
  setLeadForm,
  saving,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1f3f]/70 p-5 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
              CRM Comercial
            </p>

            <h3 className="mt-2 text-3xl font-black text-[#0b1f3f]">
              Criar novo lead
            </h3>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
              Cadastre as informações comerciais para iniciar o contato dentro do funil.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-5">
            <h4 className="text-lg font-black text-[#0b1f3f]">
              Dados da empresa
            </h4>

            <div className="mt-5 space-y-3">
              <input
                required
                value={leadForm.empresa}
                onChange={(e) => setLeadForm({ ...leadForm, empresa: e.target.value })}
                placeholder="Empresa / Organização"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={leadForm.cnpj}
                onChange={(e) => setLeadForm({ ...leadForm, cnpj: e.target.value })}
                placeholder="CNPJ"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={leadForm.cidade}
                  onChange={(e) => setLeadForm({ ...leadForm, cidade: e.target.value })}
                  placeholder="Cidade"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />

                <input
                  value={leadForm.estado}
                  onChange={(e) => setLeadForm({ ...leadForm, estado: e.target.value })}
                  placeholder="Estado"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h4 className="text-lg font-black text-[#0b1f3f]">
              Contato principal
            </h4>

            <div className="mt-5 space-y-3">
              <input
                value={leadForm.contato}
                onChange={(e) => setLeadForm({ ...leadForm, contato: e.target.value })}
                placeholder="Nome do contato"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={leadForm.cargo_contato}
                onChange={(e) => setLeadForm({ ...leadForm, cargo_contato: e.target.value })}
                placeholder="Cargo"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={leadForm.telefone}
                onChange={(e) => setLeadForm({ ...leadForm, telefone: e.target.value })}
                placeholder="Telefone / WhatsApp"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="E-mail"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5 lg:col-span-2">
            <h4 className="text-lg font-black text-[#0b1f3f]">
              Oportunidade comercial
            </h4>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <select
                value={leadForm.origem}
                onChange={(e) => setLeadForm({ ...leadForm, origem: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              >
                <option>Site IncentiVou</option>
                <option>WhatsApp</option>
                <option>Indicação</option>
                <option>LinkedIn</option>
                <option>Evento</option>
                <option>Prospecção ativa</option>
                <option>Outro</option>
              </select>

              <select
                value={leadForm.interesse}
                onChange={(e) => setLeadForm({ ...leadForm, interesse: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              >
                <option value="">Interesse ainda não definido</option>
                <option>Plano Start</option>
                <option>Projeto Aprovado</option>
                <option>Captação Inteligente</option>
                <option>Execução Segura</option>
                <option>Esporte 360°</option>
              </select>

              <input
                type="number"
                value={leadForm.valor_estimado}
                onChange={(e) => setLeadForm({ ...leadForm, valor_estimado: e.target.value })}
                placeholder="Valor potencial"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={leadForm.responsavel}
                onChange={(e) => setLeadForm({ ...leadForm, responsavel: e.target.value })}
                placeholder="Responsável comercial"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <textarea
                value={leadForm.observacoes}
                onChange={(e) => setLeadForm({ ...leadForm, observacoes: e.target.value })}
                placeholder="Observações comerciais"
                className="min-h-28 rounded-2xl border border-slate-200 p-4 text-sm font-bold md:col-span-2"
              />
            </div>
          </section>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Criar lead'}
          </button>
        </div>
      </form>
    </div>
  );
}