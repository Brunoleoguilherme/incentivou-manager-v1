'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Save,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

/* ── dados de opções ─────────────────────────────── */
const TIPOS_PROJETO = [
  { value: 'esportivo',      label: 'Projeto Esportivo' },
  { value: 'paradesportivo', label: 'Paradesportivo' },
  { value: 'evento',         label: 'Evento Esportivo' },
  { value: 'formacao',       label: 'Formação Esportiva' },
  { value: 'rendimento',     label: 'Rendimento' },
];

const MODALIDADES = [
  'Futebol','Basquete','Voleibol','Natação','Atletismo',
  'Judô','Tênis','Handebol','Futsal','Ciclismo',
  'Ginástica','Paradesporto','Multiesporte','Futebol Americano','Outro',
];

const ESFERAS = [
  { value: 'federal',   label: 'Federal' },
  { value: 'estadual',  label: 'Estadual' },
  { value: 'municipal', label: 'Municipal' },
];

const PUBLICO = [
  { value: 'criancas', label: 'Crianças (6–12 anos)' },
  { value: 'jovens',   label: 'Jovens (13–17 anos)' },
  { value: 'adultos',  label: 'Adultos (18–59 anos)' },
  { value: 'idosos',   label: 'Idosos (60+ anos)' },
  { value: 'pcd',      label: 'PCD' },
];

const FAIXAS_VALOR = [
  { value: 'ate_100k',   label: 'Até R$ 100 mil' },
  { value: '100k_500k',  label: 'R$ 100k – R$ 500k' },
  { value: '500k_1m',    label: 'R$ 500k – R$ 1M' },
  { value: 'acima_1m',   label: 'Acima de R$ 1M' },
];

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const ODS_LISTA = [
  { num: 1,  label: 'Erradicação da Pobreza' },
  { num: 3,  label: 'Saúde e Bem-Estar' },
  { num: 4,  label: 'Educação de Qualidade' },
  { num: 5,  label: 'Igualdade de Gênero' },
  { num: 8,  label: 'Trabalho Decente' },
  { num: 10, label: 'Redução das Desigualdades' },
  { num: 11, label: 'Cidades Sustentáveis' },
  { num: 13, label: 'Ação Climática' },
  { num: 16, label: 'Paz e Justiça' },
  { num: 17, label: 'Parcerias' },
];

type Perfil = {
  tipos_projeto: string[];
  modalidades: string[];
  esferas: string[];
  publico_alvo: string[];
  estados: string[];
  ods: number[];
  faixa_valor: string;
};

const perfilVazio: Perfil = {
  tipos_projeto: [], modalidades: [], esferas: [],
  publico_alvo: [], estados: [], ods: [], faixa_valor: '',
};

/* ── helpers ─────────────────────────────────────── */
function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function ChipBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition ${
        active
          ? 'border-[#0068ff] bg-[#0068ff]/10 text-[#0068ff]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {active && <CheckCircle2 size={13} />}
      {children}
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950">{title}</h2>
      {hint && <p className="mt-1 text-xs font-bold text-slate-400">{hint}</p>}
      <div className="mt-5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/* ── página ──────────────────────────────────────── */
export default function EmpresaPerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>(perfilVazio);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
    const email = u?.email || '';
    setEmailUsuario(email);
    if (!supabase || !email) { setLoading(false); return; }
    supabase
      .from('manager_empresa_perfil')
      .select('*')
      .eq('empresa_email', email)
      .single()
      .then(({ data }) => {
        if (data) {
          setPerfil({
            tipos_projeto: data.tipos_projeto || [],
            modalidades:   data.modalidades   || [],
            esferas:       data.esferas       || [],
            publico_alvo:  data.publico_alvo  || [],
            estados:       data.estados       || [],
            ods:           data.ods           || [],
            faixa_valor:   data.faixa_valor   || '',
          });
        }
        setLoading(false);
      });
  }, []);

  async function salvar() {
    if (!supabase) return;
    setSalvando(true); setErro(''); setSucesso(false);
    const payload = { ...perfil, empresa_email: emailUsuario, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('manager_empresa_perfil')
      .upsert(payload, { onConflict: 'empresa_email' });
    if (error) { setErro(error.message); setSalvando(false); return; }
    setSucesso(true);
    setSalvando(false);
    setTimeout(() => setSucesso(false), 3000);
  }

  const set = (field: keyof Perfil, val: Perfil[keyof Perfil]) =>
    setPerfil((prev) => ({ ...prev, [field]: val }));

  const pct = (() => {
    let pts = 0;
    if (perfil.tipos_projeto.length)  pts += 20;
    if (perfil.modalidades.length)    pts += 20;
    if (perfil.esferas.length)        pts += 15;
    if (perfil.publico_alvo.length)   pts += 15;
    if (perfil.faixa_valor)           pts += 15;
    if (perfil.estados.length)        pts += 10;
    if (perfil.ods.length)            pts += 5;
    return pts;
  })();

  if (loading) return (
    <PortalShell portal="empresa">
      <p className="p-10 text-center text-sm font-bold text-slate-400">Carregando perfil...</p>
    </PortalShell>
  );

  return (
    <PortalShell portal="empresa">
      <div className="mx-auto max-w-3xl space-y-7">

        {/* HEADER */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0068ff]">Portal Empresa</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Meu Perfil</h1>
            <p className="mt-1 max-w-lg text-sm font-bold text-slate-500">
              Responda às perguntas abaixo para que o sistema encontre os projetos com maior compatibilidade com sua empresa.
            </p>
          </div>

          {/* BARRA DE COMPLETUDE */}
          <div className="w-full max-w-xs shrink-0 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Perfil completo</p>
              <span className={`text-2xl font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                {pct}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-slate-300'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">
              {pct >= 80
                ? 'Excelente! Match Score será muito preciso.'
                : pct >= 50
                ? 'Bom! Complete mais para resultados melhores.'
                : 'Preencha para melhorar seu Match Score.'}
            </p>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">{erro}</div>
        )}

        {sucesso && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            <CheckCircle2 size={18} /> Perfil salvo! O Match Score foi atualizado.
          </div>
        )}

        {/* 1 — TIPO DE PROJETO */}
        <Section
          title="Que tipo de projeto sua empresa prefere apoiar?"
          hint="Selecione um ou mais"
        >
          {TIPOS_PROJETO.map((t) => (
            <ChipBtn
              key={t.value}
              active={perfil.tipos_projeto.includes(t.value)}
              onClick={() => set('tipos_projeto', toggle(perfil.tipos_projeto, t.value))}
            >
              {t.label}
            </ChipBtn>
          ))}
        </Section>

        {/* 2 — MODALIDADES */}
        <Section
          title="Quais modalidades têm mais fit com sua marca?"
          hint="Selecione todas que fazem sentido"
        >
          {MODALIDADES.map((m) => (
            <ChipBtn
              key={m}
              active={perfil.modalidades.includes(m)}
              onClick={() => set('modalidades', toggle(perfil.modalidades, m))}
            >
              {m}
            </ChipBtn>
          ))}
        </Section>

        {/* 3 — ESFERAS */}
        <Section
          title="Em qual esfera sua empresa tem interesse em investir?"
          hint="Pode escolher mais de uma"
        >
          {ESFERAS.map((e) => (
            <ChipBtn
              key={e.value}
              active={perfil.esferas.includes(e.value)}
              onClick={() => set('esferas', toggle(perfil.esferas, e.value))}
            >
              {e.label}
            </ChipBtn>
          ))}
        </Section>

        {/* 4 — PÚBLICO-ALVO */}
        <Section
          title="Qual público-alvo é mais relevante para a sua marca?"
          hint="Selecione todos que se aplicam"
        >
          {PUBLICO.map((p) => (
            <ChipBtn
              key={p.value}
              active={perfil.publico_alvo.includes(p.value)}
              onClick={() => set('publico_alvo', toggle(perfil.publico_alvo, p.value))}
            >
              {p.label}
            </ChipBtn>
          ))}
        </Section>

        {/* 5 — FAIXA DE VALOR */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950">
            Qual faixa de investimento sua empresa considera?
          </h2>
          <p className="mt-1 text-xs font-bold text-slate-400">Escolha apenas uma</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {FAIXAS_VALOR.map((f) => (
              <ChipBtn
                key={f.value}
                active={perfil.faixa_valor === f.value}
                onClick={() => set('faixa_valor', perfil.faixa_valor === f.value ? '' : f.value)}
              >
                {f.label}
              </ChipBtn>
            ))}
          </div>
        </div>

        {/* 6 — ESTADOS */}
        <Section
          title="Em quais estados sua empresa tem interesse em patrocinar?"
          hint="Deixe em branco para interesse nacional"
        >
          {ESTADOS.map((uf) => (
            <ChipBtn
              key={uf}
              active={perfil.estados.includes(uf)}
              onClick={() => set('estados', toggle(perfil.estados, uf))}
            >
              {uf}
            </ChipBtn>
          ))}
        </Section>

        {/* 7 — ODS */}
        <Section
          title="Quais ODS da ONU são prioridade para o ESG da sua empresa?"
          hint="Os Objetivos de Desenvolvimento Sustentável que mais se conectam com sua marca"
        >
          {ODS_LISTA.map((o) => (
            <ChipBtn
              key={o.num}
              active={perfil.ods.includes(o.num)}
              onClick={() => set('ods', toggle(perfil.ods, o.num))}
            >
              <span className="font-black text-[#0068ff]">ODS {o.num}</span>
              <span className="text-slate-600">· {o.label}</span>
            </ChipBtn>
          ))}
        </Section>

        {/* SALVAR */}
        <div className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0068ff]/10 text-[#0068ff]">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">Pronto para salvar</p>
              <p className="text-xs font-bold text-slate-400">Seu perfil irá personalizar o Match Score no Marketplace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(0,104,255,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Save size={16} />
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>

        <div className="pb-8" />
      </div>
    </PortalShell>
  );
}
