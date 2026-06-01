type Props = {
  anotacoes: any[];
};

export default function ActivityFeed({ anotacoes }: Props) {
  return (
    <div>
      <h4 className="text-xl font-black text-[#0b1f3f]">
        Comentários e atividade
      </h4>

      <div className="mt-4 space-y-3">
        {anotacoes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">
            Nenhuma atividade cadastrada ainda.
          </div>
        )}

        {anotacoes.map((nota) => (
          <div
            key={nota.id}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold leading-6 text-slate-700">
              {nota.anotacao}
            </p>

            <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              {nota.usuario_nome || 'Usuário'} •{' '}
              {new Date(nota.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}