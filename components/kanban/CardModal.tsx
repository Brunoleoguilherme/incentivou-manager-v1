import { X } from 'lucide-react';
import ChecklistBox from './ChecklistBox';
import MemberSelector from './MemberSelector';
import ActivityFeed from './ActivityFeed';

type Props = {
  card: any;
  columnName: string;
  isVendaFechada: boolean;
  onClose: () => void;
  onOpenConvert: () => void;
  anotacoes: any[];
  novaAnotacao: string;
  setNovaAnotacao: (value: string) => void;
  onSaveAnotacao: (e: React.FormEvent) => void;
  savingNote: boolean;
  checklist: any[];
  novoChecklistItem: string;
  setNovoChecklistItem: (value: string) => void;
  onAddChecklistItem: () => void;
  onToggleChecklistItem: (item: any) => void;
  usuarios: any[];
  membros: any[];
  membroUsuarioId: string;
  setMembroUsuarioId: (value: string) => void;
  onAddMembro: () => void;
};

export default function CardModal({
  card,
  columnName,
  isVendaFechada,
  onClose,
  onOpenConvert,
  anotacoes,
  novaAnotacao,
  setNovaAnotacao,
  onSaveAnotacao,
  savingNote,
  checklist,
  novoChecklistItem,
  setNovoChecklistItem,
  onAddChecklistItem,
  onToggleChecklistItem,
  usuarios,
  membros,
  membroUsuarioId,
  setMembroUsuarioId,
  onAddMembro,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f3f]/55 p-5 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
              Detalhes do card
            </p>

            <h3 className="mt-2 text-3xl font-black text-[#0b1f3f]">
              {card.titulo}
            </h3>

            <p className="mt-2 text-sm font-bold text-slate-500">
              Etapa atual: {columnName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-500">Descrição</p>
              <p className="mt-2 font-semibold leading-7 text-slate-700">
                {card.descricao || 'Sem descrição cadastrada.'}
              </p>
            </div>

            <ChecklistBox
              checklist={checklist}
              novoItem={novoChecklistItem}
              setNovoItem={setNovoChecklistItem}
              onAdd={onAddChecklistItem}
              onToggle={onToggleChecklistItem}
            />

            <form onSubmit={onSaveAnotacao}>
              <label className="text-sm font-black text-[#0b1f3f]">
                Adicionar comentário
              </label>

              <textarea
                value={novaAnotacao}
                onChange={(e) => setNovaAnotacao(e.target.value)}
                placeholder="Registre uma observação, retorno do cliente, pendência ou próximo passo..."
                className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-emerald-400"
              />

              <button
                disabled={savingNote}
                className="mt-3 rounded-2xl bg-[#0b1f3f] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {savingNote ? 'Salvando...' : 'Salvar comentário'}
              </button>
            </form>

            <ActivityFeed anotacoes={anotacoes} />
          </div>

          <aside className="space-y-5">
            <MemberSelector
              usuarios={usuarios}
              membros={membros}
              usuarioId={membroUsuarioId}
              setUsuarioId={setMembroUsuarioId}
              onAdd={onAddMembro}
            />

            {isVendaFechada && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm font-black text-emerald-700">
                  Venda fechada
                </p>

                <p className="mt-1 text-sm font-bold text-slate-600">
                  Converta esta venda em cliente, projeto e fluxo operacional.
                </p>

                <button
                  type="button"
                  onClick={onOpenConvert}
                  disabled={!!card.convertido}
                  className="mt-4 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {card.convertido ? 'Lead já convertido' : 'Converter para operação'}
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}