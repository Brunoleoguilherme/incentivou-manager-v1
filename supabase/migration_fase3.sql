-- ============================================================
-- Fase 3 - Portal do Patrocinador
-- Rodar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS manager_patrocinios (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id       uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  empresa_nome     text NOT NULL,
  empresa_cnpj     text,
  valor            numeric DEFAULT 0,
  data_aporte      date,
  status           text DEFAULT 'pendente'
    CHECK (status IN ('pendente','confirmado','liberado','concluido')),
  beneficio_fiscal numeric DEFAULT 0,
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patrocinios_projeto ON manager_patrocinios(projeto_id);
CREATE INDEX IF NOT EXISTS idx_patrocinios_status  ON manager_patrocinios(status);
