import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// ─── Icons ───────────────────────────────────────────────────────
function IconPalette() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>);
}
function IconRuler() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" /></svg>);
}
function IconPlus() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
}
function IconSave() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
}
function IconTrash() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconX() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
}
function IconDroplet() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>);
}

export default function ColorsSizesPage() {
  const { add } = useToast();
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [cLoading, setCLoading] = useState(true);
  const [sLoading, setSLoading] = useState(true);
  const [cForm, setCForm] = useState({ name: '', hexa_number: '#000000', is_active: 1 });
  const [sForm, setSForm] = useState({ name: '', is_active: 1 });
  const [showCForm, setShowCForm] = useState(false);
  const [showSForm, setShowSForm] = useState(false);

  const fetchColors = useCallback(async () => {
    setCLoading(true);
    try {
      const res = await api.get('/api/colors');
      setColors(res.data || res);
    } catch (e) { add(e.message, 'error'); }
    finally { setCLoading(false); }
  }, [add]);

  const fetchSizes = useCallback(async () => {
    setSLoading(true);
    try {
      const res = await api.get('/api/sizes');
      setSizes(res.data || res);
    } catch (e) { add(e.message, 'error'); }
    finally { setSLoading(false); }
  }, [add]);

  useEffect(() => { fetchColors(); fetchSizes(); }, [fetchColors, fetchSizes]);

  async function createColor(e) {
    e.preventDefault();
    try {
      await api.post('/api/colors', { name: cForm.name, hexa_number: cForm.hexa_number, is_active: Number(cForm.is_active) });
      setCForm({ name: '', hexa_number: '#000000', is_active: 1 });
      setShowCForm(false);
      await fetchColors();
      add('Color created', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function createSize(e) {
    e.preventDefault();
    try {
      await api.post('/api/sizes', { name: sForm.name, is_active: Number(sForm.is_active) });
      setSForm({ name: '', is_active: 1 });
      setShowSForm(false);
      await fetchSizes();
      add('Size created', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function saveColor(c) {
    try {
      await api.patch(`/api/colors?id=${c.id}`, { name: c.name, hexa_number: c.hexa_number, is_active: Number(c.is_active ? 1 : 0) });
      await fetchColors();
      add('Color updated', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function saveSize(s) {
    try {
      await api.patch(`/api/sizes?id=${s.id}`, { name: s.name, is_active: Number(s.is_active ? 1 : 0) });
      await fetchSizes();
      add('Size updated', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function deleteColor(id) {
    try {
      await api.del(`/api/colors?id=${id}`);
      await fetchColors();
      add('Color deleted', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function deleteSize(id) {
    try {
      await api.del(`/api/sizes?id=${id}`);
      await fetchSizes();
      add('Size deleted', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  function isLightColor(hex) {
    const c = hex?.replace('#', '') || '000000';
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 155;
  }

  const activeColors = colors.filter((c) => c.is_active).length;
  const activeSizes = sizes.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
            <IconPalette />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Colors & Sizes
            </h1>
            <p className="text-sm text-muted mt-0.5">Manage product attributes</p>
          </div>
        </div>

        {/* ─── Two Column Layout ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

           {/* ═══════════════════════════════════════════════════ */}
          {/* ─── SIZES PANEL ──────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <IconRuler />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Sizes</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-accent font-medium">{activeSizes} active</span>
                    <span className="text-xs text-muted">• {sizes.length} total</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSForm(!showSForm)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showSForm
                    ? 'bg-slate-200 text-slate-700 shadow-sm'
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                }`}
              >
                <IconPlus />
                {showSForm ? 'Cancel' : 'Add Size'}
              </button>
            </div>

            {/* Create Form */}
            {showSForm && (
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-primary/5">
                <form onSubmit={createSize} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-lg bg-blue-100 text-blue-600">
                      <IconPlus />
                    </div>
                    <span className="text-sm font-bold text-slate-700">New Size</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                      placeholder="e.g. XL, 42, Large"
                      value={sForm.name}
                      onChange={(e) => setSForm((s) => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="relative inline-flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={!!sForm.is_active} onChange={(e) => setSForm((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-emerald-500 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Active</span>
                    </label>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <IconPlus /> Create
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Size Pills Preview */}
            {!sLoading && sizes.length > 0 && (
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-2">
                  {sizes.filter(s => s.is_active).map((s) => (
                    <div
                      key={s.id}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-primary/10 to-secondary/10 border border-primary/20 text-xs font-bold text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-105 transition-all duration-200 cursor-default"
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes List */}
            <div className="divide-y divide-slate-100/80">
              {sLoading ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                  </div>
                  <p className="text-sm text-muted animate-pulse">Loading sizes...</p>
                </div>
              ) : sizes.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-300">
                    <IconRuler />
                  </div>
                  <p className="text-sm font-medium text-muted">No sizes yet</p>
                </div>
              ) : (
                sizes.map((s, idx) => (
                  <div
                    key={s.id}
                    className="group px-6 py-3.5 flex items-center gap-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Size Badge */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:scale-110 transition-all duration-300">
                      <span className="text-xs font-extrabold text-primary uppercase">
                        {s.name?.length > 3 ? s.name.substring(0, 3) : s.name}
                      </span>
                    </div>

                    {/* Name Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        className="w-full rounded-xl border border-transparent hover:border-slate-200 focus:border-primary/40 px-3 py-2 text-sm font-semibold text-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all"
                        value={s.name || ''}
                        onChange={(e) => setSizes((list) => list.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))}
                      />
                    </div>

                    {/* Active Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!s.is_active}
                        onChange={(e) => setSizes((list) => list.map((x) => x.id === s.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))}
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-sm after:transition-all peer-checked:bg-accent transition-colors" />
                    </label>

                    {/* Actions — Always Visible */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => saveSize(s)}
                        className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 hover:scale-110"
                        title="Save"
                      >
                        <IconSave />
                      </button>
                      <button
                        onClick={() => deleteSize(s.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* ─── COLORS PANEL ─────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <IconPalette />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Colors</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-accent font-medium">{activeColors} active</span>
                    <span className="text-xs text-muted">• {colors.length} total</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCForm(!showCForm)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  showCForm
                    ? 'bg-slate-200 text-slate-700 shadow-sm'
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                }`}
              >
                <IconPlus />
                {showCForm ? 'Cancel' : 'Add Color'}
              </button>
            </div>

            {/* Create Form */}
            {showCForm && (
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-pink-50/50 to-primary/5">
                <form onSubmit={createColor} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-lg bg-pink-100 text-pink-600">
                      <IconPlus />
                    </div>
                    <span className="text-sm font-bold text-slate-700">New Color</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                        placeholder="e.g. Royal Blue"
                        value={cForm.name}
                        onChange={(e) => setCForm((s) => ({ ...s, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Color</label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="color"
                            className="w-12 h-10 rounded-xl border-2 border-slate-200 cursor-pointer"
                            value={cForm.hexa_number}
                            onChange={(e) => setCForm((s) => ({ ...s, hexa_number: e.target.value }))}
                          />
                        </div>
                        <input
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={cForm.hexa_number}
                          onChange={(e) => setCForm((s) => ({ ...s, hexa_number: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="relative inline-flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={!!cForm.is_active} onChange={(e) => setCForm((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-emerald-500 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Active</span>
                    </label>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <IconPlus /> Create
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Color Swatches Preview */}
            {!cLoading && colors.length > 0 && (
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-2">
                  {colors.filter(c => c.is_active).map((c) => (
                    <div
                      key={c.id}
                      className="group relative w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-125 hover:shadow-lg transition-all duration-200 cursor-default"
                      style={{ backgroundColor: c.hexa_number || '#000' }}
                      title={c.name}
                    >
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-800 text-white text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {c.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors List */}
            <div className="divide-y divide-slate-100/80">
              {cLoading ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                  </div>
                  <p className="text-sm text-muted animate-pulse">Loading colors...</p>
                </div>
              ) : colors.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-300">
                    <IconPalette />
                  </div>
                  <p className="text-sm font-medium text-muted">No colors yet</p>
                </div>
              ) : (
                colors.map((c, idx) => (
                  <div
                    key={c.id}
                    className="group px-6 py-3.5 flex items-center gap-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Color Swatch */}
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl border-2 border-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                        style={{ backgroundColor: c.hexa_number || '#000' }}
                      >
                        <div className={`absolute inset-0 rounded-xl flex items-center justify-center ${isLightColor(c.hexa_number) ? 'text-slate-600' : 'text-white'}`}>
                          <IconDroplet />
                        </div>
                      </div>
                      {/* Color picker overlay */}
                      <input
                        type="color"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={c.hexa_number || '#000000'}
                        onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, hexa_number: e.target.value } : x))}
                        title="Change color"
                      />
                    </div>

                    {/* Name Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        className="w-full rounded-xl border border-transparent hover:border-slate-200 focus:border-primary/40 px-3 py-2 text-sm font-semibold text-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all"
                        value={c.name || ''}
                        onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))}
                      />
                      <span className="text-[10px] font-mono text-muted ml-3">{c.hexa_number}</span>
                    </div>

                    {/* Active Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!c.is_active}
                        onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))}
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-sm after:transition-all peer-checked:bg-accent transition-colors" />
                    </label>

                    {/* Actions — Always Visible */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => saveColor(c)}
                        className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 hover:scale-110"
                        title="Save"
                      >
                        <IconSave />
                      </button>
                      <button
                        onClick={() => deleteColor(c.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}