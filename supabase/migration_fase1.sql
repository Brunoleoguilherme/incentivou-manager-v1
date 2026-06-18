-- ============================================================
-- Fase 1 - Portal Executor: campos de inscrição e esfera
-- Rodar no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar campo esfera e demais campos de inscrição em manager_projetos
ALTER TABLE manager_projetos
  ADD COLUMN IF NOT EXISTS esfera           text CHECK (esfera IN ('municipal','estadual','federal')),
  ADD COLUMN IF NOT EXISTS lei_especifica   text,          -- ex: "Lei 11.438/2006"
  ADD COLUMN IF NOT EXISTS modalidade       text,          -- modalidade esportiva
  ADD COLUMN IF NOT EXISTS objetivo         text,
  ADD COLUMN IF NOT EXISTS publico_alvo     text,
  ADD COLUMN IF NOT EXISTS num_beneficiarios integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contrapartidas   text,
  ADD COLUMN IF NOT EXISTS responsavel_tecnico text,
  ADD COLUMN IF NOT EXISTS data_inicio      date,
  ADD COLUMN IF NOT EXISTS data_fim         date,
  ADD COLUMN IF NOT EXISTS valor_solicitado numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS municipio        text,
  ADD COLUMN IF NOT EXISTS inscricao_status text DEFAULT 'rascunho'
    CHECK (inscricao_status IN ('rascunho','enviado','em_analise','aprovado','reprovado'));

-- 2. Tabela de documentos da inscrição (upload)
CREATE TABLE IF NOT EXISTS manager_documentos_inscricao (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  categoria   text NOT NULL, -- 'estatuto','certidao_federal','certidao_estadual','certidao_municipal','plano_trabalho','outro'
  nome        text NOT NULL,
  url         text,          -- URL no Supabase Storage
  enviado_em  timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_projetos_esfera      ON manager_projetos(esfera);
CREATE INDEX IF NOT EXISTS idx_docs_inscricao_proj  ON manager_documentos_inscricao(projeto_id);
