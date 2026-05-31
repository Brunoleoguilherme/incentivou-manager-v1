# IncentiVou Manager — ZIP 02

Esta versão transforma o MVP visual em uma base funcional ligada ao Supabase.

## Incluído

- CRUD real de projetos em `/projetos`
- Dossiê único do projeto em `/projetos/[id]`
- Kanban operacional real em `/admin/kanban`
- Kanban do executor em `/executor/kanban`
- Página de diagnóstico do executor usando a base real de projetos
- Integração com as tabelas do Supabase criadas nos Scripts 01 e 02
- Script 03 com dados demo em `supabase/script_03_dados_demo.sql`

## Antes de rodar

Crie ou confira o arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=SUA_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Depois rode:

```powershell
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000/login
```

## Ordem no Supabase

1. Rodar Script 01: estrutura base
2. Rodar Script 02: colunas Kanban
3. Rodar Script 03: dados demo para testar o frontend

## Rotas principais

- `/login`
- `/admin`
- `/admin/kanban`
- `/executor`
- `/executor/kanban`
- `/executor/diagnostico`
- `/empresa`
- `/projetos`
- `/projetos/[id]`

## Observação

O login ainda está em modo demonstração/localStorage. A próxima versão deve trocar para Supabase Auth real com redirecionamento por perfil.
