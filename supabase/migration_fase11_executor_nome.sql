-- Fase 11: Vincular projeto ao executor que cadastrou

ALTER TABLE manager_projetos
  ADD COLUMN IF NOT EXISTS usuario_id    uuid REFERENCES manager_usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS executor_nome text;

CREATE INDEX IF NOT EXISTS idx_projetos_usuario ON manager_projetos(usuario_id);
