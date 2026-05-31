# IncentiVou Manager Core - ZIP 01

Este pacote adiciona a primeira base estrutural do IncentiVou Manager no padrão visual premium claro do site.

## O que foi criado

### Portais separados
- `/admin` - Portal Administrador
- `/executor` - Portal Executor
- `/empresa` - Portal Empresa Apoiadora

### Kanban operacional
- `/admin/kanban`
- `/executor/kanban`

Boards incluídos:
- Plano Start
- Projeto Aprovado
- Captação Inteligente
- Execução Segura
- Esporte 360°

Cada board já possui colunas com:
- responsável
- SLA/prazo
- cards operacionais
- checklist visual
- status de progresso

### Páginas complementares criadas
- `/admin/executores`
- `/admin/empresas`
- `/admin/compliance`
- `/executor/diagnostico`
- `/empresa/projetos`
- `/prestacao`
- `/esg`

### Componentes novos
- `components/PortalShell.tsx`
- `components/PortalDashboard.tsx`
- `components/KanbanBoard.tsx`

### Dados e estrutura
- `lib/kanbanData.ts`
- atualização do `supabase/schema.sql` com tabelas para usuários, boards, colunas, cards, checklists, comentários, anexos, histórico e alertas.

## Acessos de demonstração

Admin:
- e-mail: `admin@incentivou.com.br`
- senha: `admin123`

Executor:
- e-mail: `ester@incentivou.com.br`
- senha: `executor123`

Empresa:
- e-mail: `empresa@incentivou.com.br`
- senha: `empresa123`

## Como rodar localmente

```bash
npm install
npm run dev
```

Abrir:

```txt
http://localhost:3000/login
```

## Como subir para Vercel

```bash
npm run build
git add .
git commit -m "Cria core com portais e kanban operacional"
git push origin main
```

## Observação

O login ainda está em modo demonstração com `localStorage`. A próxima etapa recomendada é ligar esses perfis ao Supabase Auth e ao controle real de permissões.
