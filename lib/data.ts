import { FileText, Building2, Users, Target, Wallet, ShieldCheck, GraduationCap, ShoppingBag, BarChart3, Scale, FolderDown, Handshake, ClipboardCheck, Brain, Settings, Home } from 'lucide-react'
export const modules = [
 {href:'/dashboard',label:'Dashboard',icon:Home,desc:'Visão geral executiva da IncentiVou'},
 {href:'/projetos',label:'Projetos Incentivados',icon:FileText,desc:'Cadastro, status, valores, leis, prazos e documentação'},
 {href:'/proponentes',label:'Proponentes',icon:Users,desc:'Associações, clubes, institutos, atletas e federações'},
 {href:'/patrocinadores',label:'Patrocinadores',icon:Building2,desc:'Empresas apoiadoras, limite fiscal, contatos e histórico'},
 {href:'/captacao',label:'Captação Inteligente',icon:Target,desc:'CRM, pipeline, propostas, follow-ups e comissões'},
 {href:'/execucao',label:'Execução Segura',icon:ShieldCheck,desc:'Gestão técnica, checklist, riscos, glosas e execução'},
 {href:'/prestacao',label:'Prestação de Contas',icon:ClipboardCheck,desc:'Comprovantes, relatórios, pendências e prazos'},
 {href:'/financeiro',label:'Financeiro',icon:Wallet,desc:'Entradas, saídas, saldos, centro de custo e repasses'},
 {href:'/documentos',label:'Modelos e Downloads',icon:FolderDown,desc:'Planilhas, contratos, e-books e documentos modelo'},
 {href:'/academy',label:'IncentiVou Academy',icon:GraduationCap,desc:'E-books gratuitos, premium, cursos e certificações'},
 {href:'/marketplace',label:'Marketplace',icon:ShoppingBag,desc:'Projetos disponíveis para empresas e oportunidades de apoio'},
 {href:'/esg',label:'Impacto e ESG',icon:BarChart3,desc:'ODS, beneficiários, impacto social e relatórios para empresas'},
 {href:'/juridico',label:'Jurídico',icon:Scale,desc:'Contratos, procurações, termos, LGPD e assinaturas'},
 {href:'/relatorios',label:'Relatórios',icon:Brain,desc:'Relatórios executivos, PDFs, IA e indicadores'},
 {href:'/configuracoes',label:'Configurações',icon:Settings,desc:'Usuários, permissões, planos e identidade visual'}
]
export const planos = ['Start Esporte Incentivado','Projeto Aprovado','Captação Inteligente','Dedução Inteligente','Execução Segura','Esporte 360°']
export const kpis = [ ['Projetos cadastrados','128'], ['Valor aprovado','R$ 42,8 mi'], ['Valor captado','R$ 18,4 mi'], ['Empresas no CRM','376'], ['Prestação em dia','91%'], ['Leads por e-book','1.248']]
export const docs = [
 ['Planilha modelo de despesas','Financeiro','/modelos-despesas-incentivou.xlsx'],['Contrato de patrocínio incentivado','Jurídico','#'],['Modelo de projeto técnico LIE','Projetos','#'],['E-book gratuito: Como captar empresas','Academy','#'],['E-book premium: Prestação sem glosa','Academy Premium','#'],['Relatório ESG para patrocinadores','ESG','#']]
