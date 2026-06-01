'use client';

import { FolderKanban, Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';

type Props = {
  column: any;
  cards: any[];
  onMoveCard: (cardId: string, colunaId: string) => void;
  onOpenCard: (card: any) => void;
  onAddCard: (colunaId: string) => void;
  onDeleteCard: (card: any) => void;
};

export default function KanbanColumn({
  column,
  cards,
  onMoveCard,
  onOpenCard,
  onAddCard,
  onDeleteCard,
}: Props) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) onMoveCard(cardId, column.id);
      }}
      className="flex min-h-[650px] w-[340px] shrink-0 flex-col rounded-[1.6rem] border border-[#d8e6f5] bg-[#f8fbff] p-3 shadow-[0_18px_50px_rgba(11,31,63,0.06)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h3 className="text-[1rem] font-black tracking-[-0.03em] text-[#061b3a]">
          {column.nome}
        </h3>

        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-xs font-black text-[#061b3a] shadow-sm">
          {cards.length}
        </span>
      </div>

      <div className="space-y-3">
        {cards.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-[#cfe0f3] bg-white/75 p-7 text-center">
            <FolderKanban className="mx-auto text-[#9eb2c9]" size={24} />
            <p className="mt-3 text-sm font-bold text-[#7b8ba3]">
              Arraste cards para cá
            </p>
          </div>
        )}

        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onOpen={onOpenCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddCard(column.id)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-white px-4 py-3 text-sm font-black text-[#061b3a] shadow-sm ring-1 ring-[#d8e6f5] transition hover:-translate-y-0.5 hover:bg-[#f2fffa] hover:text-[#079b6f] hover:ring-[#16c784]/40"
      >
        <Plus size={16} />
        Adicionar um cartão
      </button>
    </div>
  );
}
