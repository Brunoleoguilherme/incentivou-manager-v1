'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, FolderKanban, Plus, RefreshCw, UserRound } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { PortalType } from '@/lib/kanbanData';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

type Board = { id: string; nome: string; tipo: string; descricao?: string; ordem?: number };
type Column = { id: string; board_id: string; nome: string; ordem: number; prazo_padrao_dias?: number };
type Card = { id: string; board_id: string; coluna_id: string; titulo: string; descricao?: string; prioridade?: string; prazo?: string; ordem?: number; projeto_id?: string };

export default function RealKanbanBoard({ portal = 'admin' }: { portal?: PortalType }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeBoardId, setActiveBoardId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColumnId, setNewColumnId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase ainda não configurado. Confira o arquivo .env.local.');
      setLoading(false);
      return;
    }

    const [boardsRes, columnsRes, cardsRes] = await Promise.all([
      supabase.from('boards').select('*').order('ordem', { ascending: true }),
      supabase.from('kanban_colunas').select('*').order('ordem', { ascending: true }),
      supabase.from('kanban_cards').select('*').order('ordem', { ascending: true }),
    ]);

    if (boardsRes.error) setError(boardsRes.error.message);
    setBoards((boardsRes.data || []) as Board[]);
    setColumns((columnsRes.data || []) as Column[]);
    setCards((cardsRes.data || []) as Card[]);
    const firstBoard = (boardsRes.data || [])[0]?.id || '';
    setActiveBoardId((current) => current || firstBoard);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const visibleColumns = useMemo(() => columns.filter((c) => c.board_id === activeBoardId).sort((a, b) => a.ordem - b.ordem), [columns, activeBoardId]);
  const visibleCards = useMemo(() => cards.filter((c) => c.board_id === activeBoardId), [cards, activeBoardId]);

  useEffect(() => {
    if (!newColumnId && visibleColumns[0]) setNewColumnId(visibleColumns[0].id);
  }, [visibleColumns, newColumnId]);

  async function moveCard(cardId: string, colunaId: string) {
    if (!supabase) return;
    const { error } = await supabase.from('kanban_cards').update({ coluna_id: colunaId, updated_at: new Date().toISOString() }).eq('id', cardId);
    if (error) setError(error.message);
    else setCards((prev) => prev.map((card) => card.id === cardId ? { ...card, coluna_id: colunaId } : card));
  }

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !newTitle.trim() || !activeBoardId || !newColumnId) return;
    const { data, error } = await supabase.from('kanban_cards').insert({ board_id: activeBoardId, coluna_id: newColumnId, titulo: newTitle.trim(), descricao: 'Card criado pelo Kanban operacional', prioridade: 'media' }).select('*').single();
    if (error) setError(error.message);
    else {
      setCards((prev) => [data as Card, ...prev]);
      setNewTitle('');
    }
  }

  return (
    <PortalShell portal={portal}>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Kanban operacional real</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">{activeBoard?.nome || 'Boards IncentiVou'}</h2>
            <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-slate-600">{activeBoard?.descricao || 'Gestão estilo Trello com responsáveis, SLAs, etapas e rastreabilidade por projeto.'}</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm"><RefreshCw size={17}/> Atualizar</button>
        </div>
      </section>

      {error && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</div>}

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {boards.map((board) => <button key={board.id} onClick={() => { setActiveBoardId(board.id); setNewColumnId(''); }} className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black transition ${activeBoardId === board.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{board.nome}</button>)}
        </div>
      </section>

      <form onSubmit={addCard} className="mt-6 grid gap-3 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-4 md:grid-cols-[1fr_280px_auto]">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Criar novo card operacional..." className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none" />
        <select value={newColumnId} onChange={(e) => setNewColumnId(e.target.value)} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none">
          {visibleColumns.map((col) => <option key={col.id} value={col.id}>{col.nome}</option>)}
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white"><Plus size={17}/> Criar card</button>
      </form>

      <section className="mt-6 overflow-x-auto pb-4">
        {loading ? <div className="rounded-[2rem] bg-white p-8 font-bold text-slate-500">Carregando Kanban...</div> : visibleColumns.length === 0 ? <div className="rounded-[2rem] bg-white p-8 font-bold text-slate-500">Nenhuma coluna encontrada. Rode o Script 02 no Supabase.</div> : (
          <div className="flex min-h-[560px] gap-4">
            {visibleColumns.map((col) => {
              const colCards = visibleCards.filter((card) => card.coluna_id === col.id);
              return <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const cardId = e.dataTransfer.getData('text/card-id'); if (cardId) moveCard(cardId, col.id); }} className="w-[310px] shrink-0 rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-950">{col.nome}</h3><p className="mt-1 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500"><CalendarClock size={14}/> SLA {col.prazo_padrao_dias || 3} dias</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{colCards.length}</span></div>
                <div className="space-y-3">{colCards.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-sm font-bold text-slate-400"><FolderKanban className="mx-auto mb-2" size={20}/> Arraste cards para cá</div> : colCards.map((card) => <article key={card.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/card-id', card.id)} className="cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing"><div className="mb-3 flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${card.prioridade === 'alta' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{card.prioridade || 'média'}</span><AlertCircle size={16} className="text-slate-300"/></div><h4 className="font-black leading-snug text-slate-950">{card.titulo}</h4><p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">{card.descricao || 'Sem descrição.'}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400"><span className="inline-flex items-center gap-1"><UserRound size={14}/> Resp.</span><span>{card.prazo ? new Date(card.prazo + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem prazo'}</span></div></article>)}</div>
              </div>;
            })}
          </div>
        )}
      </section>
    </PortalShell>
  );
}
