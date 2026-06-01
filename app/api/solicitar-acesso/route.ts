import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nome,
      empresa,
      email,
      telefone,
      cidade,
      estado,
      tipo_acesso,
      mensagem,
    } = body;

    const { data: solicitacao, error: solicitacaoError } = await supabaseAdmin
      .from('manager_solicitacoes_acesso')
      .insert({
        nome,
        empresa,
        email,
        telefone,
        cidade,
        estado,
        tipo_acesso,
        mensagem,
      })
      .select('*')
      .single();

    if (solicitacaoError) throw solicitacaoError;

    const { data: board } = await supabaseAdmin
      .from('manager_boards')
      .select('*')
      .eq('nome', 'CRM Comercial')
      .single();

    const { data: coluna } = await supabaseAdmin
      .from('manager_kanban_colunas')
      .select('*')
      .eq('board_id', board?.id)
      .eq('nome', 'Novo Lead')
      .single();

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('manager_leads')
      .insert({
        empresa,
        contato: nome,
        telefone,
        email,
        cidade,
        estado,
        origem: 'Solicitação de acesso',
        interesse: tipo_acesso,
        observacoes: mensagem,
        status: 'novo_lead',
      })
      .select('*')
      .single();

    if (leadError) throw leadError;

    let card = null;

    if (board && coluna) {
      const { data: novoCard, error: cardError } = await supabaseAdmin
        .from('manager_kanban_cards')
        .insert({
          lead_id: lead.id,
          board_id: board.id,
          coluna_id: coluna.id,
          titulo: empresa,
          descricao: mensagem || '',
          prioridade: 'media',
          status: 'ativo',
          prazo: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
          ordem: 1,
        })
        .select('*')
        .single();

      if (cardError) throw cardError;

      card = novoCard;

      await supabaseAdmin
        .from('manager_leads')
        .update({ card_id: card.id })
        .eq('id', lead.id);
    }

    await supabaseAdmin
      .from('manager_solicitacoes_acesso')
      .update({
        lead_id: lead.id,
        card_id: card?.id || null,
      })
      .eq('id', solicitacao.id);

    await resend.emails.send({
      from: 'IncentiVou <contato@incentivou.com.br>',
      to: ['ester@incentivou.com.br', 'brunoleoguilherme@gmail.com'],
      subject: 'Nova solicitação de acesso ao IncentiVou Manager',
      html: `
        <h2>Nova solicitação de acesso</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone || '-'}</p>
        <p><strong>Cidade/Estado:</strong> ${cidade || '-'} / ${estado || '-'}</p>
        <p><strong>Tipo de acesso:</strong> ${tipo_acesso || '-'}</p>
        <p><strong>Mensagem:</strong> ${mensagem || '-'}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Erro ao solicitar acesso.' },
      { status: 500 }
    );
  }
}