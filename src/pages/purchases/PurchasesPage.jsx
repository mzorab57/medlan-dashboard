import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

function toNum(v) {
  const s = String(v ?? '').replace(/,/g, '').trim();
  const n = s === '' ? 0 : Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default function PurchasesPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/api/purchases${params.toString() ? `?${params.toString()}` : ''}`);
      setItems(res.data || res || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const listTotals = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const totalQty = arr.reduce((sum, p) => sum + toNum(p.items_qty), 0);
    const totalCost = arr.reduce((sum, p) => sum + toNum(p.total_cost), 0);
    return { count: arr.length, totalQty, totalCost };
  }, [items]);

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  async function openView(id) {
    setViewId(id);
    setViewLoading(true);
    try {
      const res = await api.get(`/api/purchases?id=${id}`);
      setViewData(res);
      setStatusDraft(String(res?.purchase?.status || ''));
      const drafts = {};
      (res?.items || []).forEach((it) => {
        drafts[it.id] = { quantity: String(it.quantity ?? ''), unit_cost: String(it.unit_cost ?? '') };
      });
      setItemDraftById(drafts);
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setViewLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = viewSpecSearch.trim();
      if (!viewId || !q) {
        setViewSpecResults([]);
        return;
      }
      setViewIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(q)}&per_page=8`);
        setViewSpecResults(res.data || res || []);
      } catch {
        setViewSpecResults([]);
      } finally {
        setViewIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [viewSpecSearch, viewId]);

  async function selectProductForView(prod) {
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      const specs = Array.isArray(res) ? res : (res.data || []);
      setViewSelectedProduct({ ...prod, specs });
      setViewSpecResults([]);
      setViewSpecSearch(prod.name);
      setViewAddQty(1);
      setViewAddUnitCost('');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function saveStatus() {
    if (!viewId) return;
    setStatusSaving(true);
    try {
      await api.patch(`/api/purchases?id=${viewId}`, { status: statusDraft });
      add('Status updated', 'success');
      await openView(viewId);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setStatusSaving(false);
    }
  }

  async function saveItem(itemId) {
    if (!viewId) return;
    const d = itemDraftById?.[itemId] || {};
    const payload = {
      quantity: Number(d.quantity),
      unit_cost: Number(d.unit_cost),
    };
    setItemSavingById((s) => ({ ...(s || {}), [itemId]: true }));
    try {
      await api.patch(`/api/purchases/items?id=${itemId}`, payload);
      add('Item updated', 'success');
      await openView(viewId);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setItemSavingById((s) => ({ ...(s || {}), [itemId]: false }));
    }
  }

  async function deleteItem(itemId) {
    
    setItemSavingById((s) => ({ ...(s || {}), [itemId]: true }));
    try {
      await api.del(`/api/purchases/items?id=${itemId}`);
      add('Item deleted', 'success');
      if (viewId) await openView(viewId);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setItemSavingById((s) => ({ ...(s || {}), [itemId]: false }));
    }
  }

  async function addItemToPurchase(spec) {
    if (!viewId) return;
    const qty = Math.max(1, toNum(viewAddQty));
    const unitCost = toNum(viewAddUnitCost !== '' ? viewAddUnitCost : (spec.purchase_price ?? 0));
    setViewAddLoading(true);
    try {
      await api.post(`/api/purchases/items?id=${viewId}`, { product_spec_id: Number(spec.id), quantity: qty, unit_cost: unitCost });
      add('Item added', 'success');
      setViewSelectedProduct(null);
      setViewSpecSearch('');
      setViewSpecResults([]);
      setViewAddQty(1);
      setViewAddUnitCost('');
      await openView(viewId);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setViewAddLoading(false);
    }
  }

  async function receiveAll() {
    if (!viewId) return;
    setReceiving(true);
    try {
      await api.patch(`/api/purchases/receive?id=${viewId}`, {});
      add('Received into stock', 'success');
      await openView(viewId);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setReceiving(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = specSearch.trim();
      if (!createOpen || !q) {
        setSpecResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(q)}&per_page=8`);
        setSpecResults(res.data || res || []);
      } catch {
        setSpecResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [specSearch, createOpen]);

  async function selectProduct(prod) {
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      const specs = Array.isArray(res) ? res : (res.data || []);
      setSelectedProduct({ ...prod, specs });
      setSpecResults([]);
      setSpecSearch(prod.name);
      setAddQty(1);
      setAddUnitCost('');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  function addSpecToPurchase(sp) {
    const qty = Math.max(1, toNum(addQty));
    const unitCost = toNum(addUnitCost !== '' ? addUnitCost : (sp.purchase_price ?? 0));
    if (unitCost < 0) {
      add('Invalid unit cost', 'error');
      return;
    }
    setCreateData((prev) => {
      const existing = prev.items.find((i) => Number(i.product_spec_id) === Number(sp.id));
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) => Number(i.product_spec_id) === Number(sp.id) ? { ...i, quantity: i.quantity + qty, unit_cost: unitCost } : i),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            product_spec_id: Number(sp.id),
            product_name: selectedProduct?.name,
            color_name: sp.color_name || sp.color_id,
            size_name: sp.size_name || sp.size_id,
            quantity: qty,
            unit_cost: unitCost,
          },
        ],
      };
    });
    add('Added', 'success');
  }

  const createTotal = useMemo(() => {
    return (createData.items || []).reduce((sum, it) => sum + toNum(it.unit_cost) * toNum(it.quantity), 0);
  }, [createData.items]);

  async function submitCreate() {
    if (!createData.supplier_name.trim()) {
      add('Supplier name required', 'error');
      return;
    }
    if (!createData.items.length) {
      add('Add at least one item', 'error');
      return;
    }
    setCreateSaving(true);
    try {
      await api.post('/api/purchases', {
        supplier_name: createData.supplier_name,
        note: createData.note,
        status: 'ordered',
        items: createData.items.map((it) => ({
          product_spec_id: Number(it.product_spec_id),
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
        })),
      });
      add('Purchase created', 'success');
      setCreateOpen(false);
      setCreateData({ supplier_name: '', note: '', items: [] });
      setSelectedProduct(null);
      setSpecSearch('');
      setSpecResults([]);
      await fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setCreateSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Purchases</h2>
          <div className="text-sm text-gray-500">Create supplier orders, then receive into stock.</div>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">draft</option>
            <option value="ordered">ordered</option>
            <option value="partial">partial</option>
            <option value="received">received</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button className="px-4 py-2 rounded bg-gray-900 text-white text-sm hover:bg-gray-800" onClick={() => setCreateOpen(true)}>
            New Purchase
          </button>
        </div>
      </div>

      {String(statusFilter || '').toLowerCase() === 'ordered' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs text-gray-500 uppercase">Ordered Purchases</div>
            <div className="mt-1 text-2xl font-semibold">{listTotals.count.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs text-gray-500 uppercase">Total Qty</div>
            <div className="mt-1 text-2xl font-semibold">{listTotals.totalQty.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs text-gray-500 uppercase">Total Cost</div>
            <div className="mt-1 text-2xl font-semibold">{listTotals.totalCost.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Total Cost</th>
                <th className="px-4 py-3 text-left">Qty</th>
                {/* <th className="px-4 py-3 text-left">Received</th> */}
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(items || []).map((p) => (
                <tr key={p.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => openView(p.id)}>
                  <td className="px-4 py-3 font-medium text-gray-600">#{p.id}</td>
                  <td className="px-4 py-3">{p.supplier_name}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3 font-semibold">{toNum(p.total_cost).toLocaleString()}</td>
                  <td className="px-4 py-3">{toNum(p.items_qty).toLocaleString()}</td>
                  {/* <td className="px-4 py-3">{toNum(p.received_qty).toLocaleString()}</td> */}
                  <td className="px-4 py-3 text-xs text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ marginTop: '0px' }}>
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">New Purchase</h3>
              <button onClick={() => setCreateOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-2">Supplier</div>
                  <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Supplier name" value={createData.supplier_name} onChange={(e) => setCreateData((s) => ({ ...s, supplier_name: e.target.value }))} />
                  <textarea className="w-full mt-2 rounded border px-3 py-2 text-sm" rows={3} placeholder="Note (optional)" value={createData.note} onChange={(e) => setCreateData((s) => ({ ...s, note: e.target.value }))} />
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-2">Items</div>
                  {createData.items.length === 0 ? <div className="text-sm text-gray-400">No items yet.</div> : (
                    <div className="space-y-2">
                      {createData.items.map((it, idx) => (
                        <div key={idx} className="border rounded p-2 text-sm flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{it.product_name}</div>
                            <div className="text-xs text-gray-500 truncate">{it.color_name} {it.size_name ? `• ${it.size_name}` : ''}</div>
                            <div className="text-xs text-gray-600">Qty: {it.quantity} • Unit: {toNum(it.unit_cost).toLocaleString()}</div>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 text-xs px-2 py-1 rounded border hover:bg-red-50"
                            onClick={() => setCreateData((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 text-sm font-semibold">Total: {createTotal.toLocaleString()}</div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-2">Add Variant</div>
                  {!selectedProduct ? (
                    <>
                      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Search products..." value={specSearch} onChange={(e) => setSpecSearch(e.target.value)} />
                      <div className="mt-2 space-y-2">
                        {isSearching ? <div className="text-xs text-gray-500">Searching...</div> : null}
                        {specResults.map((p) => (
                          <button key={p.id} type="button" className="w-full text-left p-2 border rounded hover:bg-blue-50" onClick={() => selectProduct(p)}>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">Select variants</div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>
                      <button type="button" className="text-xs text-gray-500 mb-2 hover:text-gray-800" onClick={() => { setSelectedProduct(null); setSpecSearch(''); setSpecResults([]); }}>
                        &larr; Back
                      </button>
                      <div className="font-bold mb-2">{selectedProduct.name}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <input className="w-24 border rounded px-2 py-1 text-sm text-right" type="number" min="1" step="1" value={addQty} onChange={(e) => setAddQty(Math.max(1, toNum(e.target.value)))} />
                        <input className="w-40 border rounded px-2 py-1 text-sm text-right" type="number" min="0" step="1" placeholder="Unit cost" value={addUnitCost} onChange={(e) => setAddUnitCost(e.target.value)} />
                        <div className="text-xs text-gray-500">Defaults to variant purchase price</div>
                      </div>
                      <div className="space-y-2">
                        {(selectedProduct.specs || []).map((sp) => (
                          <div key={sp.id} className="border rounded p-2 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold">{sp.color_name || sp.color_id} {sp.size_name ? `• ${sp.size_name}` : ''}</div>
                              <div className="text-[11px] text-gray-500">Stock: {sp.stock} • Sale: {toNum(sp.final_price || sp.price).toLocaleString()} • Purchase: {toNum(sp.purchase_price || 0).toLocaleString()}</div>
                            </div>
                            <button type="button" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => addSpecToPurchase(sp)}>
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button disabled={createSaving} onClick={submitCreate} className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50">
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{ marginTop: '0px' }}>
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">Purchase #{viewId}</h3>
              <button onClick={() => { setViewId(null); setViewData(null); }} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {viewLoading || !viewData ? (
                <div className="text-center py-10">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const st = String(viewData.purchase?.status || '').toLowerCase();
                    const editable = !['received', 'cancelled'].includes(st);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-gray-500 text-xs uppercase">Supplier</div>
                            <div className="font-semibold">{viewData.purchase?.supplier_name}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-gray-500 text-xs uppercase">Status</div>
                            <div className="font-semibold">{viewData.purchase?.status}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <select
                                className="border rounded px-2 py-1 text-sm"
                                value={statusDraft}
                                onChange={(e) => setStatusDraft(e.target.value)}
                                disabled={!editable || statusSaving}
                              >
                                {['draft','ordered','partial','cancelled'].map((x) => (
                                  <option key={x} value={x}>{x}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="text-xs px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                                disabled={!editable || statusSaving || String(statusDraft || '').toLowerCase() === st}
                                onClick={saveStatus}
                              >
                                {statusSaving ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-gray-500 text-xs uppercase">Total Cost</div>
                            <div className="font-semibold">{toNum(viewData.purchase?.total_cost).toLocaleString()}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-gray-500 text-xs uppercase">Note</div>
                            <div>{viewData.purchase?.note || '—'}</div>
                          </div>
                        </div>

                        {editable ? (
                          <div className="rounded-xl border p-4">
                            <div className="text-xs font-bold text-gray-600 uppercase mb-2">Add Item</div>
                            {!viewSelectedProduct ? (
                              <>
                                <input
                                  className="w-full rounded border px-3 py-2 text-sm"
                                  placeholder="Search products..."
                                  value={viewSpecSearch}
                                  onChange={(e) => setViewSpecSearch(e.target.value)}
                                  disabled={viewAddLoading}
                                />
                                <div className="mt-2 space-y-2">
                                  {viewIsSearching ? <div className="text-xs text-gray-500">Searching...</div> : null}
                                  {viewSpecResults.map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      className="w-full text-left p-2 border rounded hover:bg-blue-50"
                                      onClick={() => selectProductForView(p)}
                                      disabled={viewAddLoading}
                                    >
                                      <div className="font-medium">{p.name}</div>
                                      <div className="text-xs text-gray-500">Select variants</div>
                                    </button>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div>
                                <button
                                  type="button"
                                  className="text-xs text-gray-500 mb-2 hover:text-gray-800"
                                  onClick={() => { setViewSelectedProduct(null); setViewSpecSearch(''); setViewSpecResults([]); }}
                                  disabled={viewAddLoading}
                                >
                                  &larr; Back
                                </button>
                                <div className="font-bold mb-2">{viewSelectedProduct.name}</div>
                                <div className="flex items-center gap-2 mb-3">
                                  <input
                                    className="w-24 border rounded px-2 py-1 text-sm text-right"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={viewAddQty}
                                    onChange={(e) => setViewAddQty(Math.max(1, toNum(e.target.value)))}
                                    disabled={viewAddLoading}
                                  />
                                  <input
                                    className="w-40 border rounded px-2 py-1 text-sm text-right"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Unit cost"
                                    value={viewAddUnitCost}
                                    onChange={(e) => setViewAddUnitCost(e.target.value)}
                                    disabled={viewAddLoading}
                                  />
                                  <div className="text-xs text-gray-500">Defaults to variant purchase price</div>
                                </div>
                                <div className="space-y-2">
                                  {(viewSelectedProduct.specs || []).map((sp) => (
                                    <div key={sp.id} className="border rounded p-2 flex items-center justify-between">
                                      <div>
                                        <div className="text-xs font-semibold">{sp.color_name || sp.color_id} {sp.size_name ? `• ${sp.size_name}` : ''}</div>
                                        <div className="text-[11px] text-gray-500">Purchase: {toNum(sp.purchase_price || 0).toLocaleString()}</div>
                                      </div>
                                      <button
                                        type="button"
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                        onClick={() => addItemToPurchase(sp)}
                                        disabled={viewAddLoading}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b text-gray-500 text-xs uppercase">
                              <th className="text-left py-2">Item</th>
                              <th className="text-center py-2">Qty</th>
                              {/* <th className="text-center py-2">Received</th> */}
                              <th className="text-right py-2">Unit Cost</th>
                              <th className="text-right py-2">Total</th>
                              {editable ? <th className="text-right py-2">Actions</th> : null}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(viewData.items || []).map((it) => {
                              const draft = itemDraftById?.[it.id] || {};
                              const saving = !!itemSavingById?.[it.id];
                              return (
                                <tr key={it.id}>
                                  <td className="py-3">
                                    <div className="font-medium">{it.product_name}</div>
                                    <div className="text-xs text-gray-500">{it.color_name} {it.size_name ? `• ${it.size_name}` : ''}</div>
                                  </td>
                                  <td className="text-center py-3">
                                    {editable ? (
                                      <input
                                        className="w-20 text-right border rounded px-2 py-1"
                                        type="number"
                                        min={Number(it.received_quantity || 0)}
                                        value={draft.quantity ?? String(it.quantity ?? '')}
                                        onChange={(e) => setItemDraftById((s) => ({ ...(s || {}), [it.id]: { ...(s?.[it.id] || {}), quantity: e.target.value } }))}
                                        disabled={saving}
                                      />
                                    ) : it.quantity}
                                  </td>
                                  {/* <td className="text-center py-3">{it.received_quantity}</td> */}
                                  <td className="text-right py-3">
                                    {editable ? (
                                      <input
                                        className="w-24 text-right border rounded px-2 py-1"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={draft.unit_cost ?? String(it.unit_cost ?? '')}
                                        onChange={(e) => setItemDraftById((s) => ({ ...(s || {}), [it.id]: { ...(s?.[it.id] || {}), unit_cost: e.target.value } }))}
                                        disabled={saving}
                                      />
                                    ) : toNum(it.unit_cost).toLocaleString()}
                                  </td>
                                  <td className="text-right py-3 font-medium">{(toNum(draft.unit_cost ?? it.unit_cost) * toNum(draft.quantity ?? it.quantity)).toLocaleString()}</td>
                                  {editable ? (
                                    <td className="text-right py-3">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          className="text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                                          disabled={saving}
                                          onClick={() => saveItem(it.id)}
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                                          disabled={saving || Number(it.received_quantity || 0) > 0}
                                          onClick={() => deleteItem(it.id)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  ) : null}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white flex justify-between items-center gap-3">
              <div className="text-xs text-gray-500">Receive All: increases stock and sets variant purchase price.</div>
              <button
                type="button"
                onClick={receiveAll}
                disabled={receiving || !viewData || !['ordered', 'partial'].includes(String(viewData?.purchase?.status || '').toLowerCase())}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Receive All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
