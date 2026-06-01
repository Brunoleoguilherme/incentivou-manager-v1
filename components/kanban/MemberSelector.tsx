import { UserPlus } from 'lucide-react';

type Props = {
  usuarios: any[];
  membros: any[];
  usuarioId: string;
  setUsuarioId: (value: string) => void;
  onAdd: () => void;
};

export default function MemberSelector({
  usuarios,
  membros,
  usuarioId,
  setUsuarioId,
  onAdd,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <h4 className="text-xl font-black text-[#0b1f3f]">Membros</h4>

      <div className="mt-4 flex gap-2">
        <select
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400"
        >
          <option value="">Adicionar membro...</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome} — {usuario.email}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-[#0b1f3f] px-4 text-white"
        >
          <UserPlus size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {membros.length === 0 && (
          <span className="text-sm font-bold text-slate-500">
            Nenhum membro adicionado.
          </span>
        )}

        {membros.map((membro) => (
          <span
            key={membro.id}
            className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600"
          >
            {membro.manager_usuarios?.nome || 'Usuário'}
          </span>
        ))}
      </div>
    </div>
  );
}