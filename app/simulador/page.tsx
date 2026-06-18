'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

/* ── tipos ───────────────────────────────────────── */
type Item = { categoria: string; nome_item: string; quantidade: number; valor_unitario: number; total: number };
type NovoItem = { categoria: string; nome_item: string; quantidade: string; valor_unitario: string };

/* ── dados ───────────────────────────────────────── */
const CATEGORIAS = [
  'Recursos Humanos Atividade Fim',
  'Encargos Sociais e Trabalhistas Atividade Fim',
  'Materiais Esportivos e Afins',
  'Bolsa Auxílio',
  'Hospedagem, Alimentação e Transporte',
  'Recursos Humanos Atividade Meio',
  'Encargos Sociais e Trabalhistas Atividade Meio',
  'Empresa Especializada em Prestação de Contas',
  'Local de Execução',
];

const SUGESTOES: Record<string, string[]> = {
  'Recursos Humanos Atividade Fim': ['Professor', 'Monitor', 'Coordenador Técnico', 'Preparador Físico', 'Fisioterapeuta'],
  'Materiais Esportivos e Afins': ['Uniforme', 'Bola', 'Cone', 'Colete', 'Equipamento esportivo'],
  'Bolsa Auxílio': ['Bolsa Auxílio Categoria 1', 'Bolsa Auxílio Categoria 2', 'Bolsa Auxílio Categoria 3'],
  'Hospedagem, Alimentação e Transporte': ['Alimentação', 'Transporte van', 'Transporte ônibus', 'Hospedagem'],
  'Recursos Humanos Atividade Meio': ['Contador', 'Advogado', 'Secretária', 'Auxiliar administrativo', 'Fotógrafo'],
  'Empresa Especializada em Prestação de Contas': ['Prestação de contas mensal', 'Consultoria técnica'],
  'Local de Execução': ['Quadra', 'Campo', 'Ginásio', 'Centro de treinamento'],
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const inputCls = 'h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0068ff] focus:bg-white';
const selectCls = inputCls;
const labelCls = 'block text-xs font-black uppercase tracking-[0.16em] text-slate-500 mb-2';
const fmt = (v: number) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

/* ── página ──────────────────────────────────────── */
export default function SimuladorPage() {
  const [enviando, setEnviando]   = useState(false);
  const [sucesso, setSucesso]     = useState(false);
  const [erro, setErro]           = useState('');

  const [form, setForm] = useState({
    nome_responsavel: '', email: '', telefone: '', entidade: '',
    cnpj: '', cidade: '', estado: '',
    nome_projeto: '', tipo_projeto: '', modalidade: '',
    tipo_lei: 'Lei Federal', duracao_meses: '12', local_execucao: '',
    observacoes: '', consentimento_lgpd: false,
  });

  const [itens, setItens]   = useState<Item[]>([]);
  const [novo, setNovo]     = useState<NovoItem>({ categoria: CATEGORIAS[0], nome_item: '', quantidade: '1', valor_unitario: '' });

  const f = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [campo]: e.target.value }));

  const totalFim  = useMemo(() => itens.filter(i => !['Recursos Humanos Atividade Meio','Encargos Sociais e Trabalhistas Atividade Meio','Empresa Especializada em Prestação de Contas'].includes(i.categoria)).reduce((s, i) => s + i.total, 0), [itens]);
  const totalMeio = useMemo(() => itens.filter(i =>  ['Recursos Humanos Atividade Meio','Encargos Sociais e Trabalhistas Atividade Meio','Empresa Especializada em Prestação de Contas'].includes(i.categoria)).reduce((s, i) => s + i.total, 0), [itens]);
  const totalGeral = totalFim + totalMeio;

  function adicionarItem() {
    if (!novo.nome_item || !novo.quantidade || !novo.valor_unitario) { setErro('Preencha item, quantidade e valor.'); return; }
    setErro('');
    const qtd = Number(novo.quantidade);
    const val = Number(String(novo.valor_unitario).replace(',', '.'));
    setItens(p => [...p, { categoria: novo.categoria, nome_item: novo.nome_item, quantidade: qtd, valor_unitario: val, total: qtd * val }]);
    setNovo(p => ({ ...p, nome_item: '', quantidade: '1', valor_unitario: '' }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.consentimento_lgpd) { setErro('Aceite o consentimento LGPD para continuar.'); return; }
    if (!form.nome_responsavel || !form.email || !form.nome_projeto) { setErro('Preencha nome, e-mail e nome do projeto.'); return; }
    if (!supabase) { setErro('Erro de configuração.'); return; }
    setEnviando(true);

    const { data, error } = await supabase
      .from('simulacoes_projeto')
      .insert({ ...form, duracao_meses: Number(form.duracao_meses || 12), total_atividade_fim: totalFim, total_atividade_meio: totalMeio, total_geral: totalGeral })
      .select('id').single();

    if (error) { setErro('Erro ao enviar. Tente novamente.'); setEnviando(false); return; }
    if (itens.length > 0 && data) {
      await supabase.from('simulacao_itens').insert(itens.map(i => ({ simulacao_id: data.id, ...i })));
    }
    setSucesso(true); setEnviando(false);
  }

  if (sucesso) return (
    <PortalShell portal="empresa">
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h2 className="mt-5 text-2xl font-black text-slate-950">Simulação enviada!</h2>
          <p className="mt-3 text-sm font-bold text-slate-500">
            Projeto <strong>{form.nome_projeto}</strong> recebido.<br />
            Nossa equipe entrará em contato pelo e-mail <strong>{form.email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => { setSucesso(false); setForm({ nome_responsavel: '', email: '', telefone: '', entidade: '', cnpj: '', cidade: '', estado: '', nome_projeto: '', tipo_projeto: '', modalidade: '', tipo_lei: 'Lei Federal', duracao_meses: '12', local_execucao: '', observacoes: '', consentimento_lgpd: false }); setItens([]); }}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-3 text-sm font-black text-white"
          >
            Nova simulação
          </button>
        </div>
      </div>
    </PortalShell>
  );

  return (
    <PortalShell portal="empresa">
      <div className="mx-auto max-w-3xl space-y-7">

        {/* HEADER */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Empresa</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Simulador de Projeto</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Preencha os dados abaixo e simule uma estimativa inicial do seu projeto esportivo incentivado.
          </p>
        </div>

        <form onSubmit={enviar} className="space-y-7">

          {/* DADOS DO RESPONSÁVEL */}
          <Card title="Dados do responsável">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome do responsável *">
                <input value={form.nome_responsavel} onChange={f('nome_responsavel')} placeholder="Nome completo" className={inputCls} />
              </Field>
              <Field label="E-mail *">
                <input type="email" value={form.email} onChange={f('email')} placeholder="email@empresa.com" className={inputCls} />
              </Field>
              <Field label="Telefone / WhatsApp">
                <input value={form.telefone} onChange={f('telefone')} placeholder="(00) 00000-0000" className={inputCls} />
              </Field>
              <Field label="Entidade / organização">
                <input value={form.entidade} onChange={f('entidade')} placeholder="Razão social" className={inputCls} />
              </Field>
              <Field label="CNPJ">
                <input value={form.cnpj} onChange={f('cnpj')} placeholder="00.000.000/0001-00" className={inputCls} />
              </Field>
              <Field label="Cidade">
                <input value={form.cidade} onChange={f('cidade')} placeholder="Cidade" className={inputCls} />
              </Field>
              <Field label="Estado">
                <select value={form.estado} onChange={f('estado')} className={selectCls}>
                  <option value="">Selecione</option>
                  {UFS.map(uf => <option key={uf}>{uf}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          {/* DETALHES DO PROJETO */}
          <Card title="Detalhes do projeto">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome do projeto *">
                <input value={form.nome_projeto} onChange={f('nome_projeto')} placeholder="Ex: Projeto Esporte e Cidadania 2026" className={inputCls} />
              </Field>
              <Field label="Tipo de projeto">
                <select value={form.tipo_projeto} onChange={f('tipo_projeto')} className={selectCls}>
                  <option value="">Selecione</option>
                  {['Projeto esportivo','Projeto paradesportivo','Evento esportivo','Formação esportiva','Rendimento esportivo'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Modalidade esportiva">
                <input value={form.modalidade} onChange={f('modalidade')} placeholder="Ex: Futebol, Natação, Atletismo..." className={inputCls} />
              </Field>
              <Field label="Tipo de lei">
                <select value={form.tipo_lei} onChange={f('tipo_lei')} className={selectCls}>
                  {['Lei Federal','Lei Estadual','Lei Municipal'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Duração (meses)">
                <input type="number" min="1" max="60" value={form.duracao_meses} onChange={f('duracao_meses')} className={inputCls} />
              </Field>
              <Field label="Local de execução">
                <select value={form.local_execucao} onChange={f('local_execucao')} className={selectCls}>
                  <option value="">Selecione</option>
                  {['Próprio','Cedido','Alugado','A definir'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          {/* ITENS DA SIMULAÇÃO */}
          <Card title="Itens da simulação">
            <p className="mb-5 text-xs font-bold text-slate-500">Adicione os itens de custo previstos para estimar o valor total do projeto.</p>

            {/* formulário de item */}
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-[1.5fr_1.5fr_.7fr_.9fr]">
                <Field label="Categoria">
                  <select value={novo.categoria} onChange={e => setNovo(p => ({ ...p, categoria: e.target.value, nome_item: '' }))} className={selectCls}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Item">
                  <input
                    list="sugestoes"
                    value={novo.nome_item}
                    onChange={e => setNovo(p => ({ ...p, nome_item: e.target.value }))}
                    placeholder="Ex: Professor, uniforme..."
                    className={inputCls}
                  />
                  <datalist id="sugestoes">
                    {(SUGESTOES[novo.categoria] || []).map(s => <option key={s} value={s} />)}
                  </datalist>
                </Field>
                <Field label="Qtd">
                  <input type="number" min="1" value={novo.quantidade} onChange={e => setNovo(p => ({ ...p, quantidade: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Valor unit. (R$)">
                  <input value={novo.valor_unitario} onChange={e => setNovo(p => ({ ...p, valor_unitario: e.target.value }))} placeholder="1.500,00" className={inputCls} />
                </Field>
              </div>
              {erro && <p className="mt-3 text-xs font-black text-red-600">{erro}</p>}
              <button
                type="button"
                onClick={adicionarItem}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(0,104,255,0.2)] transition hover:-translate-y-0.5"
              >
                <Plus size={16} /> Incluir item
              </button>
            </div>

            {/* tabela de itens */}
            {itens.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                <div className="hidden grid-cols-[1.4fr_1fr_.5fr_.8fr_.8fr_.4fr] bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 md:grid">
                  <span>Categoria</span><span>Item</span><span>Qtd</span><span>Unit.</span><span>Total</span><span></span>
                </div>
                <div className="divide-y divide-slate-100">
                  {itens.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1.4fr_1fr_.5fr_.8fr_.8fr_.4fr] items-center px-5 py-4 text-sm">
                      <p className="truncate text-xs font-bold text-slate-500">{item.categoria}</p>
                      <p className="font-black text-slate-950">{item.nome_item}</p>
                      <p className="font-bold text-slate-700">{item.quantidade}</p>
                      <p className="font-bold text-slate-700">{fmt(item.valor_unitario)}</p>
                      <p className="font-black text-[#0068ff]">{fmt(item.total)}</p>
                      <button type="button" onClick={() => setItens(p => p.filter((_, j) => j !== i))}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* totais */}
            {itens.length > 0 && (
              <div className="mt-5 space-y-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                {[
                  { label: 'Atividade fim', value: totalFim },
                  { label: 'Atividade meio', value: totalMeio },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
                    <span className="text-sm font-black text-slate-700">{fmt(value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-950">Total estimado</span>
                  <span className="text-2xl font-black text-[#0068ff]">{fmt(totalGeral)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* OBSERVAÇÕES + LGPD */}
          <Card title="Observações e envio">
            <div className="space-y-5">
              <Field label="Observações">
                <textarea
                  value={form.observacoes}
                  onChange={f('observacoes')}
                  rows={4}
                  placeholder="Objetivo do projeto, público atendido e informações relevantes..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0068ff] focus:bg-white"
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.consentimento_lgpd}
                  onChange={e => setForm(p => ({ ...p, consentimento_lgpd: e.target.checked }))}
                  className="mt-0.5 h-5 w-5 accent-[#0068ff]"
                />
                <span className="text-sm font-bold text-slate-700">
                  Autorizo o contato e o tratamento dos meus dados conforme a LGPD.
                </span>
              </label>

              {erro && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_18px_45px_rgba(0,104,255,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar simulação'}
              </button>
            </div>
          </Card>

          <div className="pb-8" />
        </form>
      </div>
    </PortalShell>
  );
}
