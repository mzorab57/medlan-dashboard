import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';
import { STATUSES, normalizeStatus, canTransition, isLocked, statusBgClass } from '../../lib/status';

const SOURCES = ['', 'website', 'whatsapp', 'instagram'];

export default function OrdersPage() {
  const { add } = useToast();
  
  // --- List State ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  // --- Filters ---
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState(''); // Added select for source
  
  // --- View State ---
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [updateStatusMap, setUpdateStatusMap] = useState({});

  // --- Create State ---
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    customer_name: '', phone_number: '', address: '', order_source: 'whatsapp', items: []
  });
  
  // --- Search & Specs State ---
  const [specSearch, setSpecSearch] = useState('');
  const [specResults, setSpecResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // { id, name, specs: [] }
  
  // --- Stats State ---
  const [summary, setSummary] = useState({ website: 0, whatsapp: 0, instagram: 0, other: 0, total: 0 });

  // 1. Fetch Orders List
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(sourceFilter && { source: sourceFilter })
      });
      const res = await api.get(`/api/orders?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 2. Optimized Summary Fetcher (Better to move to Backend)
  // This still fetches pages but we keep it separated to not block UI
  useEffect(() => {
    let mounted = true;
    (async () => {
        try {
            // Note: Best practice is to have GET /api/orders/stats endpoint
            // Currently keeping frontend logic but optimized to run once per filter change
            const counts = { website: 0, whatsapp: 0, instagram: 0, other: 0, total: 0 };
            let p = 1;
            // Limit to 5 pages max to prevent freezing if there are 1000s of orders
            // OR ask backend to implement stats endpoint
            while (p <= 5) { 
                const res = await api.get(`/api/orders?page=${p}&per_page=100${statusFilter ? `&status=${statusFilter}` : ''}`);
                const list = res.data || res;
                if (!Array.isArray(list) || list.length === 0) break;
                
                list.forEach(o => {
                    const s = normalizeSource(o.order_source);
                    if (s === 'web') counts.website++;
                    else if (s === 'wa') counts.whatsapp++;
                    else if (s === 'insta') counts.instagram++;
                    else counts.other++;
                });
                counts.total += list.length;
                if (list.length < 100) break;
                p++;
            }
            if (mounted) setSummary(counts);
        } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [statusFilter]);

  // 3. View Order Logic (Optimized)
  async function fetchView(id) {
    setViewLoading(true);
    try {
      const res = await api.get(`/api/orders?id=${id}`);
      let orderData = res && typeof res === 'object' ? { ...res } : res;
      let orderItems = Array.isArray(orderData?.items) ? [...orderData.items] : [];

      // Optimization: Instead of looping ALL products, only fetch specific products referenced in items
      const uniqueProductIds = [...new Set(orderItems.map(it => it.product_id).filter(Boolean))];
      
      // Fetch details only for relevant products in parallel
      const productDetails = await Promise.all(
          uniqueProductIds.map(pid => api.get(`/api/products/${pid}/specs`).catch(() => null))
      );

      // Create a map for fast lookup: ProductID -> Specs Array
      const specsMap = {}; 
      uniqueProductIds.forEach((pid, index) => {
          const specs = productDetails[index];
          if (specs) specsMap[pid] = Array.isArray(specs) ? specs : (specs.data || []);
      });

      // Also fetch product names
      const productInfos = await Promise.all(
          uniqueProductIds.map(pid => api.get(`/api/products?id=${pid}`).catch(() => null))
      );
      const productNameMap = {};
      uniqueProductIds.forEach((pid, index) => {
          const info = productInfos[index];
          if (info) {
              const p = (Array.isArray(info) ? info[0] : (info.product || info));
              if (p && p.name) productNameMap[pid] = p.name;
          }
      });

      // Enrich items
      orderItems = orderItems.map(it => {
          const pid = it.product_id;
          const sid = it.product_spec_id;
          
          // Try to find missing info from our fetched specs
          if (pid && specsMap[pid]) {
              const matchedSpec = specsMap[pid].find(s => Number(s.id) === Number(sid));
              if (matchedSpec) {
                  return {
                      ...it,
                      product_name: it.product_name || productNameMap[pid] || it.product_name,
                      size_name: it.size_name || matchedSpec.size_name || matchedSpec.size,
                      color_name: it.color_name || matchedSpec.color_name || matchedSpec.color,
                      // assuming product name might be in the parent object in your API, otherwise fetch product details
                  };
              }
          }
          return { ...it, product_name: it.product_name || productNameMap[pid] || it.product_name };
      });

      setViewData({ ...orderData, items: orderItems });
    } catch (e) {
      setError(e.message);
    } finally {
      setViewLoading(false);
    }
  }

  // 4. Create Order: Product Search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!specSearch.trim()) {
        setSpecResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${specSearch}&per_page=5`);
        setSpecResults(res.data || res || []);
      } catch { setSpecResults([]); } 
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [specSearch]);

  async function selectProductForCreate(prod) {
      try {
          const res = await api.get(`/api/products/${prod.id}/specs`);
          const specs = Array.isArray(res) ? res : (res.data || []);
          setSelectedProduct({ ...prod, specs });
          setSpecSearch(prod.name); // Set input to name
          setSpecResults([]); // Hide dropdown
      } catch (e) {
          add('Failed to load product specs', 'error');
      }
  }

  // 5. Actions
  function normalizeSource(src) {
    const s = String(src || '').toLowerCase().trim();
    if (s.includes('insta')) return 'insta';
    if (s.includes('whats') || s === 'wa') return 'wa';
    if (s.includes('web')) return 'web';
    return 'other';
  }

  function displaySource(src) {
      const n = normalizeSource(src);
      if (n === 'insta') return 'Instagram';
      if (n === 'wa') return 'WhatsApp';
      if (n === 'web') return 'Website';
      return src || '-';
  }

  async function changeStatus(id, newStatus) {
      if(!newStatus) return;
      // Optimistic UI update or simple reload
      try {
          await api.patch(`/api/orders/status?id=${id}`, { status: newStatus });
          add('Status updated', 'success');
          setUpdateStatusMap(prev => ({ ...prev, [id]: newStatus }));
          fetchList(); // Refresh list to be sure
      } catch(e) {
          add(e.message, 'error');
      }
  }

  // Create Order Logic
  function addToCart(spec, productName) {
      setCreateData(prev => {
          const existing = prev.items.find(i => i.product_spec_id === spec.id);
          if (existing) {
              if (spec.stock != null && existing.quantity >= spec.stock) {
                  add('Max stock reached', 'error');
                  return prev;
              }
              return {
                  ...prev,
                  items: prev.items.map(i => i.product_spec_id === spec.id ? { ...i, quantity: i.quantity + 1 } : i)
              };
          }
          return {
              ...prev,
              items: [...prev.items, {
                  product_spec_id: spec.id,
                  product_name: productName,
                  color_name: spec.color_name || spec.color_id,
                  size_name: spec.size_name || spec.size_id,
                  price: spec.final_price || spec.price,
                  quantity: 1,
                  stock: spec.stock
              }]
          };
      });
  }

  async function submitOrder(e) {
      e.preventDefault();
      try {
          const payload = {
              customer_name: createData.customer_name,
              phone_number: createData.phone_number,
              address: createData.address,
              order_source: normalizeSource(createData.order_source),
              items: createData.items.map(i => ({ product_spec_id: i.product_spec_id, quantity: i.quantity }))
          };
          await api.post('/api/orders', payload);
          add('Order created successfully', 'success');
          setCreateOpen(false);
          setCreateData({ customer_name: '', phone_number: '', address: '', order_source: 'whatsapp', items: [] });
          fetchList();
      } catch(e) {
          add(e.message, 'error');
      }
  }
  
  // CSV Export
  async function handleExport() {
      // Use existing logic but maybe show loading state
      try {
          add('Preparing CSV...', 'info');
          // ... (Existing CSV Logic)
          const rows = [];
          let p = 1;
          while(true) {
             const res = await api.get(`/api/orders?page=${p}&per_page=100${statusFilter ? `&status=${statusFilter}` : ''}`);
             const chunk = res.data || res;
             if(!chunk.length) break;
             rows.push(...chunk);
             if(chunk.length < 100) break;
             p++;
          }
          downloadCSV('orders.csv', rows, [
              { header: 'ID', key: 'id' }, { header: 'Customer', key: 'customer_name' },
              { header: 'Total', key: 'total_price' }, { header: 'Status', key: 'status' }
          ]);
      } catch(e) { add(e.message, 'error'); }
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex  items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <button onClick={() => setCreateOpen(true)} className="w-fit sm:w-auto rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow-sm">
          + Create Order
        </button>
      </div>

      {/* SUMMARY CARDS (Compact) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="bg-white border rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold">{key}</div>
                  <div className="text-xl font-semibold mt-1">{val}</div>
              </div>
          ))}
      </div>

      {/* FILTERS & ACTIONS */}
      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 w-full md:w-auto">
              <select className="rounded-md border px-3 py-2 bg-gray-50 text-sm w-full md:w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {STATUSES.filter(s => !['processing', 'returned'].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="rounded-md border px-3 py-2 bg-gray-50 text-sm w-full md:w-40" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}>
                  <option value="">All Sources</option>
                  {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>
          <button onClick={handleExport} className="text-sm border px-3 py-2 rounded hover:bg-gray-50 w-full md:w-auto">
             Export CSV
          </button>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">#ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => { setViewId(o.id); fetchView(o.id); }}>
                    <td className="px-4 py-3 font-medium text-gray-600">#{o.id}</td>
                    <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-gray-500">{o.phone_number}</div>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded border ${
                            normalizeSource(o.order_source) === 'wa' ? 'bg-green-50 text-green-700 border-green-200' :
                            normalizeSource(o.order_source) === 'insta' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                            {displaySource(o.order_source)}
                        </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{Number(o.total_price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusBgClass(o.status)}`}>
                            {o.status}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {!isLocked(o.status) && (
                            <select 
                                className="text-xs border rounded p-1 bg-white"
                                value={updateStatusMap[o.id] ?? normalizeStatus(o.status)}
                                onChange={(e) => changeStatus(o.id, e.target.value)}
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s} disabled={!canTransition(o.status, s)}>{s}</option>
                                ))}
                            </select>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-3 border-t flex justify-between items-center bg-gray-50">
            <button disabled={page<=1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded bg-white">Next</button>
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold">Order Details #{viewId}</h3>
                <button onClick={() => setViewId(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                {viewLoading || !viewData ? (
                    <div className="text-center py-10">Loading details...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded border">
                                <div className="text-gray-500 text-xs uppercase">Customer</div>
                                <div className="font-semibold">{viewData.order?.customer_name}</div>
                                <div>{viewData.order?.phone_number}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border">
                                <div className="text-gray-500 text-xs uppercase">Shipping</div>
                                <div>{viewData.order?.address || 'No address provided'}</div>
                                <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${statusBgClass(viewData.order?.status)}`}>{viewData.order?.status}</div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b text-gray-500 text-xs uppercase">
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-center py-2">Qty</th>
                                    <th className="text-right py-2">Price</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(viewData.items || []).map((it, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3">
                                            <div className="font-medium">{it.product_name || `Product #${it.product_id}`}</div>
                                            <div className="text-xs text-gray-500">
                                                {it.color_name} {it.size_name && `• ${it.size_name}`}
                                            </div>
                                        </td>
                                        <td className="text-center py-3">{it.quantity}</td>
                                        <td className="text-right py-3">{Number(it.price).toLocaleString()}</td>
                                        <td className="text-right py-3 font-medium">{(it.quantity * it.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t">
                                <tr>
                                    <td colSpan="3" className="text-right py-3 font-bold text-gray-600">Total</td>
                                    <td className="text-right py-3 font-bold text-lg">{Number(viewData.order?.total_price || 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold">New Order</h3>
                <button onClick={() => setCreateOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* LEFT: Customer Form & Cart */}
                <div className="w-full md:w-1/3 border-r p-6 overflow-y-auto bg-gray-50">
                    <h4 className="font-bold text-sm mb-3">Customer Details</h4>
                    <form id="createOrderForm" onSubmit={submitOrder} className="space-y-3">
                        <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Name *" required value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} />
                        <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Phone *" required value={createData.phone_number} onChange={e => setCreateData({...createData, phone_number: e.target.value})} />
                        <textarea className="w-full rounded border px-3 py-2 text-sm" placeholder="Address" rows="2" value={createData.address} onChange={e => setCreateData({...createData, address: e.target.value})} />
                        <select className="w-full rounded border px-3 py-2 text-sm" value={createData.order_source} onChange={e => setCreateData({...createData, order_source: e.target.value})}>
                            {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </form>

                    <h4 className="font-bold text-sm mt-6 mb-3 flex justify-between">
                        <span>Cart Items</span>
                        <span>{createData.items.length}</span>
                    </h4>
                    <div className="space-y-2">
                        {createData.items.length === 0 ? <div className="text-sm text-gray-400 italic">Cart is empty</div> : (
                            createData.items.map((it, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border shadow-sm flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-medium truncate w-32">{it.product_name}</div>
                                        <div className="text-xs text-gray-500">{it.color_name} / {it.size_name}</div>
                                        <div className="text-xs text-blue-600">{Number(it.price).toLocaleString()} IQD</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number" className="w-10 text-center border rounded" 
                                            value={it.quantity} 
                                            min="1" max={it.stock}
                                            onChange={(e) => {
                                                const v = Math.min(Number(e.target.value), it.stock);
                                                setCreateData(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, quantity: v } : item)
                                                }))
                                            }}
                                        />
                                        <button type="button" onClick={() => setCreateData(prev => ({...prev, items: prev.items.filter(i => i.product_spec_id !== it.product_spec_id)}))} className="text-red-500 hover:text-red-700 p-1">
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Product Search */}
                <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                    <div className="mb-4">
                        <input 
                            className="w-full border rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Search products to add..." 
                            value={specSearch}
                            onChange={e => setSpecSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    {!selectedProduct ? (
                        <div className="grid grid-cols-1 gap-2">
                            {isSearching && <div className="text-gray-500 text-sm">Searching...</div>}
                            {specResults.map(p => (
                                <div key={p.id} onClick={() => selectProductForCreate(p)} className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-blue-600 text-sm">Select &rarr;</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                             <button onClick={() => { setSelectedProduct(null); setSpecSearch(''); }} className="text-sm text-gray-500 mb-4 hover:text-gray-800">&larr; Back to Search</button>
                             <div className="font-bold text-lg mb-2">{selectedProduct.name}</div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="p-2">Variant</th>
                                            <th className="p-2">Stock</th>
                                            <th className="p-2">Price</th>
                                            <th className="p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedProduct.specs.map(sp => (
                                            <tr key={sp.id}>
                                                <td className="p-2">{sp.color_name || sp.color_id} / {sp.size_name || sp.size_id}</td>
                                                <td className="p-2 font-medium">{sp.stock}</td>
                                                <td className="p-2">{Number(sp.final_price || sp.price).toLocaleString()}</td>
                                                <td className="p-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addToCart(sp, selectedProduct.name)} 
                                                        disabled={sp.stock < 1}
                                                        className={`px-3 py-1 rounded text-xs text-white ${sp.stock < 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                    >
                                                        {sp.stock < 1 ? 'Out of Stock' : 'Add'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
                <button onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" form="createOrderForm" disabled={createData.items.length === 0} className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50">Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
