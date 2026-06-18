-- =====================================================
-- Fase 9 — Match Score Personalizado
-- =====================================================

-- Adicionar colunas de tags em manager_projetos
ALTER TABLE manager_projetos
  ADD COLUMN IF NOT EXISTS tipo_projeto text,
  ADD COLUMN IF NOT EXISTS publico_alvo_faixa text[],
  ADD COLUMN IF NOT EXISTS ods_tags integer[];

-- Perfil de preferências da empresa (um por usuário/empresa)
CREATE TABLE IF NOT EXISTS manager_empresa_perfil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES manager_usuarios(id) ON DELETE CASCADE,
  empresa_email text,
  tipos_projeto text[],
  modalidades text[],
  esferas text[],
  publico_alvo text[],
  estados text[],
  ods integer[],
  faixa_valor text CHECK (faixa_valor IN ('ate_100k','100k_500k','500k_1m','acima_1m')),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_perfil_email
  ON manager_empresa_perfil (empresa_email)
  WHERE empresa_email IS NOT NULL;
