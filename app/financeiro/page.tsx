'use client';
import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Plus, Search, Wallet, X } from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Lancamento = {
  id: string; projeto_id: string | null; descricao: string; tipo: string;
  valor: number; data_lancamento: string | null; categoria: string | null;
  status: string | null; projeto_nome?: string;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const TIPOS    = ['entrada','saida'];
const CATS     = ['Captação','Pagamento','Nota fiscal','Repasse','Taxa','Outros'];
const STATUS_O = ['Previsto','Realizado','Pago','Pendente','Atrasado','Cancelado'];
const CLS_TIPO: Record<string,string> = {
  entrada: 'bg-emerald-100 text-emerald-800',
  saida:   'bg-red-100 text-red-800',
};

const BLANK = { projeto_id: null, descricao: '', tipo: 'entrada', valor: 0, data_lancamento: '', categoria: null, status: 'Previsto' };

export default function FinanceiroPage() {
  const [lista, setLista]       = useState<Lancamento[]>([]);
  const [projetos, setProjetos] = useState<{id:string;nome:string}[]>([]);
  const [busca, setBusca]       = useState('');
  const [filtro, setFiltro]     = useState('todos');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState<any>(BLANK);
  const [loading, setLoad]      = useState(true);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    if (!supabase) return;
    const [lRes, pRes] = await Promise.all([
      supabase.from('manager_financeiro').select('*').order('data_lancamento', { ascending: false }),
      supabase.from('manager_projetos').select('id,nome').order('nome'),
    ]);
    const lans = (lRes.data || []) as Lancamento[];
    const prjs = (pRes.data || []) as {id:string;nome:string}[];
    const mapa = Object.fromEntries(prjs.map(p=>[p.id,p.nome]));
    setLista(lans.map(l=>({ ...l, projeto_nome: l.projeto_id ? mapa[l.projeto_id] : undefined })));
    setProjetos(prjs);
    setLoad(false);
  };
  useEffect(() => { load(); }, []);

  const lista_f = lista.filter(l => {
    const ok_busca = l.descricao.toLowerCase().includes(busca.toLowerCase());
    const ok_tipo  = filtro === 'todos' || l.tipo === filtro;
    return ok_busca && ok_tipo;
  });

  const totalEnt = lista.filter(l=>l.tipo==='entrada').reduce((s,l)=>s+Number(l.valor||0),0);
  const totalSai = lista.filter(l=>l.tipo==='saida').reduce((s,l)=>s+Number(l.valor||0),0);
  const saldo    = totalEnt - totalSai;

  async function salvar() {
    if (!supabase || !form.descricao.trim() || !form.valor) return;
    setSaving(true);
    await supabase.from('manager_financeiro').insert({ ...form, valor: Number(form.valor) });
    setSaving(false); setModal(false); setForm(BLANK); load();
  }

  async function excluir(id: string) {
    if (!supabase || !confirm('Excluir lançamento?')) return;
    await supabase.from('manager_financeiro').delete().eq('id', id);
    load();
  }

  return (
    <PortalShell portal="admin">
      <div className="space-y-6">

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0068ff]">Admin</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">Financeiro</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Entradas, saídas, saldos e controle de lançamentos.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label:'Total entradas', value:fmt(totalEnt), icon:<ArrowUpCircle size={18}/>, cor:'text-emerald-600', bg:'bg-emerald-50' },
              { label:'Total saídas',   value:fmt(totalSai), icon:<ArrowDownCircle size={18}/>, cor:'text-red-600',     bg:'bg-red-50'     },
              { label:'Saldo',          value:fmt(saldo),    icon:<Wallet size={18}/>,         cor: saldo>=0 ? 'text-emerald-600' : 'text-red-600', bg: saldo>=0 ? 'bg-emerald-50' : 'bg-red-50' },
            ].map(k=>(
              <div key={k.label} className="flex items-center gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.bg} ${k.cor}`}>{k.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{k.label}</p>
                  <p className={`text-xl font-black ${k.cor}`}>{loading ? '...' : k.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 min-w-44">
              <Search size={14} className="text-slate-400"/>
              <input value={busca} onChange={e=>setBusca(e.target.value)}
                placeholder="Buscar..." className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"/>
            </div>
            {['todos','entrada','saida'].map(f=>(
              <button key={f} onClick={()=>setFiltro(f)}
                className={`rounded-[1.1rem] px-4 py-2.5 text-xs font-black transition ${filtro===f ? 'bg-[#0068ff] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {f==='todos' ? 'Todos' : f==='entrada' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
            <button onClick={()=>setModal(true)}
              className="flex items-center gap-2 rounded-[1.1rem] bg-[#0068ff] px-5 py-2.5 text-sm font-black text-white shadow shadow-[#0068ff]/20 hover:bg-[#0050d0] transition">
              <Plus size={15}/> Lançamento
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Carregando...</p>
          ) : lista_f.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Nenhum lançamento encontrado.</p>
          ) : (
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Data','Descrição','Tipo','Categoria','Valor','Status',''].map(h=>(
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista_f.map((l,i)=>(
                  <tr key={l.id} className={i%2===0?'bg-white':'bg-slate-50/50'}>
                    <td className="px-3 py-3 text-xs font-bold text-slate-500">{l.data_lancamento ? new Date(l.data_lancamento).toLocaleDateString('pt-BR',{timeZone:'UTC'}) : '—'}</td>
                    <td className="px-3 py-3 font-black text-slate-950">{l.descricao}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${CLS_TIPO[l.tipo] || 'bg-slate-100 text-slate-500'}`}>{l.tipo}</span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-500">{l.categoria || '—'}</td>
                    <td className={`px-3 py-3 font-black ${l.tipo==='entrada'?'text-emerald-700':'text-red-700'}`}>{fmt(Number(l.valor||0))}</td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-500">{l.status || '—'}</td>
                    <td className="px-3 py-3">
                      <button onClick={()=>excluir(l.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                        <X size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-md rounded-[1.8rem] bg-white p-7 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">Novo Lançamento</h2>
                <button onClick={()=>setModal(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-100"><X size={16}/></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Descrição *</label>
                  <input value={form.descricao} onChange={e=>setForm((p:any)=>({...p,descricao:e.target.value}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Tipo</label>
                    <select value={form.tipo} onChange={e=>setForm((p:any)=>({...p,tipo:e.target.value}))}
                      className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none">
                      {TIPOS.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Valor (R$) *</label>
                    <input type="number" value={form.valor||''} onChange={e=>setForm((p:any)=>({...p,valor:e.target.value}))}
                      className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]"/>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Categoria</label>
                  <select value={form.categoria||''} onChange={e=>setForm((p:any)=>({...p,categoria:e.target.value}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none">
                    <option value="">Selecione...</option>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Data</label>
                  <input type="date" value={form.data_lancamento||''} onChange={e=>setForm((p:any)=>({...p,data_lancamento:e.target.value}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0068ff]"/>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Projeto (opcional)</label>
                  <select value={form.projeto_id||''} onChange={e=>setForm((p:any)=>({...p,projeto_id:e.target.value||null}))}
                    className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none">
                    <option value="">Sem vínculo</option>
                    {projetos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={()=>setModal(false)} className="flex-1 rounded-[1.1rem] border border-slate-200 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={salvar} disabled={saving||!form.descricao.trim()||!form.valor}
                  className="flex-1 rounded-[1.1rem] bg-[#0068ff] py-3 text-sm font-black text-white hover:bg-[#0050d0] disabled:opacity-40">
                  {saving?'Salvando...':'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalShell>
  );
}
