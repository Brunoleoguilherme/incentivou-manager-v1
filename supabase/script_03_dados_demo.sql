-- SCRIPT 03 — DADOS DEMO PARA TESTAR O FRONTEND DO ZIP 02
-- Rode após os Scripts 01 e 02.

insert into usuarios (nome, email, perfil, status)
values
('Bruno Guilherme', 'admin@incentivou.com.br', 'admin', 'ativo'),
('Ester', 'ester@incentivou.com.br', 'executor', 'ativo'),
('Empresa Apoiadora', 'empresa@incentivou.com.br', 'empresa', 'ativo')
on conflict (email) do nothing;

insert into executores (nome_instituicao, cnpj, cidade, estado, telefone, responsavel, status)
values
('Instituto Esporte e Futuro', '00.000.000/0001-00', 'Belo Horizonte', 'MG', '(31) 99999-9999', 'Ester', 'ativo')
on conflict do nothing;

insert into empresas (razao_social, nome_fantasia, cnpj, cidade, estado, setor, potencial_incentivo, interesse_esg, status)
values
('Empresa Apoiadora S.A.', 'Empresa Apoiadora', '11.111.111/0001-11', 'São Paulo', 'SP', 'Energia', 1200000, 'Esporte, educação e comunidade', 'ativa')
on conflict do nothing;

insert into projetos (nome, descricao, lei_incentivo, area, cidade, estado, valor_total, valor_aprovado, valor_captado, status, risco, data_inicio, data_limite)
values
('Touchdown do Bem — Núcleos BH', 'Projeto esportivo-social para atendimento de crianças e jovens por meio do flag football.', 'Lei Federal de Incentivo ao Esporte', 'Esporte educacional', 'Belo Horizonte', 'MG', 1800000, 1500000, 420000, 'captacao', 'medio', current_date, current_date + interval '90 days'),
('Festival Esporte 360°', 'Evento integrado com esporte, cultura, comunidade, ativações e prestação de contas estruturada.', 'Lei Estadual de Incentivo ao Esporte', 'Evento esportivo', 'Belo Horizonte', 'MG', 950000, 820000, 0, 'aprovado', 'baixo', current_date, current_date + interval '120 days'),
('Formação de Atletas — Base', 'Programa de formação esportiva para jovens atletas com acompanhamento técnico e educacional.', 'Fundo da Infância e Adolescência', 'Formação', 'Contagem', 'MG', 700000, 600000, 180000, 'execucao', 'alto', current_date - interval '30 days', current_date + interval '45 days')
on conflict do nothing;

-- Cards demo: cria um card por projeto na primeira coluna de cada board principal.
insert into kanban_cards (projeto_id, board_id, coluna_id, titulo, descricao, prioridade, status, prazo, ordem)
select p.id, b.id, c.id, p.nome, 'Card operacional vinculado ao dossiê único do projeto.',
case when p.risco = 'alto' then 'alta' else 'media' end,
'ativo', current_date + (c.prazo_padrao_dias || ' days')::interval, 1
from projetos p
cross join boards b
join kanban_colunas c on c.board_id = b.id and c.ordem = 1
where b.tipo in ('plano_start', 'projeto_aprovado', 'captacao', 'execucao', 'esporte_360')
on conflict do nothing;

insert into documentos (projeto_id, nome, tipo, status)
select id, 'Estatuto / documentação institucional', 'Documento básico', 'pendente' from projetos
on conflict do nothing;

insert into alertas (projeto_id, titulo, mensagem, tipo, prazo)
select id, 'Validar documentação', 'Conferir documentos obrigatórios antes de avançar etapa.', 'warning', current_date + interval '7 days' from projetos
on conflict do nothing;

insert into historico (projeto_id, acao, detalhe)
select id, 'Projeto criado', 'Dossiê inicial criado no IncentiVou Manager V1.' from projetos
on conflict do nothing;
