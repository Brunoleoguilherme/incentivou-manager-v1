import { supabase } from './supabaseClient';

export async function getLeads() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('manager_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar leads:', error);
    return [];
  }

  return data || [];
}

export async function criarLead(payload: any) {
  if (!supabase) return { data: null, error: 'Supabase não configurado' };

  const { data: lead, error: leadError } = await supabase
    .from('manager_leads')
    .insert([payload])
    .select()
    .single();

  if (leadError || !lead) {
    console.error('Erro ao criar lead:', leadError);
    return { data: null, error: leadError };
  }

  const { data: board } = await supabase
    .from('manager_boards')
    .select('*')
    .eq('tipo', 'crm_comercial')
    .single();

  const { data: coluna } = await supabase
    .from('manager_kanban_colunas')
    .select('*')
    .eq('board_id', board?.id)
    .eq('nome', 'Novo Lead')
    .single();

  if (board && coluna) {
    const { data: card } = await supabase
      .from('manager_kanban_cards')
      .insert([
        {
          board_id: board.id,
          coluna_id: coluna.id,
          titulo: payload.empresa,
          descricao: payload.observacoes || `Contato: ${payload.contato || 'Não informado'}`,
          prioridade: 'media',
          status: 'ativo',
          prazo: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          ordem: 1,
        },
      ])
      .select()
      .single();

    if (card) {
      await supabase
        .from('manager_leads')
        .update({ card_id: card.id })
        .eq('id', lead.id);
    }
  }

  return { data: lead, error: null };
}