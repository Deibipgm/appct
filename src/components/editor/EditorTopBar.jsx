import { useState } from 'react';
import { Loader2, Minus, Play, Plus, Save, Trash2, FilePlus2, FileDown } from 'lucide-react';
import { downloadArtPdf } from '@/game/artPdf';
import { PRESETS } from '@/game/editorLevel';

const btn =
  'flex items-center gap-2 rounded-xl border-2 border-[#1B120C] px-3 py-2 text-xs font-extrabold shadow-[0_3px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none';

export default function EditorTopBar({
  level,
  saved,
  currentId,
  saving,
  onName,
  onPreset,
  onResize,
  onNew,
  onSave,
  onPlay,
  onLoad,
  onDelete,
}) {
  const [pdfBusy, setPdfBusy] = useState(false);
  return (
    <div className="border-b-[3px] border-[#1B120C] bg-[#fffaf0] px-3 py-3">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2">
        <input
          value={level.name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Nome da fase"
          className="min-w-[180px] flex-1 rounded-xl border-2 border-[#1B120C] bg-white px-3 py-2 text-sm font-bold text-[#2c3a22] outline-none focus:border-[#3f9a3c]"
        />

        <select
          value={level.preset}
          onChange={(e) => onPreset(e.target.value)}
          className="rounded-xl border-2 border-[#1B120C] bg-white px-2 py-2 text-xs font-bold text-[#2c3a22]"
          aria-label="Cenário"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-xl border-2 border-[#1B120C] bg-white px-2 py-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7a6642]">
            {level.rows[0].length} bl
          </span>
          <button
            type="button"
            aria-label="Remover 8 blocos"
            onClick={() => onResize(-8)}
            className="rounded-lg bg-[#e9e2cf] p-1 hover:bg-[#dcd2b8]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Adicionar 8 blocos"
            onClick={() => onResize(8)}
            className="rounded-lg bg-[#e9e2cf] p-1 hover:bg-[#dcd2b8]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNew}
          className={`${btn} bg-[#e9e2cf] text-[#2c3a22]`}
        >
          <FilePlus2 className="h-4 w-4" /> Nova
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`${btn} bg-[#FFD23F] text-[#3a2a0e] disabled:opacity-60`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {currentId ? 'Salvar' : 'Salvar fase'}
        </button>

        <button
          type="button"
          disabled={pdfBusy}
          onClick={async () => {
            setPdfBusy(true);
            await downloadArtPdf().finally(() => setPdfBusy(false));
          }}
          className={`${btn} bg-white text-[#2c3a22] disabled:opacity-60`}
        >
          {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Imagens em PDF
        </button>

        <button type="button" onClick={onPlay} className={`${btn} bg-[#3f9a3c] text-[#fffbe8]`}>
          <Play className="h-4 w-4 fill-current" strokeWidth={0} /> Testar
        </button>
      </div>

      {saved.length > 0 && (
        <div className="mx-auto mt-2 flex max-w-[1500px] flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7a6642]">
            Minhas fases
          </span>
          {saved.map((item) => (
            <span
              key={item.id}
              className={`flex items-center gap-1 rounded-full border-2 px-2 py-1 text-[11px] font-bold ${
                currentId === item.id
                  ? 'border-[#3f9a3c] bg-[#e3f2cf] text-[#2c4a24]'
                  : 'border-[#c9b88f] bg-white text-[#5b5238]'
              }`}
            >
              <button type="button" onClick={() => onLoad(item)} className="max-w-[160px] truncate">
                {item.name}
              </button>
              <button
                type="button"
                aria-label={`Apagar ${item.name}`}
                onClick={() => onDelete(item)}
                className="text-[#b8602f] hover:text-[#8a3f1a]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}