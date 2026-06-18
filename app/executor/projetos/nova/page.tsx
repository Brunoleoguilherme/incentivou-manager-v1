'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileUp, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type UploadDoc = { categoria: string; nome: string; file: File | null };

const DOCS_EXIGIDOS = [
  { categoria: 'estatuto',           label: 'Estatuto Social / Ata de Fundação' },
  { categoria: 'certidao_federal',   label: 'Certidão Negativa Federal (Receita Federal)' },
  { categoria: 'certidao_estadual',  label: 'Certidão Negativa Estadual' },
  { categoria: 'certidao_municipal', label: 'Certidão Negativa Municipal' },
  { categoria: 'plano_trabalho',     label: 'Plano de Trabalho' },
];

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

const TIPOS_PROJETO_OPT = [
  { value: 'esportivo',      label: 'Projeto Esportivo' },
  { value: 'paradesportivo', label: 'Paradesportivo' },
  { value: 'evento',         label: 'Evento Esportivo' },
  { value: 'formacao',       label: 'Formação Esportiva' },
  { value: 'rendimento',     label: 'Rendimento' },
];

const PUBLICO_OPT = [
  { value: 'criancas', label: 'Crianças (6–12)' },
  { value: 'jovens',   label: 'Jovens (13–17)' },
  { value: 'adultos',  label: 'Adultos (18–59)' },
  { value: 'idosos',   label: 'Idosos (60+)' },
  { value: 'pcd',      label: 'PCD' },
];

const ODS_OPT = [
  { num: 1,  label: 'Pobreza' },
  { num: 3,  label: 'Saúde' },
  { num: 4,  label: 'Educação' },
  { num: 5,  label: 'Igualdade' },
  { num: 8,  label: 'Trabalho' },
  { num: 10, label: 'Desigualdades' },
  { num: 11, label: 'Cidades' },
  { num: 16, label: 'Paz' },
  { num: 17, label: 'Parcerias' },
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

export default function NovaInscricaoPage() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [saving, setSaving]   = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro]       = useState('');

  const [form, setForm] = useState({
    nome:'', esfera:'', lei_especifica:'', lei_incentivo:'',
    entidade_nome:'', entidade_cnpj:'', responsavel_tecnico:'',
    modalidade:'', objetivo:'', publico_alvo:'', num_beneficiarios:'',
    contrapartidas:'', descricao:'',
    municipio:'', estado:'', data_inicio:'', data_fim:'',
    valor_total:'', valor_solicitado:'',
  });

  const [tiposProjeto, setTiposProjeto] = useState<string[]>([]);
  const [publicoFaixa, setPublicoFaixa] = useState<string[]>([]);
  const [odsTags, setOdsTags]           = useState<number[]>([]);

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  const [docs, setDocs] = useState<UploadDoc[]>(
    DOCS_EXIGIDOS.map(d => ({ categoria: d.categoria, nome: '', file: null }))
  );

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function setDocFile(i: number, file: File | null) {
    setDocs(prev => prev.map((d, idx) => idx === i ? { ...d, file, nome: file?.name || '' } : d));
  }

  async function salvar() {
    if (!supabase) return;
    setSaving(true); setErro('');

    const { data: projeto, error: projErr } = await supabase
      .from('manager_projetos')
      .insert({
        nome:               form.nome.trim(),
        esfera:             form.esfera || null,
        lei_especifica:     form.lei_especifica || null,
        lei_incentivo:      form.lei_incentivo || null,
        modalidade:         form.modalidade || null,
        objetivo:           form.objetivo.trim() || null,
        publico_alvo:       form.publico_alvo.trim() || null,
        num_beneficiarios:  Number(form.num_beneficiarios || 0),
        contrapartidas:     form.contrapartidas.trim() || null,
        descricao:          form.descricao.trim() || null,
        cidade:             form.municipio.trim() || null,
        estado:             form.estado || null,
        data_inicio:        form.data_inicio || null,
        data_fim:           form.data_fim || null,
        valor_total:        Number(form.valor_total || 0),
        valor_solicitado:   Number(form.valor_solicitado || 0),
        responsavel_tecnico: form.responsavel_tecnico.trim() || null,
        tipo_projeto:       tiposProjeto[0] || null,
        publico_alvo_faixa: publicoFaixa.length > 0 ? publicoFaixa : null,
        ods_tags:           odsTags.length > 0 ? odsTags : null,
        status:             'diagnostico',
        inscricao_status:   'enviado',
        ...(() => {
          try {
            const u = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
            return { usuario_id: u.id || null, executor_nome: u.nome || null };
          } catch { return {}; }
        })(),
      })
      .select('id')
      .single();

    if (projErr || !projeto) {
      setErro(projErr?.message || 'Erro ao salvar projeto.');
      setSaving(false); return;
    }

    // Sync: criar card no Kanban CRM automaticamente
    try {
      const { data: colunas } = await supabase
        .from('manager_kanban_colunas')
        .select('id,ordem')
        .order('ordem', { ascending: true })
        .limit(1);
      const primeiraColuna = colunas?.[0];
      if (primeiraColuna) {
        const { data: ultimoCard } = await supabase
          .from('manager_kanban_cards')
          .select('ordem')
          .eq('coluna_id', primeiraColuna.id)
          .order('ordem', { ascending: false })
          .limit(1);
        const proximaOrdem = (ultimoCard?.[0]?.ordem ?? 0) + 1;
        await supabase.from('manager_kanban_cards').insert({
          coluna_id: primeiraColuna.id,
          titulo:    form.nome.trim(),
          descricao: form.objetivo.trim() || null,
          ordem:     proximaOrdem,
          projeto_id: projeto.id,
          tipo:      'projeto',
          tags:      form.esfera ? [form.esfera] : null,
        });
      }
    } catch (_) { /* não bloqueia o fluxo se falhar */ }

    for (const doc of docs) {
      if (!doc.file) continue;
      const path = `inscricoes/${projeto.id}/${doc.categoria}/${doc.file.name}`;
      const { error: upErr } = await supabase.storage.from('documentos').upload(path, doc.file, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path);
        await supabase.from('manager_documentos_inscricao').insert({
          projeto_id: projeto.id,
          categoria:  doc.categoria,
          nome:       doc.file.name,
          url:        urlData?.publicUrl || null,
        });
      }
    }

    setSaving(false); setSucesso(true);
    setTimeout(() => router.push('/executor/projetos'), 2000);
  }

  if (sucesso) {
    return (
      <PortalShell portal="executor">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
            <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">Projeto inscrito com sucesso!</h2>
            <p className="mt-3 text-sm font-bold text-slate-500">Redirecionando...</p>
          </div>
        </div>
      </PortalShell>
    );
  }

  const stepTitles = ['Identificação', 'Detalhes', 'Impacto & Match', 'Local e Valores', 'Documentos'];

  return (
    <PortalShell portal="executor">
      <div className="mx-auto max-w-3xl space-y-6">

        <div className="flex items-center gap-4">
          <Link href="/executor/projetos"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={15}/> Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950">Inscrição de Projeto</h1>
            <p className="text-sm font-bold text-slate-500">Formulário completo para Lei de Incentivo</p>
          </div>
        </div>

        {/* STEPS */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-0">
            {stepTitles.map((t, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={t} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black transition ${done ? 'bg-emerald-500 text-white' : active ? 'bg-gradient-to-r from-[#0068ff] to-[#16c784] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? <CheckCircle2 size={18}/> : n}
                    </div>
                    <p className={`mt-1 hidden text-center text-[10px] font-black uppercase tracking-wider sm:block ${active ? 'text-slate-950' : 'text-slate-400'}`}>{t}</p>
                  </div>
                  {i < stepTitles.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 rounded-full transition ${done ? 'bg-emerald-400' : 'bg-slate-200'}`}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {erro && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>}

        {step === 1 && (
          <Card title="Identificação do Projeto">
            <Field label="Nome do Projeto *">
              <input value={form.nome} onChange={e=>set('nome',e.target.value)} placeholder="Ex: Projeto Esporte e Cidadania 2026" className={inputCls}/>
            </Field>
            <Field label="Esfera de Governo *">
              <div className="flex gap-3">
                {['federal','estadual','municipal'].map(e => (
                  <button key={e} type="button" onClick={() => set('esfera',e)}
                    className={`flex-1 rounded-2xl border py-3 text-sm font-black capitalize transition ${form.esfera===e ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Lei de Incentivo *">
              <select value={form.lei_incentivo} onChange={e=>set('lei_incentivo',e.target.value)} className={inputCls}>
                <option value="">Selecionar lei...</option>
                {LEIS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Nº do Processo (se houver)">
              <input value={form.lei_especifica} onChange={e=>set('lei_especifica',e.target.value)} placeholder="Ex: 0001234-2026" className={inputCls}/>
            </Field>
            <Field label="Entidade Proponente *">
              <input value={form.entidade_nome} onChange={e=>set('entidade_nome',e.target.value)} placeholder="Razão social da entidade" className={inputCls}/>
            </Field>
            <Field label="CNPJ da Entidade *">
              <input value={form.entidade_cnpj} onChange={e=>set('entidade_cnpj',e.target.value)} placeholder="00.000.000/0001-00" className={inputCls}/>
            </Field>
            <Field label="Responsável Técnico *">
              <input value={form.responsavel_tecnico} onChange={e=>set('responsavel_tecnico',e.target.value)} placeholder="Nome completo" className={inputCls}/>
            </Field>
          </Card>
        )}

        {step === 2 && (
          <Card title="Detalhes do Projeto">
            <Field label="Modalidade Esportiva *">
              <select value={form.modalidade} onChange={e=>set('modalidade',e.target.value)} className={inputCls}>
                <option value="">Selecionar...</option>
                {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Objetivo do Projeto *">
              <textarea value={form.objetivo} onChange={e=>set('objetivo',e.target.value)} rows={3} placeholder="Descreva o objetivo principal..." className={inputCls}/>
            </Field>
            <Field label="Descrição Completa">
              <textarea value={form.descricao} onChange={e=>set('descricao',e.target.value)} rows={4} placeholder="Atividades, metodologia e impacto esperado..." className={inputCls}/>
            </Field>
            <Field label="Público-Alvo *">
              <input value={form.publico_alvo} onChange={e=>set('publico_alvo',e.target.value)} placeholder="Ex: Jovens de 10-18 anos em vulnerabilidade social" className={inputCls}/>
            </Field>
            <Field label="Número de Beneficiários *">
              <input type="number" min="0" value={form.num_beneficiarios} onChange={e=>set('num_beneficiarios',e.target.value)} placeholder="0" className={inputCls}/>
            </Field>
            <Field label="Contrapartidas ao Patrocinador">
              <textarea value={form.contrapartidas} onChange={e=>set('contrapartidas',e.target.value)} rows={3} placeholder="Divulgação em eventos, relatórios de impacto, banners..." className={inputCls}/>
            </Field>
          </Card>
        )}

        {step === 4 && (
          <Card title="Local, Período e Valores">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Município *">
                <input value={form.municipio} onChange={e=>set('municipio',e.target.value)} placeholder="Cidade" className={inputCls}/>
              </Field>
              <Field label="Estado *">
                <select value={form.estado} onChange={e=>set('estado',e.target.value)} className={inputCls}>
                  <option value="">UF</option>
                  {ESTADOS_BR.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data de Início *">
                <input type="date" value={form.data_inicio} onChange={e=>set('data_inicio',e.target.value)} className={inputCls}/>
              </Field>
              <Field label="Data de Término *">
                <input type="date" value={form.data_fim} onChange={e=>set('data_fim',e.target.value)} className={inputCls}/>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Valor Total do Projeto (R$) *">
                <input type="number" min="0" value={form.valor_total} onChange={e=>set('valor_total',e.target.value)} placeholder="0,00" className={inputCls}/>
              </Field>
              <Field label="Valor Solicitado por Incentivo (R$) *">
                <input type="number" min="0" value={form.valor_solicitado} onChange={e=>set('valor_solicitado',e.target.value)} placeholder="0,00" className={inputCls}/>
              </Field>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Impacto & Match Score">
            <p className="text-sm font-bold text-slate-500">
              Essas informações aumentam a compatibilidade do projeto com empresas patrocinadoras no Marketplace.
            </p>

            <Field label="Tipo de projeto *">
              <div className="flex flex-wrap gap-2">
                {TIPOS_PROJETO_OPT.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTiposProjeto(prev => toggleArr(prev, t.value))}
                    className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                      tiposProjeto.includes(t.value)
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Público-alvo principal">
              <div className="flex flex-wrap gap-2">
                {PUBLICO_OPT.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPublicoFaixa(prev => toggleArr(prev, p.value))}
                    className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                      publicoFaixa.includes(p.value)
                        ? 'border-[#0068ff] bg-[#0068ff]/10 text-[#0068ff]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="ODS relacionados (Objetivos de Desenvolvimento Sustentável)">
              <div className="flex flex-wrap gap-2">
                {ODS_OPT.map((o) => (
                  <button
                    key={o.num}
                    type="button"
                    onClick={() => setOdsTags(prev => toggleArr(prev, o.num))}
                    className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                      odsTags.includes(o.num)
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black">ODS {o.num}</span> · {o.label}
                  </button>
                ))}
              </div>
            </Field>
          </Card>
        )}

        {step === 4 && (
          <Card title="Documentos Obrigatórios">
            <p className="text-sm font-bold text-slate-500">Formatos aceitos: PDF, DOC, DOCX, PNG, JPG.</p>
            <div className="space-y-3">
              {DOCS_EXIGIDOS.map((doc, i) => (
                <div key={doc.categoria} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${docs[i].file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        {docs[i].file ? <CheckCircle2 size={18}/> : <FileUp size={18}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{doc.label}</p>
                        {docs[i].file && <p className="text-xs font-bold text-emerald-600">{docs[i].nome}</p>}
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={e => setDocFile(i, e.target.files?.[0] || null)} className="hidden"/>
                      <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50">
                        <Upload size={14}/>{docs[i].file ? 'Trocar' : 'Enviar'}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between pb-8">
          <button type="button" onClick={() => setStep(s => Math.max(1,s-1))} disabled={step===1}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50">
            ← Anterior
          </button>
          {step < 5 ? (
            <button type="button" onClick={() => setStep(s => Math.min(5, s+1))}
              className="rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-8 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">
              Próximo →
            </button>
          ) : (
            <button type="button" onClick={salvar} disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-8 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin"/>Enviando...</> : '✓ Enviar Inscrição'}
            </button>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
