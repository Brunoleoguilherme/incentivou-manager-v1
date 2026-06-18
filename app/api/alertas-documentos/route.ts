import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

console.log(
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? 'SERVICE ROLE OK'
    : 'SERVICE ROLE AUSENTE'
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function diasRestantes(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(`${data}T00:00:00`);
  vencimento.setHours(0, 0, 0, 0);

  const diff = vencimento.getTime() - hoje.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    const { data: documentos, error } = await supabaseAdmin
      .from('manager_documentos')
      .select('*, manager_projetos(nome)')
      .not('data_vencimento', 'is', null);

    if (error) throw error;

    let enviados = 0;

    for (const doc of documentos || []) {
      const dias = diasRestantes(doc.data_vencimento);

      let campoAlerta = '';

      if (dias === 30 && !doc.alerta_30_enviado) {
        campoAlerta = 'alerta_30_enviado';
      }

      if (dias === 15 && !doc.alerta_15_enviado) {
        campoAlerta = 'alerta_15_enviado';
      }

      if (dias === 1 && !doc.alerta_1_enviado) {
        campoAlerta = 'alerta_1_enviado';
      }

      if (!campoAlerta) continue;

      await resend.emails.send({
        from: 'IncentiVou <contato@incentivou.com.br>',
        to: ['ester@incentivou.com.br', 'brunoleoguilherme@gmail.com'],
        subject: `⚠️ Documento vence em ${dias} dia(s)`,
        html: `
          <div style="font-family: Arial, sans-serif; background:#f5f9ff; padding:32px;">
            <div style="max-width:640px; margin:auto; background:white; border-radius:24px; padding:32px;">
              <h2 style="color:#061b3a;">Documento próximo do vencimento</h2>

              <p>O documento abaixo está próximo do vencimento:</p>

              <p><strong>Documento:</strong> ${doc.nome || '-'}</p>
              <p><strong>Projeto:</strong> ${doc.manager_projetos?.nome || '-'}</p>
              <p><strong>Categoria:</strong> ${doc.categoria || '-'}</p>
              <p><strong>Vencimento:</strong> ${new Date(doc.data_vencimento).toLocaleDateString('pt-BR')}</p>
              <p><strong>Dias restantes:</strong> ${dias}</p>

              <p style="margin-top:24px;">
                Acesse o IncentiVou Manager para atualizar ou revisar este documento.
              </p>

              <p style="color:#60708a; font-size:13px; margin-top:32px;">
                Equipe IncentiVou
              </p>
            </div>
          </div>
        `,
      });

      await supabaseAdmin
        .from('manager_documentos')
        .update({ [campoAlerta]: true })
        .eq('id', doc.id);

      enviados++;
    }

    return NextResponse.json({
      ok: true,
      enviados,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Erro ao processar alertas.',
      },
      { status: 500 }
    );
  }
}