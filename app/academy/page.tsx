'use client';
import { BookOpen, GraduationCap, Lock, PlayCircle, Star } from 'lucide-react';
import PortalShell from '@/components/PortalShell';

const MATERIAIS = [
  { titulo:'Guia da Lei de Incentivo ao Esporte',     tipo:'E-book',  nivel:'Gratuito', duracao:'45 min leitura', estrelas:5 },
  { titulo:'Como captar recursos para seu projeto',   tipo:'E-book',  nivel:'Gratuito', duracao:'30 min leitura', estrelas:5 },
  { titulo:'Prestação de contas sem glosa',           tipo:'Curso',   nivel:'Premium',  duracao:'4h',             estrelas:5 },
  { titulo:'Plano de trabalho que aprova',            tipo:'Template',nivel:'Gratuito', duracao:'Modelo editável', estrelas:4 },
  { titulo:'ESG no esporte: como mensurar impacto',   tipo:'E-book',  nivel:'Premium',  duracao:'60 min leitura', estrelas:5 },
  { titulo:'Certificação IncentiVou Manager',         tipo:'Curso',   nivel:'Premium',  duracao:'12h',            estrelas:5 },
  { titulo:'Documentos e certidões necessárias',      tipo:'Checklist',nivel:'Gratuito',duracao:'5 min',         estrelas:4 },
  { titulo:'Captação: pitch para patrocinadores',     tipo:'Curso',   nivel:'Premium',  duracao:'3h',             estrelas:5 },
];

const TIPO_CLS: Record<string,string> = {
  'E-book': 'bg-blue-100 text-blue-800',
  'Curso': 'bg-violet-100 text-violet-800',
  'Template': 'bg-teal-100 text-teal-800',
  'Checklist': 'bg-amber-100 text-amber-800',
};

export default function AcademyPage() {
  return (
    <PortalShell portal="admin">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <GraduationCap size={22}/>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/60">Conhecimento</p>
              <h1 className="text-2xl font-black">IncentiVou Academy</h1>
            </div>
          </div>
          <p className="mt-3 max-w-lg text-sm font-bold text-white/70">
            E-books gratuitos, cursos premium, templates e certificações para quem trabalha com incentivo esportivo.
          </p>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {[
              {label:'E-books gratuitos',value:'12'},
              {label:'Cursos premium',   value:'8'},
              {label:'Templates',        value:'24'},
              {label:'Certificações',    value:'3'},
            ].map(k=>(
              <div key={k.label} className="rounded-[1.2rem] bg-white/10 p-4 text-center">
                <p className="text-xl font-black">{k.value}</p>
                <p className="text-[10px] font-bold text-white/50">{k.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-slate-950">Biblioteca de materiais</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MATERIAIS.map(m=>(
              <div key={m.titulo} className="flex items-start gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/30">
                <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.nivel==='Premium' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                  {m.tipo==='Curso' ? <PlayCircle size={18}/> : <BookOpen size={18}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${TIPO_CLS[m.tipo] || 'bg-slate-100 text-slate-500'}`}>{m.tipo}</span>
                    {m.nivel==='Premium' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                        <Lock size={9}/> Premium
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-black text-slate-950">{m.titulo}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-400">{m.duracao}</p>
                    <div className="flex items-center gap-0.5">
                      {Array(m.estrelas).fill(0).map((_,i)=>(
                        <Star key={i} size={10} className="text-amber-400 fill-amber-400"/>
                      ))}
                    </div>
                  </div>
                </div>
                <button className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition ${m.nivel==='Premium' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-[#0068ff] text-white hover:bg-[#0050d0]'}`}>
                  {m.nivel==='Premium' ? 'Acessar' : 'Baixar'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
