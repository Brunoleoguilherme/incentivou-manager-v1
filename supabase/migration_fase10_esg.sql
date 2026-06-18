-- Fase 10: Indicadores ESG

CREATE TABLE IF NOT EXISTS manager_esg_indicadores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_nome    text,
  eixo            text,
  ods             text,
  indicador       text        NOT NULL,
  beneficiarios   integer     DEFAULT 0,
  cidade          text,
  estado          text,
  patrocinador    text,
  status          text        DEFAULT 'Planejado',
  impacto         text,
  resultado       text,
  prazo           date,
  created_at      timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE manager_esg_indicadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_esg" ON manager_esg_indicadores
  FOR ALL USING (true) WITH CHECK (true);
