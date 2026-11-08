import { Brush, Eraser, PaintBucket } from 'lucide-react';

const TOOLS = [
  { id: 'pincel', label: 'Pincel', Icon: Brush },
  { id: 'borracha', label: 'Borracha', Icon: Eraser },
  { id: 'balde', label: 'Preencher coluna', Icon: PaintBucket },
];

export default function ToolRail({ tool, onChange }) {
  return (
    <div className="flex gap-2 rounded-[18px] border-[3px] border-[#1B120C] bg-[#101d12] p-2 md:flex-col">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={tool === id}
          onClick={() => onChange(id)}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition ${
            tool === id
              ? 'border-[#FFD23F] bg-[#FFD23F] text-[#101d12]'
              : 'border-white/25 bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}