'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { PortalType } from '@/lib/kanbanData';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

import KanbanColumn from '@/components/kanban/KanbanColumn';
import CardModal from '@/components/kanban/CardModal';
import LeadModal from '@/components/kanban/LeadModal';
import ConvertModal from '@/components/kanban/ConvertModal';

type Board = {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string;
  ordem?: number;
};

type Column = {
  id: string;
  board_id: string;
  nome: string;
  ordem: number;
  prazo_padrao_dias?: number;
};

type Card = {
  id: string;
  board_id: string;
  coluna_id: string;
  titulo: string;
  descricao?: string;
  prioridade?: string;
  prazo?: string;
  ordem?: number;
  projeto_id?: string | null;
  lead_id?: string | null;
  convertido?: boolean;
  convertido_para_board_id?: string | null;
  convertido_para_card_id?: string | null;
  convertido_em?: string | null;
};

type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  cidade?: string;
  estado?: string;
  setor?: string;
  potencial_incentivo?: number;
  interesse_esg?: string;
};

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  status?: string;
};

type Anotacao = {
  id: string;
  card_id: string;
  usuario_nome?: string;
  anotacao: string;
  created_at: string;
};

type ChecklistItem = {
  id: string;
  card_id: string;
  titulo: string;
  concluido: boolean;
  ordem?: number;
};

type CardMembro = {
  id: string;
  card_id: string;
  usuario_id: string;
  manager_usuarios?: Usuario;
};

const leadInicial = {
  empresa: '',
  contato: '',
  cargo_contato: '',
  telefone: '',
  email: '',
  cnpj: '',
  cidade: '',
  estado: '',
  origem: 'Site IncentiVou',
  interesse: '',
  valor_estimado: '',
  responsavel: '',
  observacoes: '',
};

const empresaInicial = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  cidade: '',
  estado: '',
  setor: '',
  potencial_incentivo: '',
  interesse_esg: '',
};

const projetoInicial = {
  nome: '',
  descricao: '',
  lei_incentivo: 'Lei de Incentivo ao Esporte',
  area: '',
  cidade: '',
  estado: '',
  valor_total: '',
  responsavel: '',
};

export default function RealKanbanBoard({ portal = 'admin' }: { portal?: PortalType }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [activeBoardId, setActiveBoardId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [anotacaoEditandoId, setAnotacaoEditandoId] = useState<string | null>(null);
  const [textoEdicaoAnotacao, setTextoEdicaoAnotacao] = useState('');
  const [savingEditNote, setSavingEditNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [novoChecklistItem, setNovoChecklistItem] = useState('');

  const [membros, setMembros] = useState<CardMembro[]>([]);
  const [membroUsuarioId, setMembroUsuarioId] = useState('');

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadForm, setLeadForm] = useState(leadInicial);
  const [leadColumnId, setLeadColumnId] = useState('');

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [empresaModo, setEmpresaModo] = useState<'existente' | 'nova'>('nova');
  const [empresaExistenteId, setEmpresaExistenteId] = useState('');
  const [produtoDestinoBoardId, setProdutoDestinoBoardId] = useState('');
  const [empresaForm, setEmpresaForm] = useState(empresaInicial);
  const [projetoForm, setProjetoForm] = useState(projetoInicial);

  async function load() {
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase ainda não configurado. Confira o arquivo .env.local.');
      setLoading(false);
      return;
    }

    const [boardsRes, columnsRes, cardsRes, empresasRes, usuariosRes] = await Promise.all([
      supabase.from('manager_boards').select('*').order('ordem', { ascending: true }),
      supabase.from('manager_kanban_colunas').select('*').order('ordem', { ascending: true }),
      supabase.from('manager_kanban_cards').select('*').order('ordem', { ascending: true }),
      supabase.from('manager_empresas').select('*').order('created_at', { ascending: false }),
      supabase.from('manager_usuarios').select('*').order('nome', { ascending: true }),
    ]);

    if (boardsRes.error) setError(boardsRes.error.message);
    if (columnsRes.error) setError(columnsRes.error.message);
    if (cardsRes.error) setError(cardsRes.error.message);
    if (empresasRes.error) setError(empresasRes.error.message);
    if (usuariosRes.error) setError(usuariosRes.error.message);

    setBoards((boardsRes.data || []) as Board[]);
    setColumns((columnsRes.data || []) as Column[]);
    setCards((cardsRes.data || []) as Card[]);
    setEmpresas((empresasRes.data || []) as Empresa[]);
    setUsuarios((usuariosRes.data || []) as Usuario[]);

    const firstBoard = (boardsRes.data || [])[0]?.id || '';
    setActiveBoardId((current) => current || firstBoard);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  const visibleColumns = useMemo(
    () =>
      columns
        .filter((column) => column.board_id === activeBoardId)
        .sort((a, b) => a.ordem - b.ordem),
    [columns, activeBoardId]
  );

  const visibleCards = useMemo(
    () => cards.filter((card) => card.board_id === activeBoardId),
    [cards, activeBoardId]
  );

  const produtosDestino = useMemo(
    () => boards.filter((board) => board.tipo !== 'crm_comercial'),
    [boards]
  );

  async function moveCard(cardId: string, colunaId: string) {
  if (!supabase) return;

  const cardAtual = cards.find((c) => c.id === cardId);
  if (!cardAtual) return;

  const mudandoColuna = cardAtual.coluna_id !== colunaId;

  if (mudandoColuna) {
    const completo = await checklistCompleto(cardId);

    if (!completo) {
      const continuar = window.confirm(
        'O checklist desta etapa ainda não está completo.\nDeseja avançar mesmo assim?'
      );
      if (!continuar) return;
    }
  }

  const { error } = await supabase
    .from('manager_kanban_cards')
    .update({
      coluna_id: colunaId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId);

  if (error) {
    setError(error.message);
    return;
  }

  // Ao entrar em Execução Segura, substitui o checklist pelos itens da fase
  if (mudandoColuna) {
    const colunaDestino = columns.find((c) => c.id === colunaId);
    if (colunaDestino) {
      const nomeNormalizado = colunaDestino.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');

      const CHECKLISTS_POR_COLUNA: Record<string, string[]> = {
        execucao_segura: [
          'Recurso Liberado',
          'Kick-off Execução',
          'Manual de Execução Entregue',
          'Checklist Mensal',
          'Registro de Orientações',
          'Monitoramento Contínuo',
          'Prestação Parcial',
        ],
      };

      const itens = CHECKLISTS_POR_COLUNA[nomeNormalizado];
      if (itens) {
        await supabase.from('manager_card_checklist').delete().eq('card_id', cardId);
        await supabase.from('manager_card_checklist').insert(
          itens.map((titulo, index) => ({
            card_id: cardId,
            titulo,
            concluido: false,
            ordem: index + 1,
          }))
        );
        if (selectedCard?.id === cardId) {
          await carregarChecklist(cardId);
        }
      }
    }
  }

  setCards((prev) =>
    prev.map((card) =>
      card.id === cardId ? { ...card, coluna_id: colunaId } : card
    )
  );
}

  async function criarLead(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !activeBoard) return;

    setSavingLead(true);
    setError('');

    const colunaId =
      leadColumnId ||
      visibleColumns.find((col) => col.nome.toLowerCase().includes('novo'))?.id ||
      visibleColumns[0]?.id;

    if (!colunaId) {
      setError('Coluna de Novo Lead não encontrada.');
      setSavingLead(false);
      return;
    }

    const { data: lead, error: leadError } = await supabase
      .from('manager_leads')
      .insert({
        empresa: leadForm.empresa.trim(),
        contato: leadForm.contato.trim() || null,
        cargo_contato: leadForm.cargo_contato.trim() || null,
        telefone: leadForm.telefone.trim() || null,
        email: leadForm.email.trim() || null,
        cnpj: leadForm.cnpj.trim() || null,
        cidade: leadForm.cidade.trim() || null,
        estado: leadForm.estado.trim() || null,
        origem: leadForm.origem || null,
        interesse: leadForm.interesse || null,
        valor_estimado: Number(leadForm.valor_estimado || 0),
        responsavel: leadForm.responsavel.trim() || null,
        observacoes: leadForm.observacoes.trim() || null,
        status: 'novo_lead',
      })
      .select('*')
      .single();

    if (leadError || !lead) {
      setError(leadError?.message || 'Erro ao criar lead.');
      setSavingLead(false);
      return;
    }

    const descricao = [
      lead.contato ? `Contato: ${lead.contato}` : '',
      lead.telefone ? `Telefone: ${lead.telefone}` : '',
      lead.email ? `E-mail: ${lead.email}` : '',
      lead.interesse ? `Interesse: ${lead.interesse}` : '',
      lead.valor_estimado ? `Potencial: R$ ${Number(lead.valor_estimado).toLocaleString('pt-BR')}` : '',
      lead.observacoes ? `Observações: ${lead.observacoes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const { data: card, error: cardError } = await supabase
      .from('manager_kanban_cards')
      .insert({
        lead_id: lead.id,
        board_id: activeBoard.id,
        coluna_id: colunaId,
        titulo: lead.empresa,
        descricao,
        prioridade: 'media',
        status: 'ativo',
        prazo: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        ordem: 1,
      })
      .select('*')
      .single();

    if (cardError || !card) {
      setError(cardError?.message || 'Erro ao criar card do lead.');
      setSavingLead(false);
      return;
    }

    await supabase.from('manager_leads').update({ card_id: card.id }).eq('id', lead.id);

    setCards((prev) => [card as Card, ...prev]);
    setLeadForm(leadInicial);
    setShowLeadModal(false);
    setSavingLead(false);
  }

async function checklistCompleto(cardId: string) {
  if (!supabase) return true;

  const { data } = await supabase
    .from('manager_card_checklist')
    .select('*')
    .eq('card_id', cardId);

  if (!data?.length) return true; // sem checklist = pode mover

  return data.every((item) => item.concluido);
}

  async function abrirCard(card: Card) {
    setSelectedCard(card);
    setNovaAnotacao('');
    setShowConvertModal(false);
    setProdutoDestinoBoardId('');
    setEmpresaModo('nova');
    setEmpresaExistenteId('');

    setEmpresaForm({
      razao_social: card.titulo || '',
      nome_fantasia: card.titulo || '',
      cnpj: '',
      cidade: '',
      estado: '',
      setor: '',
      potencial_incentivo: '',
      interesse_esg: '',
    });

    setProjetoForm({
      nome: card.titulo || '',
      descricao: card.descricao || '',
      lei_incentivo: 'Lei de Incentivo ao Esporte',
      area: '',
      cidade: '',
      estado: '',
      valor_total: '',
      responsavel: '',
    });

    await Promise.all([
      carregarAnotacoes(card.id),
      carregarChecklist(card.id),
      carregarMembros(card.id),
    ]);
  }

  async function carregarAnotacoes(cardId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('manager_card_anotacoes')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setAnotacoes((data || []) as Anotacao[]);
  }

  async function carregarChecklist(cardId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('manager_card_checklist')
      .select('*')
      .eq('card_id', cardId)
      .order('ordem', { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setChecklist((data || []) as ChecklistItem[]);
  }

  async function carregarMembros(cardId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('manager_card_membros')
      .select('*, manager_usuarios (*)')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setMembros((data || []) as CardMembro[]);
  }

  async function salvarAnotacao(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase || !selectedCard || !novaAnotacao.trim()) return;

    setSavingNote(true);

    const { error } = await supabase.from('manager_card_anotacoes').insert({
      card_id: selectedCard.id,
      usuario_nome: 'Bruno Guilherme',
      anotacao: novaAnotacao.trim(),
    });

    if (error) {
      setError(error.message);
      setSavingNote(false);
      return;
    }

    setNovaAnotacao('');
    await carregarAnotacoes(selectedCard.id);
    setSavingNote(false);
  }

  function iniciarEditarAnotacao(anotacao: Anotacao) {
  setAnotacaoEditandoId(anotacao.id);
  setTextoEdicaoAnotacao(anotacao.anotacao || '');
}

function cancelarEditarAnotacao() {
  setAnotacaoEditandoId(null);
  setTextoEdicaoAnotacao('');
}

async function salvarEdicaoAnotacao(anotacaoId: string) {
  if (!supabase || !selectedCard || !textoEdicaoAnotacao.trim()) return;

  setSavingEditNote(true);

  const { error } = await supabase
    .from('manager_card_anotacoes')
    .update({
      anotacao: textoEdicaoAnotacao.trim(),
    })
    .eq('id', anotacaoId);

  if (error) {
    setError(error.message);
    setSavingEditNote(false);
    return;
  }

  setAnotacaoEditandoId(null);
  setTextoEdicaoAnotacao('');
  await carregarAnotacoes(selectedCard.id);
  setSavingEditNote(false);
}

async function excluirAnotacao(anotacaoId: string) {
  if (!supabase || !selectedCard) return;

  const confirmar = window.confirm('Deseja realmente excluir este comentário?');
  if (!confirmar) return;

  setDeletingNoteId(anotacaoId);

  const { error } = await supabase
    .from('manager_card_anotacoes')
    .delete()
    .eq('id', anotacaoId);

  if (error) {
    setError(error.message);
    setDeletingNoteId(null);
    return;
  }

  await carregarAnotacoes(selectedCard.id);
  setDeletingNoteId(null);
}

  async function adicionarChecklistItem() {
    if (!supabase || !selectedCard || !novoChecklistItem.trim()) return;

    const { data, error } = await supabase
      .from('manager_card_checklist')
      .insert({
        card_id: selectedCard.id,
        titulo: novoChecklistItem.trim(),
        concluido: false,
        ordem: checklist.length + 1,
      })
      .select('*')
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setChecklist((prev) => [...prev, data as ChecklistItem]);
    setNovoChecklistItem('');
  }

  async function excluirCard(card: any) {
  if (!supabase) return;

  if (!confirm(`Deseja excluir o card "${card.titulo}"?`)) return;

  const { error } = await supabase
    .from('manager_kanban_cards')
    .delete()
    .eq('id', card.id);

  if (error) {
    setError(error.message);
    return;
  }

  if (card.lead_id) {
    await supabase
      .from('manager_leads')
      .delete()
      .eq('id', card.lead_id);
  }

  setCards((prev) => prev.filter((item) => item.id !== card.id));
}
  
  async function alternarChecklistItem(item: ChecklistItem) {
    if (!supabase) return;

    const { error } = await supabase
      .from('manager_card_checklist')
      .update({ concluido: !item.concluido })
      .eq('id', item.id);

    if (error) {
      setError(error.message);
      return;
    }

    setChecklist((prev) =>
      prev.map((current) =>
        current.id === item.id ? { ...current, concluido: !current.concluido } : current
      )
    );
  }

  async function adicionarMembro() {
    if (!supabase || !selectedCard || !membroUsuarioId) return;

    const usuario = usuarios.find((item) => item.id === membroUsuarioId);

    const { error } = await supabase.from('manager_card_membros').insert({
      card_id: selectedCard.id,
      usuario_id: membroUsuarioId,
    });

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.from('manager_notificacoes').insert({
      usuario_id: membroUsuarioId,
      titulo: 'Você foi adicionado a um card',
      mensagem: `Você foi atribuído ao card "${selectedCard.titulo}".`,
      tipo: 'kanban',
      lida: false,
      link: `/admin/kanban`,
    });

    await supabase.from('manager_card_anotacoes').insert({
      card_id: selectedCard.id,
      usuario_nome: 'Sistema',
      anotacao: `${usuario?.nome || 'Usuário'} foi adicionado como membro do card.`,
    });

    setMembroUsuarioId('');
    await Promise.all([carregarMembros(selectedCard.id), carregarAnotacoes(selectedCard.id)]);
  }

  async function criarChecklistPadraoEsporte360(cardId: string) {
  if (!supabase) return;

  const itensPadrao = [
    'Análise Prévia',
    'Reunião Técnica',
    'Checklist Legal',
    'Parecer Técnico',
    'Decisão Final',
  ];

  const { error } = await supabase.from('manager_card_checklist').insert(
    itensPadrao.map((titulo, index) => ({
      card_id: cardId,
      titulo,
      concluido: false,
      ordem: index + 1,
    }))
  );

  if (error) {
    setError(error.message);
  }
}

  async function converterVendaParaOperacao(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase || !selectedCard || !produtoDestinoBoardId) return;

    setConverting(true);
    setError('');

    const boardDestino = boards.find((board) => board.id === produtoDestinoBoardId);

    if (!boardDestino) {
      setError('Produto/board de destino não encontrado.');
      setConverting(false);
      return;
    }

    const primeiraColuna = columns
      .filter((col) => col.board_id === boardDestino.id)
      .sort((a, b) => a.ordem - b.ordem)[0];

    if (!primeiraColuna) {
      setError('Nenhuma coluna encontrada para o produto escolhido.');
      setConverting(false);
      return;
    }

    let empresaId = empresaExistenteId;

    if (empresaModo === 'nova') {
      if (!empresaForm.razao_social.trim()) {
        setError('Informe a razão social da empresa.');
        setConverting(false);
        return;
      }

      const { data: novaEmpresa, error: empresaError } = await supabase
        .from('manager_empresas')
        .insert({
          razao_social: empresaForm.razao_social.trim(),
          nome_fantasia: empresaForm.nome_fantasia.trim() || empresaForm.razao_social.trim(),
          cnpj: empresaForm.cnpj.trim() || null,
          cidade: empresaForm.cidade.trim() || null,
          estado: empresaForm.estado.trim() || null,
          setor: empresaForm.setor.trim() || null,
          potencial_incentivo: Number(empresaForm.potencial_incentivo || 0),
          interesse_esg: empresaForm.interesse_esg.trim() || null,
          status: 'ativa',
        })
        .select('*')
        .single();

      if (empresaError || !novaEmpresa) {
        setError(empresaError?.message || 'Erro ao criar empresa.');
        setConverting(false);
        return;
      }

      empresaId = novaEmpresa.id;
      setEmpresas((prev) => [novaEmpresa as Empresa, ...prev]);
    }

    if (!empresaId) {
      setError('Selecione uma empresa existente ou cadastre uma nova empresa.');
      setConverting(false);
      return;
    }

    const nomeProjeto = projetoForm.nome.trim() || selectedCard.titulo;

    const { data: novoProjeto, error: projetoError } = await supabase
      .from('manager_projetos')
      .insert({
        empresa_id: empresaId,
        lead_id: selectedCard.lead_id || null,
        nome: nomeProjeto,
        descricao: projetoForm.descricao.trim() || selectedCard.descricao || null,
        lei_incentivo: projetoForm.lei_incentivo.trim() || null,
        area: projetoForm.area.trim() || null,
        cidade: projetoForm.cidade.trim() || empresaForm.cidade.trim() || null,
        estado: projetoForm.estado.trim() || empresaForm.estado.trim() || null,
        valor_total: Number(projetoForm.valor_total || 0),
        valor_aprovado: 0,
        valor_captado: 0,
        status: 'ativo',
        risco: 'baixo',
        data_inicio: new Date().toISOString().slice(0, 10),
        data_limite: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        produto_contratado: boardDestino.nome,
      })
      .select('*')
      .single();

    if (projetoError || !novoProjeto) {
      setError(projetoError?.message || 'Erro ao criar projeto.');
      setConverting(false);
      return;
    }

    const { data: novoCard, error: cardError } = await supabase
      .from('manager_kanban_cards')
      .insert({
        projeto_id: novoProjeto.id,
        lead_id: selectedCard.lead_id || null,
        board_id: boardDestino.id,
        coluna_id: primeiraColuna.id,
        titulo: nomeProjeto,
        descricao: `Produto contratado: ${boardDestino.nome}`,
        prioridade: selectedCard.prioridade || 'media',
        status: 'ativo',
        prazo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        ordem: 1,
      })
      .select('*')
      .single();

    if (cardError || !novoCard) {
      setError(cardError?.message || 'Erro ao criar card operacional.');
      setConverting(false);
      return;
    }

    if (
  boardDestino.nome === 'Esporte 360°' &&
  primeiraColuna.nome === 'Diagnóstico'
) {
  await criarChecklistPadraoEsporte360(novoCard.id);
}

    await supabase
      .from('manager_kanban_cards')
      .update({
        convertido: true,
        convertido_para_board_id: boardDestino.id,
        convertido_para_card_id: novoCard.id,
        convertido_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCard.id);

    if (selectedCard.lead_id) {
      await supabase
        .from('manager_leads')
        .update({
          status: 'convertido',
          convertido: true,
          convertido_projeto_id: novoProjeto.id,
          convertido_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedCard.lead_id);
    }

    await supabase.from('manager_historico').insert({
      projeto_id: novoProjeto.id,
      acao: 'Venda convertida',
      detalhe: `Lead ${selectedCard.titulo} convertido para ${boardDestino.nome}.`,
    });

    await supabase.from('manager_alertas').insert({
      projeto_id: novoProjeto.id,
      titulo: 'Novo projeto criado',
      mensagem: `Projeto ${nomeProjeto} criado a partir da conversão comercial.`,
      tipo: 'info',
      lido: false,
      prazo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });

    await supabase.from('manager_card_anotacoes').insert({
      card_id: selectedCard.id,
      usuario_nome: 'Bruno Guilherme',
      anotacao: `Venda convertida para ${boardDestino.nome}. Projeto criado: ${nomeProjeto}.`,
    });

    setCards((prev) =>
      prev
        .map((card) =>
          card.id === selectedCard.id
            ? {
                ...card,
                convertido: true,
                convertido_para_board_id: boardDestino.id,
                convertido_para_card_id: novoCard.id,
                convertido_em: new Date().toISOString(),
              }
            : card
        )
        .concat(novoCard as Card)
    );

    setConverting(false);
    setShowConvertModal(false);
    setProdutoDestinoBoardId('');
    setSelectedCard(null);
    setActiveBoardId(boardDestino.id);
  }

  function getColumnName(id: string) {
    return columns.find((column) => column.id === id)?.nome || 'Sem etapa';
  }

  async function adicionarCartaoNaColuna(colunaId: string) {
    if (!supabase || !activeBoard) return;

    // Board CRM: abre modal de lead
    if (activeBoard.tipo === 'crm_comercial') {
      setLeadColumnId(colunaId);
      setLeadForm(leadInicial);
      setShowLeadModal(true);
      return;
    }

    // Outros boards: cria card simples
    const titulo = window.prompt('Título do cartão:');
    if (!titulo?.trim()) return;

    const { data: novoCard, error } = await supabase
      .from('manager_kanban_cards')
      .insert({
        board_id: activeBoard.id,
        coluna_id: colunaId,
        titulo: titulo.trim(),
        prioridade: 'media',
        status: 'ativo',
        prazo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        ordem: 1,
      })
      .select('*')
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setCards((prev) => [novoCard as Card, ...prev]);
  }

  const isVendaFechada =
    selectedCard && getColumnName(selectedCard.coluna_id) === 'Venda Fechada';

  return (
    <PortalShell portal={portal}>
      <section className="rounded-[1.65rem] border border-[#d8e6f5] bg-white p-5 shadow-[0_18px_55px_rgba(11,31,63,0.06)]">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#16c784]">
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#061b3a]">
        {activeBoard?.nome || 'CRM Comercial'}
      </h2>

      <p className="mt-1 text-sm font-bold text-[#40516b]">
        Leads • Projetos • Captação • Execução
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-[180px] rounded-2xl border border-[#e4eef8] bg-[#f7fbff] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8ba3]">
          Leads
        </p>
        <p className="mt-1 text-xl font-black text-[#061b3a]">
          {cards.filter((c) => c.lead_id).length}
        </p>
      </div>

      <div className="min-w-[180px] rounded-2xl border border-[#e4eef8] bg-[#f7fbff] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8ba3]">
          Vendas Fechadas
        </p>
        <p className="mt-1 text-xl font-black text-[#16c784]">
          {
            cards.filter(
              (c) =>
                columns.find((col) => col.id === c.coluna_id)?.nome ===
                'Venda Fechada'
            ).length
          }
        </p>
      </div>

      <div className="min-w-[180px] rounded-2xl border border-[#e4eef8] bg-[#f7fbff] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8ba3]">
          Vendas Perdidas
        </p>
        <p className="mt-1 text-xl font-black text-[#ef4444]">
          {
            cards.filter(
              (c) =>
                columns.find((col) => col.id === c.coluna_id)?.nome ===
                'Venda Perdida'
            ).length
          }
        </p>
      </div>

      <button
        onClick={load}
        className="min-w-[180px] rounded-2xl bg-gradient-to-r from-[#0068ff] to-[#16c784] px-5 py-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(18,183,168,0.22)]"
      >
        ↻ Atualizar
      </button>
    </div>
  </div>
</section>

      {error && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          {error}
        </div>
      )}

      <section className="mt-4 rounded-[1.5rem] border border-[#d8e6f5] bg-white/92 px-4 py-3 shadow-[0_12px_35px_rgba(11,31,63,0.05)]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/admin/leads"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-[#d8e6f5] bg-white px-5 text-sm font-black text-[#061b3a] shadow-sm transition hover:border-[#16c784] hover:bg-[#f5fffb]"
          >
            Leads
            <span className="rounded-full bg-[#e9fff7] px-2 py-1 text-xs font-black text-[#16c784]">
              {cards.filter((card) => card.lead_id).length}
            </span>
          </Link>

          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => setActiveBoardId(board.id)}
              className={`h-10 shrink-0 rounded-2xl px-5 text-sm font-black transition ${
                activeBoardId === board.id
                  ? 'bg-gradient-to-r from-[#0068ff] via-[#12b7a8] to-[#16c784] text-white shadow-[0_14px_35px_rgba(18,183,168,0.22)]'
                  : 'bg-[#f7fbff] text-[#061b3a] hover:bg-[#eef7ff] hover:text-[#079b6f]'
              }`}
            >
              {board.nome}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 overflow-x-auto pb-4">
        {loading ? (
          <div className="rounded-[2rem] bg-white p-8 font-bold text-slate-500">
            Carregando Kanban...
          </div>
        ) : visibleColumns.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 font-bold text-slate-500">
            Nenhuma coluna encontrada.
          </div>
        ) : (
          <div className="flex min-h-[560px] gap-5">
            {visibleColumns.map((column) => {
              const columnCards = visibleCards.filter((card) => card.coluna_id === column.id);

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={columnCards}
                  onMoveCard={moveCard}
                  onOpenCard={abrirCard}
                  onAddCard={adicionarCartaoNaColuna}
                  onDeleteCard={excluirCard}
                />
              );
            })}
          </div>
        )}
      </section>

      <LeadModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={criarLead}
        leadForm={leadForm}
        setLeadForm={setLeadForm}
        saving={savingLead}
      />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          columnName={getColumnName(selectedCard.coluna_id)}
          isVendaFechada={!!isVendaFechada}
          onClose={() => setSelectedCard(null)}
          onOpenConvert={() => setShowConvertModal(true)}
          anotacoes={anotacoes}
          novaAnotacao={novaAnotacao}
          setNovaAnotacao={setNovaAnotacao}
          onSaveAnotacao={salvarAnotacao}
          savingNote={savingNote}
          checklist={checklist}
          novoChecklistItem={novoChecklistItem}
          setNovoChecklistItem={setNovoChecklistItem}
          onAddChecklistItem={adicionarChecklistItem}
          onToggleChecklistItem={alternarChecklistItem}
          usuarios={usuarios}
          membros={membros}
          membroUsuarioId={membroUsuarioId}
          setMembroUsuarioId={setMembroUsuarioId}
          anotacaoEditandoId={anotacaoEditandoId}
textoEdicaoAnotacao={textoEdicaoAnotacao}
setTextoEdicaoAnotacao={setTextoEdicaoAnotacao}
savingEditNote={savingEditNote}
deletingNoteId={deletingNoteId}
onEditAnotacao={iniciarEditarAnotacao}
onCancelEditAnotacao={cancelarEditarAnotacao}
onSaveEditAnotacao={salvarEdicaoAnotacao}
onDeleteAnotacao={excluirAnotacao}
          onAddMembro={adicionarMembro}
        />
      )}

      <ConvertModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onSubmit={converterVendaParaOperacao}
        converting={converting}
        empresas={empresas}
        produtosDestino={produtosDestino}
        empresaModo={empresaModo}
        setEmpresaModo={setEmpresaModo}
        empresaExistenteId={empresaExistenteId}
        setEmpresaExistenteId={setEmpresaExistenteId}
        empresaForm={empresaForm}
        setEmpresaForm={setEmpresaForm}
        projetoForm={projetoForm}
        setProjetoForm={setProjetoForm}
        produtoDestinoBoardId={produtoDestinoBoardId}
        setProdutoDestinoBoardId={setProdutoDestinoBoardId}
      
      />
    </PortalShell>
  );
}
