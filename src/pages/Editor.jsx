import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { applyBrush, blankLevel, fromSaved, resizeWidth, toDef, toSaved } from '@/game/editorLevel';
import EditorCanvas from '@/components/editor/EditorCanvas';
import EditorTopBar from '@/components/editor/EditorTopBar';
import ToolRail from '@/components/editor/ToolRail';
import AssetTray from '@/components/editor/AssetTray';
import TestPlay from '@/components/editor/TestPlay';

export default function Editor() {
  const [level, setLevel] = useState(() => blankLevel());
  const [tool, setTool] = useState('pincel');
  const [asset, setAsset] = useState('terra');
  const [saved, setSaved] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [testDef, setTestDef] = useState(null);

  const refresh = useCallback(async () => {
    const page = await base44.entities.SavedLevel.filter(
      {},
      { sort: '-updated_date', limit: 30 }
    );
    setSaved(page?.items ?? page ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const paint = (x, y) => setLevel((prev) => applyBrush(prev, { tool, asset }, x, y));

  const startNew = () => {
    setLevel(blankLevel(level.preset));
    setCurrentId(null);
    setStatus('Nova fase em branco.');
  };

  const load = (record) => {
    setLevel(fromSaved(record));
    setCurrentId(record.id);
    setStatus(`Editando "${record.name}".`);
  };

  const save = async () => {
    setSaving(true);
    setStatus('');
    try {
      const payload = toSaved(level);
      if (currentId) {
        await base44.entities.SavedLevel.update(currentId, payload);
      } else {
        const created = await base44.entities.SavedLevel.create(payload);
        setCurrentId(created.id);
      }
      await refresh();
      setStatus('Fase salva.');
    } catch (error) {
      setStatus(error?.message ?? 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record) => {
    await base44.entities.SavedLevel.delete(record.id);
    if (currentId === record.id) setCurrentId(null);
    await refresh();
    setStatus(`"${record.name}" apagada.`);
  };

  const play = () => setTestDef(toDef(level));

  return (
    <div className="min-h-screen bg-[#eef3e2] text-[#2c3a22]">
      <EditorTopBar
        level={level}
        saved={saved}
        currentId={currentId}
        saving={saving}
        onName={(name) => setLevel((prev) => ({ ...prev, name }))}
        onPreset={(preset) => setLevel((prev) => ({ ...prev, preset }))}
        onResize={(delta) => setLevel((prev) => resizeWidth(prev, delta))}
        onNew={startNew}
        onSave={save}
        onPlay={play}
        onLoad={load}
        onDelete={remove}
      />

      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 p-3 md:flex-row">
        <div className="flex-1 overflow-auto rounded-[18px] border-[3px] border-[#1B120C] bg-[#cfe9f5] shadow-[0_6px_0_#1B120C]">
          <EditorCanvas level={level} onPaint={paint} />
        </div>
        <ToolRail tool={tool} onChange={setTool} />
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-1 px-3 pb-3 text-[11px] font-bold text-[#6b5d3e]">
        <span className="flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          Clique e arraste para desenhar. Terra sobe do chão, plataformas flutuam, fardos viram
          obstáculos.
        </span>
        <span>{status}</span>
        <Link to="/" className="text-[#2f7fb8] underline">
          Voltar ao jogo
        </Link>
      </div>

      <AssetTray asset={asset} onChange={setAsset} />

      {testDef && <TestPlay levelDef={testDef} onExit={() => setTestDef(null)} />}
    </div>
  );
}