const ASSETS = [
  { id: 'terra', label: 'Terra', swatch: '#EDBE6A' },
  { id: 'plataforma', label: 'Plataforma', swatch: '#B4703A' },
  { id: 'fardo', label: 'Fardo azul', swatch: '#0091FF' },
  { id: 'buraco', label: 'Buraco', swatch: '#8a7f66' },
  { id: 'boll', label: 'Capulho', swatch: '#FFFDF7' },
  { id: 'golden', label: 'Dourado', swatch: '#FFD24A' },
  { id: 'item', label: 'Item', swatch: '#FFD23F' },
  { id: 'weevil', label: 'Bicudo', swatch: '#8A4E28' },
  { id: 'whitefly', label: 'Mosca-branca', swatch: '#F8F1D4' },
  { id: 'folharao', label: 'Folharão', swatch: '#8CC63F' },
  { id: 'casca', label: 'Casca-Bruta', swatch: '#C8643A' },
  { id: 'start', label: 'Início', swatch: '#3F9A3C' },
  { id: 'goal', label: 'Chegada', swatch: '#E81E25' },
];

export default function AssetTray({ asset, onChange }) {
  return (
    <div className="overflow-x-auto border-t-[3px] border-[#1B120C] bg-[#101d12] px-3 py-3">
      <div className="flex min-w-max items-center gap-2">
        {ASSETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={asset === item.id}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
              asset === item.id
                ? 'border-[#FFD23F] bg-[#FFD23F] text-[#101d12]'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span
              className="h-4 w-4 rounded-[4px] border border-[#1B120C]"
              style={{ background: item.swatch }}
            />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}