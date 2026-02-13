import { useEffect, useState, useRef, useMemo } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';
import { useAuth } from '../../store/auth';

// ─── Icons ───────────────────────────────────────────────────────
function IconBox() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
}
function IconSearch() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
}
function IconRefresh() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
}
function IconDollar() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
}
function IconLayers() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);
}
function IconPalette() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>);
}
function IconRuler() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
}

export default function StockPage() {
  const { add } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [specOptions, setSpecOptions] = useState([]);
  const [specId, setSpecId] = useState('');
  
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filterColorId, setFilterColorId] = useState('');
  const [filterSizeId, setFilterSizeId] = useState('');

  const [adjustQty, setAdjustQty] = useState('');
  const [desc, setDesc] = useState('');
  
  const specsReqId = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
            api.get('/api/colors'),
            api.get('/api/sizes')
        ]);
        setColors(cRes.data || cRes);
        setSizes(sRes.data || sRes);
      } catch { /* ignore */ }
    })();

    const pid = localStorage.getItem('stock_product_id');
    const pname = localStorage.getItem('stock_product_name');
    const sid = localStorage.getItem('stock_spec_id');
    if (pid && pname) {
        setSelectedProduct({ id: pid, name: pname });
        setProductSearch(pname);
        fetchSpecs(pid, sid);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!productSearch.trim()) {
        setProductResults([]);
        return;
      }
      setProductLoading(true);
      try {
        const res = await api.get(`/api/products?search=${productSearch}&per_page=5`);
        setProductResults(res.data || res);
      } catch { setProductResults([]); } 
      finally { setProductLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  async function fetchSpecs(productId, preSelectedSpecId = null) {
    const rid = ++specsReqId.current;
    try {
      const res = await api.get(`/api/products/${productId}/specs`);
      if (rid !== specsReqId.current) return;
      const list = res.data?.data || res.data || res || [];
      setSpecOptions(list);
      if (preSelectedSpecId) {
        setSpecId(preSelectedSpecId);
        fetchHistory(preSelectedSpecId);
      } else if (list.length === 1) {
        setSpecId(String(list[0].id));
        fetchHistory(String(list[0].id));
      } else {
        setSpecId('');
        setItems([]);
      }
    } catch { setSpecOptions([]); }
  }

  async function fetchHistory(id) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/stock?product_spec_id=${id}`);
      setItems(res.data || res);
      localStorage.setItem('stock_spec_id', id);
    } catch (e) { setError(e.message); } 
    finally { setLoading(false); }
  }

  async function adjust(e) {
    e.preventDefault();
    if (!specId || !adjustQty) return;
    try {
      await api.post('/api/stock/adjust', { product_spec_id: Number(specId), quantity: Number(adjustQty), description: desc });
      setAdjustQty(''); setDesc('');
      add('Stock adjusted', 'success');
      fetchHistory(specId);
    } catch (e) { add(e.message, 'error'); }
  }

  const availableSpecs = useMemo(() => {
    return specOptions.filter(s => {
        if (filterColorId && String(s.color_id) !== filterColorId) return false;
        if (filterSizeId && String(s.size_id) !== filterSizeId) return false;
        return true;
    });
  }, [specOptions, filterColorId, filterSizeId]);

  function handleSelectProduct(p) {
    setSelectedProduct({ id: p.id, name: p.name });
    setProductSearch(p.name);
    setDropdownOpen(false);
    setSpecId('');
    setFilterColorId('');
    setFilterSizeId('');
    setItems([]);
    localStorage.setItem('stock_product_id', p.id);
    localStorage.setItem('stock_product_name', p.name);
    localStorage.removeItem('stock_spec_id');
    fetchSpecs(p.id);
  }

  const getColorName = (id) => colors.find(c => String(c.id) === String(id))?.name || '-';
  const getSizeName = (id) => sizes.find(s => String(s.id) === String(id))?.name || '-';
  
  const totalStock = useMemo(() => specOptions.reduce((sum, s) => sum + Number(s.stock ?? s.quantity_in_stock ?? 0), 0), [specOptions]);
  
  const colorTotals = useMemo(() => {
    const map = {};
    specOptions.forEach((s) => { if (s.color_id) map[s.color_id] = (map[s.color_id] || 0) + Number(s.stock ?? 0); });
    return Object.entries(map).map(([id, total]) => ({ id, total }));
  }, [specOptions]);

  const sizeTotals = useMemo(() => {
    const map = {};
    specOptions.forEach((s) => { if (s.size_id) map[s.size_id] = (map[s.size_id] || 0) + Number(s.stock ?? 0); });
    return Object.entries(map).map(([id, total]) => ({ id, total }));
  }, [specOptions]);

  const stockValueCost = useMemo(() => specOptions.reduce((sum, s) => sum + (Number(s.stock ?? 0) * Number(s.purchase_price ?? 0)), 0), [specOptions]);
  const stockValueSale = useMemo(() => specOptions.reduce((sum, s) => sum + (Number(s.stock ?? 0) * Number(s.final_price ?? s.price ?? 0)), 0), [specOptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
            <IconBox />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Stock Management
            </h1>
            <p className="text-sm text-muted mt-0.5">Track inventory and history</p>
          </div>
        </div>

        {/* ─── Search & Overview ────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-5 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Select Product</label>
              <div className="relative">
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <IconSearch />
                </div>
                {productLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {dropdownOpen && productResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-1">
                  {productResults.map(p => (
                    <div
                      key={p.id}
                      className="px-4 py-2.5 hover:bg-primary/5 cursor-pointer text-sm text-slate-700 hover:text-primary transition-colors flex items-center justify-between group"
                      onMouseDown={() => handleSelectProduct(p)}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variant Select */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Select Variant</label>
              <div className="relative">
                <select
                  className={`w-full appearance-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer ${!specId ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50/50'}`}
                  value={specId}
                  onChange={(e) => { setSpecId(e.target.value); fetchHistory(e.target.value); }}
                  disabled={!selectedProduct}
                >
                  <option value="">Select Variant...</option>
                  {availableSpecs.map(s => (
                    <option key={s.id} value={s.id}>
                      {getColorName(s.color_id)} / {getSizeName(s.size_id)} — Qty: {s.stock ?? s.quantity_in_stock}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-blue-50 text-blue-600"><IconLayers /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Stock</span>
                </div>
                <div className="text-xl font-bold text-slate-800">{totalStock.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-50 text-emerald-600"><IconDollar /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Value (Cost)</span>
                </div>
                <div className="text-xl font-bold text-emerald-700">{stockValueCost.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-50 text-emerald-600"><IconDollar /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Value (Sale)</span>
                </div>
                <div className="text-xl font-bold text-emerald-700">{stockValueSale.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-pink-50 text-pink-600"><IconPalette /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">By Color</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                  {colorTotals.map(ct => (
                    <div key={ct.id} className="flex justify-between text-xs">
                      <span className="text-slate-600">{getColorName(ct.id)}</span>
                      <span className="font-mono font-bold text-slate-800">{ct.total}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-indigo-50 text-indigo-600"><IconRuler /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">By Size</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                  {sizeTotals.map(st => (
                    <div key={st.id} className="flex justify-between text-xs">
                      <span className="text-slate-600">{getSizeName(st.id)}</span>
                      <span className="font-mono font-bold text-slate-800">{st.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── ADJUSTMENT ───────────────────────────────────── */}
        {specId && user?.role === 'admin' && (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <IconRefresh /> Adjust Stock
            </h3>
            <form onSubmit={adjust} className="flex flex-col md:flex-row gap-3 items-end">
              <div className="w-full md:w-1/4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Change (+/-)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                  placeholder="+10 or -5"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  required
                />
              </div>
              <div className="w-full flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reason</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                  placeholder="e.g. Broken item, New shipment..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <IconCheck /> Update
              </button>
            </form>
          </div>
        )}

        {/* ─── HISTORY ──────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Stock History</h3>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <p className="text-sm text-muted animate-pulse">Loading history...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <IconRefresh />
              </div>
              <p className="text-sm font-medium text-muted">No history found for this variant</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Type</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Change</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Reason</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Order</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {items.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-primary/5 transition-colors" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          m.type.includes('add') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          m.type.includes('remove') ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold">
                        <span className={Number(m.quantity) > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {Number(m.quantity) > 0 ? '+' : ''}{m.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {m.description || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        {m.order_item_id ? (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            #{m.order_item_id}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-muted">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}