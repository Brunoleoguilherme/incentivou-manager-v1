-- ============================================================
-- Fase 5 - Prestação de Contas
-- Rodar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS manager_prestacao_docs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id   uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  tipo         text NOT NULL,
  descricao    text,
  responsavel  text,
  fornecedor   text,
  status       text DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_andamento','em_analise','aprovado','risco_glosa','reprovado')),
  valor        numeric DEFAULT 0,
  prazo        date,
  observacoes  text,
  url          text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prestacao_projeto ON manager_prestacao_docs(projeto_id);
CREATE INDEX IF NOT EXISTS idx_prestacao_status  ON manager_prestacao_docs(status);
