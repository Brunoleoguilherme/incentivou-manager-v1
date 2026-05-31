create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  lei text,
  numero_processo text,
  valor_aprovado numeric default 0,
  valor_captado numeric default 0,
  status text default 'diagnostico',
  cidade text,
  estado text,
  criado_em timestamptz default now()
);
create table if not exists proponentes (id uuid primary key default gen_random_uuid(), nome text not null, cnpj text, responsavel text, email text, telefone text, criado_em timestamptz default now());
create table if not exists patrocinadores (id uuid primary key default gen_random_uuid(), razao_social text not null, cnpj text, lucro_real boolean default false, potencial_deducao numeric default 0, contato text, email text, telefone text, criado_em timestamptz default now());
create table if not exists documentos_modelo (id uuid primary key default gen_random_uuid(), nome text not null, categoria text, url text, premium boolean default false, criado_em timestamptz default now());
create table if not exists ebooks (id uuid primary key default gen_random_uuid(), titulo text not null, gratuito boolean default true, preco numeric default 0, url text, criado_em timestamptz default now());

-- IncentiVou Manager Core - Portais + Kanban Operacional
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  perfil text not null check (perfil in ('admin','executor','empresa','consultor','compliance','financeiro')),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists kanban_boards (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('plano_start','projeto_aprovado','captacao_inteligente','execucao_segura','esporte_360')),
  descricao text,
  cor text,
  ordem integer default 0,
  criado_em timestamptz default now()
);

create table if not exists kanban_colunas (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references kanban_boards(id) on delete cascade,
  nome text not null,
  responsavel_padrao text,
  sla_horas integer,
  ordem integer default 0,
  criado_em timestamptz default now()
);

create table if not exists kanban_cards (
  id uuid primary key default gen_random_uuid(),
  coluna_id uuid references kanban_colunas(id) on delete set null,
  projeto_id uuid references projetos(id) on delete set null,
  titulo text not null,
  descricao text,
  prioridade text default 'media' check (prioridade in ('baixa','media','alta','critica')),
  status text default 'aberto',
  responsavel_id uuid references usuarios(id) on delete set null,
  prazo date,
  percentual_conclusao integer default 0,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table if not exists kanban_checklists (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references kanban_cards(id) on delete cascade,
  titulo text not null,
  concluido boolean default false,
  obrigatorio boolean default true,
  ordem integer default 0,
  criado_em timestamptz default now()
);

create table if not exists kanban_comentarios (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references kanban_cards(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete set null,
  comentario text not null,
  criado_em timestamptz default now()
);

create table if not exists kanban_anexos (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references kanban_cards(id) on delete cascade,
  nome_arquivo text not null,
  url text not null,
  tipo text,
  criado_em timestamptz default now()
);

create table if not exists kanban_historico (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references kanban_cards(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete set null,
  acao text not null,
  detalhe text,
  criado_em timestamptz default now()
);

create table if not exists alertas_operacionais (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade,
  card_id uuid references kanban_cards(id) on delete cascade,
  titulo text not null,
  descricao text,
  severidade text default 'media' check (severidade in ('baixa','media','alta','critica')),
  lido boolean default false,
  prazo date,
  criado_em timestamptz default now()
);
