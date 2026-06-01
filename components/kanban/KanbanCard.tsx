'use client';

import { useState } from 'react';
import {
  CalendarClock,
  Edit3,
  Mail,
  MoreVertical,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react';

type Props = {
  card: any;
  onOpen: (card: any) => void;
  onDelete: (card: any) => void;
};

function limparDescricao(descricao?: string) {
  if (!descricao) return '';

  const textosRemover = [
    'Card criado pelo Kanban operacional',
    'Novo lead cadastrado no CRM Comercial.',
    'Card criado diretamente no fluxo operacional.',
    'Observações:',
    'Observação:',
    'Observacao:',
    'Observacoes:',
  ];

  let texto = descricao;

  textosRemover.forEach((item) => {
    texto = texto.replaceAll(item, '');
  });

  return texto.trim();
}

export default function KanbanCard({ card, onOpen, onDelete }: Props) {
  const [menuAberto, setMenuAberto] = useState(false);
  const descricaoLimpa = limparDescricao(card.descricao);

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
      onClick={() => onOpen(card)}
      className="group relative cursor-pointer overflow-visible rounded-[1.5rem] border border-[#d8e6f5] bg-white p-4 shadow-[0_18px_45px_rgba(11,31,63,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-[#16c784]/50 hover:shadow-[0_22px_55px_rgba(11,31,63,0.13)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784]" />

      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[1rem] font-black leading-tight tracking-[-0.03em] text-[#061b3a]">
          {card.titulo}
        </h4>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAberto((value) => !value);
            }}
            className="rounded-xl p-1 text-[#8aa0bb] transition hover:bg-[#eef7ff] hover:text-[#061b3a]"
          >
            <MoreVertical size={16} />
          </button>

          {menuAberto && (
            <div
              className="absolute right-0 top-8 z-50 w-40 rounded-2xl border border-[#d8e6f5] bg-white p-2 shadow-[0_18px_50px_rgba(11,31,63,0.16)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false);
                  onOpen(card);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-[#061b3a] hover:bg-[#f5f9ff]"
              >
                <Edit3 size={15} />
                Editar
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuAberto(false);
                  onDelete(card);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {descricaoLimpa && (
        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#52627a]">
          {descricaoLimpa}
        </p>
      )}

      {(card.contato || card.telefone || card.email) && (
        <div className="mt-3 space-y-1.5 text-xs font-bold text-[#52627a]">
          {card.contato && (
            <p className="flex items-center gap-2">
              <UserRound size={13} className="text-[#13b8a6]" />
              <span className="truncate">{card.contato}</span>
            </p>
          )}

          {card.telefone && (
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-[#13b8a6]" />
              <span className="truncate">{card.telefone}</span>
            </p>
          )}

          {card.email && (
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-[#13b8a6]" />
              <span className="truncate">{card.email}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[#edf3fa] pt-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7b8ba3]">
          <CalendarClock size={12} />
          Prazo
        </span>

        <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-[11px] font-black text-[#061b3a]">
          {card.prazo ? new Date(card.prazo).toLocaleDateString('pt-BR') : 'Sem prazo'}
        </span>
      </div>
    </div>
  );
}
