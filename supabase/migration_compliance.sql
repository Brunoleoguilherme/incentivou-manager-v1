-- Migration: manager_documentos (Compliance Documental)
-- Rodar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS manager_documentos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id          uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  nome                text NOT NULL,
  categoria           text NOT NULL
    CHECK (categoria IN ('certidao','juridico','financeiro','tecnico','outro')),
  tipo                text,
  status              text DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_analise','aprovado','vencendo','vencido')),
  data_vencimento     date,
  url                 text,
  observacao          text,
  alerta_30_enviado   boolean DEFAULT false,
  alerta_15_enviado   boolean DEFAULT false,
  alerta_1_enviado    boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manager_documentos_projeto ON manager_documentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_manager_documentos_status  ON manager_documentos(status);
CREATE INDEX IF NOT EXISTS idx_manager_documentos_venc    ON manager_documentos(data_vencimento);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_manager_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_manager_documentos_updated_at ON manager_documentos;
CREATE TRIGGER trg_manager_documentos_updated_at
  BEFORE UPDATE ON manager_documentos
  FOR EACH ROW EXECUTE FUNCTION update_manager_documentos_updated_at();
