// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const categorias = [
  'Recursos Humanos Atividade Fim',
  'Encargos Sociais e Trabalhistas Atividade Fim',
  'Materiais Esportivos e Afins',
  'Bolsa Auxílio',
  'Hospedagem, Alimentação e Transporte',
  'Recursos Humanos Atividade Meio',
  'Encargos Sociais e Trabalhistas Atividade Meio',
  'Empresa Especializada em Prestação de Contas',
  'Local de Execução',
];

const sugestoes = {
  'Recursos Humanos Atividade Fim': [
    'Professor',
    'Monitor',
    'Coordenador Técnico',
    'Preparador Físico',
    'Fisioterapeuta',
    'Psicólogo',
    'Assistente Social',
  ],
  'Materiais Esportivos e Afins': [
    'Uniforme',
    'Bola',
    'Cone',
    'Colete',
    'Equipamento esportivo',
    'Material de treino',
  ],
  'Bolsa Auxílio': [
    'Bolsa Auxílio Categoria 1',
    'Bolsa Auxílio Categoria 2',
    'Bolsa Auxílio Categoria 3',
  ],
  'Hospedagem, Alimentação e Transporte': [
    'Alimentação',
    'Transporte van',
    'Transporte ônibus',
    'Hospedagem',
    'Kit lanche',
  ],
  'Recursos Humanos Atividade Meio': [
    'Contador',
    'Advogado',
    'Secretária',
    'Auxiliar administrativo',
    'Assessor de imprensa',
    'Fotógrafo',
    'Videomaker',
  ],
  'Empresa Especializada em Prestação de Contas': [
    'Prestação de contas mensal',
    'Consultoria técnica',
    'Gestão documental',
  ],
  'Local de Execução': [
    'Espaço alugado',
    'Quadra',
    'Campo',
    'Ginásio',
    'Centro de treinamento',
  ],
};

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function SimuladorPublico() {
  const [config, setConfig] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    nome_responsavel: '',
    email: '',
    telefone: '',
    entidade: '',
    cnpj: '',
    cidade: '',
    estado: '',
    nome_projeto: '',
    tipo_projeto: '',
    modalidade: '',
    tipo_lei: 'Lei Federal',
    duracao_meses: 12,
    local_execucao: '',
    observacoes: '',
    consentimento_lgpd: false,
  });

  const [itens, setItens] = useState([]);

  const [novoItem, setNovoItem] = useState({
    categoria: 'Recursos Humanos Atividade Fim',
    nome_item: '',
    quantidade: 1,
    valor_unitario: '',
  });

  useEffect(() => {
    async function carregarConfig() {
      const { data } = await supabase
        .from('site_config')
        .select('valor')
        .eq('chave', 'simulador_publico')
        .single();

      setConfig(data?.valor || {
        ativo: true,
        titulo: 'Simulador de Projeto Esportivo Incentivado',
        subtitulo: 'Preencha os dados abaixo e simule uma estimativa inicial do seu projeto.',
        textoLgpd: 'Autorizo o contato e o tratamento dos meus dados.',
      });
    }

    carregarConfig();
  }, []);

  const totalAtividadeFim = useMemo(() => {
    return itens
      .filter((item) =>
        [
          'Recursos Humanos Atividade Fim',
          'Encargos Sociais e Trabalhistas Atividade Fim',
          'Materiais Esportivos e Afins',
          'Bolsa Auxílio',
          'Hospedagem, Alimentação e Transporte',
          'Local de Execução',
        ].includes(item.categoria)
      )
      .reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [itens]);

  const totalAtividadeMeio = useMemo(() => {
    return itens
      .filter((item) =>
        [
          'Recursos Humanos Atividade Meio',
          'Encargos Sociais e Trabalhistas Atividade Meio',
          'Empresa Especializada em Prestação de Contas',
        ].includes(item.categoria)
      )
      .reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [itens]);

  const totalGeral = totalAtividadeFim + totalAtividadeMeio;

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function adicionarItem() {
    if (!novoItem.nome_item || !novoItem.quantidade || !novoItem.valor_unitario) {
      alert('Preencha o item, quantidade e valor unitário.');
      return;
    }

    const quantidade = Number(novoItem.quantidade);
    const valor = Number(String(novoItem.valor_unitario).replace(',', '.'));
    const total = quantidade * valor;

    setItens((prev) => [
      ...prev,
      {
        ...novoItem,
        quantidade,
        valor_unitario: valor,
        total,
      },
    ]);

    setNovoItem({
      categoria: novoItem.categoria,
      nome_item: '',
      quantidade: 1,
      valor_unitario: '',
    });
  }

  function removerItem(index) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  async function enviarSimulacao(e) {
    e.preventDefault();

    if (!form.consentimento_lgpd) {
      alert('É necessário aceitar o consentimento de uso dos dados.');
      return;
    }

    if (!form.nome_responsavel || !form.email || !form.nome_projeto) {
      alert('Preencha nome, e-mail e nome do projeto.');
      return;
    }

    setEnviando(true);

    const payload = {
      ...form,
      duracao_meses: Number(form.duracao_meses || 12),
      total_atividade_fim: totalAtividadeFim,
      total_atividade_meio: totalAtividadeMeio,
      total_geral: totalGeral,
    };

    const { data, error } = await supabase
      .from('simulacoes_projeto')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error(error);
      alert('Erro ao enviar simulação.');
      setEnviando(false);
      return;
    }

    if (itens.length > 0) {
      const itensPayload = itens.map((item) => ({
        simulacao_id: data.id,
        categoria: item.categoria,
        nome_item: item.nome_item,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        total: item.total,
      }));

      const { error: itensError } = await supabase
        .from('simulacao_itens')
        .insert(itensPayload);

      if (itensError) {
        console.error(itensError);
      }
    }

    setSucesso(true);
    setEnviando(false);
  }

  if (!config) {
    return <main style={{ padding: 40 }}>Carregando simulador...</main>;
  }

  if (config.ativo === false) {
    return <main style={{ padding: 40 }}>Simulador temporariamente indisponível.</main>;
  }

  if (sucesso) {
    return (
      <main className="sim-page">
        <section className="success-card">
          <h1>Simulação enviada com sucesso!</h1>
          <p>
            Recebemos os dados do seu projeto. Nossa equipe irá analisar as informações
            e entrar em contato.
          </p>
          <a href="/simulador">Fazer nova simulação</a>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="sim-page">
      <section className="hero">
        <div className="badge">IncentiVou</div>
        <h1>{config.titulo}</h1>
        <p>{config.subtitulo}</p>
      </section>

      <form onSubmit={enviarSimulacao}>
        <section className="card">
          <h2>Dados do responsável</h2>

          <div className="grid">
            <label>
              Nome do responsável *
              <input value={form.nome_responsavel} onChange={(e) => atualizarCampo('nome_responsavel', e.target.value)} />
            </label>

            <label>
              E-mail *
              <input type="email" value={form.email} onChange={(e) => atualizarCampo('email', e.target.value)} />
            </label>

            <label>
              Telefone / WhatsApp
              <input value={form.telefone} onChange={(e) => atualizarCampo('telefone', e.target.value)} />
            </label>

            <label>
              Entidade / organização
              <input value={form.entidade} onChange={(e) => atualizarCampo('entidade', e.target.value)} />
            </label>

            <label>
              CNPJ
              <input value={form.cnpj} onChange={(e) => atualizarCampo('cnpj', e.target.value)} />
            </label>

            <label>
              Cidade
              <input value={form.cidade} onChange={(e) => atualizarCampo('cidade', e.target.value)} />
            </label>

            <label>
              Estado
              <input value={form.estado} onChange={(e) => atualizarCampo('estado', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Detalhes do projeto</h2>

          <div className="grid">
            <label>
              Nome do projeto *
              <input value={form.nome_projeto} onChange={(e) => atualizarCampo('nome_projeto', e.target.value)} />
            </label>

            <label>
              Tipo de projeto
              <select value={form.tipo_projeto} onChange={(e) => atualizarCampo('tipo_projeto', e.target.value)}>
                <option value="">Selecione</option>
                <option>Projeto esportivo</option>
                <option>Projeto paradesportivo</option>
                <option>Evento esportivo</option>
                <option>Formação esportiva</option>
                <option>Rendimento esportivo</option>
              </select>
            </label>

            <label>
              Modalidade
              <input value={form.modalidade} onChange={(e) => atualizarCampo('modalidade', e.target.value)} />
            </label>

            <label>
              Tipo de lei
              <select value={form.tipo_lei} onChange={(e) => atualizarCampo('tipo_lei', e.target.value)}>
                <option>Lei Federal</option>
                <option>Lei Estadual</option>
                <option>Lei Municipal</option>
              </select>
            </label>

            <label>
              Duração em meses
              <input type="number" min="1" value={form.duracao_meses} onChange={(e) => atualizarCampo('duracao_meses', e.target.value)} />
            </label>

            <label>
              Local de execução
              <select value={form.local_execucao} onChange={(e) => atualizarCampo('local_execucao', e.target.value)}>
                <option value="">Selecione</option>
                <option>Próprio</option>
                <option>Cedido</option>
                <option>Alugado</option>
                <option>A definir</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Itens da simulação</h2>

          <div className="item-box">
            <label>
              Categoria
              <select
                value={novoItem.categoria}
                onChange={(e) => setNovoItem((prev) => ({ ...prev, categoria: e.target.value, nome_item: '' }))}
              >
                {categorias.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </label>

            <label>
              Item
              <input
                list="sugestoes-itens"
                value={novoItem.nome_item}
                onChange={(e) => setNovoItem((prev) => ({ ...prev, nome_item: e.target.value }))}
                placeholder="Ex: Professor, uniforme, transporte..."
              />
              <datalist id="sugestoes-itens">
                {(sugestoes[novoItem.categoria] || []).map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>

            <label>
              Quantidade
              <input
                type="number"
                min="1"
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem((prev) => ({ ...prev, quantidade: e.target.value }))}
              />
            </label>

            <label>
              Valor unitário
              <input
                value={novoItem.valor_unitario}
                onChange={(e) => setNovoItem((prev) => ({ ...prev, valor_unitario: e.target.value }))}
                placeholder="Ex: 1500"
              />
            </label>

            <button type="button" onClick={adicionarItem}>
              Incluir item
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Item</th>
                  <th>Quantidade</th>
                  <th>Valor unitário</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 && (
                  <tr>
                    <td colSpan="6">Nenhum item incluído ainda.</td>
                  </tr>
                )}

                {itens.map((item, index) => (
                  <tr key={`${item.nome_item}-${index}`}>
                    <td>{item.categoria}</td>
                    <td>{item.nome_item}</td>
                    <td>{item.quantidade}</td>
                    <td>{moeda(item.valor_unitario)}</td>
                    <td>{moeda(item.total)}</td>
                    <td>
                      <button type="button" className="remove" onClick={() => removerItem(index)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="totais">
          <div>
            <span>Valor total da atividade fim</span>
            <strong>{moeda(totalAtividadeFim)}</strong>
          </div>

          <div>
            <span>Valor total da atividade meio</span>
            <strong>{moeda(totalAtividadeMeio)}</strong>
          </div>

          <div className="grand">
            <span>Valor total estimado do projeto</span>
            <strong>{moeda(totalGeral)}</strong>
          </div>
        </section>

        <section className="card">
          <h2>Observações</h2>
          <textarea
            value={form.observacoes}
            onChange={(e) => atualizarCampo('observacoes', e.target.value)}
            placeholder="Conte brevemente sobre o objetivo do projeto, público atendido e qualquer informação relevante."
          />

          <label className="check">
            <input
              type="checkbox"
              checked={form.consentimento_lgpd}
              onChange={(e) => atualizarCampo('consentimento_lgpd', e.target.checked)}
            />
            {config.textoLgpd}
          </label>

          <button className="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar simulação'}
          </button>
        </section>
      </form>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
.sim-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07152f, #061020 45%, #091a3a);
  color: #fff;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
}

.hero {
  max-width: 1100px;
  margin: 0 auto 28px;
  padding: 36px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(22, 74, 180, .9), rgba(5, 16, 34, .95));
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 24px 80px rgba(0,0,0,.35);
}

.badge {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  background: #20d68b;
  color: #04111f;
  font-weight: 800;
  margin-bottom: 14px;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 38px;
}

.hero p {
  margin: 0;
  color: #dce8ff;
  font-size: 17px;
  line-height: 1.5;
}

form {
  max-width: 1100px;
  margin: 0 auto;
}

.card {
  background: rgba(255,255,255,.97);
  color: #101827;
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 22px;
  box-shadow: 0 18px 50px rgba(0,0,0,.22);
}

.card h2 {
  margin: 0 0 22px;
  color: #07265c;
  font-size: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-weight: 700;
  font-size: 14px;
}

input, select, textarea {
  border: 1px solid #d4dbe8;
  border-radius: 14px;
  padding: 13px 14px;
  font-size: 15px;
  outline: none;
  background: #fff;
}

input:focus, select:focus, textarea:focus {
  border-color: #20d68b;
  box-shadow: 0 0 0 3px rgba(32,214,139,.18);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.item-box {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr .6fr .8fr auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 22px;
}

button {
  border: 0;
  border-radius: 14px;
  padding: 13px 18px;
  font-weight: 900;
  cursor: pointer;
  background: #20d68b;
  color: #04111f;
}

button:hover {
  filter: brightness(.95);
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th {
  text-align: left;
  background: #eaf1ff;
  color: #07265c;
  padding: 12px;
  font-size: 13px;
}

td {
  border-bottom: 1px solid #e8edf5;
  padding: 12px;
  font-size: 14px;
}

.remove {
  background: #ffe7e7;
  color: #b42318;
  padding: 8px 12px;
}

.totais {
  background: rgba(255,255,255,.97);
  color: #101827;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 22px;
  box-shadow: 0 18px 50px rgba(0,0,0,.22);
}

.totais div {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #e8edf5;
  text-transform: uppercase;
  font-size: 14px;
}

.totais .grand {
  border-bottom: 0;
  font-size: 20px;
  color: #07265c;
}

.check {
  margin: 20px 0;
  flex-direction: row;
  align-items: flex-start;
  line-height: 1.4;
}

.check input {
  margin-top: 2px;
}

.submit {
  width: 100%;
  padding: 16px;
  font-size: 17px;
  background: linear-gradient(135deg, #20d68b, #12b76a);
}

.success-card {
  max-width: 720px;
  margin: 80px auto;
  background: #fff;
  color: #101827;
  padding: 42px;
  border-radius: 28px;
  text-align: center;
}

.success-card h1 {
  color: #07265c;
}

.success-card a {
  display: inline-block;
  margin-top: 20px;
  background: #20d68b;
  color: #04111f;
  padding: 14px 18px;
  border-radius: 14px;
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 850px) {
  .hero h1 {
    font-size: 28px;
  }

  .grid,
  .item-box {
    grid-template-columns: 1fr;
  }

  .card,
  .hero {
    padding: 22px;
    border-radius: 20px;
  }

  .sim-page {
    padding: 22px 12px;
  }
}
`;