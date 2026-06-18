-- Migration: manager_proponentes + manager_financeiro
-- Rodar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS manager_proponentes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  tipo        text,
  cnpj        text,
  cidade      text,
  estado      text,
  email       text,
  telefone    text,
  responsavel text,
  status      text DEFAULT 'Ativo'
    CHECK (status IN ('Ativo','Em análise','Com pendência','Inativo')),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manager_financeiro (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id       uuid REFERENCES manager_projetos(id) ON DELETE SET NULL,
  descricao        text NOT NULL,
  tipo             text DEFAULT 'entrada' CHECK (tipo IN ('entrada','saida')),
  valor            numeric(15,2) DEFAULT 0,
  data_lancamento  date,
  categoria        text,
  status           text DEFAULT 'Previsto',
  created_at       timestamptz DEFAULT now()
);
