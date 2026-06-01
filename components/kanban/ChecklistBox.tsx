import { Plus } from 'lucide-react';

type Props = {
  checklist: any[];
  novoItem: string;
  setNovoItem: (value: string) => void;
  onAdd: () => void;
  onToggle: (item: any) => void;
};

export default function ChecklistBox({
  checklist,
  novoItem,
  setNovoItem,
  onAdd,
  onToggle,
}: Props) {
  const concluidos = checklist.filter((item) => item.concluido).length;
  const total = checklist.length;
  const progresso = total ? Math.round((concluidos / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-black text-[#0b1f3f]">Checklist</h4>
        <span className="text-sm font-black text-slate-500">
          {concluidos}/{total}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {checklist.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-700"
          >
            <input
              type="checkbox"
              checked={item.concluido}
              onChange={() => onToggle(item)}
            />
            <span className={item.concluido ? 'line-through text-slate-400' : ''}>
              {item.titulo}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-emerald-500 px-4 text-white"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}