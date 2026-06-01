'use client';

import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  converting: boolean;
  empresas: any[];
  produtosDestino: any[];
  empresaModo: 'existente' | 'nova';
  setEmpresaModo: (value: 'existente' | 'nova') => void;
  empresaExistenteId: string;
  setEmpresaExistenteId: (value: string) => void;
  empresaForm: any;
  setEmpresaForm: (value: any) => void;
  projetoForm: any;
  setProjetoForm: (value: any) => void;
  produtoDestinoBoardId: string;
  setProdutoDestinoBoardId: (value: string) => void;
};

export default function ConvertModal({
  open,
  onClose,
  onSubmit,
  converting,
  empresas,
  produtosDestino,
  empresaModo,
  setEmpresaModo,
  empresaExistenteId,
  setEmpresaExistenteId,
  empresaForm,
  setEmpresaForm,
  projetoForm,
  setProjetoForm,
  produtoDestinoBoardId,
  setProdutoDestinoBoardId,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1f3f]/70 p-5 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
              Conversão comercial
            </p>

            <h3 className="mt-2 text-3xl font-black text-[#0b1f3f]">
              Converter venda em operação
            </h3>

            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
              Crie a empresa, o projeto e o card operacional automaticamente.
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
            <h4 className="text-lg font-black text-[#0b1f3f]">Empresa</h4>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setEmpresaModo('nova')}
                className={`rounded-xl px-4 py-2 text-sm font-black ${
                  empresaModo === 'nova'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Nova empresa
              </button>

              <button
                type="button"
                onClick={() => setEmpresaModo('existente')}
                className={`rounded-xl px-4 py-2 text-sm font-black ${
                  empresaModo === 'existente'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Empresa existente
              </button>
            </div>

            {empresaModo === 'existente' ? (
              <select
                value={empresaExistenteId}
                onChange={(e) => setEmpresaExistenteId(e.target.value)}
                className="mt-5 w-full rounded-2xl border border-slate-200 p-4 text-sm font-black"
              >
                <option value="">Selecione uma empresa...</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome_fantasia || empresa.razao_social}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-5 space-y-3">
                <input
                  required={empresaModo === 'nova'}
                  value={empresaForm.razao_social}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, razao_social: e.target.value })
                  }
                  placeholder="Razão Social"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />

                <input
                  value={empresaForm.nome_fantasia}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, nome_fantasia: e.target.value })
                  }
                  placeholder="Nome Fantasia"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />

                <input
                  value={empresaForm.cnpj}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, cnpj: e.target.value })
                  }
                  placeholder="CNPJ"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={empresaForm.cidade}
                    onChange={(e) =>
                      setEmpresaForm({ ...empresaForm, cidade: e.target.value })
                    }
                    placeholder="Cidade"
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                  />

                  <input
                    value={empresaForm.estado}
                    onChange={(e) =>
                      setEmpresaForm({ ...empresaForm, estado: e.target.value })
                    }
                    placeholder="Estado"
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                  />
                </div>

                <input
                  value={empresaForm.setor}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, setor: e.target.value })
                  }
                  placeholder="Setor"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h4 className="text-lg font-black text-[#0b1f3f]">
              Projeto e produto
            </h4>

            <div className="mt-5 space-y-3">
              <select
                required
                value={produtoDestinoBoardId}
                onChange={(e) => setProdutoDestinoBoardId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-black"
              >
                <option value="">Produto contratado...</option>
                {produtosDestino.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.nome}
                  </option>
                ))}
              </select>

              <input
                required
                value={projetoForm.nome}
                onChange={(e) =>
                  setProjetoForm({ ...projetoForm, nome: e.target.value })
                }
                placeholder="Nome do projeto"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={projetoForm.lei_incentivo}
                onChange={(e) =>
                  setProjetoForm({
                    ...projetoForm,
                    lei_incentivo: e.target.value,
                  })
                }
                placeholder="Lei de incentivo"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                value={projetoForm.area}
                onChange={(e) =>
                  setProjetoForm({ ...projetoForm, area: e.target.value })
                }
                placeholder="Área"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <input
                type="number"
                value={projetoForm.valor_total}
                onChange={(e) =>
                  setProjetoForm({
                    ...projetoForm,
                    valor_total: e.target.value,
                  })
                }
                placeholder="Valor total previsto"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
              />

              <textarea
                value={projetoForm.descricao}
                onChange={(e) =>
                  setProjetoForm({ ...projetoForm, descricao: e.target.value })
                }
                placeholder="Observações / descrição do projeto"
                className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold"
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
            disabled={!produtoDestinoBoardId || converting}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {converting ? 'Convertendo...' : 'Confirmar conversão'}
          </button>
        </div>
      </form>
    </div>
  );
}