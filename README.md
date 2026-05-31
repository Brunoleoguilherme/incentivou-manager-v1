# IncentiVou — Sistema Completo

Sistema visual em Next.js + Tailwind, preparado para Vercel e Supabase.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra: http://localhost:3000

## Como enviar para Vercel

```bash
npm run build
git init
git add .
git commit -m "sistema inicial IncentiVou"
git branch -M main
git remote add origin SEU_REPOSITORIO_GITHUB
git push -u origin main
```

Depois importe o repositório na Vercel e configure as variáveis do `.env.example`.

## O que já está incluso

- Identidade visual IncentiVou
- Dashboard executivo
- Projetos incentivados
- Proponentes
- Patrocinadores
- Captação Inteligente
- Execução Segura
- Prestação de Contas
- Financeiro
- Modelos e Downloads
- IncentiVou Academy
- Marketplace
- ESG e Impacto
- Jurídico
- Relatórios
- Configurações
- Login visual
- Logo na pasta `public`
- Planilha modelo de despesas para download

## Próximo passo técnico

Integrar as telas com Supabase: autenticação, tabelas, RLS, uploads e dados reais.
