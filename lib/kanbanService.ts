import { supabase } from './supabaseClient';

export async function getKanbanData() {
  if (!supabase) return { colunas: [], cards: [] };

  const [{ data: colunas }, { data: cards }] = await Promise.all([
    supabase
      .from('manager_kanban_colunas')
      .select('*')
      .order('ordem', { ascending: true }),

    supabase
      .from('manager_kanban_cards')
      .select('*')
      .order('ordem', { ascending: true }),
  ]);

  return {
    colunas: colunas || [],
    cards: cards || [],
  };
}

export async function moverCard(cardId: string, colunaId: string) {
  if (!supabase) return false;

  const { error } = await supabase
    .from('manager_kanban_cards')
    .update({
      coluna_id: colunaId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId);

  if (error) {
    console.error('Erro ao mover card:', error);
    return false;
  }

  return true;
}