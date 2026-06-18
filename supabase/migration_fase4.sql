-- ============================================================
-- Fase 4 - Execução: Beneficiários e Metas
-- Rodar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS manager_beneficiarios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id      uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  cpf             text,
  data_nascimento date,
  categoria       text DEFAULT 'atleta'
    CHECK (categoria IN ('atleta','tecnico','staff','voluntario','outro')),
  ativo           boolean DEFAULT true,
  observacoes     text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manager_metas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  indicador   text NOT NULL,
  unidade     text DEFAULT 'un',
  meta_valor  numeric DEFAULT 0,
  realizado   numeric DEFAULT 0,
  periodo     text,
  observacao  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beneficiarios_projeto ON manager_beneficiarios(projeto_id);
CREATE INDEX IF NOT EXISTS idx_metas_projeto         ON manager_metas(projeto_id);
