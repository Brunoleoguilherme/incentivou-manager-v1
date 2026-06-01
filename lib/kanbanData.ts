import {
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderKanban,
  Handshake,
  Landmark,
  LayoutDashboard,
  LineChart,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  Wallet,
} from 'lucide-react';

export type PortalType = 'admin' | 'executor' | 'empresa';

export const demoUsers = [
  { nome: 'Bruno Guilherme', email: 'admin@incentivou.com.br', senha: 'admin123', perfil: 'Administrador', portal: 'admin' },
  { nome: 'Ester', email: 'ester@incentivou.com.br', senha: 'executor123', perfil: 'Executor', portal: 'executor' },
  { nome: 'Empresa Apoiadora', email: 'empresa@incentivou.com.br', senha: 'empresa123', perfil: 'Empresa', portal: 'empresa' },
];

export const portalConfig = {
  admin: {
    label: 'Portal Admin',
    href: '/admin',
    headline: 'Controle executivo da operação IncentiVou',
    description: 'Acompanhe projetos, clientes, captação, execução, compliance, prestação de contas e indicadores estratégicos em um único painel.',
    userName: 'Bruno Guilherme',
    badge: 'Administrador',
  },
  executor: {
    label: 'Portal Executor',
    href: '/executor',
    headline: 'Gestão completa dos projetos executores',
    description: 'Organize diagnóstico, documentos, etapas técnicas, captação, execução segura e prestação de contas com rastreabilidade.',
    userName: 'Ester',
    badge: 'Executor',
  },
  empresa: {
    label: 'Portal Empresa',
    href: '/empresa',
    headline: 'Decisão inteligente para empresas apoiadoras',
    description: 'Simule potencial de incentivo, conheça projetos, acompanhe impacto ESG e baixe relatórios executivos dos aportes.',
    userName: 'Empresa Apoiadora',
    badge: 'Empresa',
  },
} as const;

export const portalMenus = {
  admin: [
    { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'CRM', href: '/admin/kanban', icon: FolderKanban },
{ label: 'Leads', href: '/admin/leads', icon: Users },
{ label: 'Projetos', href: '/projetos', icon: FileText },
    { label: 'Executores', href: '/admin/executores', icon: Users },
    { label: 'Empresas', href: '/admin/empresas', icon: Building2 },
    { label: 'Compliance', href: '/admin/compliance', icon: ShieldCheck },
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ],
  executor: [
    { label: 'Visão Geral', href: '/executor', icon: LayoutDashboard },
    { label: 'Meu Kanban', href: '/executor/kanban', icon: FolderKanban },
    { label: 'Diagnóstico', href: '/executor/diagnostico', icon: FileCheck2 },
    { label: 'Documentos', href: '/documentos', icon: UploadCloud },
    { label: 'Execução Segura', href: '/execucao', icon: ShieldCheck },
    { label: 'Prestação', href: '/prestacao-contas', icon: ClipboardCheck },
  ],
  empresa: [
    { label: 'Visão Geral', href: '/empresa', icon: LayoutDashboard },
    { label: 'Simulador', href: '/simulador', icon: Landmark },
    { label: 'Marketplace', href: '/marketplace', icon: Target },
    { label: 'Projetos Apoiados', href: '/empresa/projetos', icon: Handshake },
    { label: 'Impacto ESG', href: '/impacto-esg', icon: LineChart },
    { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ],
};

export const adminMetrics = [
  { label: 'Projetos ativos', value: '42', change: '+8 este mês', icon: FileText },
  { label: 'Valor em pipeline', value: 'R$ 18,4M', change: 'captação monitorada', icon: Wallet },
  { label: 'SLA em dia', value: '91%', change: 'operações no prazo', icon: CalendarClock },
  { label: 'Riscos críticos', value: '6', change: 'exigem ação', icon: ShieldCheck },
];

export const executorMetrics = [
  { label: 'Projetos sob gestão', value: '12', change: '5 em execução', icon: FileText },
  { label: 'Documentos pendentes', value: '18', change: 'priorizar semana', icon: UploadCloud },
  { label: 'Checklists concluídos', value: '76%', change: 'média operacional', icon: CheckCircle2 },
  { label: 'Prazos próximos', value: '9', change: 'até 7 dias', icon: CalendarClock },
];

export const empresaMetrics = [
  { label: 'Potencial simulado', value: 'R$ 1,2M', change: 'ano-base atual', icon: Landmark },
  { label: 'Projetos sugeridos', value: '16', change: 'match fiscal/ESG', icon: Target },
  { label: 'Impacto estimado', value: '4.820', change: 'beneficiários', icon: LineChart },
  { label: 'Relatórios prontos', value: '7', change: 'downloads disponíveis', icon: BarChart3 },
];

export const operationalBoards = [
  {
    id: 'start',
    title: 'Plano Start',
    subtitle: 'Diagnóstico inicial e decisão técnica segura',
    color: 'from-emerald-500 to-teal-500',
    columns: [
      { title: 'Novo contato', sla: '24h', owner: 'Comercial', cards: ['Lead registrado', 'Origem do contato definida'] },
      { title: 'Formulário enviado', sla: '48h', owner: 'Atendimento', cards: ['Diagnóstico enviado', 'Follow-up agendado'] },
      { title: 'Análise prévia', sla: '2 dias úteis', owner: 'Técnico', cards: ['Documentos básicos', 'Viabilidade inicial'] },
      { title: 'Reunião técnica', sla: '5 dias', owner: 'Consultor', cards: ['Ata registrada', 'Necessidades mapeadas'] },
      { title: 'Parecer e decisão', sla: '2 dias úteis', owner: 'Compliance', cards: ['Parecer técnico', 'Seguir ou encerrar'] },
    ],
  },
  {
    id: 'projeto',
    title: 'Projeto Aprovado',
    subtitle: 'Da assinatura à submissão oficial',
    color: 'from-blue-500 to-sky-500',
    columns: [
      { title: 'Contrato assinado', sla: '48h', owner: 'Comercial/Jurídico', cards: ['Contrato anexado', 'Dados do cliente conferidos'] },
      { title: 'Kick-off', sla: '3 dias úteis', owner: 'Gerente do Projeto', cards: ['Cronograma definido', 'Responsáveis alinhados'] },
      { title: 'Coleta de conteúdo', sla: '5 dias úteis', owner: 'Atendimento', cards: ['Logo/fotos/histórico', 'Objetivos e contrapartidas'] },
      { title: 'Redação técnica', sla: '10 dias úteis', owner: 'Técnico', cards: ['Plano de trabalho', 'Orçamento estruturado'] },
      { title: 'Validação e submissão', sla: '3 dias úteis', owner: 'Coordenação', cards: ['Validação formal', 'Protocolo salvo'] },
    ],
  },
  {
    id: 'captacao',
    title: 'Captação Inteligente',
    subtitle: 'CRM, abordagem e fechamento com empresas',
    color: 'from-orange-500 to-amber-500',
    columns: [
      { title: 'Projeto aprovado', sla: 'imediato', owner: 'Técnico', cards: ['Documentos comerciais liberados'] },
      { title: 'Estratégia', sla: '3 dias úteis', owner: 'Comercial Estratégico', cards: ['Meta definida', 'Tese de captação'] },
      { title: 'Perfil de empresa', sla: '2 dias úteis', owner: 'BI/Comercial', cards: ['Match fiscal', 'Match ESG/região'] },
      { title: 'Prospecção', sla: 'semanal', owner: 'Comercial', cards: ['Empresas contatadas', 'Reuniões marcadas'] },
      { title: 'Negociação/fechamento', sla: 'por proposta', owner: 'Diretoria', cards: ['Term sheet', 'Aporte confirmado'] },
    ],
  },
  {
    id: 'execucao',
    title: 'Execução Segura',
    subtitle: 'Monitoramento técnico, evidências e controle mensal',
    color: 'from-lime-500 to-emerald-500',
    columns: [
      { title: 'Recurso liberado', sla: '24h', owner: 'Financeiro', cards: ['Comprovante anexado'] },
      { title: 'Kick-off execução', sla: '3 dias úteis', owner: 'Gerente do Projeto', cards: ['Responsabilidades alinhadas'] },
      { title: 'Manual entregue', sla: '2 dias úteis', owner: 'Compliance', cards: ['Manual enviado', 'Treinamento realizado'] },
      { title: 'Monitoramento', sla: 'mensal', owner: 'Operacional', cards: ['Checklist mensal', 'Orientações registradas'] },
      { title: 'Prestação', sla: 'cronograma', owner: 'Compliance/Financeiro', cards: ['Comprovantes', 'Relatório final'] },
    ],
  },
  {
    id: 'esporte360',
    title: 'Esporte 360°',
    subtitle: 'Fluxo integrado do diagnóstico à prestação de contas',
    color: 'from-rose-500 to-purple-500',
    columns: [
      { title: 'Diagnóstico', sla: 'Start', owner: 'Consultor', cards: ['Dossiê inicial'] },
      { title: 'Projeto', sla: 'Projeto aprovado', owner: 'Técnico', cards: ['Elaboração completa'] },
      { title: 'Aprovação', sla: 'Sistema oficial', owner: 'Coordenação', cards: ['Protocolo e acompanhamento'] },
      { title: 'Captação', sla: 'Pipeline', owner: 'Comercial', cards: ['Empresas e reuniões'] },
      { title: 'Execução/Prestação', sla: 'Mestre', owner: 'Compliance', cards: ['Cronograma mestre', 'Riscos monitorados'] },
    ],
  },
];

export const alerts = [
  { title: 'Certidões vencendo', description: '3 proponentes precisam atualizar documentação esta semana.', icon: ShieldCheck },
  { title: 'SLA de formulário', description: '5 leads estão parados há mais de 48h sem resposta.', icon: Megaphone },
  { title: 'Prestação crítica', description: '2 projetos exigem conferência de comprovantes antes do fechamento.', icon: ClipboardCheck },
  { title: 'Oportunidade de captação', description: 'Empresa com potencial fiscal alto combinou com 4 projetos.', icon: Sparkles },
];
