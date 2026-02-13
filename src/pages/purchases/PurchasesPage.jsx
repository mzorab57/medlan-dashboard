import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// ─── Icons ───────────────────────────────────────────────────────
function IconShoppingCart() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>);
}
function IconPlus() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
}
function IconDollar() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
}
function IconPackage() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconX() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
}
function IconFilter() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
}
function IconSearch() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
}
function IconDownload() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
}
function IconSave() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
}
function IconTrash() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
}
function IconChevronDown() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
}

function toNum(v) {
  const s = String(v ?? '').replace(/,/g, '').trim();
  const n = s === '' ? 0 : Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default function PurchasesPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ordered');

  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createData, setCreateData] = useState({ supplier_name: '', note: '', items: [] });

  const [viewId, setViewId] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [receiving, setReceiving] = useState(false);
  const [statusDraft, setStatusDraft] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [itemDraftById, setItemDraftById] = useState({});
  const [itemSavingById, setItemSavingById] = useState({});

  const [viewSpecSearch, setViewSpecSearch] = useState('');
  const [viewSpecResults, setViewSpecResults] = useState([]);
  const [viewIsSearching, setViewIsSearching] = useState(false);
  const [viewSelectedProduct, setViewSelectedProduct] = useState(null);
  const [viewAddQty, setViewAddQty] = useState(1);
  const [viewAddUnitCost, setViewAddUnitCost] = useState('');
  const [viewAddLoading, setViewAddLoading] = useState(false);

  const [specSearch, setSpecSearch] = useState('');
  const [specResults, setSpecResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addQty, setAddQty] = useState(1);
  const [addUnitCost, setAddUnitCost] = useState('');

  async function fetchList() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/api/purchases${params.toString() ? `?${params.toString()}` : ''}`);
      setItems(res.data || res || []);
    } catch { setItems([]); } 
    finally { setLoading(false); }
  }

  const listTotals = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const totalQty = arr.reduce((sum, p) => sum + toNum(p.items_qty), 0);
    const totalCost = arr.reduce((sum, p) => sum + toNum(p.total_cost), 0);
    return { count: arr.length, totalQty, totalCost };
  }, [items]);

  useEffect(() => { fetchList(); }, [statusFilter]);

  async function openView(id) {
    setViewId(id); setViewLoading(true);
    try {
      const res = await api.get(`/api/purchases?id=${id}`);
      setViewData(res); setStatusDraft(String(res?.purchase?.status || ''));
      const drafts = {};
      (res?.items || []).forEach((it) => { drafts[it.id] = { quantity: String(it.quantity ?? ''), unit_cost: String(it.unit_cost ?? '') }; });
      setItemDraftById(drafts);
    } catch (e) { add(e.message, 'error'); } 
    finally { setViewLoading(false); }
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!viewId || !viewSpecSearch.trim()) { setViewSpecResults([]); return; }
      setViewIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(viewSpecSearch.trim())}&per_page=8`);
        setViewSpecResults(res.data || res || []);
      } catch { setViewSpecResults([]); } 
      finally { setViewIsSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [viewSpecSearch, viewId]);

  async function selectProductForView(prod) {
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      const specs = Array.isArray(res) ? res : (res.data || []);
      setViewSelectedProduct({ ...prod, specs });
      setViewSpecResults([]); setViewSpecSearch(prod.name);
      setViewAddQty(1); setViewAddUnitCost('');
    } catch (e) { add(e.message, 'error'); }
  }

  async function saveStatus() {
    if (!viewId) return;
    setStatusSaving(true);
    try {
      await api.patch(`/api/purchases?id=${viewId}`, { status: statusDraft });
      add('Status updated', 'success'); await openView(viewId); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setStatusSaving(false); }
  }

  async function saveItem(itemId) {
    if (!viewId) return;
    const d = itemDraftById?.[itemId] || {};
    setItemSavingById((s) => ({ ...(s || {}), [itemId]: true }));
    try {
      await api.patch(`/api/purchases/items?id=${itemId}`, { quantity: Number(d.quantity), unit_cost: Number(d.unit_cost) });
      add('Item updated', 'success'); await openView(viewId); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setItemSavingById((s) => ({ ...(s || {}), [itemId]: false })); }
  }

  async function deleteItem(itemId) {
    setItemSavingById((s) => ({ ...(s || {}), [itemId]: true }));
    try {
      await api.del(`/api/purchases/items?id=${itemId}`);
      add('Item deleted', 'success'); if (viewId) await openView(viewId); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setItemSavingById((s) => ({ ...(s || {}), [itemId]: false })); }
  }

  async function addItemToPurchase(spec) {
    if (!viewId) return;
    setViewAddLoading(true);
    try {
      await api.post(`/api/purchases/items?id=${viewId}`, { product_spec_id: Number(spec.id), quantity: Math.max(1, toNum(viewAddQty)), unit_cost: toNum(viewAddUnitCost !== '' ? viewAddUnitCost : (spec.purchase_price ?? 0)) });
      add('Item added', 'success'); setViewSelectedProduct(null); setViewSpecSearch(''); setViewSpecResults([]);
      await openView(viewId); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setViewAddLoading(false); }
  }

  async function receiveAll() {
    if (!viewId) return;
    setReceiving(true);
    try {
      await api.patch(`/api/purchases/receive?id=${viewId}`, {});
      add('Received into stock', 'success'); await openView(viewId); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setReceiving(false); }
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!createOpen || !specSearch.trim()) { setSpecResults([]); return; }
      setIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(specSearch.trim())}&per_page=8`);
        setSpecResults(res.data || res || []);
      } catch { setSpecResults([]); } 
      finally { setIsSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [specSearch, createOpen]);

  async function selectProduct(prod) {
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      const specs = Array.isArray(res) ? res : (res.data || []);
      setSelectedProduct({ ...prod, specs });
      setSpecResults([]); setSpecSearch(prod.name); setAddQty(1); setAddUnitCost('');
    } catch (e) { add(e.message, 'error'); }
  }

  function addSpecToPurchase(sp) {
    const qty = Math.max(1, toNum(addQty));
    const unitCost = toNum(addUnitCost !== '' ? addUnitCost : (sp.purchase_price ?? 0));
    setCreateData((prev) => {
      const existing = prev.items.find((i) => Number(i.product_spec_id) === Number(sp.id));
      if (existing) {
        return { ...prev, items: prev.items.map((i) => Number(i.product_spec_id) === Number(sp.id) ? { ...i, quantity: i.quantity + qty, unit_cost: unitCost } : i) };
      }
      return {
        ...prev,
        items: [...prev.items, { product_spec_id: Number(sp.id), product_name: selectedProduct?.name, color_name: sp.color_name || sp.color_id, size_name: sp.size_name || sp.size_id, quantity: qty, unit_cost: unitCost }],
      };
    });
    add('Added', 'success');
  }

  const createTotal = useMemo(() => (createData.items || []).reduce((sum, it) => sum + toNum(it.unit_cost) * toNum(it.quantity), 0), [createData.items]);

  async function submitCreate() {
    if (!createData.supplier_name.trim()) { add('Supplier name required', 'error'); return; }
    if (!createData.items.length) { add('Add items first', 'error'); return; }
    setCreateSaving(true);
    try {
      await api.post('/api/purchases', {
        supplier_name: createData.supplier_name, note: createData.note, status: 'ordered',
        items: createData.items.map((it) => ({ product_spec_id: Number(it.product_spec_id), quantity: Number(it.quantity), unit_cost: Number(it.unit_cost) })),
      });
      add('Purchase created', 'success'); setCreateOpen(false); setCreateData({ supplier_name: '', note: '', items: [] });
      setSelectedProduct(null); setSpecSearch(''); setSpecResults([]); await fetchList();
    } catch (e) { add(e.message, 'error'); } 
    finally { setCreateSaving(false); }
  }

  const getStatusColor = (s) => {
    switch(String(s).toLowerCase()) {
      case 'received': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'partial': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
                <IconShoppingCart />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{items.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Purchases
              </h1>
              <p className="text-sm text-muted mt-0.5">Manage supplier orders & stock intake</p>
            </div>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <IconPlus />
            <span>New Purchase</span>
          </button>
        </div>

        {/* ─── Summary Cards ──────────────────────────────────── */}
        {String(statusFilter || '').toLowerCase() === 'ordered' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Ordered', value: listTotals.count, icon: <IconShoppingCart />, color: 'blue' },
              { label: 'Total Qty', value: listTotals.totalQty, icon: <IconPackage />, color: 'indigo' },
              { label: 'Total Cost', value: listTotals.totalCost, icon: <IconDollar />, color: 'emerald', isMoney: true },
            ].map((stat) => (
              <div key={stat.label} className="group p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">{stat.value.toLocaleString()} {stat.isMoney && <span className="text-sm font-normal text-muted">IQD</span>}</div>
                <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><IconFilter /></div>
            <div className="relative">
              <select
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all cursor-pointer font-medium text-slate-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="ordered">Ordered</option>
                <option value="partial">Partial</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"><IconChevronDown /></div>
            </div>
          </div>
        </div>

        {/* ─── Purchases Table ────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted animate-pulse font-medium">Loading purchases...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <tr className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4 w-20">#ID</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Cost</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {items.map((p, idx) => (
                    <tr 
                      key={p.id} 
                      className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 cursor-pointer"
                      onClick={() => openView(p.id)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-400 group-hover:text-primary transition-colors">#{p.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{p.supplier_name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(p.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{toNum(p.total_cost).toLocaleString()} <span className="text-[10px] font-normal text-muted">IQD</span></td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-600">{toNum(p.items_qty)}</td>
                      <td className="px-6 py-4 text-xs text-muted font-medium">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── CREATE MODAL ───────────────────────────────────── */}
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-lg" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-200/50">
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary"><IconPlus /></div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">New Purchase</h3>
                    <p className="text-xs text-muted">Create a new supplier order</p>
                  </div>
                </div>
                <button onClick={() => setCreateOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-muted hover:text-slate-600 transition-colors"><IconX /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left: Supplier & Cart */}
                <div className="w-full lg:w-1/3 border-r border-slate-100 bg-slate-50/30 flex flex-col overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Supplier Details</label>
                      <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="Supplier Name *" value={createData.supplier_name} onChange={e => setCreateData(s => ({...s, supplier_name: e.target.value}))} />
                      <textarea className="w-full mt-3 rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 resize-none" rows={3} placeholder="Notes (optional)" value={createData.note} onChange={e => setCreateData(s => ({...s, note: e.target.value}))} />
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cart Items</label>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">{createData.items.length}</span>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {createData.items.length === 0 ? <div className="text-center py-8 text-muted border-2 border-dashed border-slate-200 rounded-xl"><p className="text-xs">No items added yet</p></div> : (
                          createData.items.map((it, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm flex justify-between gap-3 group hover:border-primary/30 transition-all">
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-700 truncate">{it.product_name}</div>
                                <div className="text-xs text-muted truncate">{it.color_name} • {it.size_name}</div>
                                <div className="text-xs font-mono text-primary mt-1 font-bold">{it.quantity} x {toNum(it.unit_cost).toLocaleString()}</div>
                              </div>
                              <button onClick={() => setCreateData(s => ({...s, items: s.items.filter((_, i) => i !== idx)}))} className="text-red-400 hover:text-red-600 p-1 self-start opacity-0 group-hover:opacity-100 transition-opacity"><IconTrash /></button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">Total Cost</span>
                        <span className="text-lg font-extrabold text-primary">{createTotal.toLocaleString()} <span className="text-xs font-normal text-muted">IQD</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Product Search */}
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  <div className="mb-6">
                    <div className="relative">
                      <input className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 shadow-sm" placeholder="Search products to add..." value={specSearch} onChange={e => setSpecSearch(e.target.value)} autoFocus />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><IconSearch /></div>
                    </div>
                  </div>

                  {!selectedProduct ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {isSearching && <div className="col-span-full text-center text-xs text-muted py-4">Searching...</div>}
                      {specResults.map(p => (
                        <button key={p.id} onClick={() => selectProduct(p)} className="flex justify-between items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all text-left group">
                          <span className="font-bold text-sm text-slate-700 group-hover:text-primary">{p.name}</span>
                          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <button onClick={() => { setSelectedProduct(null); setSpecSearch(''); setSpecResults([]); }} className="text-xs font-bold text-muted hover:text-primary flex items-center gap-1 transition-colors">&larr; Back to Search</button>
                      <div className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex-1 min-w-[200px]">
                          <div className="text-lg font-extrabold text-slate-800">{selectedProduct.name}</div>
                          <p className="text-xs text-muted">Select variant below to add to cart</p>
                        </div>
                        <div className="flex gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                            <input className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center font-bold outline-none focus:border-primary" type="number" min="1" value={addQty} onChange={e => setAddQty(Math.max(1, toNum(e.target.value)))} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Cost</label>
                            <input className="w-28 border rounded-lg px-2 py-1.5 text-sm text-right font-mono outline-none focus:border-primary" type="number" min="0" placeholder="Auto" value={addUnitCost} onChange={e => setAddUnitCost(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedProduct.specs.map(sp => (
                          <div key={sp.id} className="p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all flex justify-between items-center group bg-white">
                            <div>
                              <div className="font-bold text-sm text-slate-700">{sp.color_name || sp.color_id} / {sp.size_name || sp.size_id}</div>
                              <div className="text-[10px] text-muted font-mono mt-0.5">Stock: {sp.stock} • Buy: {toNum(sp.purchase_price).toLocaleString()}</div>
                            </div>
                            <button onClick={() => addSpecToPurchase(sp)} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/20 hover:bg-secondary hover:shadow-md transition-all">Add</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button onClick={() => setCreateOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted hover:bg-slate-50 transition-all">Cancel</button>
                <button disabled={createSaving} onClick={submitCreate} className="px-8 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {createSaving ? 'Creating...' : 'Create Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW MODAL ─────────────────────────────────────── */}
        {viewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-lg" onClick={(e) => e.target === e.currentTarget && setViewId(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-200/50">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">Purchase #{viewId}</h3>
                  <p className="text-xs text-muted">Manage order details & reception</p>
                </div>
                <button onClick={() => { setViewId(null); setViewData(null); }} className="p-2 rounded-xl hover:bg-slate-100 text-muted hover:text-slate-600 transition-colors"><IconX /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {viewLoading || !viewData ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted animate-pulse">Loading details...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Top Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Supplier', val: viewData.purchase?.supplier_name },
                        { label: 'Total Cost', val: `${toNum(viewData.purchase?.total_cost).toLocaleString()} IQD`, isMono: true },
                        { label: 'Items', val: toNum(viewData.purchase?.items_qty) },
                        { label: 'Status', val: viewData.purchase?.status, isBadge: true }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                          {item.isBadge ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.val)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                {String(item.val).toUpperCase()}
                              </span>
                              {!['received','cancelled'].includes(String(viewData.purchase?.status).toLowerCase()) && (
                                <select className="text-xs border rounded p-1 outline-none" value={statusDraft} onChange={e => setStatusDraft(e.target.value)}>
                                  {['draft','ordered','partial','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              )}
                              {String(statusDraft) !== String(viewData.purchase?.status) && !['received','cancelled'].includes(String(viewData.purchase?.status).toLowerCase()) && (
                                <button onClick={saveStatus} disabled={statusSaving} className="p-1 bg-primary text-white rounded shadow text-[10px]"><IconCheck /></button>
                              )}
                            </div>
                          ) : (
                            <div className={`font-bold text-slate-800 ${item.isMono ? 'font-mono' : ''}`}>{item.val}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Items Table */}
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3 text-left">Product</th>
                            <th className="px-6 py-3 text-center">Qty</th>
                            <th className="px-6 py-3 text-right">Unit Cost</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            {!['received','cancelled'].includes(String(viewData.purchase?.status).toLowerCase()) && <th className="px-6 py-3 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(viewData.items || []).map(it => {
                            const draft = itemDraftById?.[it.id] || {};
                            const saving = !!itemSavingById?.[it.id];
                            const editable = !['received','cancelled'].includes(String(viewData.purchase?.status).toLowerCase());
                            return (
                              <tr key={it.id} className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-800">{it.product_name}</div>
                                  <div className="text-xs text-muted">{it.color_name} / {it.size_name}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {editable ? (
                                    <input className="w-16 text-center border rounded py-1 text-sm outline-none focus:border-primary" type="number" min="0" value={draft.quantity ?? it.quantity} onChange={e => setItemDraftById(s => ({...s, [it.id]: {...(s?.[it.id] || {}), quantity: e.target.value}}))} />
                                  ) : <span className="font-mono font-bold">{it.quantity}</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {editable ? (
                                    <input className="w-24 text-right border rounded py-1 text-sm outline-none focus:border-primary font-mono" type="number" min="0" value={draft.unit_cost ?? it.unit_cost} onChange={e => setItemDraftById(s => ({...s, [it.id]: {...(s?.[it.id] || {}), unit_cost: e.target.value}}))} />
                                  ) : <span className="font-mono">{toNum(it.unit_cost).toLocaleString()}</span>}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                  {(toNum(draft.unit_cost ?? it.unit_cost) * toNum(draft.quantity ?? it.quantity)).toLocaleString()}
                                </td>
                                {editable && (
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => saveItem(it.id)} disabled={saving} className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"><IconSave /></button>
                                      <button onClick={() => deleteItem(it.id)} disabled={saving} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all"><IconTrash /></button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Item Section (only if editable) */}
                    {!['received','cancelled'].includes(String(viewData.purchase?.status).toLowerCase()) && (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-6 bg-slate-50/50">
                        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><IconPlus /> Add Items to this Purchase</h4>
                        {/* Reuse simplified search logic here or just a button to open full add modal */}
                        {!viewSelectedProduct ? (
                          <div className="relative">
                            <input className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Search product to add..." value={viewSpecSearch} onChange={e => setViewSpecSearch(e.target.value)} />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><IconSearch /></div>
                            {viewSpecResults.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-10">
                                {viewSpecResults.map(p => (
                                  <button key={p.id} onClick={() => selectProductForView(p)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 border-b last:border-0 border-slate-50">
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-slate-800">{viewSelectedProduct.name}</span>
                              <button onClick={() => { setViewSelectedProduct(null); setViewSpecSearch(''); setViewSpecResults([]); }} className="text-xs font-bold text-red-500 hover:underline">Cancel</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {viewSelectedProduct.specs.map(sp => (
                                <div key={sp.id} className="flex justify-between items-center p-2.5 border rounded-lg hover:border-primary/30 transition-all">
                                  <div className="text-xs">
                                    <div className="font-bold text-slate-700">{sp.color_name} / {sp.size_name}</div>
                                    <div className="text-muted">Buy: {toNum(sp.purchase_price).toLocaleString()}</div>
                                  </div>
                                  <button onClick={() => addItemToPurchase(sp)} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">Add</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* View Footer */}
              <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                <div className="text-xs text-muted max-w-md">
                  Receiving will update product stock levels and purchase prices. Cannot be undone.
                </div>
                {['ordered','partial'].includes(String(viewData?.purchase?.status || '').toLowerCase()) ? (
                  <button onClick={receiveAll} disabled={receiving} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    <IconDownload /> Receive Stock
                  </button>
                ) : (
                  <button onClick={() => { setViewId(null); setViewData(null); }} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}