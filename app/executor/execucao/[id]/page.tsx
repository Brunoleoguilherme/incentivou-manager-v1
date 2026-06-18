'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';

type Entrega = {
  id: string;
  projeto_id: string | null;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  prazo: string | null;
  status: string | null;
  created_at?: string | null;
};

type Projeto = {
  id: string;
  nome: string;
};

type Evidencia = {
  id: string;
  entrega_id: string;
  nome: string | null;
  tipo: string | null;
  tipo_arquivo: string | null;
  tamanho: number | null;
  enviado_por: string | null;
  arquivo_url: string | null;
  observacao: string | null;
  created_at: string | null;
};

type Comentario = {
  id: string;
  entrega_id: string;
  autor: string | null;
  comentario: string | null;
  created_at: string | null;
};

type ChecklistItem = {
  id: string;
  entrega_id: string;
  item: string | null;
  concluido: boolean | null;
  prazo?: string | null;
  ordem?: number | null;
  created_at?: string | null;
};

type TimelineItem = {
  id: string;
  entrega_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  created_at: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return 'Sem prazo';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatDateTime(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

function formatarTamanho(bytes?: number | null) {
  if (!bytes) return '-';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
}

function obterTipoLegivel(tipo?: string | null) {
  if (!tipo) return 'Arquivo';
  if (tipo.includes('pdf')) return 'PDF';
  if (tipo.includes('image')) return 'Imagem';
  if (tipo.includes('spreadsheet') || tipo.includes('excel')) return 'Planilha';
  if (tipo.includes('word')) return 'Documento Word';
  if (tipo.includes('zip')) return 'Arquivo compactado';
  return 'Arquivo';
}

function EvidenciaIcone({ tipo }: { tipo?: string | null }) {
  if (tipo?.includes('image')) return <ImageIcon size={22} />;
  return <FileText size={22} />;
}

function diasRestantes(date?: string | null) {
  if (!date) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const prazo = new Date(`${date}T00:00:00`);
  prazo.setHours(0, 0, 0, 0);

  return Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function statusEntrega(entrega: Entrega | null) {
  if (!entrega) return 'pendente';

  const dias = diasRestantes(entrega.prazo);

  if (entrega.status !== 'concluído' && dias !== null && dias < 0) {
    return 'atrasada';
  }

  return entrega.status || 'pendente';
}

export default function EntregaDetalhePage() {
  const params = useParams();
  const entregaId = String(params.id);

  const [aba, setAba] = useState('resumo');
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const [modalEvidencia, setModalEvidencia] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nomeEvidencia, setNomeEvidencia] = useState('');
  const [observacaoEvidencia, setObservacaoEvidencia] = useState('');

  const [novoComentario, setNovoComentario] = useState('');
  const [novoChecklist, setNovoChecklist] = useState('');
  const [prazoChecklist, setPrazoChecklist] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function registrarTimeline(tipo: string, titulo: string, descricao?: string) {
    if (!supabase) return;

    await supabase.from('manager_timeline_entregas').insert({
      entrega_id: entregaId,
      tipo,
      titulo,
      descricao: descricao || null,
    });
  }

  async function carregarDados() {
    if (!supabase) return;

    setLoading(true);
    setErro('');

    const { data: entregaData, error: entregaError } = await supabase
      .from('manager_entregas')
      .select('*')
      .eq('id', entregaId)
      .single();

    if (entregaError) {
      setErro(entregaError.message);
      setLoading(false);
      return;
    }

    setEntrega(entregaData);

    if (entregaData?.projeto_id) {
      const { data: projetoData } = await supabase
        .from('manager_projetos')
        .select('id,nome')
        .eq('id', entregaData.projeto_id)
        .single();

      setProjeto(projetoData || null);
    }

    const [{ data: evs }, { data: comments }, { data: checks }, { data: timelineData }] =
      await Promise.all([
        supabase
          .from('manager_evidencias')
          .select('*')
          .eq('entrega_id', entregaId)
          .order('created_at', { ascending: false }),

        supabase
          .from('manager_comentarios_entregas')
          .select('*')
          .eq('entrega_id', entregaId)
          .order('created_at', { ascending: false }),

        supabase
          .from('manager_checklist_entregas')
          .select('*')
          .eq('entrega_id', entregaId)
          .order('ordem', { ascending: true })
          .order('created_at', { ascending: true }),

        supabase
          .from('manager_timeline_entregas')
          .select('*')
          .eq('entrega_id', entregaId)
          .order('created_at', { ascending: false }),
      ]);

    setEvidencias(evs || []);
    setComentarios(comments || []);
    setChecklist(checks || []);
    setTimeline(timelineData || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, [entregaId]);

  const checklistConcluidos = checklist.filter((item) => item.concluido).length;

  const progressoChecklist = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklistConcluidos / checklist.length) * 100);
  }, [checklist, checklistConcluidos]);

  const evidenciasPorTipo = useMemo(() => {
    return {
      imagens: evidencias.filter((item) =>
        (item.tipo_arquivo || item.tipo || '').includes('image')
      ).length,
      pdfs: evidencias.filter((item) =>
        (item.tipo_arquivo || item.tipo || '').includes('pdf')
      ).length,
      outros: evidencias.filter((item) => {
        const tipo = item.tipo_arquivo || item.tipo || '';
        return !tipo.includes('image') && !tipo.includes('pdf');
      }).length,
    };
  }, [evidencias]);

  async function salvarComentario() {
    if (!supabase || !novoComentario.trim()) return;

    const comentarioTexto = novoComentario.trim();

    const { error } = await supabase.from('manager_comentarios_entregas').insert({
      entrega_id: entregaId,
      autor: 'Executor',
      comentario: comentarioTexto,
    });

    if (error) {
      setErro(error.message);
      return;
    }

    await registrarTimeline('comentario', 'Comentário adicionado', comentarioTexto);

    setNovoComentario('');
    await carregarDados();
  }

  async function excluirComentario(id: string) {
    if (!supabase) return;
    if (!window.confirm('Deseja excluir este comentário?')) return;

    const { error } = await supabase
      .from('manager_comentarios_entregas')
      .delete()
      .eq('id', id);

    if (error) {
      setErro(error.message);
      return;
    }

    await carregarDados();
  }

  async function adicionarChecklist() {
    if (!supabase || !novoChecklist.trim()) return;

    const itemTexto = novoChecklist.trim();

    const { error } = await supabase.from('manager_checklist_entregas').insert({
      entrega_id: entregaId,
      item: itemTexto,
      concluido: false,
      prazo: prazoChecklist || null,
      ordem: checklist.length + 1,
    });

    if (error) {
      setErro(error.message);
      return;
    }

    await registrarTimeline('checklist', 'Item de checklist adicionado', itemTexto);

    setNovoChecklist('');
    setPrazoChecklist('');
    await carregarDados();
  }

  async function alternarChecklist(item: ChecklistItem) {
    if (!supabase) return;

    const novoStatus = !item.concluido;

    const { error } = await supabase
      .from('manager_checklist_entregas')
      .update({ concluido: novoStatus })
      .eq('id', item.id);

    if (error) {
      setErro(error.message);
      return;
    }

    if (novoStatus) {
      await registrarTimeline('checklist', 'Checklist concluído', item.item || 'Item concluído');
    }

    await carregarDados();
  }

  async function excluirChecklist(id: string) {
    if (!supabase) return;
    if (!window.confirm('Deseja excluir este item?')) return;

    const { error } = await supabase
      .from('manager_checklist_entregas')
      .delete()
      .eq('id', id);

    if (error) {
      setErro(error.message);
      return;
    }

    await carregarDados();
  }

  async function concluirEntrega() {
    if (!supabase || !entrega) return;

    const confirmar = window.confirm('Deseja marcar esta entrega como concluída?');
    if (!confirmar) return;

    const { error } = await supabase
      .from('manager_entregas')
      .update({ status: 'concluído' })
      .eq('id', entrega.id);

    if (error) {
      setErro(error.message);
      return;
    }

    await registrarTimeline('status', 'Entrega concluída', entrega.titulo || 'Entrega concluída');

    await carregarDados();
  }

  async function uploadEvidencia() {
    if (!supabase) return;

    setSalvando(true);
    setErro('');

    try {
      let arquivoUrl = '';

      if (arquivo) {
        const extensao = arquivo.name.split('.').pop() || 'pdf';
        const nomeArquivo = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extensao}`;

        const caminho = `entregas/${entregaId}/${nomeArquivo}`;

        const { error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(caminho, arquivo, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('evidencias')
          .getPublicUrl(caminho);

        arquivoUrl = data.publicUrl;
      }

      const evidenciaNome = nomeEvidencia || arquivo?.name || 'Evidência';

      const { error } = await supabase.from('manager_evidencias').insert({
        entrega_id: entregaId,
        nome: evidenciaNome,
        tipo: arquivo?.type || 'link/observação',
        tipo_arquivo: arquivo?.type || 'link/observação',
        tamanho: arquivo?.size || null,
        enviado_por: 'Executor',
        arquivo_url: arquivoUrl || null,
        observacao: observacaoEvidencia,
      });

      if (error) throw error;

      await registrarTimeline('evidencia', 'Evidência anexada', evidenciaNome);

      setArquivo(null);
      setNomeEvidencia('');
      setObservacaoEvidencia('');
      setModalEvidencia(false);

      await carregarDados();
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar evidência.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluirEvidencia(id: string) {
    if (!supabase) return;
    if (!window.confirm('Deseja excluir esta evidência?')) return;

    const { error } = await supabase
      .from('manager_evidencias')
      .delete()
      .eq('id', id);

    if (error) {
      setErro(error.message);
      return;
    }

    await carregarDados();
  }

  if (loading) {
    return (
      <PortalShell portal="executor">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 font-black text-slate-500">
          Carregando entrega...
        </div>
      </PortalShell>
    );
  }

  if (!entrega) {
    return (
      <PortalShell portal="executor">
        <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 font-black text-red-600">
          Entrega não encontrada.
        </div>
      </PortalShell>
    );
  }

  const statusAtual = statusEntrega(entrega);

  return (
    <PortalShell portal="executor">
      <div className="space-y-7">
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
                Detalhe da Entrega
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
                {entrega.titulo}
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                {projeto?.nome || 'Projeto não vinculado'}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <StatusBadge status={statusAtual} />
                <Badge>Responsável: {entrega.responsavel || '-'}</Badge>
                <Badge>Prazo: {formatDate(entrega.prazo)}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/executor/execucao"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Voltar
              </Link>

              {entrega.status !== 'concluído' && (
                <button
                  type="button"
                  onClick={concluirEntrega}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(22,163,74,0.22)] transition hover:-translate-y-0.5"
                >
                  <CheckCircle2 size={16} />
                  Concluir entrega
                </button>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <Metric label="Evidências" value={evidencias.length} icon={<UploadCloud size={20} />} />
            <Metric label="Checklist" value={`${progressoChecklist}%`} icon={<CheckCircle2 size={20} />} />
            <Metric label="Comentários" value={comentarios.length} icon={<MessageSquare size={20} />} />
            <Metric label="Status" value={statusAtual} icon={<FileText size={20} />} />
          </div>
        </section>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-black text-red-600">
            {erro}
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              ['resumo', 'Resumo'],
              ['evidencias', 'Evidências'],
              ['checklist', 'Checklist'],
              ['comentarios', 'Comentários'],
              ['timeline', 'Timeline'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${
                  aba === id
                    ? 'bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] text-white shadow-[0_14px_30px_rgba(19,184,166,0.22)]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {aba === 'resumo' && (
              <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-2xl font-black text-slate-950">
                    Resumo da entrega
                  </h3>

                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                    {entrega.descricao || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-2xl font-black text-slate-950">
                    Linha de status
                  </h3>

                  <div className="mt-5 space-y-3">
                    <TimelineStep active label="Criada" />
                    <TimelineStep
                      active={['em andamento', 'aguardando aprovação', 'concluído', 'atrasada'].includes(statusAtual)}
                      label="Em andamento"
                    />
                    <TimelineStep
                      active={evidencias.length > 0 || checklist.length > 0}
                      label="Evidências e checklist"
                    />
                    <TimelineStep active={entrega.status === 'concluído'} label="Concluída" />
                  </div>
                </div>
              </div>
            )}

            {aba === 'evidencias' && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">Evidências</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Arquivos, comprovantes e registros da execução.
                    </p>
                  </div>

                  <button
                    onClick={() => setModalEvidencia(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-5 py-3 text-sm font-black text-white"
                  >
                    <Plus size={17} />
                    Nova evidência
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <MiniMetric label="Imagens" value={evidenciasPorTipo.imagens} />
                  <MiniMetric label="PDFs" value={evidenciasPorTipo.pdfs} />
                  <MiniMetric label="Outros" value={evidenciasPorTipo.outros} />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {evidencias.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3">
                      <Empty>Nenhuma evidência cadastrada.</Empty>
                    </div>
                  ) : (
                    evidencias.map((item) => {
                      const tipo = item.tipo_arquivo || item.tipo;
                      const isImage = tipo?.includes('image') && item.arquivo_url;

                      return (
                        <div
                          key={item.id}
                          className="group flex min-h-[240px] flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                              <EvidenciaIcone tipo={tipo} />
                            </div>

                            <div className="min-w-0">
                              <h4 className="line-clamp-2 text-base font-black leading-tight text-slate-950">
                                {item.nome || 'Evidência'}
                              </h4>

                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                {obterTipoLegivel(tipo)} • {formatarTamanho(item.tamanho)}
                              </p>
                            </div>
                          </div>

                          {isImage && (
                            <a
                              href={item.arquivo_url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 block overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                            >
                              <img
                                src={item.arquivo_url || ''}
                                alt={item.nome || 'Evidência'}
                                className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                              />
                            </a>
                          )}

                          <p className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                            {item.observacao || 'Sem observação cadastrada.'}
                          </p>

                          <div className="mt-auto border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                              <span>{item.enviado_por || 'Executor'}</span>
                              <span>{formatDateTime(item.created_at)}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {item.arquivo_url && (
                                <>
                                  <a
                                    href={item.arquivo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                                  >
                                    <ExternalLink size={14} />
                                    Visualizar
                                  </a>

                                  <a
                                    href={item.arquivo_url}
                                    download
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                  >
                                    <Download size={14} />
                                    Download
                                  </a>
                                </>
                              )}

                              <button
                                onClick={() => excluirEvidencia(item.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {aba === 'checklist' && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">Checklist operacional</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {checklistConcluidos} de {checklist.length} item(ns) concluído(s).
                    </p>
                  </div>

                  <div className="w-full rounded-2xl bg-white p-4 shadow-sm md:w-80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        Progresso
                      </span>
                      <span className="text-2xl font-black text-slate-950">{progressoChecklist}%</span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] transition-all duration-500"
                        style={{ width: `${progressoChecklist}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
                  <input
                    value={novoChecklist}
                    onChange={(e) => setNovoChecklist(e.target.value)}
                    placeholder="Novo item do checklist"
                    className="h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />

                  <input
                    type="date"
                    value={prazoChecklist}
                    onChange={(e) => setPrazoChecklist(e.target.value)}
                    className="h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-400"
                  />

                  <button
                    onClick={adicionarChecklist}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,184,166,0.22)]"
                  >
                    <Plus size={17} />
                    Adicionar
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {checklist.length === 0 ? (
                    <Empty>Nenhum item cadastrado.</Empty>
                  ) : (
                    checklist.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition md:flex-row md:items-center md:justify-between ${
                          item.concluido
                            ? 'border-emerald-100 bg-emerald-50/70'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-4">
                          <button
                            type="button"
                            onClick={() => alternarChecklist(item)}
                            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition ${
                              item.concluido
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                            }`}
                          >
                            <CheckCircle2 size={17} />
                          </button>

                          <div>
                            <p
                              className={`text-sm font-black leading-6 ${
                                item.concluido
                                  ? 'text-emerald-800 line-through decoration-2'
                                  : 'text-slate-950'
                              }`}
                            >
                              {index + 1}. {item.item}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                {item.concluido ? 'Concluído' : 'Pendente'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                <CalendarClock size={13} />
                                {item.prazo ? formatDate(item.prazo) : 'Sem prazo'}
                              </span>
                            </div>
                          </div>
                        </label>

                        <button
                          onClick={() => excluirChecklist(item.id)}
                          className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {aba === 'comentarios' && (
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-slate-950">Comentários</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Comunicação e histórico da equipe.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                      Total
                    </p>
                    <p className="text-3xl font-black text-slate-950">{comentarios.length}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva uma atualização, orientação ou observação..."
                    className="min-h-32 w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium outline-none focus:border-emerald-400"
                  />

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={salvarComentario}
                      className="rounded-2xl bg-gradient-to-r from-[#0068FF] to-[#16C784] px-6 py-3 text-sm font-black text-white shadow-lg"
                    >
                      Publicar comentário
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {comentarios.length === 0 ? (
                    <Empty>Nenhum comentário cadastrado.</Empty>
                  ) : (
                    comentarios.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#0068FF] to-[#16C784] text-lg font-black text-white">
                              {(item.autor || 'E').charAt(0)}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="font-black text-slate-950">
                                  {item.autor || 'Executor'}
                                </h4>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>

                              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {item.comentario}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => excluirComentario(item.id)}
                            className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {aba === 'timeline' && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-2xl font-black text-slate-950">Timeline da entrega</h3>

                <div className="mt-5 space-y-4">
                  {timeline.length === 0 ? (
                    <Empty>Nenhum evento registrado.</Empty>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Activity size={18} />
                        </div>

                        <div>
                          <p className="font-black text-slate-950">{item.titulo}</p>
                          {item.descricao && (
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                              {item.descricao}
                            </p>
                          )}
                          <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            {formatDateTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {modalEvidencia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061b3a]/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-7 shadow-[0_30px_90px_rgba(6,27,58,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    Nova evidência
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    Anexar comprovação
                  </h2>
                </div>

                <button
                  onClick={() => setModalEvidencia(false)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  value={nomeEvidencia}
                  onChange={(e) => setNomeEvidencia(e.target.value)}
                  placeholder="Nome da evidência"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none"
                />

                <input
                  type="file"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-600"
                />

                <textarea
                  value={observacaoEvidencia}
                  onChange={(e) => setObservacaoEvidencia(e.target.value)}
                  placeholder="Observação"
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none"
                />

                <button
                  onClick={uploadEvidencia}
                  disabled={salvando}
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#0068ff] via-[#13b8a6] to-[#16c784] font-black text-white disabled:opacity-60"
                >
                  {salvando ? 'Salvando...' : 'Salvar evidência'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase text-emerald-700">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'concluído'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'atrasada'
        ? 'bg-red-50 text-red-700'
        : status === 'em andamento'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-amber-50 text-amber-700';

  return (
    <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${classes}`}>
      {status}
    </span>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
      {children}
    </div>
  );
}

function TimelineStep({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid h-9 w-9 place-items-center rounded-full border ${
          active
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 bg-white text-slate-400'
        }`}
      >
        <CheckCircle2 size={16} />
      </div>

      <p className={`text-sm font-black ${active ? 'text-slate-950' : 'text-slate-400'}`}>
        {label}
      </p>
    </div>
  );
}
