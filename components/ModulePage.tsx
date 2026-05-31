import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { DownloadList, Kpi, TableMock } from '@/components/Cards';

type Props = { title: string; subtitle: string; items: string[]; kpis?: [string,string][]; downloads?: boolean };
export default function ModulePage({title, subtitle, items, kpis, downloads}: Props){
  return <Layout>
    <PageHeader title={title} subtitle={subtitle}/>
    {kpis && <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{kpis.map(([l,v])=><Kpi key={l} label={l} value={v}/>)}</div>}
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="xl:col-span-2 card p-6">
        <h3 className="text-2xl font-black text-escuro">Funcionalidades principais</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map(item=><div key={item} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><p className="font-bold text-slate-800">{item}</p></div>)}
        </div>
      </section>
      <aside className="card p-6">
        <h3 className="text-xl font-black">Ações rápidas</h3>
        <div className="mt-4 grid gap-3">
          {['Novo cadastro','Importar planilha','Gerar relatório PDF','Enviar por e-mail','Notificar por WhatsApp','Analisar com IA'].map(a=><button key={a} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left font-bold text-slate-700 hover:bg-blue-50">{a}</button>)}
        </div>
      </aside>
    </div>
    <div className="mt-8"><TableMock/></div>
    {downloads && <div className="mt-8"><h3 className="mb-4 text-2xl font-black">Modelos disponíveis</h3><DownloadList/></div>}
  </Layout>
}
