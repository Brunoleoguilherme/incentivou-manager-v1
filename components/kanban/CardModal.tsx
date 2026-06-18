import {
  Edit3,
  Save,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import ChecklistBox from './ChecklistBox';
import MemberSelector from './MemberSelector';

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

  anotacaoEditandoId: string | null;
  textoEdicaoAnotacao: string;
  setTextoEdicaoAnotacao: (value: string) => void;
  savingEditNote: boolean;
  deletingNoteId: string | null;
  onEditAnotacao: (anotacao: any) => void;
  onCancelEditAnotacao: () => void;
  onSaveEditAnotacao: (anotacaoId: string) => void;
  onDeleteAnotacao: (anotacaoId: string) => void;

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

  anotacaoEditandoId,
  textoEdicaoAnotacao,
  setTextoEdicaoAnotacao,
  savingEditNote,
  deletingNoteId,
  onEditAnotacao,
  onCancelEditAnotacao,
  onSaveEditAnotacao,
  onDeleteAnotacao,

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

            <section>
              <h4 className="text-2xl font-black text-[#0b1f3f]">
                Comentários e atividade
              </h4>

              <div className="mt-4 space-y-3">
                {anotacoes.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    Nenhum comentário registrado.
                  </div>
                )}

                {anotacoes.map((item) => {
                  const editando = anotacaoEditandoId === item.id;
                  const excluindo = deletingNoteId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      {editando ? (
                        <div>
                          <textarea
                            value={textoEdicaoAnotacao}
                            onChange={(e) =>
                              setTextoEdicaoAnotacao(e.target.value)
                            }
                            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
                          />

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onSaveEditAnotacao(item.id)}
                              disabled={savingEditNote}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                            >
                              <Save size={15} />
                              {savingEditNote ? 'Salvando...' : 'Salvar edição'}
                            </button>

                            <button
                              type="button"
                              onClick={onCancelEditAnotacao}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600"
                            >
                              <XCircle size={15} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm font-black text-[#0b1f3f]">
                              {item.anotacao}
                            </p>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => onEditAnotacao(item)}
                                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                title="Editar comentário"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteAnotacao(item.id)}
                                disabled={excluindo}
                                className="grid h-9 w-9 place-items-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                title="Excluir comentário"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            {item.usuario_nome || 'Usuário'} •{' '}
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString('pt-BR')
                              : ''}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
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
                  {card.convertido
                    ? 'Lead já convertido'
                    : 'Converter para operação'}
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}