-- Migration: Fase 6 - Diagnostico + Entregas
-- Rodar no Supabase SQL Editor

-- 1. Score no projeto (para marketplace)
ALTER TABLE manager_projetos
  ADD COLUMN IF NOT EXISTS score_diagnostico integer DEFAULT 0;

-- 2. Tabela de entregas (usada pelo diagnostico e execucao segura)
CREATE TABLE IF NOT EXISTS manager_entregas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  uuid REFERENCES manager_projetos(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  descricao   text,
  data_entrega date,
  status      text DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_andamento','concluido','cancelado')),
  url_comprovante text,
  created_at  timestamptz DEFAULT now()
);
