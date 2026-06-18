'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

const LEIS = [
  'Lei 11.438/2006 – Lei de Incentivo ao Esporte (Federal)',
  'Lei Rouanet – Lei 8.313/1991 (Federal)',
  'Lei Pelé – Lei 9.615/1998 (Federal)',
  'Lei Estadual de Incentivo ao Esporte',
  'Lei Municipal de Incentivo ao Esporte',
  'Outro',
];
const MODALIDADES = [
  'Futebol','Basquete','Voleibol','Natação','Atletismo','Judô','Tênis',
  'Handebol','Futsal','Ciclismo','Ginástica','Esportes de Aventura',
  'Esporte Escolar','Paradesporto','Multiesporte','Outro',
];
const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const inputCls = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">{label}</label>
      {children}
    </div>
  );
}

export default function EditarProjetoPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erro, setErro]         = useState('');

  const [form, setForm] = useState({
    nome: '', esfera: '', lei_especifica: '', lei_incentivo: '',
    entidade_nome: '', entidade_cnpj: '', responsavel_tecnico: '',
    modalidade: '', objetivo: '', publico_alvo: '', num_beneficiarios: '',
    contrapartidas: '', descricao: '',
    municipio: '', estado: '', data_inicio: '', data_fim: '',
    valor_total: '', valor_solicitado: '',
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!supabase || !id) return;
    supabase
      .from('manager_projetos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setErro('Projeto não encontrado.'); setLoading(false); return; }
        setForm({
          nome:                data.nome                 || '',
          esfera:              data.esfera               || '',
          lei_especifica:      data.lei_especifica       || '',
          lei_incentivo:       data.lei_incentivo        || '',
          entidade_nome:       data.entidade_nome        || '',
          entidade_cnpj:       data.entidade_cnpj        || '',
          responsavel_tecnico: data.responsavel_tecnico  || '',
          modalidade:          data.modalidade           || '',
          objetivo:            data.objetivo             || '',
          publico_alvo:        data.publico_alvo         || '',
          num_beneficiarios:   String(data.num_beneficiarios || ''),
          contrapartidas:      data.contrapartidas       || '',
          descricao:           data.descricao            || '',
          municipio:           data.cidade               || '',
          estado:              data.estado               || '',
          data_inicio:         data.data_inicio          || '',
          data_fim:            data.data_fim             || '',
          valor_total:         String(data.valor_total   || ''),
          valor_solicitado:    String(data.valor_solicitado || ''),
        });
        setLoading(false);
      });
  }, [id]);

  async function salvar() {
    if (!supabase || !id) return;
    setSaving(true); setErro('');

    const { error } = await supabase
      .from('manager_projetos')
      .update({
        nome:               form.nome.trim(),
        esfera:             form.esfera            || null,
        lei_especifica:     form.lei_especifica    || null,
        lei_incentivo:      form.lei_incentivo     || null,
        modalidade:         form.modalidade        || null,
        objetivo:           form.objetivo.trim()   || null,
        publico_alvo:       form.publico_alvo.trim() || null,
        num_beneficiarios:  Number(form.num_beneficiarios || 0),
        contrapartidas:     form.contrapartidas.trim() || null,
        descricao:          form.descricao.trim()  || null,
        cidade:             form.municipio.trim()  || null,
        estado:             form.estado            || null,
        data_inicio:        form.data_inicio       || null,
        data_fim:           form.data_fim          || null,
        valor_total:        Number(form.valor_total      || 0),
        valor_solicitado:   Number(form.valor_solicitado || 0),
        responsavel_tecnico: form.responsavel_tecnico.trim() || null,
      })
      .eq('id', id);

    setSaving(false);
    if (error) { setErro(error.message); return; }
    setSucesso(true);
    setTimeout(() => router.push(`/executor/projetos/${id}`), 1500);
  }

  if (loading) {
    return (
      <PortalShell portal="executor">
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-black text-slate-400">
          Carregando projeto...
        </div>
      </PortalShell>
    );
  }

  if (sucesso) {
    return (
      <PortalShell portal="executor">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
            <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">Projeto atualizado!</h2>
            <p className="mt-3 text-sm font-bold text-slate-500">Redirecionando...</p>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell portal="executor">
      <div className="mx-auto max-w-3xl space-y-6">

        <div className="flex items-center gap-4">
          <Link href={`/executor/projetos/${id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={15}/> Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950">Editar Projeto</h1>
            <p className="text-sm font-bold text-slate-500">Corrija ou atualize as informações</p>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>
        )}

        <Card title="Identificação do Projeto">
          <Field label="Nome do Projeto *">
            <input value={form.nome} onChange={e => set('nome', e.target.value)} className={inputCls} placeholder="Ex: Projeto Esporte e Cidadania 2026"/>
          </Field>
          <Field label="Esfera de Governo *">
            <div className="flex gap-3">
              {['federal','estadual','municipal'].map(e => (
                <button key={e} type="button" onClick={() => set('esfera', e)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-black capitalize transition ${form.esfera === e ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {e}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Lei de Incentivo *">
            <select value={form.lei_incentivo} onChange={e => set('lei_incentivo', e.target.value)} className={inputCls}>
              <option value="">Selecionar lei...</option>
              {LEIS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Nº do Processo (se houver)">
            <input value={form.lei_especifica} onChange={e => set('lei_especifica', e.target.value)} className={inputCls} placeholder="Ex: 0001234-2026"/>
          </Field>
          <Field label="Entidade Proponente">
            <input value={form.entidade_nome} onChange={e => set('entidade_nome', e.target.value)} className={inputCls} placeholder="Razão social da entidade"/>
          </Field>
          <Field label="CNPJ da Entidade">
            <input value={form.entidade_cnpj} onChange={e => set('entidade_cnpj', e.target.value)} className={inputCls} placeholder="00.000.000/0001-00"/>
          </Field>
          <Field label="Responsável Técnico *">
            <input value={form.responsavel_tecnico} onChange={e => set('responsavel_tecnico', e.target.value)} className={inputCls} placeholder="Nome completo"/>
          </Field>
        </Card>

        <Card title="Detalhes do Projeto">
          <Field label="Modalidade Esportiva *">
            <select value={form.modalidade} onChange={e => set('modalidade', e.target.value)} className={inputCls}>
              <option value="">Selecionar...</option>
              {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Objetivo do Projeto *">
            <textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)} rows={3} className={inputCls} placeholder="Descreva o objetivo principal..."/>
          </Field>
          <Field label="Descrição Completa">
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} rows={4} className={inputCls} placeholder="Atividades, metodologia e impacto esperado..."/>
          </Field>
          <Field label="Público-Alvo *">
            <input value={form.publico_alvo} onChange={e => set('publico_alvo', e.target.value)} className={inputCls} placeholder="Ex: Jovens de 10-18 anos em vulnerabilidade social"/>
          </Field>
          <Field label="Número de Beneficiários *">
            <input type="number" min="0" value={form.num_beneficiarios} onChange={e => set('num_beneficiarios', e.target.value)} className={inputCls} placeholder="0"/>
          </Field>
          <Field label="Contrapartidas ao Patrocinador">
            <textarea value={form.contrapartidas} onChange={e => set('contrapartidas', e.target.value)} rows={3} className={inputCls} placeholder="Divulgação em eventos, relatórios de impacto, banners..."/>
          </Field>
        </Card>

        <Card title="Local, Período e Valores">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Município *">
              <input value={form.municipio} onChange={e => set('municipio', e.target.value)} className={inputCls} placeholder="Cidade"/>
            </Field>
            <Field label="Estado *">
              <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls}>
                <option value="">UF</option>
                {ESTADOS_BR.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data de Início *">
              <input type="date" value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} className={inputCls}/>
            </Field>
            <Field label="Data de Término *">
              <input type="date" value={form.data_fim} onChange={e => set('data_fim', e.target.value)} className={inputCls}/>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor Total do Projeto (R$) *">
              <input type="number" min="0" value={form.valor_total} onChange={e => set('valor_total', e.target.value)} className={inputCls} placeholder="500000"/>
            </Field>
            <Field label="Valor Solicitado por Incentivo (R$) *">
              <input type="number" min="0" value={form.valor_solicitado} onChange={e => set('valor_solicitado', e.target.value)} className={inputCls} placeholder="500000"/>
            </Field>
          </div>
        </Card>

        <div className="flex justify-end pb-8">
          <button type="button" onClick={salvar} disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-8 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60 transition hover:-translate-y-0.5">
            {saving ? <><Loader2 size={16} className="animate-spin"/>Salvando...</> : '✓ Salvar Alterações'}
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
