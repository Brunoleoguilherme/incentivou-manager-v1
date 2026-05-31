// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function dataBr(data) {
  if (!data) return '-';
  return new Date(data).toLocaleString('pt-BR');
}

export default function SimulacoesRecebidas() {
  const [simulacoes, setSimulacoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [itens, setItens] = useState([]);

  useEffect(() => {
    carregarSimulacoes();
  }, []);

  async function carregarSimulacoes() {
    const { data, error } = await supabase
      .from('simulacoes_projeto')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error) {
      setSimulacoes(data || []);
    }
  }

  async function abrir(simulacao) {
    setSelecionada(simulacao);

    const { data } = await supabase
      .from('simulacao_itens')
      .select('*')
      .eq('simulacao_id', simulacao.id)
      .order('criado_em', { ascending: true });

    setItens(data || []);
  }

  return (
    <main className="page">
      <section className="top">
        <div>
          <span>IncentiVou Manager</span>
          <h1>Simulações recebidas</h1>
          <p>Veja todos os leads que preencheram o simulador público.</p>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Leads</h2>

          {simulacoes.length === 0 && <p>Nenhuma simulação recebida ainda.</p>}

          {simulacoes.map((sim) => (
            <button key={sim.id} className="lead" onClick={() => abrir(sim)}>
              <strong>{sim.nome_projeto}</strong>
              <span>{sim.nome_responsavel} · {sim.email}</span>
              <b>{moeda(sim.total_geral)}</b>
            </button>
          ))}
        </div>

        <div className="card detail">
          {!selecionada && <p>Selecione uma simulação para ver os detalhes.</p>}

          {selecionada && (
            <>
              <h2>{selecionada.nome_projeto}</h2>

              <div className="info">
                <p><b>Responsável:</b> {selecionada.nome_responsavel}</p>
                <p><b>E-mail:</b> {selecionada.email}</p>
                <p><b>Telefone:</b> {selecionada.telefone || '-'}</p>
                <p><b>Entidade:</b> {selecionada.entidade || '-'}</p>
                <p><b>CNPJ:</b> {selecionada.cnpj || '-'}</p>
                <p><b>Cidade/UF:</b> {selecionada.cidade || '-'} / {selecionada.estado || '-'}</p>
                <p><b>Tipo:</b> {selecionada.tipo_projeto || '-'}</p>
                <p><b>Modalidade:</b> {selecionada.modalidade || '-'}</p>
                <p><b>Lei:</b> {selecionada.tipo_lei || '-'}</p>
                <p><b>Duração:</b> {selecionada.duracao_meses} meses</p>
                <p><b>Local:</b> {selecionada.local_execucao || '-'}</p>
                <p><b>Recebido em:</b> {dataBr(selecionada.criado_em)}</p>
              </div>

              <div className="totais">
                <p><span>Atividade fim</span><strong>{moeda(selecionada.total_atividade_fim)}</strong></p>
                <p><span>Atividade meio</span><strong>{moeda(selecionada.total_atividade_meio)}</strong></p>
                <p className="grand"><span>Total</span><strong>{moeda(selecionada.total_geral)}</strong></p>
              </div>

              <h3>Itens</h3>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Item</th>
                      <th>Qtd.</th>
                      <th>Valor</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item) => (
                      <tr key={item.id}>
                        <td>{item.categoria}</td>
                        <td>{item.nome_item}</td>
                        <td>{item.quantidade}</td>
                        <td>{moeda(item.valor_unitario)}</td>
                        <td>{moeda(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selecionada.observacoes && (
                <>
                  <h3>Observações</h3>
                  <p>{selecionada.observacoes}</p>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #07152f;
          color: white;
          padding: 36px;
          font-family: Arial, sans-serif;
        }

        .top {
          max-width: 1200px;
          margin: 0 auto 24px;
        }

        .top span {
          color: #20d68b;
          font-weight: 900;
        }

        .top h1 {
          font-size: 36px;
          margin: 8px 0;
        }

        .top p {
          color: #d8e3f8;
        }

        .grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 22px;
        }

        .card {
          background: white;
          color: #101827;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 70px rgba(0,0,0,.35);
        }

        .lead {
          width: 100%;
          text-align: left;
          border: 1px solid #e3e8f2;
          background: #f8fbff;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lead strong {
          color: #07265c;
        }

        .lead span {
          color: #667085;
          font-size: 13px;
        }

        .lead b {
          color: #078d5b;
        }

        .info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 18px;
        }

        .totais {
          background: #f1f7ff;
          border-radius: 18px;
          padding: 18px;
          margin: 20px 0;
        }

        .totais p {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }

        .grand {
          font-size: 20px;
          color: #07265c;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        th {
          background: #eaf1ff;
          color: #07265c;
          text-align: left;
          padding: 12px;
        }

        td {
          border-bottom: 1px solid #e8edf5;
          padding: 12px;
        }

        @media (max-width: 900px) {
          .page {
            padding: 20px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}