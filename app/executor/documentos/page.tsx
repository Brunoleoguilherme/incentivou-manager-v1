'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Edit3,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Projeto = {
  id: string;
  nome: string;
};

type Documento = {
  id: string;
  projeto_id: string | null;
  nome: string | null;
  categoria: string | null;
  arquivo_url: string | null;
  observacao: string | null;
  status: string | null;
  data_vencimento: string | null;
  tamanho_arquivo: number | null;
  created_at: string | null;
  manager_projetos?: {
    nome: string;
  } | null;
};

const categorias = [
  'Estatuto',
  'Ata',
  'Certidão Federal',
  'Certidão Estadual',
  'Certidão Municipal',
  'CAGEC (Estadual)',
  'CADIN',
  'Plano de Trabalho',
  'Relatório Técnico',
  'Relatório Financeiro',
  'Prestação de Contas',
  'Contrato',
  'Outros',
];

const documentoInicial = {
  projeto_id: '',
  nome: '',
  categoria: 'Outros',
  observacao: '',
  status: 'pendente',
  data_vencimento: '',
};

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MAX_PROJECT_STORAGE_MB = 1024; // 1 GB
const MAX_PROJECT_STORAGE_BYTES = MAX_PROJECT_STORAGE_MB * 1024 * 1024;

const MAX_DOCUMENTS_PER_PROJECT = 100;

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

function statusLabel(status?: string | null) {
  if (!status) return 'Pendente';
  const labels: Record<string, string> = {
    pendente:   'Pendente',
    aprovado:   'Aprovado',
    rejeitado:  'Rejeitado',
    em_analise: 'Em análise',
    vencendo:   'Vencendo',
    vencido:    'Vencido',
  };
  return labels[status.toLowerCase()] || status;
}

function diasRestantes(data?: string | null) {
  if (!data) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(`${data}T00:00:00`);
  vencimento.setHours(0, 0, 0, 0);

  const diff = vencimento.getTime() - hoje.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ExecutorDocumentosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const [filtroProjeto, setFiltroProjeto]   = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus]     = useState('');
  const [filtroVenc, setFiltroVenc]         = useState(''); // 'vencido' | 'vencendo' | 'ok'

  const [modalAberto, setModalAberto] = useState(false);
  const [documentoEditando, setDocumentoEditando] = useState<Documento | null>(null);
  const [form, setForm] = useState(documentoInicial);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando]       = useState(false);
  const [docExcluindo, setDocExcluindo] = useState<Documento | null>(null);
  const [senhaExc, setSenhaExc]         = useState('');
  const [senhaExcErro, setSenhaExcErro] = useState(false);
  const [deletando, setDeletando]       = useState(false);

  async function carregarDados() {
    if (!supabase) return;

    setLoading(true);
    setErro('');

    const [{ data: projetosData, error: projetosError }, { data: documentosData, error: documentosError }] =
      await Promise.all([
        supabase.from('manager_projetos').select('id,nome').order('nome'),
        supabase
          .from('manager_documentos')
          .select('*, manager_projetos(nome)')
          .order('created_at', { ascending: false }),
      ]);

    if (projetosError) {
      setErro(projetosError.message);
      setLoading(false);
      return;
    }

    if (documentosError) {
      setErro(documentosError.message);
      setLoading(false);
      return;
    }

    setProjetos(projetosData || []);
    setDocumentos(documentosData || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const vencidos = documentos.filter((doc) => {
      const dias = diasRestantes(doc.data_vencimento);
      return dias !== null && dias < 0;
    }).length;

    const vencendo = documentos.filter((doc) => {
      const dias = diasRestantes(doc.data_vencimento);
      return dias !== null && dias >= 0 && dias <= 30;
    }).length;

    const validos = documentos.filter((doc) => {
      const dias = diasRestantes(doc.data_vencimento);
      return dias === null || dias > 30;
    }).length;

    return {
      total: documentos.length,
      validos,
      vencendo,
      vencidos,
    };
  }, [documentos]);

  const documentosFiltrados = useMemo(() => documentos.filter((doc) => {
    const termo = busca.toLowerCase();
    const buscaOk = !busca || (
      doc.nome?.toLowerCase().includes(termo) ||
      doc.categoria?.toLowerCase().includes(termo) ||
      doc.status?.toLowerCase().includes(termo) ||
      doc.manager_projetos?.nome?.toLowerCase().includes(termo)
    );
    const projetoOk   = !filtroProjeto   || doc.projeto_id === filtroProjeto;
    const categoriaOk = !filtroCategoria || doc.categoria === filtroCategoria;
    const statusOk    = !filtroStatus    || (doc.status || 'pendente') === filtroStatus;
    const dias = diasRestantes(doc.data_vencimento);
    const vencOk = !filtroVenc || (
      filtroVenc === 'vencido'  ? (dias !== null && dias < 0) :
      filtroVenc === 'vencendo' ? (dias !== null && dias >= 0 && dias <= 30) :
      filtroVenc === 'ok'       ? (dias === null || dias > 30) : true
    );
    return buscaOk && projetoOk && categoriaOk && statusOk && vencOk;
  }), [documentos, busca, filtroProjeto, filtroCategoria, filtroStatus, filtroVenc]);

  function abrirNovoDocumento() {
    setDocumentoEditando(null);
    setForm(documentoInicial);
    setArquivo(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEditarDocumento(documento: Documento) {
    setDocumentoEditando(documento);
    setForm({
      projeto_id: documento.projeto_id || '',
      nome: documento.nome || '',
      categoria: documento.categoria || 'Outros',
      observacao: documento.observacao || '',
      status: documento.status || 'pendente',
      data_vencimento: documento.data_vencimento || '',
    });
    setArquivo(null);
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setDocumentoEditando(null);
    setForm(documentoInicial);
    setArquivo(null);
    setErro('');
  }

  async function uploadArquivo() {
    if (!supabase || !arquivo) return documentoEditando?.arquivo_url || null;

    const extensao = arquivo.name.split('.').pop() || 'pdf';
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`;
    const caminho = `executor/${nomeArquivo}`;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

if (arquivo && arquivo.size > MAX_FILE_SIZE) {
  setErro(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB} MB.`);
  return;
}

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(caminho, arquivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('documentos').getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function salvarDocumento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabase) return;

    setErro('');
    setSalvando(true);

    if (arquivo) {
  if (!allowedMimeTypes.includes(arquivo.type)) {
    setErro('Tipo de arquivo não permitido. Envie apenas PDF, DOC, DOCX, XLSX, PNG ou JPG.');
    setSalvando(false);
    return;
  }

  if (arquivo.size > MAX_FILE_SIZE_BYTES) {
    setErro(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB} MB.`);
    setSalvando(false);
    return;
  }
}

const documentosDoProjeto = documentos.filter(
  (doc) => doc.projeto_id === form.projeto_id
);

if (!documentoEditando && documentosDoProjeto.length >= MAX_DOCUMENTS_PER_PROJECT) {
  setErro(`Este projeto já atingiu o limite de ${MAX_DOCUMENTS_PER_PROJECT} documentos.`);
  setSalvando(false);
  return;
}

const usoAtualProjeto = documentosDoProjeto.reduce((total, doc: any) => {
  return total + Number(doc.tamanho_arquivo || 0);
}, 0);

if (arquivo && usoAtualProjeto + arquivo.size > MAX_PROJECT_STORAGE_BYTES) {
  setErro('Este projeto atingiu o limite de 1 GB em documentos.');
  setSalvando(false);
  return;
}

    if (!form.projeto_id) {
      setErro('Selecione um projeto.');
      setSalvando(false);
      return;
    }

    if (!form.nome.trim()) {
      setErro('Informe o nome do documento.');
      setSalvando(false);
      return;
    }

    try {
      const arquivoUrl = await uploadArquivo();

      const payload = {
        projeto_id: form.projeto_id,
        nome: form.nome.trim(),
        categoria: form.categoria,
        observacao: form.observacao,
        status: form.status,
        data_vencimento: form.data_vencimento || null,
        arquivo_url: arquivoUrl,
        tamanho_arquivo: arquivo ? arquivo.size : documentoEditando?.tamanho_arquivo || null,
      };

      if (documentoEditando) {
        const { error } = await supabase
          .from('manager_documentos')
          .update(payload)
          .eq('id', documentoEditando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('manager_documentos').insert(payload);

        if (error) throw error;
      }

      await carregarDados();
      setSalvando(false);
      fecharModal();
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar documento.');
      setSalvando(false);
    }
  }

  function abrirExcluir(doc: Documento) {
    setDocExcluindo(doc);
    setSenhaExc('');
    setSenhaExcErro(false);
  }

  async function confirmarExclusaoDoc() {
    if (!supabase || !docExcluindo) return;
    setDeletando(true);
    const usuarioSalvo = JSON.parse(localStorage.getItem('incentivou_usuario') || '{}');
    const { data } = await supabase
      .from('manager_usuarios')
      .select('id')
      .eq('email', usuarioSalvo?.email || '')
      .eq('senha', senhaExc)
      .eq('status', 'ativo')
      .single();
    if (!data) {
      setSenhaExcErro(true);
      setDeletando(false);
      return;
    }
    await supabase.from('manager_documentos').delete().eq('id', docExcluindo.id);
    setDeletando(false);
    setDocExcluindo(null);
    setSenhaExc('');
    setSenhaExcErro(false);
    await carregarDados();
  }

  return (
    <PortalShell portal="executor">
      <div className="space-y-7">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
                Portal Executor
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
                Documentos
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
                Organize documentos, certidões, planos de trabalho, contratos e
                arquivos necessários para execução e prestação de contas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/executor"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Voltar ao Dashboard
              </Link>

              <button
                type="button"
                onClick={abrirNovoDocumento}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-6 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] transition hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Novo documento
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <ResumoCard label="Total" value={resumo.total} icon={<FileText size={21} />} />
            <ResumoCard label="Válidos" value={resumo.validos} icon={<FileText size={21} />} />
            <ResumoCard label="Vencendo" value={resumo.vencendo} icon={<UploadCloud size={21} />} />
            <ResumoCard label="Vencidos" value={resumo.vencidos} icon={<FileText size={21} />} />
          </div>
        </section>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">
            {erro}
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          {/* BUSCA + FILTROS */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search size={19} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por documento, projeto, categoria ou status..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-13 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Projeto */}
              <select
                value={filtroProjeto}
                onChange={e => setFiltroProjeto(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="">Todos os projetos</option>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              {/* Categoria */}
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Status */}
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="em_analise">Em análise</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="vencendo">Vencendo</option>
                <option value="vencido">Vencido</option>
              </select>

              {/* Vencimento */}
              <select
                value={filtroVenc}
                onChange={e => setFiltroVenc(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="">Qualquer vencimento</option>
                <option value="vencido">Vencidos</option>
                <option value="vencendo">Vencendo em 30 dias</option>
                <option value="ok">Em dia</option>
              </select>

              {/* Limpar filtros */}
              {(filtroProjeto || filtroCategoria || filtroStatus || filtroVenc || busca) && (
                <button
                  onClick={() => { setFiltroProjeto(''); setFiltroCategoria(''); setFiltroStatus(''); setFiltroVenc(''); setBusca(''); }}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-100"
                >
                  ✕ Limpar filtros
                </button>
              )}

              <span className="ml-auto self-center text-xs font-black text-slate-400">
                {documentosFiltrados.length} resultado(s)
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="hidden grid-cols-[1.25fr_1.1fr_.8fr_.7fr_.8fr_.7fr_.8fr] bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
              <span>Documento</span>
              <span>Projeto</span>
              <span>Categoria</span>
              <span>Status</span>
              <span>Vencimento</span>
              <span>Data</span>
              <span className="text-center">Ações</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">
                Carregando documentos...
              </div>
            ) : documentosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-sm font-black text-slate-500">
                Nenhum documento encontrado.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documentosFiltrados.map((doc) => (
                  <div
                    key={doc.id}
                    className="grid gap-3 px-5 py-5 transition hover:bg-slate-50 md:grid-cols-[1.25fr_1.1fr_.8fr_.7fr_.8fr_.7fr_.8fr] md:items-center"
                  >
                    <div>
                      <p className="text-base font-black text-slate-950">
                        {doc.nome}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-500 md:hidden">
                        {doc.manager_projetos?.nome || 'Sem projeto'}
                      </p>
                    </div>

                    <p className="hidden text-sm font-semibold text-slate-700 md:block">
                      {doc.manager_projetos?.nome || 'Sem projeto'}
                    </p>

                    <p className="text-sm font-bold text-slate-600">
                      {doc.categoria || 'Outros'}
                    </p>

                    <div>
                      <StatusBadge status={doc.status} />
                    </div>

                    <VencimentoBadge data={doc.data_vencimento} />

                    <p className="text-sm font-bold text-slate-600">
                      {formatDate(doc.created_at)}
                    </p>

                    <div className="flex flex-wrap justify-start gap-2 md:justify-center">
                      {doc.arquivo_url && (
                        <>
                          <a
                            href={doc.arquivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            title="Visualizar"
                          >
                            <Eye size={17} />
                          </a>

                          <a
                            href={doc.arquivo_url}
                            download
                            className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition hover:bg-blue-600 hover:text-white"
                            title="Download"
                          >
                            <Download size={17} />
                          </a>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => abrirEditarDocumento(doc)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-[#16c784] hover:text-white"
                        title="Editar"
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirExcluir(doc)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                        title="Excluir"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    {documentoEditando ? 'Editar documento' : 'Novo documento'}
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    {documentoEditando ? 'Atualizar arquivo' : 'Enviar documento'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={fecharModal}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-950"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={salvarDocumento} className="mt-6 space-y-4">
                <select
                  value={form.projeto_id}
                  onChange={(e) => setForm({ ...form, projeto_id: e.target.value })}
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  <option value="">Selecione o projeto</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="Nome do documento"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />

                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="vencendo">Vencendo</option>
                  <option value="vencido">Vencido</option>
                </select>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Data de vencimento
                  </label>

                  <input
                    type="date"
                    value={form.data_vencimento}
                    onChange={(e) =>
                      setForm({ ...form, data_vencimento: e.target.value })
                    }
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />
                </div>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-600"
                />

                {documentoEditando?.arquivo_url && !arquivo && (
                  <p className="text-xs font-bold text-slate-500">
                    Arquivo atual será mantido caso nenhum novo arquivo seja enviado.
                  </p>
                )}

                <textarea
                  placeholder="Observação"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-emerald-400"
                />

                {erro && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
                    {erro}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={salvando}
                  className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white shadow-[0_18px_45px_rgba(19,184,166,0.28)] disabled:opacity-60"
                >
                  {salvando
                    ? 'Salvando...'
                    : documentoEditando
                      ? 'Salvar alterações'
                      : 'Enviar documento'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

        {/* MODAL EXCLUSÃO DOCUMENTO */}
        {docExcluindo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-[1.8rem] bg-white p-7 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={24}/>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950">Excluir documento?</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Você está prestes a excluir <span className="font-black text-slate-950">"{docExcluindo.nome}"</span>. Esta ação não pode ser desfeita.
              </p>
              <div className="mt-5">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Digite sua senha para confirmar
                </label>
                <input
                  type="password"
                  value={senhaExc}
                  onChange={e => { setSenhaExc(e.target.value); setSenhaExcErro(false); }}
                  placeholder="••••••••"
                  className={`w-full rounded-[1rem] border px-4 py-3 text-sm font-bold outline-none transition ${senhaExcErro ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 focus:border-red-400 focus:bg-white'}`}
                />
                {senhaExcErro && (
                  <p className="mt-1.5 text-xs font-black text-red-500">Senha incorreta. Tente novamente.</p>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setDocExcluindo(null)}
                  className="flex-1 rounded-[1.1rem] border border-slate-200 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button onClick={confirmarExclusaoDoc} disabled={!senhaExc || deletando}
                  className="flex-1 rounded-[1.1rem] bg-red-500 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-40 transition">
                  {deletando ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

    </PortalShell>
  );
}

function ResumoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = (status || 'pendente').toLowerCase();
  const cls =
    value === 'aprovado'   ? 'bg-emerald-100 text-emerald-800' :
    value === 'rejeitado'  ? 'bg-red-100 text-red-700'         :
    value === 'em_analise' ? 'bg-blue-100 text-blue-800'       :
    value === 'vencendo'   ? 'bg-orange-100 text-orange-700'   :
    value === 'vencido'    ? 'bg-red-100 text-red-700'         :
                             'bg-amber-100 text-amber-800';
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${cls}`}>
      {statusLabel(value)}
    </span>
  );
}

function VencimentoBadge({ data }: { data?: string | null }) {
  const dias = diasRestantes(data);

  if (!data || dias === null) {
    return (
      <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500">
        Sem data
      </span>
    );
  }

  const classe =
    dias < 0
      ? 'bg-red-50 text-red-700'
      : dias <= 1
        ? 'bg-red-50 text-red-700'
        : dias <= 15
          ? 'bg-orange-50 text-orange-700'
          : dias <= 30
            ? 'bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700';

  const texto =
    dias < 0
      ? `Vencido há ${Math.abs(dias)} dia(s)`
      : dias === 0
        ? 'Vence hoje'
        : `${formatDate(data)} • ${dias} dia(s)`;

  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${classe}`}>
      {texto}
    </span>
  );
}