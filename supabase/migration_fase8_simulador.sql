-- Simulador público
CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor jsonb,
  created_at timestamptz DEFAULT now()
);

-- Configuração padrão do simulador
INSERT INTO site_config (chave, valor) VALUES (
  'simulador_publico',
  '{"ativo": true, "titulo": "Simulador de Projeto Esportivo Incentivado", "subtitulo": "Preencha os dados abaixo e simule uma estimativa inicial do seu projeto.", "textoLgpd": "Autorizo o contato e o tratamento dos meus dados conforme a LGPD."}'
) ON CONFLICT (chave) DO NOTHING;

CREATE TABLE IF NOT EXISTS simulacoes_projeto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_responsavel text NOT NULL,
  email text NOT NULL,
  telefone text,
  entidade text,
  cnpj text,
  cidade text,
  estado text,
  nome_projeto text NOT NULL,
  tipo_projeto text,
  modalidade text,
  tipo_lei text DEFAULT 'Lei Federal',
  duracao_meses integer DEFAULT 12,
  local_execucao text,
  observacoes text,
  consentimento_lgpd boolean DEFAULT false,
  total_atividade_fim numeric(15,2) DEFAULT 0,
  total_atividade_meio numeric(15,2) DEFAULT 0,
  total_geral numeric(15,2) DEFAULT 0,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','aprovado','reprovado')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulacao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulacao_id uuid REFERENCES simulacoes_projeto(id) ON DELETE CASCADE,
  categoria text NOT NULL,
  nome_item text NOT NULL,
  quantidade integer DEFAULT 1,
  valor_unitario numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
