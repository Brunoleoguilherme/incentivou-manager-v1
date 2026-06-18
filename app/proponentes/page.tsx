'use client';
import { useEffect, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Plus, Search, Trash2, X } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Proponente = {
  id: string; nome: string; tipo: string | null; cnpj: string | null;
  cidade: string | null; estado: string | null; email: string | null;
  telefone: string | null; responsavel: string | null; status: string | null;
};

const TIPO_OPT   = ['Associação','Clube','Instituto','Federação','OSC','Entidade pública','Outro'];
const STATUS_OPT = ['Ativo','Em análise','Com pendência','Inativo'];
const CLS: Record<string,string> = {
  'Ativo': 'bg-emerald-100 text-emerald-800',
  'Em análise': 'bg-amber-100 text-amber-800',
  'Com pendência': 'bg-red-100 text-red-800',
  'Inativo': 'bg-slate-100 text-slate-500',
};

const BLANK: Omit<Proponente,'id'> = { nome:'', tipo:null, cnpj:null, cidade:null, estado:null, email:null, telefone:null, responsavel:null, status:'Ativo' };

export default function ProponentesPage() {
  const [lista, setLista]   = useState<Proponente[]>([]);
  const [busca, setBusca]   = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState<Omit<Proponente,'id'>>(BLANK);
  const [loading, setLoad]  = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!supabase) return;
    supabase.from('manager_proponentes').select('*').order('nome')
      .then(({ data }) => { setLista((data || []) as Proponente[]); setLoad(false); });
  };
  useEffect(load, []);

  const lista_f = lista.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.cidade || '').toLowerCase().includes(busca.toLowerCase())
  );

  async function salvar() {
    if (!supabase || !form.nome.trim()) return;
    setSaving(true);
    await supabase.from('manager_proponentes').insert(form);
    setSaving(false); setModal(false); setForm(BLANK); load();
  }

  async function excluir(id: string) {
    if (!supabase || !confirm('Excluir proponente?')) return;
    await supabase.from('manager_proponentes').delete().eq('id', id);
    load();
  }

  return (
    <PortalShell portal="admin">
      <div className="space-y-6">

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Proponentes</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Associações, clubes, institutos e federações cadastrados.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 min-w-48">
              <Search size={15} className="text-slate-400"/>
              <input value={busca} onChange={e=>setBusca(e.target.value)}
                placeholder="Buscar por nome ou cidade..."
                className="flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"/>
            </div>
            <button onClick={()=>setModal(true)}
              className="flex items-center gap-2 rounded-[1.1rem] bg-[#0068ff] px-5 py-2.5 text-sm font-black text-white shadow shadow-[#0068ff]/20 hover:bg-[#0050d0] transition">
              <Plus size={15}/> Novo proponente
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : lista_f.length === 0 ? (
            <div className="py-10 text-center">
              <Building2 size={32} className="mx-auto text-slate-300"/>
              <p className="mt-3 text-sm font-black text-slate-400">{busca ? 'Nenhum resultado' : 'Nenhum proponente cadastrado'}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lista_f.map(p => (
                <div key={p.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{p.nome}</p>
                      {p.tipo && <p className="mt-0.5 text-xs font-bold text-slate-400">{p.tipo}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${CLS[p.status] || 'bg-slate-100 text-slate-500'}`}>
                          {p.status}
                        </span>
                      )}
                      <button onClick={()=>excluir(p.id)}
                        className="ml-1 grid h-6 w-6 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {p.cidade && (
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <MapPin size={11}/> {p.cidade}{p.estado ? `, ${p.estado}` : ''}
                      </p>
                    )}
                    {p.email && (
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Mail size={11}/> {p.email}
                      </p>
                    )}
                    {p.telefone && (
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Phone size={11}/> {p.telefone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MODAL */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-lg rounded-[1.8rem] bg-white p-7 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">Novo Proponente</h2>
                <button onClick={()=>setModal(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-100">
                  <X size={16}/>
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label:'Nome da entidade *', key:'nome',       type:'text' },
                  { label:'CNPJ',               key:'cnpj',       type:'text' },
                  { label:'Responsável',        key:'responsavel',type:'text' },
                  { label:'E-mail',             key:'email',      type:'email'},
                  { label:'Telefone',           key:'telefone',   type:'text' },
                  { label:'Cidade',             key:'cidade',     type:'text' },
                  { label:'Estado (UF)',        key:'estado',     type:'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{f.label}</label>
                    <input value={(form as any)[f.key] || ''} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                      type={f.type}
                      className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-950 outline-none focus:border-[#0068ff] focus:bg-white"/>
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Tipo</label>
                  <select value={form.tipo || ''} onChange={e=>setForm(prev=>({...prev,tipo:e.target.value}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-950 outline-none focus:border-[#0068ff]">
                    <option value="">Selecione...</option>
                    {TIPO_OPT.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Status</label>
                  <select value={form.status || 'Ativo'} onChange={e=>setForm(prev=>({...prev,status:e.target.value}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-950 outline-none focus:border-[#0068ff]">
                    {STATUS_OPT.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={()=>setModal(false)}
                  className="flex-1 rounded-[1.1rem] border border-slate-200 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button onClick={salvar} disabled={saving || !form.nome.trim()}
                  className="flex-1 rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white hover:bg-[#0050d0] disabled:opacity-40">
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalShell>
  );
}
