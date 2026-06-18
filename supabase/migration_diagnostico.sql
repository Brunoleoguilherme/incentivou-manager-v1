-- Adicionar score ao manager_projetos (usado no diagnóstico e marketplace)
ALTER TABLE manager_projetos
  ADD COLUMN IF NOT EXISTS score_diagnostico integer DEFAULT 0;
